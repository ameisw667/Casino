import { describe, expect, it } from 'vitest';
import {
  BROAD_QUERY_SET,
  buildBroadQueryMarkdown,
  type BroadQueryResult,
} from '../../../scripts/audit-broad-query-set';

describe('BROAD_QUERY_SET (Säule 7 N4 Allowlist)', () => {
  it('contains at least 3 non-money read paths', () => {
    expect(BROAD_QUERY_SET.length).toBeGreaterThanOrEqual(3);
  });

  it('only lists STABLE (read-only) RPCs with a verified migration source', () => {
    for (const entry of BROAD_QUERY_SET) {
      expect(entry.stableVerified).toBe(true);
      expect(entry.migrationFile).toMatch(/^0\d+_[a-z_]+\.sql$/);
      // Safety-Regel Abschnitt 0: keine Geld-RPCs (Schreibeffekte) in der Allowlist.
      expect([
        'settle_game_bet',
        'start_game_round',
        'settle_game_round',
        'advance_blackjack_round',
      ]).not.toContain(entry.name);
    }
    expect(BROAD_QUERY_SET.map((e) => e.name)).toContain('get_leaderboard');
  });
});

describe('buildBroadQueryMarkdown', () => {
  it('renders one section per measured path with plan details and a verdict', () => {
    const results: BroadQueryResult[] = [
      {
        name: 'get_leaderboard',
        meanMs: 12.4,
        plan: 'Index Scan using users_pkey ...',
        status: 'ok',
      },
      {
        name: 'get_community_stats',
        meanMs: 0,
        plan: '',
        status: 'failed',
        failureReason: 'HTTP 400',
      },
    ];
    const markdown = buildBroadQueryMarkdown(results, '2026-09-13T12:00:00.000Z');

    expect(markdown).toContain('# Breites Query-Set');
    expect(markdown).toContain('get_leaderboard');
    expect(markdown).toContain('12.4');
    expect(markdown).toContain('get_community_stats');
    expect(markdown).toContain('HTTP 400');
    expect(markdown).toContain('EXPLAIN (ANALYZE, BUFFERS)');
  });
});
