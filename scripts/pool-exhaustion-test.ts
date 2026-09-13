// Pool-Erschöpfungstest (Säule 8 N4, T_DATABASE/08 Abschnitt N4) — öffnet gezielt
// parallele RAW-TCP-Verbindungen gegen die lokale Supavisor-Pooler-Instanz (Port 54329),
// um das Verhalten am Limit von max_client_conn (lokal: 100, siehe docs/database/
// 08_connection_pooling_supavisor.md §3) zu beobachten.
//
// Messgrenze (dokumentiert in L2): pg_stat_activity sieht nur SERVER-seitige
// Verbindungen — die Client-Seite terminiert am Supavisor. Deshalb öffnet dieses
// Skript echte Client-Sockets und sampelt parallel check-pooler-health.ts (L2),
// um beide Seiten im Audit gegenüberzustellen.
//
// Safety-Guards (Security-Review Pflicht laut Plan):
//   1. Host ist hart auf Loopback beschränkt — ein `--host`-Override mit Nicht-Loopback
//      wird mit Fehler abgelehnt. Ein Ausführen gegen Remote (`hmqwozhdckbwjqzcmire`)
//      ist strukturell ausgeschlossen.
//   2. `POOL_EXHAUSTION_CONFIRM=local` muss explizit gesetzt sein (analog dem
//      Connection-String-Guard aus T_DATABASE/05 Backup).
//   3. Verbindungszahl ist auf 250 gekappt (Localhost-DoS-Schutz für die eigene Instanz).
//
// Realer Lauf ist in der Merge-Phase geplant (docker daemon down beim Implementieren).

import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const MAX_CONNECTIONS_CAP = 250;
const DEFAULT_COUNT = 120;
const LOCAL_POOLER_PORT = 54329;
const CONNECT_TIMEOUT_MS = 5000;
const INTER_CONNECTION_DELAY_MS = 10;
const HEALTH_SAMPLE_TIMEOUT_MS = 15000;

const LOOPBACK_HOSTS = ['127.0.0.1', 'localhost', '::1'];

export interface ExhaustionConfig {
  count: number;
  host: string;
  port: number;
}

export interface ExhaustionHealthSample {
  sampledAt: string;
  status: string;
  dbConnections: number | null;
}

export interface ExhaustionOutcome {
  config: ExhaustionConfig;
  openedConnections: number;
  firstRejectionAt: number | null;
  firstRejectionError: string | null;
  errorClasses: Record<string, number>;
  healthSamples: ExhaustionHealthSample[];
  startedAt: string;
  finishedAt: string;
}

export function assertLoopbackTarget(host: string): boolean {
  if (!LOOPBACK_HOSTS.includes(host)) {
    throw new Error(
      `Nicht-Loopback-Host abgelehnt: "${host}". Der Test darf ausschließlich gegen ` +
        `die lokale Instanz laufen (127.0.0.1 / localhost / ::1).`,
    );
  }
  return true;
}

export function parseExhaustionConfig(argv: string[]): ExhaustionConfig {
  const config: ExhaustionConfig = {
    count: DEFAULT_COUNT,
    host: '127.0.0.1',
    port: LOCAL_POOLER_PORT,
  };

  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--count') {
      const parsed = Number.parseInt(argv[i + 1] ?? '', 10);
      if (Number.isNaN(parsed)) continue;
      config.count = Math.min(parsed, MAX_CONNECTIONS_CAP);
    } else if (flag === '--host') {
      const host = argv[i + 1];
      if (host) {
        assertLoopbackTarget(host);
        config.host = host;
      }
    }
  }

  return config;
}

export function buildExhaustionMarkdown(outcome: ExhaustionOutcome): string {
  const errorClassRows = Object.entries(outcome.errorClasses)
    .map(([code, count]) => `| \`${code}\` | ${count} |`)
    .join('\n');
  const healthRows = outcome.healthSamples
    .map(
      (sample) => `| ${sample.sampledAt} | ${sample.status} | ${sample.dbConnections ?? 'n/a'} |`,
    )
    .join('\n');

  return `# Pool-Erschöpfungs-Audit (pool-exhaustion)

**Status:** lokal beobachtet — kein Live-/Prod-Befund (Remote-DB ist tabu, siehe T_DATABASE Rahmenbedingungen).

## Konfiguration
- Ziel: \`${outcome.config.host}:${outcome.config.port}\` (lokale Supavisor-Instanz)
- Angeforderte Verbindungen: ${outcome.config.count}
- Zeitraum: ${outcome.startedAt} → ${outcome.finishedAt}

## Beobachtung
- Erfolgreich geöffnete Verbindungen: **${outcome.openedConnections}**
- Erste Zurückweisung bei Verbindung Nr.: ${outcome.firstRejectionAt ?? 'keine'}
- Fehlerbild der ersten Zurückweisung: ${outcome.firstRejectionError ?? '—'}

## Fehlerklassen
| Klasse | Anzahl |
| --- | --- |
${errorClassRows || '| — | 0 |'}

## check-pooler-health-Samples (L2)
| Zeitpunkt | Status | DB-Verbindungen (pg_stat_activity) |
| --- | --- | --- |
${healthRows || '| — | — | — |'}

## Messgrenze
pg_stat_activity sieht nur Server-seitige Verbindungen; die Client-Seite terminiert am
Supavisor (\`poolerClients: null\` in L2). Dieses Skript beobachtet deshalb die
Client-Seite via Raw-TCP und die Server-Seite via L2 — die Gegenüberstellung zeigt,
wo Supavisor die Verbindungskappe durchsetzt.
`;
}

interface ProbeResult {
  kind: 'open' | 'error';
  errorClass?: string;
  errorMessage?: string;
  socket?: net.Socket;
}

