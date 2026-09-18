// Konsolidiertes Chaos-Testskript — ersetzt invalidate-supabase-url.mjs/
// invalidate-upstash-token.mjs (siehe worldmap/05_1.10 ...md Abschnitt 11).
//
// Env-Steuerung:
//   CHAOS_CONFIRM=yes          Pflicht (siehe prod-guard.mjs).
//   CHAOS_TARGET=supabase|upstash   Welcher Proxy bekommt den Fault-Modus (Standard: supabase).
//   CHAOS_MODE=hang|reset|502|504|pass|transient   Fault-Modus für CHAOS_TARGET (Standard: reset).
//   CHAOS_SESSION_COOKIE=...   Optional, für authentifizierten Nachweis (N5: nur via Env).
//   CHAOS_UPSTREAM_URL=...     Optional: überschreibt die echte Supabase-URL (z. B. lokale
//                              Instanz http://127.0.0.1:54321) — nur Loopback-Hosts erlaubt;
//                              verhindert reale Remote-Writes bei L6-Retry-Läufen.
//   CHAOS_UPSTASH_URL=...      Optional: dieselbe Loopback-Only-Override für die
//                              Upstash-URL — ohne sie bleibt der Remote-Upstash live.
//
// F6: Der jeweils andere Proxy läuft immer in 'pass', beide sind unabhängig ansteuerbar.
//
// N3 (Säule 8): Modus `transient` — der Proxy faultet GENAU EINEN POST (reset-Semantik)
// und lässt danach alles durch. Nach L6 (Retry-/Backoff-Logik in WalletService) ist die
// erwartete Antwort 200 mit korrektem WalletSnapshot (der Retry ruft denselben RPC mit
// derselben requestId auf = Idempotenz-Replay). Dauerfault-Modi bleiben unverändert und
// erwarten weiterhin durchgehend 5xx (der Retry erschöpft sich, fail-closed).
//
// Security-Review-Fix (LOW): CHAOS_UPSTASH_URL — analog zur Supabase-Override erlaubt
// auch der Upstash-URL einen Loopback-Only-Override. Ohne ihn bliebe in
// "lokalem" Override-Modus der echte Remote-Upstash live (Rate-Limit-Counter-Write).

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertSafeToRunChaosTest } from './lib/prod-guard.mjs';
import { createFaultProxy } from './lib/fault-proxy.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

const SUPABASE_PROXY_PORT = 3196;
const UPSTASH_PROXY_PORT = 3197;
const APP_PORT = 3099;
const READY_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;

// Liest NUR die beiden benötigten öffentlichen URLs aus .env.local — keine Secrets,
// kein Ausgeben von Werten, kein Schreiben in diese Datei. CHAOS_UPSTREAM_URL
// überschreibt die Supabase-URL (nur Loopback-Hosts) für lokale Läufe ohne Remote-Berührung.
function readRealUpstreamUrls() {
  const upstreamOverride = process.env.CHAOS_UPSTREAM_URL;
  if (upstreamOverride) {
    let overrideOrigin;
    try {
      overrideOrigin = new URL(upstreamOverride).origin;
    } catch {
      console.error('FEHLER: CHAOS_UPSTREAM_URL ist keine gültige URL.');
      process.exit(1);
    }
    const host = new URL(overrideOrigin).hostname;
    if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
      console.error(
        'FEHLER: CHAOS_UPSTREAM_URL muss auf einen Loopback-Host zeigen (kein Remote-Treffer).',
      );
      process.exit(1);
    }
    const upstashUrl = readUpstashUrl();
    if (!upstashUrl) process.exit(1);
    return { supabaseUrl: overrideOrigin, upstashUrl: applyUpstashOverride(upstashUrl) };
  }

  const envPath = path.join(REPO_ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(
      'FEHLER: .env.local nicht gefunden — wird nur zum Lesen der echten Supabase-/Upstash-URL gebraucht.',
    );
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const find = (key) => {
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
  };
  const supabaseUrl = find('NEXT_PUBLIC_SUPABASE_URL');
  const upstashUrl = find('UPSTASH_REDIS_REST_URL');
  if (!supabaseUrl || !upstashUrl) {
    console.error(
      'FEHLER: NEXT_PUBLIC_SUPABASE_URL oder UPSTASH_REDIS_REST_URL fehlt in .env.local.',
    );
    process.exit(1);
  }
  return { supabaseUrl, upstashUrl: applyUpstashOverride(upstashUrl) };
}

