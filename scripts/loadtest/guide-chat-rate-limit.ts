/**
 * Stufe R / R14 — Rate-Limit-/Kosten-Abuse-Test unter echter Last für den Royale Guide.
 * Feuert einen echten Burst von Requests gegen den lokalen Dev-Server
 * (POST /api/chat/bot-response, stream:false, eine Frage ohne Tool-Trigger) und
 * beobachtet, ob die dokumentierte 30-Anfragen/60-Sekunden-Grenze (Abschnitt 3 von
 * Z_LLM/10_llm_erweiterung.md) tatsächlich greift — inklusive Recovery nach Ablauf
 * des Fensters. Läuft gegen die echte Upstash-Sliding-Window-Instanz (kein Mock),
 * da UPSTASH_REDIS_REST_URL/TOKEN in .env.local gesetzt sind.
 *
 * Kosten-Hinweis: jeder erfolgreiche (< 429) Request löst einen echten,
 * nicht-streamenden OpenAI-Call aus (1 Call/Request, kein Tool-Trigger durch die
 * gewählte Frage) — bei den bereits gemessenen ~$0.0002/Request (siehe R13) bleiben
 * die Gesamtkosten dieses Tests im Bereich weniger US-Cent.
 *
 * Run: npx tsx scripts/loadtest/guide-chat-rate-limit.ts
 */

import fs from 'fs';
import path from 'path';

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const BASE_URL = process.env.LOADTEST_BASE_URL || 'http://localhost:3015';
const BURST_SIZE = 35; // documented limit (30) + clean margin (5) over the 60s window
const QUESTION = 'Was ist der Unterschied zwischen Hard Total und Soft Total beim Blackjack?';

type RequestResult = {
  index: number;
  status: number;
  elapsedMs: number;
  rateLimitLimit: string | null;
  rateLimitRemaining: string | null;
  retryAfter: string | null;
};

async function fireRequest(index: number): Promise<RequestResult> {
  const startedAt = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/api/chat/bot-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({ message: QUESTION, stream: false }),
    });
    // Drain the body so the connection is fully consumed before the next request.
    await res.text().catch(() => undefined);
    return {
      index,
      status: res.status,
      elapsedMs: Math.round(performance.now() - startedAt),
      rateLimitLimit: res.headers.get('x-ratelimit-limit'),
      rateLimitRemaining: res.headers.get('x-ratelimit-remaining'),
      retryAfter: res.headers.get('retry-after'),
    };
  } catch (err) {
    return {
      index,
      status: -1,
      elapsedMs: Math.round(performance.now() - startedAt),
      rateLimitLimit: null,
      rateLimitRemaining: null,
      retryAfter: err instanceof Error ? err.message : String(err),
    };
  }
}

function summarize(results: RequestResult[]): void {
  const succeeded = results.filter((r) => r.status === 200);
  const rateLimited = results.filter((r) => r.status === 429);
  const other = results.filter((r) => r.status !== 200 && r.status !== 429);
  const firstRateLimited = results.find((r) => r.status === 429);

  console.log(`\n=== Burst-Ergebnis (${results.length} Requests) ===`);
  console.log(`200 OK:        ${succeeded.length}`);
  console.log(`429 Too Many:  ${rateLimited.length}`);
  console.log(
    `Sonstige:      ${other.length}${other.length > 0 ? ` (Status: ${other.map((r) => r.status).join(', ')})` : ''}`,
  );
  if (firstRateLimited) {
    console.log(
      `Erster 429 bei Request #${firstRateLimited.index} — Limit=${firstRateLimited.rateLimitLimit} Retry-After=${firstRateLimited.retryAfter}s`,
    );
  }
  const limitHeader = results.find((r) => r.rateLimitLimit !== null)?.rateLimitLimit;
  console.log(`X-RateLimit-Limit laut Server: ${limitHeader ?? 'nicht gesetzt'}`);

  console.log('\nDetail (Index, Status, ms, Remaining):');
  for (const r of results) {
    console.log(
      `  #${r.index}: ${r.status} in ${r.elapsedMs}ms remaining=${r.rateLimitRemaining ?? '-'}`,
    );
  }
}

async function main(): Promise<void> {
  console.log(`=== Stufe R / R14 — Guide-Chat Rate-Limit-Burst gegen ${BASE_URL} ===`);
  console.log(`Sende ${BURST_SIZE} Requests parallel (echter Burst, kein gestufter Ramp-up)...`);

  const results = await Promise.all(
    Array.from({ length: BURST_SIZE }, (_, i) => fireRequest(i + 1)),
  );
  results.sort((a, b) => a.index - b.index);
  summarize(results);

  const firstRateLimited = results.find((r) => r.status === 429);
  if (!firstRateLimited) {
    console.log(
      '\nKein 429 im Burst beobachtet — Rate-Limit hat nicht ausgelöst. Test-Ergebnis: siehe oben.',
    );
    return;
  }

  const resetSeconds = firstRateLimited.retryAfter ? Number(firstRateLimited.retryAfter) : 61;
  const waitMs = (Number.isFinite(resetSeconds) ? resetSeconds : 61) * 1000 + 2000;
  console.log(
    `\nWarte ${Math.round(waitMs / 1000)}s auf Fenster-Reset, dann 1 Recovery-Request...`,
  );
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  const recovery = await fireRequest(BURST_SIZE + 1);
  console.log(
    `Recovery-Request nach Wartezeit: Status=${recovery.status} in ${recovery.elapsedMs}ms remaining=${recovery.rateLimitRemaining ?? '-'}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
