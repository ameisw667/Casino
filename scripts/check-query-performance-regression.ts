/**
 * Query-Performance-Regressions-Gate (Säule 7 N3,
 * T_DATABASE/11_database_query_performance_indexing.md).
 *
 * Vergleicht die letzten beiden Einträge aus `docs/database/audits/trend.jsonl`
 * (Säule 7 N2): Verschlechterung > 25 % je Pfad (Vergleichsgröße: `meanMs` der
 * Top-Pfade — pg_stat_statements liefert keine Perzentile, siehe query-perf-trend.ts)
 * oder ein neuer Seq-Scan-Fund → Exit-Code 1.
 *
 * Bewusst KEIN Deployment-Blocker: das Skript hängt nur an Cron/Dispatch-Läufen
 * der query-performance-audit.yml (kein PR-Gate) — eine einzelne Lastspitze soll
 * keinen Merge blockieren, aber sichtbar gemeldet werden (Plan Abschnitt 3 N3).
 * Bei Fehlschlag erzeugt der CI-Schritt ein `gh issue` (gleiches Muster wie
 * T_DATABASE/05 N4 — kein neuer Alerting-Dienst).
 */
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseTrendLines, type TrendRecord } from './query-perf-trend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const TREND_FILE = path.join(REPO_ROOT, 'docs', 'database', 'audits', 'trend.jsonl');

export interface RegressionOptions {
  deteriorationPct: number;
}

export interface RegressionVerdict {
  regressed: boolean;
  reasons: string[];
}

export function detectRegression(
  previous: TrendRecord,
  current: TrendRecord,
  options: RegressionOptions = { deteriorationPct: 25 },
): RegressionVerdict {
  const reasons: string[] = [];
  const currentPaths = new Map(current.paths.map((p) => [p.name, p]));

  for (const previousPath of previous.paths) {
    const currentPath = currentPaths.get(previousPath.name);
    if (!currentPath) continue;
    const increasePct =
      previousPath.meanMs > 0
        ? ((currentPath.meanMs - previousPath.meanMs) / previousPath.meanMs) * 100
        : 0;
    if (currentPath.meanMs > previousPath.meanMs * (1 + options.deteriorationPct / 100)) {
      reasons.push(
        `Pfad "${previousPath.name}": ${previousPath.meanMs.toFixed(2)} ms → ` +
          `${currentPath.meanMs.toFixed(2)} ms (+${increasePct.toFixed(0)} %, Schwelle > ${options.deteriorationPct} %)`,
      );
    }
  }

  const previousSeqScans = new Set(previous.seqScanTables);
  for (const table of current.seqScanTables) {
    if (!previousSeqScans.has(table)) {
      reasons.push(`Neuer Seq-Scan-Fund auf "${table}" (im Vorlauf nicht vorhanden)`);
    }
  }

  return { regressed: reasons.length > 0, reasons };
}

/** Fehlende/korrupte Datei ist kein Regressionsfund — der erste Lauf bleibt grün. */
export async function loadLastTwoTrendRecords(
  filePath: string,
): Promise<[TrendRecord, TrendRecord] | null> {
  let content: string;
  try {
    content = await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
  const records = parseTrendLines(content);
  if (records.length < 2) return null;
  const previous = records[records.length - 2];
  const current = records[records.length - 1];
  if (!previous || !current) return null;
  return [previous, current];
}

async function main(): Promise<void> {
  const pair = await loadLastTwoTrendRecords(TREND_FILE);
  if (!pair) {
    console.log('Noch keine zwei Trend-Einträge in trend.jsonl — nichts zu vergleichen (grün).');
    return;
  }
  const verdict = detectRegression(pair[0], pair[1]);
  if (!verdict.regressed) {
    console.log(`Keine Regression (${pair[1].timestamp} vs. ${pair[0].timestamp}).`);
    return;
  }
  console.error(
    `⚠️ Query-Performance-Regression erkannt (${pair[0].timestamp} → ${pair[1].timestamp}):`,
  );
  for (const reason of verdict.reasons) {
    console.error(`  - ${reason}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error: unknown) => {
    console.error('Query-Performance-Regression-Check fehlgeschlagen:', error);
    process.exitCode = 1;
  });
}
