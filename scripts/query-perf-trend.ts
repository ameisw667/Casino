/**
 * Trendspeicherung für die Query-Performance-Audits (Säule 7 N2,
 * T_DATABASE/11_database_query_performance_indexing.md).
 *
 * Konvention: `docs/database/audits/trend.jsonl` — ein JSON-Objekt pro Zeile,
 * ein Lauf pro Zeile, strikt append-only (keine Überschreibungen, kein Löschen),
 * damit die Historie vollständig bleibt (Plan Abschnitt 3 N2).
 *
 * Messgenauigkeit (ehrlich dokumentiert): `pg_stat_statements` liefert nur den
 * Mittelwert (`mean_exec_time`), keine Perzentile. Der "p95-Pfad"-Vergleich des
 * Plans wird deshalb als Vergleich der Top-Pfade nach `mean_exec_time` umgesetzt —
 * die konservativste verfügbare Approximation ohne Schemaänderung. Abweichung
 * gegen den Plan-Wortlaut "p50/p95" ist in der Planungsdatei §9 dokumentiert.
 */
import { appendFile, readFile } from 'node:fs/promises';

export interface TrendPath {
  /** Kurzer Pfad-Identifikator (Query-Head oder RPC-Name). */
  name: string;
  meanMs: number;
  calls: number;
}

export interface TrendRecord {
  timestamp: string;
  mode: string;
  findings: { calls: number; seqScans: number };
  paths: TrendPath[];
  seqScanTables: string[];
}

export interface BuildTrendRecordInput {
  timestamp: string;
  mode: string;
  callsFindingsCount: number;
  seqScanFindings: string[];
  paths: TrendPath[];
  maxPaths?: number;
}

export function buildTrendRecord(input: BuildTrendRecordInput): TrendRecord {
  const maxPaths = input.maxPaths ?? 5;
  const sortedPaths = [...input.paths].sort((a, b) => b.meanMs - a.meanMs);
  return {
    timestamp: input.timestamp,
    mode: input.mode,
    findings: {
      calls: input.callsFindingsCount,
      seqScans: input.seqScanFindings.length,
    },
    paths: sortedPaths.slice(0, maxPaths),
    seqScanTables: [...input.seqScanFindings],
  };
}

export function parseTrendLines(content: string): TrendRecord[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as TrendRecord];
      } catch {
        // Tolerant gegenüber Teilzeilen (abgebrochener Lauf) — Historie bleibt lesbar.
        return [];
      }
    });
}

export async function appendTrendRecord(record: TrendRecord, filePath: string): Promise<void> {
  await appendFile(filePath, `${JSON.stringify(record)}\n`, 'utf8');
}

/** Fehlende Datei ist kein Fehler — der erste Lauf hat noch keine Historie. */
export async function readTrendRecords(filePath: string): Promise<TrendRecord[]> {
  let content: string;
  try {
    content = await readFile(filePath, 'utf8');
  } catch {
    return [];
  }
  return parseTrendLines(content);
}
