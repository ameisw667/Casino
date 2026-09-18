import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// T_SECURITY_HARDENING/04_csrf_origin_guard.md L2 — instead of pinning a hand-kept list, this
// inventory discovers every mutation route dynamically and enforces Layer 2
// (validateMutationOrigin) on all of them except a reason-documented, secret-authenticated
// exemption allowlist. A new browser mutation route without the guard now fails this test
// automatically, instead of silently shipping without depth-of-defense.

const root = resolve(__dirname, '../../../..');
const apiDir = resolve(root, 'src/app/api');

const MUTATION_EXPORT_PATTERN =
  /export\s+(?:async\s+)?(?:function|const)\s+(?:POST|PATCH|DELETE|PUT)\b|export\s*\{[^}]*\b(?:POST|PATCH|DELETE|PUT)\b/;

// Machine endpoints whose mutation handler is not a browser mutation: authenticated by a secret or
// signature instead of a browser Origin (plan §2 #4), or retired to a constant 410 (no mutation
// left to protect). Each entry pairs the route with the source-text token its auth story must
// contain — a new exemption here is a security decision, not a convenience.
const EXEMPTED_MUTATION_ROUTES = [
  { path: 'src/app/api/telegram/webhook/route.ts', authStoryToken: /secret/i },
  { path: 'src/app/api/webhooks/clerk/route.ts', authStoryToken: /retired/i },
  // Review correction (2026-09-13): both routes are constant-410 stubs ("... has been retired"),
  // no mutation left to protect — same story as webhooks/clerk, not open gaps.
  { path: 'src/app/api/casino/migrate-session/route.ts', authStoryToken: /retired/i },
  { path: 'src/app/api/casino/session-sync/route.ts', authStoryToken: /retired/i },
  { path: 'src/app/api/internal/wallet-events/route.ts', authStoryToken: /secret/i },
  { path: 'src/app/api/internal/cron-alert/route.ts', authStoryToken: /secret|CRON/i },
  { path: 'src/app/api/internal/big-win-events/route.ts', authStoryToken: /secret/i },
  {
    path: 'src/app/api/internal/csp-report/route.ts',
    authStoryToken: /Unauthenticated by design/,
  },
] as const;

// Follow-up finding (round-2 dynamic scan, 2026-09-12; corrected 2026-09-13): these
// browser-triggered mutation routes still ship without Layer 2. The executed plan scoped L1 to
// guide-persona and login-history only; touching the auth/session bootstrap flow
// (login-guard, signup-suspicion) was deliberately out of scope. migrate-session/session-sync
// initially landed here by mistake — they are retired 410 stubs and now sit on the exemption
// list above. This list is a tripwire, not an exemption: it fails when a third gap appears AND
// when one of these two is fixed — either way the list must be consciously updated.
const OPEN_LAYER_2_GAPS = [
  'src/app/api/auth/login-guard/route.ts',
  'src/app/api/auth/signup-suspicion/route.ts',
] as const;

