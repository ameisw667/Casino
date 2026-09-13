import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  auditCatalogCoverage,
  RED_TEAM_CRITICAL_ROUTES,
  RED_TEAM_KNOWN_NOT_BUILT_ROUTES,
  type RedTeamCatalog,
} from '../../../../scripts/red-team/catalog-coverage';

// 06_7 L4 (R10): the probe catalog used to be a 2-case list with no route mapping and
// nothing compared it against the real route inventory — new money/auth routes could
// appear without any probe decision. This test pins the catalog to the canonical
// filesystem route list (same inventory as rate-limit-route-completeness.test.ts).
// Warn-only by plan decision: a NEW critical route without probe or documented decision
// is surfaced via console.warn, not a hard CI failure — only a stale/dead catalog entry
// fails, because that is a broken catalog rather than a coverage gap.

const API_ROOT = resolve(__dirname, '../../../app/api');
const CATALOG_PATH = resolve(__dirname, '../../../../scripts/red-team/test-catalog.json');

function collectRoutePaths(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return collectRoutePaths(fullPath);
    if (entry.isFile() && entry.name === 'route.ts') {
      return [
        relative(API_ROOT, fullPath)
          .split(sep)
          .join('/')
          .replace(/\/route\.ts$/, ''),
      ];
    }
    return [];
  });
}

function loadCatalog(): RedTeamCatalog {
  return JSON.parse(readFileSync(CATALOG_PATH, 'utf8')) as RedTeamCatalog;
}

describe('red-team catalog coverage (06_7 L4)', () => {
  it('every catalog case references a route that actually exists on disk', () => {
    const audit = auditCatalogCoverage(loadCatalog(), collectRoutePaths(API_ROOT));
    expect(audit.staleCatalogRoutes).toEqual([]);
  });

  it('every documented not-built follow-up route still exists on disk', () => {
    const audit = auditCatalogCoverage(loadCatalog(), collectRoutePaths(API_ROOT));
    expect(audit.deadKnownNotBuiltRoutes).toEqual([]);
  });

  it('no critical route falls through the cracks silently (warn-only visibility)', () => {
    const catalog = loadCatalog();
    const audit = auditCatalogCoverage(catalog, collectRoutePaths(API_ROOT));
    if (audit.uncoveredCriticalRoutes.length > 0) {
      // Warn-only by 06_7 L4 plan decision (no hard CI gate) — debug stream so the lint
      // no-console rule passes while vitest still surfaces the drift in CI output.
      console.debug(
        `[06_7 L4] critical routes without red-team probe or documented not-built decision: ` +
          `${audit.uncoveredCriticalRoutes.join(', ')}`,
      );
    }
    // The warn must never hide a known follow-up route behind a config error: every
    // critical route must be either covered by the catalog or on the not-built list.
    const covered = new Set(catalog.cases.flatMap((entry) => entry.routes ?? []));
    const accounted = [...covered, ...RED_TEAM_CRITICAL_ROUTES];
    expect(accounted.length).toBeGreaterThan(0);
    expect(audit.uncoveredCriticalRoutes).toEqual([]);
  });

  it('the not-built follow-up list is a subset of the critical route list (config consistency)', () => {
    for (const route of RED_TEAM_KNOWN_NOT_BUILT_ROUTES) {
      expect(RED_TEAM_CRITICAL_ROUTES, route).toContain(route);
    }
  });
});

describe('Test des Tests — gap detection (negative control, 06_7 L4)', () => {
  it('detects a simulated new money route that has neither probe nor not-built decision', () => {
    const catalog: RedTeamCatalog = {
      version: 2,
      environment: 'synthetic',
      cases: [{ id: 'rate-limit-bypass', class: 'rate-limit-bypass', routes: ['casino/bet'] }],
    };
    const audit = auditCatalogCoverage(
      catalog,
      ['casino/bet', 'casino/fake-new-money-route'],
      [...RED_TEAM_CRITICAL_ROUTES, 'casino/fake-new-money-route'],
    );
    expect(audit.uncoveredCriticalRoutes).toContain('casino/fake-new-money-route');
  });

  it('flags a catalog route that no longer exists on disk', () => {
    const catalog: RedTeamCatalog = {
      version: 2,
      environment: 'synthetic',
      cases: [{ id: 'x', class: 'x', routes: ['casino/removed-route'] }],
    };
    const audit = auditCatalogCoverage(catalog, ['casino/bet']);
    expect(audit.staleCatalogRoutes).toEqual(['casino/removed-route']);
  });

  it('a not-built route is never reported as uncovered while it stays on the follow-up list', () => {
    const catalog: RedTeamCatalog = {
      version: 2,
      environment: 'synthetic',
      cases: [{ id: 'x', class: 'x', routes: ['casino/jackpot-probe'] }],
    };
    const audit = auditCatalogCoverage(catalog, ['casino/jackpot', 'casino/jackpot-probe']);
    expect(audit.uncoveredCriticalRoutes).toEqual([]);
  });
});