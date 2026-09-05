import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const auditDirectory = join('docs', 'database', 'audits');
const seqScanThreshold = 5_000;
const avgMsThreshold = 50;
const projectRef = process.env.SUPABASE_PROJECT_REF ?? '';
const apiToken = process.env.SUPABASE_ACCESS_TOKEN ?? '';
const apiBaseUrl = 'https://api.supabase.com/v1';

interface CallRow {
  query: string;
  total_exec_time: string;
  ncalls: string;
}

interface IndexStatsRow {
  name: string;
  table: string;
  index_scans: string;
  seq_scans: string;
  unused: boolean;
  size?: string;
}

interface CommandResult {
  label: string;
  subcommand: string;
  raw: string;
}

interface NormalizedCallRow {
  query: string;
  calls: number;
  avgMs: number;
}

/**
 * CI-Modus (supabase/cli#6392): granulare Access-Tokens werden von `supabase link`
 * nicht akzeptiert — stattdessen laufen die Audit-Sichten direkt über den
 * Management-API-Endpoint /database/query/read-only, den das Token abdeckt.
 */
function isApiMode(): boolean {
  return apiToken.length > 0 && projectRef.length > 0;
}

async function runInspectJson(subcommand: string): Promise<string> {
  // shell: true ist auf Windows zwingend für npx.cmd (siehe scripts/backup-supabase.ts).
  const { stdout } = await execFileAsync(
    npxCommand,
    ['supabase', 'inspect', 'db', subcommand, '--linked', '--output-format', 'json'],
    { cwd: process.cwd(), windowsHide: true, maxBuffer: 32 * 1024 * 1024, shell: true },
  );
  return stdout;
}

async function runApiQuery(sql: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(`${apiBaseUrl}/projects/${projectRef}/database/query/read-only`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    throw new Error(
      `Management-API query/read-only fehlgeschlagen: HTTP ${response.status} — ${await response.text()}`,
    );
  }
  return (await response.json()) as Record<string, unknown>[];
}

async function getCliVersion(): Promise<string> {
  const { stdout } = await execFileAsync(npxCommand, ['supabase', '--version'], {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
    shell: true,
  });
  return stdout.trim();
}