// Complete Layer-2 inventory pinned after L1 (guide-persona, login-history added). Merge note
// (2026-09-18, security-round3-final-merge → codex/uncommitted-cohort-review): admin/users/[id]/status
// and admin/promo-codes/[code]/reverse existed only as uncommitted main-directory files when this
// list was authored — they, and auth/signup-fingerprint (added independently on main after this
// branch diverged), all already call validateMutationOrigin(); this only pins them.
const GUARDED_INVENTORY = [
  'src/app/api/admin/digest-preview/start/route.ts',
  'src/app/api/admin/fraud/complete-wait/route.ts',
  'src/app/api/admin/fraud/scan/route.ts',
  'src/app/api/admin/fraud/route.ts',
  'src/app/api/admin/knowledge/route.ts',
  'src/app/api/admin/promo-codes/[code]/reverse/route.ts',
  'src/app/api/admin/promo-codes/route.ts',
  'src/app/api/admin/users/[id]/status/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/auth/signup-fingerprint/route.ts',
  'src/app/api/casino/bet-crash-multiplayer/route.ts',
  'src/app/api/casino/bet/route.ts',
  'src/app/api/casino/blackjack/route.ts',
  'src/app/api/casino/guide-persona/route.ts',
  'src/app/api/casino/redeem-code/route.ts',
  'src/app/api/casino/seeds/route.ts',
  'src/app/api/chat/bot-response/route.ts',
  'src/app/api/chat/feedback/route.ts',
  'src/app/api/chat/route.ts',
  'src/app/api/chat/voice-synthesize/route.ts',
  'src/app/api/chat/voice-transcribe/route.ts',
  'src/app/api/notifications/[id]/route.ts',
  'src/app/api/notifications/read-all/route.ts',
  'src/app/api/telegram/link/route.ts',
  'src/app/api/telegram/toggle/route.ts',
  'src/app/api/telegram/unlink/route.ts',
  'src/app/api/user/login-history/route.ts',
  'src/app/api/user/self-exclusion/route.ts',
  'src/app/api/user/stats/route.ts',
] as const;

function collectRouteFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectRouteFiles(full, acc);
    } else if (entry === 'route.ts') {
      acc.push(relative(root, full).replaceAll('\\', '/'));
    }
  }
  return acc;
}

const allRoutes = collectRouteFiles(apiDir).sort();
const mutationRoutes = allRoutes.filter((path) =>
  MUTATION_EXPORT_PATTERN.test(readFileSync(resolve(root, path), 'utf8')),
);
const exempted = mutationRoutes.filter((path) =>
  (EXEMPTED_MUTATION_ROUTES as readonly { path: string }[]).some(
    (exemption) => exemption.path === path,
  ),
);
const openGaps = mutationRoutes.filter((path) =>
  (OPEN_LAYER_2_GAPS as readonly string[]).includes(path),
);
const guardedRoutes = mutationRoutes.filter(
  (path) => !exempted.includes(path) && !openGaps.includes(path),
);

describe('browser mutation origin inventory', () => {
  it('requires validateMutationOrigin in every discovered non-exempt mutation route', () => {
    for (const path of guardedRoutes) {
      const route = readFileSync(resolve(root, path), 'utf8');
      expect(route, `${path} must call validateMutationOrigin`).toContain('validateMutationOrigin');
    }
  });

  it('pins the complete Layer-2 inventory so it cannot silently shrink or drift', () => {
    expect(guardedRoutes.sort()).toEqual([...GUARDED_INVENTORY].sort());
  });

  it('keeps the open Layer-2 gaps visible as a tripwire, not as silent exemptions', () => {
    const actualUnguarded = mutationRoutes.filter(
      (path) => !exempted.includes(path) && !guardedRoutes.includes(path),
    );
    expect(actualUnguarded.sort()).toEqual([...OPEN_LAYER_2_GAPS].sort());
  });

  it('exempts only routes with a non-browser auth story, verified against their source', () => {
    for (const { path, authStoryToken } of EXEMPTED_MUTATION_ROUTES) {
      const route = readFileSync(resolve(root, path), 'utf8');
      expect(
        authStoryToken.test(route),
        `${path} exemption needs its documented auth story in source`,
      ).toBe(true);
    }
  });

  it.each(guardedRoutes)('%s rejects cross-origin input before parsing a body', (path) => {
    const route = readFileSync(resolve(root, path), 'utf8');
    const guardMatch = route.match(/const \w+ = validateMutationOrigin\(request\);/);
    const parseIndex = route.indexOf('await request.json()');

    expect(route).toContain('validateMutationOrigin');
    expect(guardMatch).not.toBeNull();
    if (parseIndex > -1 && guardMatch) {
      expect(guardMatch.index).toBeLessThan(parseIndex);
    }
  });
});
