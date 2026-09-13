import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { buildTrendRecord, appendTrendRecord, type TrendPath } from './query-perf-trend';

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

// ===== Säule 7 N1: Last-Kopplung (--sample-during-load) =====
// Statt eines Idle-Einzelaufrufs sampelt dieser Modus pg_stat_statements-Deltas
// in einem Intervall (5 s) für die Dauer eines extern laufenden Lasttests. Der
// Stop-Mechanismus ist ein Marker-File (`query-perf-sampler.stop`), das der
// Artillery-After-Hook in scripts/loadtest/bet-flow.processor.mjs schreibt —
// ein gemeinsamer Lasttest-Lauf, zwei Auswertungen (Kopplung mit T_DATABASE/08
// N1, keine doppelte Lasttest-Infrastruktur).

export interface LoadSample {
  sampledAt: string;
  totalCalls: number;
  deltaCalls: number;
  topMeanMs: number;
}

export function computeLoadSample(
  rows: NormalizedCallRow[],
  previousTotalCalls: number,
  sampledAt: string,
): LoadSample {
  const totalCalls = rows.reduce((sum, row) => sum + row.calls, 0);
  const topMeanMs = rows.reduce((max, row) => Math.max(max, row.avgMs), 0);
  return {
    sampledAt,
    totalCalls,
    deltaCalls: Math.max(0, totalCalls - previousTotalCalls),
    topMeanMs,
  };
}

export function buildLoadSampleMarkdown(
  samples: LoadSample[],
  modeLabel: string,
  timestamp: string,
): string {
  const rows =
    samples.length > 0
      ? samples
          .map(
            (sample) =>
              `| ${sample.sampledAt} | ${sample.totalCalls.toLocaleString('en-US')} | +${sample.deltaCalls.toLocaleString('en-US')} | ${sample.topMeanMs.toFixed(2)} |`,
          )
          .join('\n')
      : '| _(keine Samples — Sampling-Fehler)_ |';
  const activeSamples = samples.filter((s) => s.deltaCalls > 0).length;

  return `# Query-Performance-Last-Audit (${timestamp.slice(0, 10)})

- **Zeitstempel:** ${timestamp}
- **Modus:** ${modeLabel} — \`--sample-during-load\` (Last-Kopplung mit \`npm run loadtest:bet\`, T_DATABASE/08 N1)
- **Intervall:** 5 s, Stopp via \`docs/database/audits/query-perf-sampler.stop\`
- **Verifizierung:** ${activeSamples} Sample(s) mit Delta > 0 — ${
    activeSamples > 0
      ? '✅ Lastphase wurde tatsächlich gemessen (erhöhte pg_stat_statements-Aktivität).'
      : '⚠️ Kein Delta beobachtet — Last hat die geprüften Pfade nicht erreicht.'
  }

## Zeitreihe (pg_stat_statements)

| Zeitpunkt | calls gesamt | Δ calls | Ø mean_exec_time Top-Pfad (ms) |
| --- | --- | --- | --- |
${rows}

Abgrenzung zur Ruhezustands-Konvention: Präfix \`-load-\` im Dateinamen trennt
diese Zeitreihe von den Idle-Audits (\`query-performance-<date>.md\`).
`;
}

async function fetchCallsRows(useApi: boolean): Promise<NormalizedCallRow[]> {
  if (useApi) {
    const statsSchemaRows = await runApiQuery(
      `SELECT n.nspname AS schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
WHERE e.extname = 'pg_stat_statements';`,
    );
    const statsTable = `${String(statsSchemaRows[0]?.schema ?? 'extensions')}.pg_stat_statements`;
    const rows = await runApiQuery(
      `SELECT query, calls, mean_exec_time FROM ${statsTable} ORDER BY total_exec_time DESC LIMIT 25;`,
    );
    return rows.map((row) => ({
      query: String(row.query ?? ''),
      calls: Number(row.calls ?? 0),
      avgMs: Number(row.mean_exec_time ?? 0),
    }));
  }
  const raw = await runInspectJson('calls');
  return normalizeCallsCli((JSON.parse(raw ?? '{"rows":[]}').rows ?? []) as CallRow[]);
}

const SAMPLE_INTERVAL_MS = 5000;
const MAX_SAMPLING_DURATION_MS = 30 * 60 * 1000;
const STOP_FILE = join('docs', 'database', 'audits', 'query-perf-sampler.stop');

