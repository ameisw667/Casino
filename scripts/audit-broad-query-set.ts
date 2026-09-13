/**
 * Breites Query-Set-Audit (Säule 7 N4, T_DATABASE/11_database_query_performance_indexing.md).
 *
 * Erweitert die Performance-Verifikation über die 3 Geld-RPC-Lesepfade hinaus auf
 * die tatsächlich nutzerseitig sichtbaren Lesepfade (Leaderboard, Community-Stats,
 * Guide-Suche, Guide-Feedback-Summary).
 *
 * Sicherheitsregel (Plan Abschnitt 0, bindend): NIEMALS `EXPLAIN ANALYZE` auf einen
 * Geld-RPC mit Schreibeffekten (`settle_game_bet`, `start_game_round`,
 * `settle_game_round`, `advance_blackjack_round`, …). Diese Allowlist enthält
 * ausschließlich per Migration verifizierte `STABLE`-Funktionen — ein `EXPLAIN
 * ANALYZE` auf einer STABLE-Funktion führt sie real aus, aber ohne Schreibeffekte.
 * Jeder Eintrag trägt die verifizierende Migrations-Datei als Beleg.
 *
 * Ergebnis wird als eigenständige datierte Audit-Datei geschrieben
 * (`docs/database/audits/broad-query-set-<date>.md`); der letzte Abschnitt kann
 * von N1 in die Last-Audit-Datei übernommen werden. Realer Lauf deferred in die
 * Merge-Phase (docker daemon down beim Implementieren).
 */
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const auditDirectory = path.join(REPO_ROOT, 'docs', 'database', 'audits');
const apiBaseUrl = 'https://api.supabase.com/v1';

export interface BroadQueryEntry {
  name: string;
  /** Vorbereitetes EXPLAIN-Statement (STABLE-Funktion = ausführbar ohne Schreibeffekte). */
  explainSql: string;
  /** Per Migration verifiziert: LANGUAGE sql STABLE — kein Schreibeffekt. */
  stableVerified: true;
  migrationFile: string;
}

/**
 * Verifiziert STABLE (read-only):
 *  - get_leaderboard        → 015_get_leaderboard.sql (LANGUAGE sql STABLE SECURITY DEFINER)
 *  - get_community_stats    → 016_full_server_authority_expansion.sql (STABLE)
 *  - match_guide_documents  → 039_guide_knowledge_pgvector.sql (STABLE)
 *  - get_guide_feedback_summary → 042_guide_feedback_evals.sql (STABLE)
 */
export const BROAD_QUERY_SET: BroadQueryEntry[] = [
  {
    name: 'get_leaderboard',
    explainSql: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.get_leaderboard();',
    stableVerified: true,
    migrationFile: '015_get_leaderboard.sql',
  },
  {
    name: 'get_community_stats',
    explainSql: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.get_community_stats();',
    stableVerified: true,
    migrationFile: '016_full_server_authority_expansion.sql',
  },
  {
    name: 'match_guide_documents',
    explainSql: `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.match_guide_documents('test query', 5, 0.3);`,
    stableVerified: true,
    migrationFile: '039_guide_knowledge_pgvector.sql',
  },
  {
    name: 'get_guide_feedback_summary',
    explainSql:
      "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.get_guide_feedback_summary(now() - interval '7 days');",
    stableVerified: true,
    migrationFile: '042_guide_feedback_evals.sql',
  },
];

export interface BroadQueryResult {
  name: string;
  /** Messzeit in ms (erste "Execution Time"-Zeile des EXPLAIN-Outputs). */
  meanMs: number;
  plan: string;
  status: 'ok' | 'failed';
  failureReason?: string;
}

export function parseExecutionTimeMs(explainOutput: string): number | null {
  const match = /Execution Time: ([\d.]+) ms/.exec(explainOutput);
  return match ? Number(match[1]) : null;
}

