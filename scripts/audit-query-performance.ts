import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const auditDirectory = join('docs', 'database', 'audits');
const seqScanThreshold = 5_000;
const avgMsThreshold = 50;

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

async function runInspectJson(subcommand: string): Promise<string> {
  // shell: true ist auf Windows zwingend für npx.cmd (siehe scripts/backup-supabase.ts).
  const { stdout } = await execFileAsync(
    npxCommand,
    ['supabase', 'inspect', 'db', subcommand, '--linked', '--output-format', 'json'],
    { cwd: process.cwd(), windowsHide: true, maxBuffer: 32 * 1024 * 1024, shell: true },
  );
  return stdout;
}

async function getCliVersion(): Promise<string> {
  const { stdout } = await execFileAsync(npxCommand, ['supabase', '--version'], {
    cwd: process.cwd(),
    windowsHide: true,
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

function evaluateCalls(rows: CallRow[]): string[] {
  return rows
    .map((row) => {
      const calls = parseCallCount(row.ncalls);
      const avgMs = calls > 0 ? (parseIntervalSeconds(row.total_exec_time) * 1000) / calls : 0;
      return { query: row.query, avgMs, calls };
    })
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
  cliVersion: string,
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
    `- **CLI:** ${cliVersion}`,
    `- **Modus:** \`supabase inspect db --linked --output-format json\` (read-only)`,
    `- **Bewertung:** ${verdict}`,
    '',
    'Quelle der Methodik & Schwellenwerte: [`docs/database/07_indexing_query_performance.md`](../07_indexing_query_performance.md) (§ Schwellenwerte).',
    '',
    'Hinweis: Die CLI-Subcommands `seq-scans` und `unused-indexes` sind seit CLI 2.116.0 deprecated und in `index-stats` aufgegangen — beide Sichten werden aus dessen JSON abgeleitet.',
    '',
    '---',
    '',
    '## Bewertung gegen die Schwellenwerte',
    '',
    ...(callsFindings.length + seqScanFindings.length === 0
      ? [`✅ Keine Query über ${avgMsThreshold} ms Durchschnitt, kein Seq-Scan über ${seqScanThreshold} Aufrufe. Nächster Quartals-Check empfohlen.`]
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
  const cliVersion = await getCliVersion();
  const results: CommandResult[] = [];

  for (const subcommand of ['calls', 'outliers', 'index-stats']) {
    results.push({
      label: subcommand,
      subcommand,
      raw: await runInspectJson(subcommand),
    });
  }

  const callsRows = (JSON.parse(results[0]?.raw ?? '{"rows":[]}').rows ?? []) as CallRow[];
  const outliersRows = (JSON.parse(results[1]?.raw ?? '{"rows":[]}').rows ?? []) as CallRow[];
  const indexRows = (JSON.parse(results[2]?.raw ?? '{"rows":[]}').rows ?? []) as IndexStatsRow[];

  const callsFindings = [...evaluateCalls(callsRows), ...evaluateCalls(outliersRows)];
  const seqScanFindings = evaluateSeqScans(indexRows);
  const unusedIndexes = evaluateUnusedIndexes(indexRows);

  const markdown = buildMarkdown(
    cliVersion,
    results,
    callsFindings,
    seqScanFindings,
    unusedIndexes,
  );

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