function readUpstashUrl() {
  const envPath = path.join(REPO_ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('FEHLER: .env.local nicht gefunden (UPSTASH_REDIS_REST_URL).');
    return undefined;
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^UPSTASH_REDIS_REST_URL=(.*)$/m);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

// Security-Review-Fix (LOW): Optionale Upstash-Loopback-Override mit demselben
// Guard wie die Supabase-Variante — ohne sie bleibt der echte Remote-Upstash live.
function applyUpstashOverride(upstashUrl) {
  const upstashOverride = process.env.CHAOS_UPSTASH_URL;
  if (!upstashOverride) return upstashUrl;
  let origin;
  try {
    origin = new URL(upstashOverride).origin;
  } catch {
    console.error('FEHLER: CHAOS_UPSTASH_URL ist keine gültige URL.');
    process.exit(1);
  }
  const host = new URL(origin).hostname;
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
    console.error(
      'FEHLER: CHAOS_UPSTASH_URL muss auf einen Loopback-Host zeigen (kein Remote-Treffer).',
    );
    process.exit(1);
  }
  return origin;
}

async function waitForReady(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch {
      // Noch nicht bereit.
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return false;
}

async function main() {
  assertSafeToRunChaosTest();

  const target = process.env.CHAOS_TARGET === 'upstash' ? 'upstash' : 'supabase';
  const mode = process.env.CHAOS_MODE || 'reset';
  const { supabaseUrl, upstashUrl } = readRealUpstreamUrls();

  // Defense-in-Depth (Security-Review LOW): sobald ein Loopback-Override aktiv ist,
  // wird der Proxy an genau diese Loopback-Hosts gelockt — ein künftiger
  // Code-Pfad kann den Guard nicht mehr umgehen.
  const overrideActive = Boolean(process.env.CHAOS_UPSTREAM_URL || process.env.CHAOS_UPSTASH_URL);
  const hostLock = overrideActive ? ['127.0.0.1', 'localhost', '::1'] : undefined;

  let supabaseMode = 'pass';
  let upstashMode = 'pass';
  if (target === 'supabase') supabaseMode = mode;
  else upstashMode = mode;

  console.log(`Chaos-Testlauf: CHAOS_TARGET=${target}, CHAOS_MODE=${mode}`);

  const supabaseProxy = await createFaultProxy({
    port: SUPABASE_PROXY_PORT,
    upstreamOrigin: supabaseUrl,
    getMode: () => supabaseMode,
    allowedUpstreamHosts: hostLock,
  });
  const upstashProxy = await createFaultProxy({
    port: UPSTASH_PROXY_PORT,
    upstreamOrigin: upstashUrl,
    getMode: () => upstashMode,
    allowedUpstreamHosts: hostLock,
  });

  let child;
  let exitCode = 1;

  try {
    console.log(`Starte isolierten next-Prozess auf Port ${APP_PORT} ...`);
    child = spawn('npx', ['next', 'dev', '--port', String(APP_PORT)], {
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${SUPABASE_PROXY_PORT}`,
        UPSTASH_REDIS_REST_URL: `http://127.0.0.1:${UPSTASH_PROXY_PORT}`,
        // R7: Sentry im isolierten Testprozess deaktivieren (kein DSN -> SDK-No-Op).
        NEXT_PUBLIC_SENTRY_DSN: '',
      },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let childOutput = '';
    child.stdout.on('data', (d) => (childOutput += d.toString()));
    child.stderr.on('data', (d) => (childOutput += d.toString()));

    const ready = await waitForReady(APP_PORT, READY_TIMEOUT_MS);
    if (!ready) {
      console.error(
        `FEHLER: Isolierter next-Prozess wurde innerhalb von ${READY_TIMEOUT_MS}ms nicht bereit.`,
      );
      if (childOutput.includes('Another next dev server is already running')) {
        console.error(
          '\nURSACHE: Next.js erlaubt nur EINEN next-dev-Prozess pro Projekt (Singleton-Lock), ' +
            'auch auf unterschiedlichen Ports. Schließe deinen normalen "npm run dev" (Port 3015), ' +
            'bevor du einen Chaos-Testlauf startest — siehe Plan Abschnitt 3.7.',
        );
      } else {
        console.error('\nLetzte Prozess-Ausgabe:\n' + childOutput.slice(-1500));
      }
      // Direkt setzen, nicht nur die lokale Variable: ein früher `return` hier
      // überspringt die `process.exitCode = exitCode`-Zeile nach dem try/finally.
      process.exitCode = 1;
      return;
    }

    console.log('Prozess bereit. Feuere POST /api/casino/bet ...');
    const sessionCookie = process.env.CHAOS_SESSION_COOKIE;
    if (!sessionCookie) {
      console.warn(
        'Hinweis: CHAOS_SESSION_COOKIE nicht gesetzt — Request läuft unauthentifiziert.',
      );
    }

    let res;
    try {
      res = await fetch(`http://127.0.0.1:${APP_PORT}/api/casino/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // validateMutationOrigin() verlangt einen Origin-Header, der im Dev-Fallback
          // (kein APP_ORIGINS gesetzt) exakt der eigenen Request-Origin entsprechen muss.
          Origin: `http://127.0.0.1:${APP_PORT}`,
          ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        },
        // Korrigiert gegen requestSchema (Säule 8 N3-Befund): der alte Body
        // `{ game: 'dice', ... }` scheiterte an `clientSeed`-Pflicht → immer 400,
        // bevor irgendein supabase-POST gefeuert wird — die 5xx-Prüfung war dadurch
        // am Baseline-Stand defekt.
        body: JSON.stringify({
          gameType: 'DICE',
          amount: 1,
          target: 50,
          condition: 'OVER',
          clientSeed: 'chaos-seed',
          requestId: crypto.randomUUID(),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      const bodyText = await res
        .clone()
        .text()
        .catch(() => '(Body nicht lesbar)');
      console.log(`Antwort: HTTP ${res.status} — Body: ${bodyText.slice(0, 200)}`);
    } catch (err) {
      console.log(
        `Request lief in einen Client-seitigen Timeout/Abbruch (${err.name}) — erwartet bei mode=hang.`,
      );
    }

    // QA-Perspektive (Plan Abschnitt 4.3/7): nach hang/reset/50x prüfen, ob der
    // next-Prozess selbst noch reagiert, nicht nur ob unser Request abgebrochen ist.
    const healthCheck = await fetch(`http://127.0.0.1:${APP_PORT}/`, {
      signal: AbortSignal.timeout(5000),
    }).then(
      (r) => r.status,
      () => 'UNREACHABLE',
    );
    console.log(`Health-Check nach dem Testrequest: ${healthCheck}`);

    if (sessionCookie && res) {
      if (mode === 'transient') {
        // N3: nach L6 kompensiert der Retry den einmaligen Fault — 200 erwartet.
        exitCode = res.status === 200 ? 0 : 1;
        console.log(
          exitCode === 0
            ? '✅ L6-Retry bestätigt: einmaliger transianter Fault wurde kompensiert (200).'
            : `❌ transient: erwartet 200 nach L6-Retry, erhalten ${res.status}.`,
        );
      } else {
        exitCode = res.status >= 500 && res.status < 600 ? 0 : 1;
        console.log(
          exitCode === 0 ? '✅ Fail-Closed bestätigt.' : `❌ Erwartet 5xx, erhalten ${res.status}.`,
        );
      }
    } else if (!res) {
      // Kein res = Client-Timeout/Abort, konsistent mit hang. Health-Check entscheidet.
      exitCode = healthCheck !== 'UNREACHABLE' ? 0 : 1;
    } else if (mode === 'transient') {
      // Security-Review-Fix (LOW): transient OHNE Session-Cookie kann die Retry-
      // Aussage gar nicht prüfen (unauthentifizierte Requests laufen nie in einen
      // Geld-RPC) — ein "Pass" wäre leeres Ergebnis. Bewusst rot markieren.
      exitCode = 1;
      console.error(
        '❌ transient erfordert CHAOS_SESSION_COOKIE — ohne authentifizierten Request ist keine L6-Retry-Aussage möglich.',
      );
    } else {
      exitCode = 0;
      console.log(
        'Kein authentifizierter Nachweis ohne CHAOS_SESSION_COOKIE — nur Server-Antwortverhalten geprüft.',
      );
    }
  } finally {
    if (child) child.kill();
    await supabaseProxy.close();
    await upstashProxy.close();
    console.log('Isolierter Prozess und beide Proxys beendet.');
  }

  process.exitCode = exitCode;
}

main();
