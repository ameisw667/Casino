/**
 * Pooler-Health-Check (Säule 8 L2 + N2, T_DATABASE/08_database_connection_pooling.md).
 *
 * Ersetzt den bisher nur dokumentierten PowerShell-Pseudocode
 * (`docs/database/08_connection_pooling_supavisor.md` §6, fiktives
 * `check-pooler-health.ps1`) durch ein echtes, plattformunabhängiges Skript.
 *
 * Transport (zwei Modi, automatisch gewählt wie in scripts/audit-query-performance.ts):
 *   - lokal (Standard): `npx supabase db query --local` — reine SELECT-Abfrage auf
 *     `pg_stat_activity` (K1-Klasse, read-only), Ziel ist ausschließlich die lokale Instanz.
 *   - remote (nur wenn SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF gesetzt sind):
 *     Management-API `/projects/{ref}/database/query/read-only` (L4, CI-Cron).
 *     Derselbe supabase/cli#6392-Workaround wie in Säule 7 L7; das Secret wird von
 *     Jan exclusively hinterlegt und von der CI-Env injiziert — nie im Repo.
 *
 * Ausgabe (stdout, JSON):
 *   { status: "normal"|"warning"|"critical", activeConnections, dbConnections,
 *     poolerClients, threshold, breakdown, sampledAt, mode }
 *
 * Messgrenze (ehrlich dokumentiert): `pg_stat_activity` zeigt nur Server-
 * seiten-Verbindungen (Supavisor-Pool, PostgREST, ...). Die Anzahl der
 * Pooler-CLIENT-Verbindungen (gegen max_client_conn) terminiert am Supavisor
 * und ist aus SQL nicht ablesbar — sie wird hier als null gemeldet und wird
 * durch den synthetischen Erschöpfungstest (N4) empirisch beobachtet.
 *
 * N2 (Observability): wenn SENTRY_DSN gesetzt ist, wird das Ergebnis als
 * Sentry-Event verschickt — ohne DSN bleibt alles beim stdout-only-Verhalten.
 */
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { request as httpsRequest } from 'node:https';

const execFileAsync = promisify(execFile);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export interface PoolerActivityRow {
  application_name: string;
  state: string | null;
  connections: number;
}

export interface PoolerHealthThresholds {
  dbConnections: { warning: number; critical: number };
}

/**
 * Schwellenwerte aus `docs/database/08_connection_pooling_supavisor.md` §5
 * (Warnung ≥ 42 DB-Conns, Kritisch ≥ 55 DB-Conns — remote-nano-orientiert,
 * lokal im Ruhezustand weit darunter).
 */
export const POOLER_HEALTH_THRESHOLDS: PoolerHealthThresholds = {
  dbConnections: { warning: 42, critical: 55 },
};

export interface PoolerHealthResult {
  status: 'normal' | 'warning' | 'critical';
  activeConnections: number;
  dbConnections: number;
  poolerClients: null;
  threshold: PoolerHealthThresholds;
  breakdown: PoolerActivityRow[];
}

export function evaluatePoolerHealth(
  breakdown: PoolerActivityRow[],
  thresholds: PoolerHealthThresholds,
): PoolerHealthResult {
  const dbConnections = breakdown.reduce((sum, row) => sum + row.connections, 0);
  const status: PoolerHealthResult['status'] =
    dbConnections >= thresholds.dbConnections.critical
      ? 'critical'
      : dbConnections >= thresholds.dbConnections.warning
        ? 'warning'
        : 'normal';
  return {
    status,
    activeConnections: dbConnections,
    dbConnections,
    poolerClients: null,
    threshold: thresholds,
    breakdown,
  };
}

async function queryLocalConnections(): Promise<PoolerActivityRow[]> {
  // Ein einzelnes JSON-Aggregat als TEXT — robust gegen CLI-Ausgabeformatierung.
  // Transport ueber -f <Datei>: der CLI 2.116 lehnt unquoted Multi-Word-SQL als
  // positional arguments ab (shell:true splittet Spaces in einzelne Argumente).
  const sql = `SELECT coalesce(json_agg(t), '[]'::json)::text FROM (
  SELECT application_name, state, count(*)::int AS connections
  FROM pg_stat_activity
  WHERE datname = current_database() AND application_name <> ''
  GROUP BY application_name, state
  ORDER BY application_name, state
) t;`;
  const sqlFile = path.join(process.cwd(), 'scripts', '.tmp-pooler-health.sql');
  await writeFile(sqlFile, sql, 'utf8');
  try {
    const { stdout } = await execFileAsync(
      npxCommand,
      ['supabase', 'db', 'query', '--local', '-f', 'scripts/.tmp-pooler-health.sql'],
      {
        cwd: process.cwd(),
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
        shell: true,
      },
    );
    const trimmed = stdout.trim();
    // CLI >= 2.116 liefert {"boundary":..., "rows":[{"coalesce": "<json-string>"}]};
    // aeltere Versionen den rohen JSON-String direkt.
    if (trimmed.startsWith('[')) return JSON.parse(trimmed) as PoolerActivityRow[];
    if (trimmed.startsWith('{')) {
      const envelope = JSON.parse(trimmed) as { rows?: Array<{ coalesce?: string }> };
      const payload = envelope.rows?.[0]?.coalesce;
      if (typeof payload !== 'string') {
        throw new Error(`db query-Envelope ohne coalesce-Wert: ${trimmed.slice(0, 200)}`);
      }
      return JSON.parse(payload) as PoolerActivityRow[];
    }
    throw new Error(`Unerwartete db query-Ausgabe (kein JSON): ${trimmed.slice(0, 200)}`);
  } finally {
    await rm(sqlFile, { force: true });
  }
}

