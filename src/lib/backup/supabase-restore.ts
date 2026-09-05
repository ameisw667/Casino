import type { PlaintextBackupArtifact } from './supabase-dump';

type SqlExecutor = (argumentsList: string[], environment: Record<string, string>) => Promise<void>;
type ArtifactWriter = (path: string, data: Buffer) => Promise<void>;

export type RestoreSummary = {
  restoredArtifacts: string[];
  connectionPort: number;
};

/**
 * Safety guard (Allowlist, kein Blocklist — Security-Review 2026-09-05): Restore läuft
 * ausschließlich gegen den isolierten Loopback-Drill-Container auf Port 55432. Alles
 * andere (Supabase-Projekt, lokale Dev-Instanz auf 54322, DNS-Namen, percent-encodierte
 * Host-Tricks) fail-closed. T_DATABASE/05 L6 Schritt 4.
 */
const ISOLATED_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const ISOLATED_PORT = '55432';
const PROJECT_REF = 'hmqwozhdckbwjqzcmire';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error('Restore target contains malformed percent-encoding');
  }
}

export function assertRestoreTargetIsIsolated(connectionUrl: string): {
  target: URL;
  hostname: string;
} {
  let target: URL;
  try {
    target = new URL(connectionUrl);
  } catch {
    throw new Error('Restore target must be a valid connection URL');
  }
  if (target.protocol !== 'postgresql:' && target.protocol !== 'postgres:') {
    throw new Error('Restore target must be a postgresql:// connection URL');
  }

  const hostname = safeDecode(target.hostname)
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\.+$/, '');
  if (!ISOLATED_HOSTS.has(hostname)) {
    throw new Error(
      'Restore target refused: only the isolated loopback drill container is allowed',
    );
  }
  if (target.port !== ISOLATED_PORT) {
    throw new Error('Restore target refused: the drill container must use port 55432');
  }
  if (safeDecode(connectionUrl).toLowerCase().includes(PROJECT_REF)) {
    throw new Error('Restore target refused: restores must never run against a Supabase project');
  }
  return { target, hostname };
}

function assertArtifactSet(artifacts: PlaintextBackupArtifact[]): void {
  const names = new Set(artifacts.map((artifact) => artifact.name));
  if (!names.has('schema.sql') || !names.has('data.sql')) {
    throw new Error('Restore requires schema.sql and data.sql');
  }
  if (
    names.size !== artifacts.length ||
    artifacts.some((artifact) => artifact.plaintext.length === 0)
  ) {
    throw new Error('Restore artifacts contain duplicates or empty files');
  }
}

export async function restoreSupabaseArtifacts(input: {
  artifacts: PlaintextBackupArtifact[];
  connectionUrl: string;
  directory: string;
  execute: SqlExecutor;
  writeFile: ArtifactWriter;
}): Promise<RestoreSummary> {
  const { target, hostname } = assertRestoreTargetIsIsolated(input.connectionUrl);
  assertArtifactSet(input.artifacts);

  const database = safeDecode(target.pathname).replace(/^\//, '').split('?')[0] || 'postgres';
  // Credentials werden nie per argv übergeben (prozesstabelle-leküle) — Passwort läuft
  // über die Executor-Environment (PGPASSWORD), die Conninfo bleibt credential-frei.
  const connectionInfo = [
    `host=${hostname}`,
    `port=${target.port || '5432'}`,
    ...(target.username ? [`user=${safeDecode(target.username)}`] : []),
    `dbname=${database}`,
  ].join(' ');
  const executorEnvironment: Record<string, string> = target.password
    ? { PGPASSWORD: safeDecode(target.password) }
    : {};

  const baseDirectory = input.directory.replace(/\\/g, '/').replace(/\/$/, '');
  for (const artifact of input.artifacts) {
    const path = `${baseDirectory}/${artifact.name}`;
    await input.writeFile(path, artifact.plaintext);
    await input.execute(
      ['--no-psqlrc', '--set', 'ON_ERROR_STOP=1', '--dbname', connectionInfo, '--file', path],
      executorEnvironment,
    );
  }

  return {
    restoredArtifacts: input.artifacts.map((artifact) => artifact.name),
    connectionPort: target.port ? Number(target.port) : 5432,
  };
}
