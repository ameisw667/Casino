// worldmap/05_Observability_und_Lasttest.md (P28/1.16, L5) — assigns each Artillery
// virtual user a distinct synthetic player id (kept stable across the whole VU flow via
// context.vars), so the load test measures genuine multi-user concurrency on the bet
// path instead of every VU serializing on the single dev_user_fallback advisory lock.
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Säule 7 N1 (T_DATABASE/11): before/after-Hooks koppeln den Lasttest mit dem
// Query-Performance-Sampler (`audit-query-performance.ts --sample-during-load`) —
// ein gemeinsamer Lasttest-Lauf, zwei Auswertungen (Pooler-Health aus T_DATABASE/08
// L5a + pg_stat_statements-Zeitreihe aus T_DATABASE/11 N1). Der Sampler läuft als
// detached Child und wird über ein Stop-Marker-File beendet, das der after-Hook
// schreibt — kein Signal-Handling über Artillery-Prozessgrenzen nötig.

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const QUERY_PERF_STOP_FILE = join(
  REPO_ROOT,
  'docs',
  'database',
  'audits',
  'query-perf-sampler.stop',
);

export function assignLoadtestUser(context, events, done) {
  context.vars.loadtestUserId = `vu-${randomUUID()}`;
  return done();
}

export function startQueryPerfSampler(context, events, done) {
  const child = spawn(
    'npx',
    ['tsx', 'scripts/audit-query-performance.ts', '--sample-during-load'],
    {
      cwd: REPO_ROOT,
      detached: true,
      stdio: 'ignore',
      shell: process.platform === 'win32',
    },
  );
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
