// 06_7 L4 (R10): keeps the red-team probe catalog from silently drifting away from the
// real route list (the original catalog listed only 2 case ids with no route mapping —
// exactly why new money/auth routes could appear without any probe decision). Pure
// functions only; the enforcing test lives in
// src/lib/security/__tests__/red-team-catalog-coverage.test.ts and deliberately WARNS
// (console.warn) instead of hard-failing on uncovered routes, while a catalog case that
// references a nonexistent route IS a hard failure (that is a broken catalog, not a
// coverage gap).
//
// Route paths are relative to src/app/api, separator-normalized — the same canonical
// inventory the 06_6 L3 completeness test collects from the filesystem.

export interface CatalogCase {
  id: string;
  class: string;
  routes?: string[];
}

export interface RedTeamCatalog {
  version: number;
  environment: string;
  cases: CatalogCase[];
}

// Money/auth-critical routes that SHOULD eventually have a red-team probe or an explicit
// documented decision. Union of the originally covered routes, the R5 gap list and the two
// 06_6-known unguarded routes.
export const RED_TEAM_CRITICAL_ROUTES: readonly string[] = [
  'casino/bet',
  'casino/blackjack',
  'casino/redeem-code',
  'casino/bet-crash-multiplayer',
  'casino/guide-persona',
  'casino/jackpot',
  'auth/login-guard',
  'auth/signup-suspicion',
  'admin/users',
  'admin/fraud',
  'admin/promo-codes',
  'user/balance',
  'user/self-exclusion',
  'tournaments/daily-race',
  'telegram/webhook',
];

// The 7 routes deliberately NOT probed in the 06_7 scope (plan L3 Nicht-Scope) — they must
// stay documented here so the coverage audit reports "known, not built" instead of a
// silent gap. Removing a route from the codebase turns this into a dead entry the test
// flags.
export const RED_TEAM_KNOWN_NOT_BUILT_ROUTES: readonly string[] = [
  'casino/jackpot',
  'user/balance',
  'tournaments/daily-race',
  'admin/promo-codes',
  'casino/guide-persona',
  'telegram/webhook',
  'user/self-exclusion',
];

export interface CatalogCoverageAudit {
  /** Catalog routes that do not exist on disk — hard failure in the test. */
  staleCatalogRoutes: string[];
  /** Critical routes with neither a probe nor a documented not-built decision — warn-only. */
  uncoveredCriticalRoutes: string[];
  /** Documented follow-up routes that no longer exist on disk — hard failure in the test. */
  deadKnownNotBuiltRoutes: string[];
}

export function auditCatalogCoverage(
  catalog: RedTeamCatalog,
  existingRoutes: readonly string[],
  // Overridable so the negative-control test can simulate a NEW critical route without
  // mutating the module constants.
  criticalRoutes: readonly string[] = RED_TEAM_CRITICAL_ROUTES,
  knownNotBuiltRoutes: readonly string[] = RED_TEAM_KNOWN_NOT_BUILT_ROUTES,
): CatalogCoverageAudit {
  const existing = new Set(existingRoutes);
  const covered = new Set(catalog.cases.flatMap((entry) => entry.routes ?? []));

  return {
    staleCatalogRoutes: [...covered].filter((route) => !existing.has(route)),
    uncoveredCriticalRoutes: criticalRoutes.filter(
      (route) => existing.has(route) && !covered.has(route) && !knownNotBuiltRoutes.includes(route),
    ),
    deadKnownNotBuiltRoutes: [...knownNotBuiltRoutes].filter((route) => !existing.has(route)),
  };
}