async function runSampleDuringLoad(): Promise<void> {
  const useApi = isApiMode();
  const modeLabel = useApi
    ? `Management API query/read-only (read-only, supabase/cli#6392-Workaround)`
    : `supabase inspect db calls --linked --output-format json (read-only)`;
  const samples: LoadSample[] = [];
  const startedAt = Date.now();
  let previousTotalCalls = 0;

  while (Date.now() - startedAt < MAX_SAMPLING_DURATION_MS) {
    if (existsSync(STOP_FILE)) break;
    try {
      const rows = await fetchCallsRows(useApi);
      const sample = computeLoadSample(rows, previousTotalCalls, new Date().toISOString());
      if (samples.length === 0) {
        // Erster Sample ist die Baseline — Delta 0, damit die Lastphase sich
        // ab dem zweiten Sample in den Deltas zeigt.
        samples.push({ ...sample, deltaCalls: 0 });
      } else {
        samples.push(sample);
      }
      previousTotalCalls = sample.totalCalls;
      console.info(
        `Sample ${samples.length}: +${sample.deltaCalls} calls (Top-Ø ${sample.topMeanMs.toFixed(2)} ms)`,
      );
    } catch (error) {
      // Ein einzelner Sample-Fehler darf den Lauf nicht abbrechen — Zeitreihe geht weiter.
      console.error('Sampling-Fehler (übersprungen):', error);
    }
    await new Promise((resolve) => setTimeout(resolve, SAMPLE_INTERVAL_MS));
  }

  const timestamp = new Date().toISOString();
  const markdown = buildLoadSampleMarkdown(samples, modeLabel, timestamp);
  await mkdir(auditDirectory, { recursive: true });
  const outputPath = join(auditDirectory, `query-performance-load-${timestamp.slice(0, 10)}.md`);
  await writeFile(outputPath, markdown, 'utf8');

  // N2: auch Last-Läufe landen in der Trend-Historie (append-only).
  const last = samples[samples.length - 1];
  if (last) {
    await appendTrendRecord(
      buildTrendRecord({
        timestamp,
        mode: 'load',
        callsFindingsCount: 0,
        seqScanFindings: [],
        paths: [
          { name: 'pg_stat_statements:top-total', meanMs: last.topMeanMs, calls: last.totalCalls },
        ],
        maxPaths: 5,
      }),
      join(auditDirectory, 'trend.jsonl'),
    );
  }

  // Stop-Marker aufräumen, damit der nächste Lauf sauber startet.
  await rm(STOP_FILE, { force: true });

  console.info(`Last-Audit geschrieben: ${outputPath} (${samples.length} Samples)`);
}

// ===== Säule 7 N2: Trend-Extraktion =====

export function extractSeqScanTables(rows: IndexStatsRow[]): string[] {
  return rows.filter((row) => Number(row.seq_scans) > seqScanThreshold).map((row) => row.table);
}

export function extractTrendPaths(rows: NormalizedCallRow[]): TrendPath[] {
  return rows.map((row) => ({ name: row.query.slice(0, 80), meanMs: row.avgMs, calls: row.calls }));
}

async function main(): Promise<void> {
  const results: CommandResult[] = [];
  let callsFindings: string[] = [];
  let seqScanFindings: string[] = [];
  let unusedIndexes: string[] = [];
  let normalizedCalls: NormalizedCallRow[] = [];
  let indexRows: IndexStatsRow[] = [];
  let modeLabel: string;

  if (isApiMode()) {
    modeLabel = `\`Management API /projects/${projectRef}/database/query/read-only\` (read-only, supabase/cli#6392-Workaround)`;
    // pg_stat_statements liegt bei Supabase im Extension-Schema (Standard: `extensions`)
    // und ist im search_path des query/read-only-Endpunkts nicht auflösbar — das
    // tatsächliche Schema wird daher dynamisch aus pg_extension ermittelt.
    const statsSchemaRows = await runApiQuery(
      `SELECT n.nspname AS schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
WHERE e.extname = 'pg_stat_statements';`,
    );
    const statsSchema = String(statsSchemaRows[0]?.schema ?? '');
    if (statsSchema.length === 0) {
      throw new Error(
        'Extension pg_stat_statements ist im Remote-Projekt nicht installiert — Audit-Sicht calls/outliers nicht verfügbar.',
      );
    }
    const statsTable = `${statsSchema}.pg_stat_statements`;
    const callsRaw = await runApiQuery(
      `SELECT query, calls, mean_exec_time FROM ${statsTable} ORDER BY total_exec_time DESC LIMIT 25;`,
    );
    const outliersRaw = await runApiQuery(
      `SELECT query, calls, mean_exec_time FROM ${statsTable} ORDER BY mean_exec_time DESC LIMIT 25;`,
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
    normalizedCalls = toCallRow(callsRaw);
    indexRows = toIndexRow(indexRaw);
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
    indexRows = (JSON.parse(raws[2] ?? '{"rows":[]}').rows ?? []) as IndexStatsRow[];

    callsFindings = [
      ...evaluateCalls(normalizeCallsCli(callsRows)),
      ...evaluateCalls(normalizeCallsCli(outliersRows)),
    ];
    seqScanFindings = evaluateSeqScans(indexRows);
    unusedIndexes = evaluateUnusedIndexes(indexRows);
    normalizedCalls = normalizeCallsCli(callsRows);
  }

  const markdown = buildMarkdown(modeLabel, results, callsFindings, seqScanFindings, unusedIndexes);

  const timestamp = new Date().toISOString();
  const date = timestamp.slice(0, 10);
  const outputPath = join(auditDirectory, `query-performance-${date}.md`);
  await mkdir(auditDirectory, { recursive: true });
  await writeFile(outputPath, markdown, 'utf8');

  // Säule 7 N2: append-only Trend-Eintrag — Grundlage für das N3-Regressions-Gate.
  await appendTrendRecord(
    buildTrendRecord({
      timestamp,
      mode: isApiMode() ? 'management-api' : 'cli',
      callsFindingsCount: callsFindings.length,
      seqScanFindings: extractSeqScanTables(indexRows),
      paths: extractTrendPaths(normalizedCalls),
      maxPaths: 5,
    }),
    join(auditDirectory, 'trend.jsonl'),
  );

  console.info(
    `Audit geschrieben: ${outputPath} (${callsFindings.length + seqScanFindings.length} Befund(e), ${unusedIndexes.length} unbenutzte Indizes)`,
  );
}

const isSampleDuringLoad = process.argv.includes('--sample-during-load');

if (isSampleDuringLoad) {
  runSampleDuringLoad().catch((error: unknown) => {
    console.error('Query-Performance-Last-Sampling fehlgeschlagen:', error);
    process.exitCode = 1;
  });
} else if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error: unknown) => {
    console.error('Query-Performance-Audit fehlgeschlagen:', error);
    process.exitCode = 1;
  });
}