export function buildBroadQueryMarkdown(
  results: BroadQueryResult[],
  timestamp: string,
  thresholds: { warnMs: number } = { warnMs: 50 },
): string {
  const rows =
    results.length > 0
      ? results
          .map((result) => {
            if (result.status === 'failed') {
              return `| \`${result.name}\` | — | ⚠️ fehlgeschlagen: ${result.failureReason ?? 'unbekannt'} |`;
            }
            const verdict = result.meanMs > thresholds.warnMs ? '⚠️ > Schwelle' : '✅ ok';
            return `| \`${result.name}\` | ${result.meanMs.toFixed(2)} | ${verdict} |`;
          })
          .join('\n')
      : '| _(keine Messung — realer Lauf deferred)_ |';
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const slowCount = results.filter((r) => r.status === 'ok' && r.meanMs > thresholds.warnMs).length;
  const verdict =
    failedCount + slowCount === 0
      ? '✅ Kein Fund (Schwelle: > 50 ms EXPLAIN ANALYZE)'
      : '⚠️ Befund — siehe Tabelle';

  const planSections = results
    .filter((r) => r.status === 'ok')
    .map((r) => `### ${r.name}\n\n\`\`\`\n${r.plan.trim() || '(leer)'}\n\`\`\`\n`)
    .join('\n');

  return `# Breites Query-Set-Audit (${timestamp.slice(0, 10)})

- **Zeitstempel:** ${timestamp}
- **Bewertung:** ${verdict}
- **Sicherheitsregel:** Allowlist enthält ausschließlich per Migration verifizierte \`STABLE\`-Funktionen (keine Schreibeffekte); Geld-RPCs mit Schreibeffekten sind ausgeschlossen.
- **Methode:** \`EXPLAIN (ANALYZE, BUFFERS)\` je Pfad (Transport: lokal \`supabase db query --local\`, remote Management-API \`query/read-only\` — Säule-7-L7-Konvention).

## Ergebnisse (Schwelle > ${thresholds.warnMs} ms)

| Pfad | Execution Time (ms) | Bewertung |
| --- | --- | --- |
${rows}

## Pläne

${planSections || '_Keine erfolgreichen Messungen._'}
`;
}

async function runCliExplain(sql: string): Promise<string> {
  const { stdout } = await execFileAsync(npxCommand, ['supabase', 'db', 'query', '--local', sql], {
    cwd: REPO_ROOT,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
    shell: true,
  });
  return stdout;
}

async function runApiExplain(sql: string): Promise<string> {
  const token = process.env.SUPABASE_ACCESS_TOKEN ?? '';
  const projectRef = process.env.SUPABASE_PROJECT_REF ?? '';
  const response = await fetch(`${apiBaseUrl}/projects/${projectRef}/database/query/read-only`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const rows = (await response.json()) as Record<string, unknown>[];
  // Der read-only-Endpunkt liefert EXPLAIN-Output als Plan-Zeilen-Objekte.
  return rows.map((row) => String(row['QUERY PLAN'] ?? Object.values(row)[0] ?? '')).join('\n');
}

export async function measureBroadQuerySet(): Promise<BroadQueryResult[]> {
  const useApi = Boolean(process.env.SUPABASE_ACCESS_TOKEN && process.env.SUPABASE_PROJECT_REF);
  const results: BroadQueryResult[] = [];
  for (const entry of BROAD_QUERY_SET) {
    try {
      const output = useApi
        ? await runApiExplain(entry.explainSql)
        : await runCliExplain(entry.explainSql);
      const meanMs = parseExecutionTimeMs(output) ?? 0;
      results.push({ name: entry.name, meanMs, plan: output, status: 'ok' });
    } catch (error) {
      results.push({
        name: entry.name,
        meanMs: 0,
        plan: '',
        status: 'failed',
        failureReason: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}

async function main(): Promise<void> {
  const timestamp = new Date().toISOString();
  const results = await measureBroadQuerySet();
  const markdown = buildBroadQueryMarkdown(results, timestamp);
  await mkdir(auditDirectory, { recursive: true });
  const outputPath = path.join(auditDirectory, `broad-query-set-${timestamp.slice(0, 10)}.md`);
  await writeFile(outputPath, markdown, 'utf8');
  console.info(`Breites Query-Set-Audit geschrieben: ${path.relative(REPO_ROOT, outputPath)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error: unknown) => {
    console.error('Breites Query-Set-Audit fehlgeschlagen:', error);
    process.exitCode = 1;
  });
}
