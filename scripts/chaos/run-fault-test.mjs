// Konsolidiertes Chaos-Testskript — ersetzt invalidate-supabase-url.mjs/
// invalidate-upstash-token.mjs (siehe worldmap/05_1.10 ...md Abschnitt 11).
//
// Env-Steuerung:
//   CHAOS_CONFIRM=yes          Pflicht (siehe prod-guard.mjs).
//   CHAOS_TARGET=supabase|upstash   Welcher Proxy bekommt den Fault-Modus (Standard: supabase).
//   CHAOS_MODE=hang|reset|502|504|pass   Fault-Modus für CHAOS_TARGET (Standard: reset).
//   CHAOS_SESSION_COOKIE=...   Optional, für authentifizierten Nachweis (N5: nur via Env).
//
// F6: Der jeweils andere Proxy läuft immer in 'pass', beide sind unabhängig ansteuerbar.

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
// kein Ausgeben von Werten, kein Schreiben in diese Datei.
function readRealUpstreamUrls() {
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
  return { supabaseUrl, upstashUrl };
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

  let supabaseMode = 'pass';
  let upstashMode = 'pass';
  if (target === 'supabase') supabaseMode = mode;
  else upstashMode = mode;

  console.log(`Chaos-Testlauf: CHAOS_TARGET=${target}, CHAOS_MODE=${mode}`);

  const supabaseProxy = await createFaultProxy({
    port: SUPABASE_PROXY_PORT,
    upstreamOrigin: supabaseUrl,
    getMode: () => supabaseMode,
  });
  const upstashProxy = await createFaultProxy({
    port: UPSTASH_PROXY_PORT,
    upstreamOrigin: upstashUrl,
    getMode: () => upstashMode,
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
          ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        },
        body: JSON.stringify({ game: 'dice', amount: 1, requestId: crypto.randomUUID() }),
        signal: AbortSignal.timeout(10_000),
      });
      console.log(`Antwort: HTTP ${res.status}`);
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
      exitCode = res.status >= 500 && res.status < 600 ? 0 : 1;
      console.log(
        exitCode === 0 ? '✅ Fail-Closed bestätigt.' : `❌ Erwartet 5xx, erhalten ${res.status}.`,
      );
    } else if (!res) {
      // Kein res = Client-Timeout/Abort, konsistent mit hang. Health-Check entscheidet.
      exitCode = healthCheck !== 'UNREACHABLE' ? 0 : 1;
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
