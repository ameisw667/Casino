import { randomUUID } from 'node:crypto';
import { assertSafePhase1Target } from './target-guard';

// P1.4 origin-bypass probe (T_SECURITY_HARDENING/04 Runde 2, L5): verifies the two-layer CSRF
// Origin-Guard on a real money route against three attack shapes:
//   1. forged Origin, no Sec-Fetch-Site        -> rejected by Layer 1 (proxy hasValidOrigin)
//   2. neither Origin nor Sec-Fetch-Site       -> rejected by Layer 1 (fail-closed, M4)
//   3. forged Origin + SPOOFED Sec-Fetch-Site  -> rejected by Layer 2 (route-level
//      validateMutationOrigin) — a direct API client can set the header; only this layer catches it
// The body stays `{}` so that even a failing guard cannot reach the money operation: the invalid
// input stops at body validation, mirroring the safe design of rate-limit-bypass.ts.

const FORGED_ORIGIN = 'https://attacker.example';

type ProbeCase = {
  name: string;
  origin?: string;
  secFetchSite?: string;
  expectedRejectionLayer: string;
};

const probeCases: ProbeCase[] = [
  { name: 'forged-origin', origin: FORGED_ORIGIN, expectedRejectionLayer: 'layer1-edge' },
  { name: 'missing-origin-headers', expectedRejectionLayer: 'layer1-edge-fail-closed' },
  {
    name: 'spoofed-sec-fetch-site',
    origin: FORGED_ORIGIN,
    secFetchSite: 'same-origin',
    expectedRejectionLayer: 'layer2-route',
  },
];

async function runProbe(target: { url: string }, probeCase: ProbeCase, cookie: string) {
  const headers = new Headers({
    cookie,
    'content-type': 'application/json',
    'Idempotency-Key': randomUUID(),
  });
  if (probeCase.origin) headers.set('origin', probeCase.origin);
  if (probeCase.secFetchSite) headers.set('sec-fetch-site', probeCase.secFetchSite);

  const response = await fetch(new URL('/api/casino/bet', target.url), {
    method: 'POST',
    headers,
    body: '{}',
  });

  // 403 is the Origin-Guard contract on both layers. 400/401/429 would mean the guard did not
  // fire first and the request slipped past — that must fail the probe, not pass it.
  if (response.status !== 403) {
    throw new Error(
      `P1.4 origin-bypass contract failed for case '${probeCase.name}' ` +
        `(expected rejection by ${probeCase.expectedRejectionLayer}, got ${response.status})`,
    );
  }
  return { name: probeCase.name, layer: probeCase.expectedRejectionLayer, status: response.status };
}

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_AUTH_COOKIE?.trim();
  if (!cookie) throw new Error('RED_TEAM_AUTH_COOKIE is required');

  const results = await Promise.all(
    probeCases.map((probeCase) => runProbe(target, probeCase, cookie)),
  );
  console.log(
    `P1.4 origin-bypass probes passed: ${results.map((result) => result.name).join(', ')}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.4 origin-bypass probe failed');
  process.exitCode = 1;
});