const apiToken = process.env.SUPABASE_ACCESS_TOKEN ?? '';
const projectRef = process.env.SUPABASE_PROJECT_REF ?? '';
const apiBaseUrl = 'https://api.supabase.com/v1';

/** Entspricht exakt der Moduswahl aus scripts/audit-query-performance.ts (Säule 7 L7). */
export function isApiMode(
  hasToken: string = apiToken,
  hasProjectRef: string = projectRef,
): boolean {
  return hasToken.length > 0 && hasProjectRef.length > 0;
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
    // Security-Review-Fix (LOW): Response-Body gekürzt in Fehlermeldungen — nie
    // ganze Upstream-Bodies ungetrimmt in Errors/Logs übernehmen.
    const body = (await response.text()).slice(0, 300);
    throw new Error(
      `Management-API query/read-only fehlgeschlagen: HTTP ${response.status} — ${body}`,
    );
  }
  return (await response.json()) as Record<string, unknown>[];
}

export function normalizeRemoteActivityRows(rows: Record<string, unknown>[]): PoolerActivityRow[] {
  return rows.map((row) => ({
    application_name: String(row.application_name ?? ''),
    state: row.state === null || row.state === undefined ? null : String(row.state),
    connections: Number(row.connections ?? 0),
  }));
}

async function queryRemoteConnections(): Promise<PoolerActivityRow[]> {
  // Kein datname-Filter (read-only-Endpunkt verbindet direkt auf die Projekt-DB).
  const rows = await runApiQuery(
    `SELECT application_name, state, count(*)::int AS connections
FROM pg_stat_activity
WHERE application_name <> ''
GROUP BY application_name, state
ORDER BY application_name, state;`,
  );
  return normalizeRemoteActivityRows(rows);
}

export interface SentryDsn {
  publicKey: string;
  host: string;
  projectId: string;
}

export function parseSentryDsn(dsn: string): SentryDsn | null {
  const match = /^https:\/\/([^@]+)@([^/]+)\/(\d+)$/.exec(dsn.trim());
  if (!match) return null;
  return { publicKey: match[1] ?? '', host: match[2] ?? '', projectId: match[3] ?? '' };
}

export interface SentryEnvelope {
  header: Record<string, string>;
  payload: {
    event_id: string;
    platform: string;
    level: 'info' | 'warning' | 'error';
    message: { formatted: string };
    timestamp: string;
  };
}

export function buildSentryEnvelope(
  dsn: SentryDsn,
  formatted: string,
  status: PoolerHealthResult['status'],
): SentryEnvelope {
  const eventId = randomUUID();
  return {
    header: { event_id: eventId },
    payload: {
      event_id: eventId,
      platform: 'javascript',
      level: status === 'critical' ? 'error' : status === 'warning' ? 'warning' : 'info',
      message: { formatted },
      timestamp: new Date().toISOString(),
    },
  };
}

/** Best-Effort-Versand: ein Fehler beim Versand darf den Health-Check nie brechen. */
async function sendToSentry(result: PoolerHealthResult, sampledAt: string): Promise<void> {
  const dsn = parseSentryDsn(process.env.SENTRY_DSN ?? '');
  if (!dsn) return;
  const envelope = buildSentryEnvelope(
    dsn,
    `pooler health: ${result.status} — ${result.dbConnections} DB-Verbindungen (${sampledAt})`,
    result.status,
  );
  const body = `${JSON.stringify(envelope.header)}\n${JSON.stringify(envelope.payload)}\n`;
  return new Promise((resolve) => {
    const req = httpsRequest(
      {
        hostname: dsn.host,
        path: `/api/${dsn.projectId}/envelope/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-sentry-envelope',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${dsn.publicKey}, sentry_client=custom-pooler-health/1.0`,
        },
        timeout: 5000,
      },
      () => resolve(),
    );
    req.on('error', () => resolve());
    req.on('timeout', () => {
      req.destroy();
      resolve();
    });
    req.end(body);
  });
}

async function main(): Promise<void> {
  const mode = isApiMode() ? 'remote' : 'local';
  const breakdown =
    mode === 'remote' ? await queryRemoteConnections() : await queryLocalConnections();
  const result = evaluatePoolerHealth(breakdown, POOLER_HEALTH_THRESHOLDS);
  const sampledAt = new Date().toISOString();
  await sendToSentry(result, sampledAt);
  console.log(JSON.stringify({ ...result, sampledAt, mode }, null, 2));
  if (result.status !== 'normal') process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error: unknown) => {
    console.error('Pooler-Health-Check fehlgeschlagen:', error);
    process.exitCode = 1;
  });
}
