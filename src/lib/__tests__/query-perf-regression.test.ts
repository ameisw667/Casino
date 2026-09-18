import { describe, expect, it } from 'vitest';
import { detectRegression } from '../../../scripts/check-query-performance-regression';
import type { TrendRecord } from '../../../scripts/query-perf-trend';

function record(paths: TrendRecord['paths'], seqScanTables: string[] = []): TrendRecord {
  return {
    timestamp: '2026-09-13T12:00:00.000Z',
    mode: 'cli',
    findings: { calls: 0, seqScans: seqScanTables.length },
    paths,
    seqScanTables,
  };
}

describe('detectRegression', () => {
  it('flags a p95/mean deterioration above the threshold', () => {
    const previous = record([{ name: 'get_leaderboard', meanMs: 10, calls: 100 }]);
    const current = record([{ name: 'get_leaderboard', meanMs: 14.5, calls: 100 }]);

    const result = detectRegression(previous, current, { deteriorationPct: 25 });
    expect(result.regressed).toBe(true);
    expect(result.reasons[0]).toContain('get_leaderboard');
    expect(result.reasons[0]).toContain('45');
  });

  it('stays green with stable values and small noise', () => {
    const previous = record([{ name: 'get_leaderboard', meanMs: 10, calls: 100 }]);
    const current = record([{ name: 'get_leaderboard', meanMs: 11, calls: 100 }]);

    expect(detectRegression(previous, current, { deteriorationPct: 25 }).regressed).toBe(false);
  });

  it('flags a new seq-scan finding that was absent in the previous run', () => {
    const previous = record([{ name: 'a', meanMs: 5, calls: 10 }], []);
    const current = record([{ name: 'a', meanMs: 5, calls: 10 }], ['casino_bets']);

    const result = detectRegression(previous, current, { deteriorationPct: 25 });
    expect(result.regressed).toBe(true);
    expect(result.reasons.some((r) => r.includes('casino_bets'))).toBe(true);
  });

  it('ignores paths that disappeared from the current run', () => {
    const previous = record([
      { name: 'old-hot-path', meanMs: 9, calls: 50 },
      { name: 'stable', meanMs: 10, calls: 10 },
    ]);
    const current = record([{ name: 'stable', meanMs: 10, calls: 10 }]);

    expect(detectRegression(previous, current, { deteriorationPct: 25 }).regressed).toBe(false);
  });

  it('ignores paths that appear only in the current run (first measurement)', () => {
    const previous = record([]);
    const current = record([{ name: 'brand-new', meanMs: 80, calls: 1 }]);

    expect(detectRegression(previous, current, { deteriorationPct: 25 }).regressed).toBe(false);
  });
});