function parseIntervalSeconds(interval: string): number {
  const daySplit = interval.split(', ');
  const dayPart = daySplit.length === 2 ? Number(daySplit[0]?.split(' ')[0] ?? 0) : 0;
  const timePart = daySplit[daySplit.length - 1] ?? '0';
  const [hours = '0', minutes = '0', seconds = '0'] = timePart.split(':');
  return dayPart * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function parseCallCount(ncalls: string): number {
  return Number(ncalls.replace(/,/g, ''));
}

function normalizeCallsCli(rows: CallRow[]): NormalizedCallRow[] {
  return rows.map((row) => {
    const calls = parseCallCount(row.ncalls);
    return {
      query: row.query,
      calls,
      avgMs: calls > 0 ? (parseIntervalSeconds(row.total_exec_time) * 1000) / calls : 0,
    };
  });
}

function evaluateCalls(rows: NormalizedCallRow[]): string[] {
  return rows
    .filter((row) => row.avgMs > avgMsThreshold)
    .map(
      (row) =>
        `⚠️ Durchschnitt **${row.avgMs.toFixed(1)} ms** pro Aufruf über ${row.calls.toLocaleString('en-US')} Aufrufe (> ${avgMsThreshold} ms): \`${row.query.slice(0, 160)}\``,
    );
}

function evaluateSeqScans(rows: IndexStatsRow[]): string[] {
  return rows
    .filter((row) => Number(row.seq_scans) > seqScanThreshold)
    .map((row) => `⚠️ Seq-Scans **${row.seq_scans}** auf \`${row.table}\` (> ${seqScanThreshold})`);
}

function evaluateUnusedIndexes(rows: IndexStatsRow[]): string[] {
  return rows
    .filter((row) => row.unused)
    .map((row) => `${row.name} (\`${row.table}\`, ${row.size ?? '—'})`);
}

function markdownSection(title: string, body: string[]): string[] {
  return [`## ${title}`, '', ...(body.length > 0 ? body : ['_(leere Ergebnisliste)_']), ''];
}

function buildMarkdown(
  modeLabel: string,
  results: CommandResult[],
  callsFindings: string[],
  seqScanFindings: string[],
  unusedIndexes: string[],
): string {
  const timestamp = new Date().toISOString();
  const verdict =
    callsFindings.length + seqScanFindings.length > 0
      ? '⚠️ **Befund** — siehe Bewertung unten'
      : '✅ **Kein Handlungsbedarf** (Schwellen: > 50 ms Ø bzw. Seq-Scan > 5.000 Zeilen)';

  return [
    `# Query-Performance-Audit (${timestamp.slice(0, 10)})`,
    '',
    `- **Zeitstempel:** ${timestamp}`,
    `- **Modus:** ${modeLabel}`,
    `- **Bewertung:** ${verdict}`,
    '',
    'Quelle der Methodik & Schwellenwerte: [`docs/database/07_indexing_query_performance.md`](../07_indexing_query_performance.md) (§ Schwellenwerte).',
    '',
    ...(isApiMode()
      ? []
      : [
          'Hinweis: Die CLI-Subcommands `seq-scans` und `unused-indexes` sind seit CLI 2.116.0 deprecated und in `index-stats` aufgegangen — beide Sichten werden aus dessen JSON abgeleitet.',
          '',
        ]),
    '---',
    '',
    '## Bewertung gegen die Schwellenwerte',
    '',
    ...(callsFindings.length + seqScanFindings.length === 0
      ? [
          `✅ Keine Query über ${avgMsThreshold} ms Durchschnitt, kein Seq-Scan über ${seqScanThreshold} Aufrufe. Nächster Quartals-Check empfohlen.`,
        ]
      : [...callsFindings, ...seqScanFindings]),
    '',
    'Unbenutzte Indizes (informativ, kein Handlungsdruck — erst nach ≥ 90 Tagen Beobachtungswindow entfernen):',
    '',
    ...(unusedIndexes.length > 0 ? unusedIndexes.map((entry) => `- ${entry}`) : ['- _(keine)_']),
    '',
    ...markdownSection('Rohdaten: calls', [
      '```json',
      results[0]?.raw.trim() ?? '(fehlgeschlagen)',
      '```',
      '',
    ]),
    ...markdownSection('Rohdaten: outliers', [
      '```json',
      results[1]?.raw.trim() ?? '(fehlgeschlagen)',
      '```',
      '',
    ]),
    ...markdownSection('Rohdaten: index-stats (Quelle für Seq-Scans & unbenutzte Indizes)', [
      '```json',
      results[2]?.raw.trim() ?? '(fehlgeschlagen)',
      '```',
    ]),
  ].join('\n');
}

async function main(): Promise<void> {
  const results: CommandResult[] = [];
  let callsFindings: string[] = [];
  let seqScanFindings: string[] = [];
  let unusedIndexes: string[] = [];
  let modeLabel: string;

  if (isApiMode()) {
    modeLabel = `\`Management API /projects/${projectRef}/database/query/read-only\` (read-only, supabase/cli#6392-Workaround)`;
    const callsRaw = await runApiQuery(
      'SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 25;',
    );
    const outliersRaw = await runApiQuery(
      'SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 25;',
    );
    const indexRaw = await runApiQuery(
      `SELECT
  psui.indexrelname AS name,
  psui.relname AS table,
  psui.idx_scan AS index_scans,
  COALESCE(pst.seq_scan, 0) AS seq_scans,
  pg_size_pretty(pg_relation_size(psui.relid)) AS size
FROM pg_stat_user_indexes psui
LEFT JOIN pg_stat_all_tables pst ON pst.relid = psui.relid
ORDER BY psui.relname, psui.indexrelname;`,
    );

    const toCallRow = (rows: Record<string, unknown>[]): NormalizedCallRow[] =>
      rows.map((row) => ({
        query: String(row.query ?? ''),
        calls: Number(row.calls ?? 0),
        avgMs: Number(row.mean_exec_time ?? 0),
      }));
    const toIndexRow = (rows: Record<string, unknown>[]): IndexStatsRow[] =>
      rows.map((row) => ({
        name: String(row.name ?? ''),
        table: String(row.table ?? ''),
        index_scans: String(row.index_scans ?? '0'),
        seq_scans: String(row.seq_scans ?? '0'),
        unused: Number(row.index_scans ?? 0) === 0,
        size: row.size === null || row.size === undefined ? undefined : String(row.size),
      }));

    callsFindings = evaluateCalls(toCallRow(callsRaw));
    seqScanFindings = evaluateSeqScans(toIndexRow(indexRaw));
    unusedIndexes = evaluateUnusedIndexes(toIndexRow(indexRaw));
    results.push(
      { label: 'calls', subcommand: 'api:calls', raw: JSON.stringify(callsRaw, null, 2) },
      { label: 'outliers', subcommand: 'api:outliers', raw: JSON.stringify(outliersRaw, null, 2) },
      {
        label: 'index-stats',
        subcommand: 'api:index-stats',
        raw: JSON.stringify(indexRaw, null, 2),
      },
    );
  } else {
    const cliVersion = await getCliVersion();
    modeLabel = `\`supabase inspect db --linked --output-format json\` (read-only, CLI ${cliVersion})`;
    const raws: string[] = [];
    for (const subcommand of ['calls', 'outliers', 'index-stats']) {
      const raw = await runInspectJson(subcommand);
      raws.push(raw);
      results.push({ label: subcommand, subcommand, raw });
    }

    const callsRows = (JSON.parse(raws[0] ?? '{"rows":[]}').rows ?? []) as CallRow[];
    const outliersRows = (JSON.parse(raws[1] ?? '{"rows":[]}').rows ?? []) as CallRow[];
    const indexRows = (JSON.parse(raws[2] ?? '{"rows":[]}').rows ?? []) as IndexStatsRow[];

    callsFindings = [
      ...evaluateCalls(normalizeCallsCli(callsRows)),
      ...evaluateCalls(normalizeCallsCli(outliersRows)),
    ];
    seqScanFindings = evaluateSeqScans(indexRows);
    unusedIndexes = evaluateUnusedIndexes(indexRows);
  }

  const markdown = buildMarkdown(modeLabel, results, callsFindings, seqScanFindings, unusedIndexes);

  const date = new Date().toISOString().slice(0, 10);
  const outputPath = join(auditDirectory, `query-performance-${date}.md`);
  await mkdir(auditDirectory, { recursive: true });
  await writeFile(outputPath, markdown, 'utf8');

  console.info(
    `Audit geschrieben: ${outputPath} (${callsFindings.length + seqScanFindings.length} Befund(e), ${unusedIndexes.length} unbenutzte Indizes)`,
  );
}

main().catch((error: unknown) => {
  console.error('Query-Performance-Audit fehlgeschlagen:', error);
  process.exitCode = 1;
});
