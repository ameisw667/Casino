// worldmap/05_Observability_und_Lasttest.md (P28/1.16, L5) — assigns each Artillery
// virtual user a distinct synthetic player id (kept stable across the whole VU flow via
// context.vars), so the load test measures genuine multi-user concurrency on the bet
// path instead of every VU serializing on the single dev_user_fallback advisory lock.
//
// Säule 8 L5a (T_DATABASE/08_database_connection_pooling.md): periodischer
// Connection-Count-Sampler während des Lasttest-Laufs. Alle 5 s wird
// `scripts/check-pooler-health.ts` (L2, read-only, nur lokal) aufgerufen und die
// JSON-Zeitreihe nach `docs/database/audits/pooler-health-loadtest.jsonl` angehängt;
// nach dem Lauf schreibt `stopPoolerSamplerAndWriteAudit` den Audit-Markdown
// `docs/database/audits/pooler-loadtest-<YYYY-MM-DD>.md`. Damit werden die
// dokumentierten Schwellenwerte (Warnung ≥ 42 / Kritisch ≥ 55 DB-Conns) erstmals
// neben der RPC-Latenz-Zeitreihe empirisch mit echten Connection-Counts unterlegt.
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Säule 8 L5a (T_DATABASE/08_database_connection_pooling.md): periodischer
// Connection-Count-Sampler während des Lasttest-Laufs.
// Säule 7 N1 (T_DATABASE/11): zusätzlich detached Query-Performance-Sampler
// (`audit-query-performance.ts --sample-during-load`) mit Stop-Marker-File —
// ein gemeinsamer Lasttest-Lauf, zwei Auswertungen (keine doppelte
// Lasttest-Infrastruktur).

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const AUDIT_DIR = join(REPO_ROOT, 'docs', 'database', 'audits');
const SAMPLES_JSONL = join(AUDIT_DIR, 'pooler-health-loadtest.jsonl');
const POOLER_SAMPLE_INTERVAL_MS = 5_000;
const QUERY_PERF_STOP_FILE = join(AUDIT_DIR, 'query-perf-sampler.stop');
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

let samplerInterval = null;
let poolerSamples = [];

export function assignLoadtestUser(context, events, done) {
  context.vars.loadtestUserId = `vu-${randomUUID()}`;
  return done();
}

function spawnPoolerHealthSample() {
  const child = spawn(NPX, ['tsx', 'scripts/check-pooler-health.ts'], {
    cwd: REPO_ROOT,
    windowsHide: true,
    shell: true,
  });
  let stdout = '';
  child.stdout.on('data', (d) => (stdout += d.toString()));
  child.on('error', () => {
    /* Sample verpassen darf den Lasttest nie brechen */
  });
  child.on('close', () => {
    try {
      const sample = JSON.parse(stdout.trim());
      const entry = { sampledAt: new Date().toISOString(), ...sample };
      poolerSamples.push(entry);
      mkdirSync(AUDIT_DIR, { recursive: true });
      appendFileSync(SAMPLES_JSONL, `${JSON.stringify(entry)}\n`, 'utf8');
    } catch {
      /* Nicht-JSON-Ausgabe (z. B. CLI-Fehler) ignorieren */
    }
  });
}

export function startPoolerSampler(context, events, done) {
  if (samplerInterval) return done();
  spawnPoolerHealthSample();
  samplerInterval = setInterval(spawnPoolerHealthSample, POOLER_SAMPLE_INTERVAL_MS);
  return done();
}

export function stopPoolerSamplerAndWriteAudit(context, events, done) {
  if (samplerInterval) {
    clearInterval(samplerInterval);
    samplerInterval = null;
  }
  if (poolerSamples.length === 0) return done();

  const date = new Date().toISOString().slice(0, 10);
  const rows = poolerSamples
    .map(
      (s) =>
        `| ${s.sampledAt} | ${s.status} | ${s.dbConnections ?? '—'} | ${(s.breakdown ?? [])
          .map((b) => `${b.application_name}:${b.state ?? '?'}=${b.connections}`)
          .join(', ')} |`,
    )
    .join('\n');
  const maxSeen = Math.max(...poolerSamples.map((s) => s.dbConnections ?? 0));
  const markdown = [
    `# Pooler-Lasttest-Audit (${date})`,
    '',
    '- **Modus:** lokal (Artillery `npm run loadtest:bet` + 5s-Sampling via `scripts/check-pooler-health.ts`)',
    `- **Samples:** ${poolerSamples.length} (Intervall ${POOLER_SAMPLE_INTERVAL_MS / 1000}s)`,
    `- **Peak DB-Verbindungen:** ${maxSeen}`,
    '- **Schwellen:** Warnung ≥ 42 / Kritisch ≥ 55 DB-Conns (docs/database/08_connection_pooling_supavisor.md §5)',
    '',
    '| Sampled at | Status | DB-Verbindungen | Aufschlüsselung |',
    '| --- | :---: | :---: | --- |',
    rows,
    '',
    'Rohzeitreihe (JSONL): `pooler-health-loadtest.jsonl` im selben Verzeichnis.',
    '',
    'Messgrenze: `poolerClients` ist aus `pg_stat_activity` nicht ablesbar (terminiert am Supavisor) — siehe docs/database/08_connection_pooling_supavisor.md §6.',
    '',
  ].join('\n');
  mkdirSync(AUDIT_DIR, { recursive: true });
  writeFileSync(join(AUDIT_DIR, `pooler-loadtest-${date}.md`), markdown, 'utf8');
  poolerSamples = [];
  return done();
}

export function startQueryPerfSampler(context, events, done) {
  const child = spawn(NPX, ['tsx', 'scripts/audit-query-performance.ts', '--sample-during-load'], {
    cwd: REPO_ROOT,
    detached: true,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  child.unref();
  context.vars.queryPerfSamplerPid = child.pid;
  return done();
}

export function stopQueryPerfSampler(context, events, done) {
  // Stop-Marker-File: der Sampler prüft es pro Intervall (5 s) und schreibt danach
  // selbst die Last-Audit-Datei. Falls kein Sampler lief (Kopplung deaktiviert),
  // ist der Marker harmlos — der Sampler räumt ihn am Ende seines Laufs auf.
  writeFileSync(QUERY_PERF_STOP_FILE, new Date().toISOString(), 'utf8');
  return done();
}