function openProbeConnection(config: ExhaustionConfig): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: config.host, port: config.port });
    let settled = false;

    const settle = (result: ProbeResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    socket.once('connect', () => {
      // Verbindung offen halten (kein Auth-Handshake) — genau diese hängen bei
      // max_client_conn in der Warteschlange bzw. zählen gegen das Limit.
      settle({ kind: 'open', socket });
    });
    socket.once('error', (err) => {
      const code = 'code' in err && typeof err.code === 'string' ? err.code : err.name;
      settle({ kind: 'error', errorClass: code, errorMessage: `${err.name}: ${err.message}` });
    });
    socket.setTimeout(CONNECT_TIMEOUT_MS, () => {
      socket.destroy();
      settle({
        kind: 'error',
        errorClass: 'ETIMEDOUT',
        errorMessage: 'ETIMEDOUT (connect timeout)',
      });
    });
  });
}

async function samplePoolerHealth(): Promise<ExhaustionHealthSample> {
  try {
    const stdout = await execFileAsync('npx', ['tsx', 'scripts/check-pooler-health.ts'], {
      cwd: REPO_ROOT,
      shell: true,
      timeout: HEALTH_SAMPLE_TIMEOUT_MS,
      // Security-Review-Fix (LOW): das Sampling muss strikt lokal bleiben — der
      // Remote-Modus (L4) wird hier gezielt deaktiviert, damit ein im Environment
      // vorhandenes SUPABASE_ACCESS_TOKEN keine read-only Remote-Abfrage auslöst.
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: '', SUPABASE_PROJECT_REF: '' },
    }).then((r) => r.stdout);

    const parsed = JSON.parse(stdout) as {
      status?: string;
      activeConnections?: number;
      sampledAt?: string;
    };
    return {
      sampledAt: parsed.sampledAt ?? new Date().toISOString(),
      status: parsed.status ?? 'unknown',
      dbConnections: typeof parsed.activeConnections === 'number' ? parsed.activeConnections : null,
    };
  } catch {
    // Sampling darf den Test nie brechen — fehlendes Sample wird im Audit sichtbar.
    return { sampledAt: new Date().toISOString(), status: 'sample-failed', dbConnections: null };
  }
}

async function runExhaustion(config: ExhaustionConfig): Promise<ExhaustionOutcome> {
  const startedAt = new Date().toISOString();
  const sockets: net.Socket[] = [];
  const errorClasses: Record<string, number> = {};
  let openedConnections = 0;
  let firstRejectionAt: number | null = null;
  let firstRejectionError: string | null = null;

  const baseline = await samplePoolerHealth();
  console.log(
    `Baseline-Health: ${baseline.status} (${baseline.dbConnections ?? 'n/a'} DB-Verbindungen)`,
  );

  for (let attempt = 1; attempt <= config.count; attempt++) {
    const probe = await openProbeConnection(config);
    if (probe.kind === 'open' && probe.socket) {
      openedConnections += 1;
      sockets.push(probe.socket);
    } else {
      const errorClass = probe.errorClass ?? 'UNKNOWN';
      errorClasses[errorClass] = (errorClasses[errorClass] ?? 0) + 1;
      if (firstRejectionAt === null) {
        firstRejectionAt = attempt;
        firstRejectionError = probe.errorMessage ?? errorClass;
      }
    }
    if (attempt % 20 === 0) {
      console.log(`... ${attempt}/${config.count} Versuche (${openedConnections} offen)`);
    }
    await new Promise((resolve) => setTimeout(resolve, INTER_CONNECTION_DELAY_MS));
  }

  const atPeak = await samplePoolerHealth();
  console.log(`Peak-Health: ${atPeak.status} (${atPeak.dbConnections ?? 'n/a'} DB-Verbindungen)`);

  for (const socket of sockets) {
    socket.destroy();
  }

  const afterCleanup = await samplePoolerHealth();
  console.log(
    `Health nach Aufräumen: ${afterCleanup.status} (${afterCleanup.dbConnections ?? 'n/a'} DB-Verbindungen)`,
  );

  return {
    config,
    openedConnections,
    firstRejectionAt,
    firstRejectionError,
    errorClasses,
    healthSamples: [baseline, atPeak, afterCleanup],
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

async function main() {
  if (process.env.POOL_EXHAUSTION_CONFIRM !== 'local') {
    console.error(
      'FEHLER: POOL_EXHAUSTION_CONFIRM=local fehlt. Der Test öffnet absichtlich ' +
        'Verbindungen bis zur Kappe — die Bestätigung stellt sicher, dass das bewusst ' +
        'gegen die LOKALE Instanz (Port 54329) passiert.',
    );
    process.exitCode = 1;
    return;
  }

  const config = parseExhaustionConfig(process.argv.slice(2));
  assertLoopbackTarget(config.host);
  console.log(
    `Pool-Erschöpfungstest gegen ${config.host}:${config.port} (${config.count} Verbindungen)`,
  );

  const outcome = await runExhaustion(config);

  const auditsDir = path.join(REPO_ROOT, 'docs', 'database', 'audits');
  fs.mkdirSync(auditsDir, { recursive: true });
  const auditPath = path.join(auditsDir, `pool-exhaustion-${outcome.startedAt.slice(0, 10)}.md`);
  fs.writeFileSync(auditPath, buildExhaustionMarkdown(outcome), 'utf8');

  console.log(
    `\nErgebnis: ${outcome.openedConnections} Verbindungen offen, erste Zurückweisung bei ` +
      `Nr. ${outcome.firstRejectionAt ?? '—'} — Audit: ${path.relative(REPO_ROOT, auditPath)}`,
  );

  // Exit 0 auch bei Zurückweisungen: das Beobachten des Kappen-Verhaltens IST das Ziel.
  process.exitCode = 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
