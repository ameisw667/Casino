import { describe, expect, it } from 'vitest';
import { DEFAULT_VIP_CONFIG } from '@/lib/casino/vip-config';
import {
  createNeonLobbySnapshot,
  deriveLobbyRewards,
  formatTournamentCountdown,
} from '../neon-arcade-lobby-model';

describe('createNeonLobbySnapshot', () => {
  it('returns a deterministic timestamped pool without inventing tournament leaders', () => {
    const now = new Date('2026-08-14T12:34:56.000Z');
    const first = createNeonLobbySnapshot(now);
    const second = createNeonLobbySnapshot(now);

    expect(second).toEqual(first);
    expect(first.asOf).toBe(now.toISOString());
    expect(first.jackpot.amount).toBeGreaterThan(84_200);
    expect(first.jackpot.cadence).toBe('server-snapshot');
    expect(first.proofMetrics.map((metric) => metric.id)).toEqual([
      'total-paid',
      'average-payout',
      'bets-placed',
      'provably-fair',
    ]);
    expect(first.tournament.leaders).toEqual([]);
  });

  it('uses UTC day boundaries and advances the pool only with server time', () => {
    const now = new Date('2026-08-14T23:59:20.000Z');
    const nextMinute = new Date('2026-08-15T00:00:20.000Z');
    const snapshot = createNeonLobbySnapshot(now);
    const nextSnapshot = createNeonLobbySnapshot(nextMinute);

    expect(snapshot.tournament.startsAt).toBe('2026-08-14T00:00:00.000Z');
    expect(snapshot.tournament.endsAt).toBe('2026-08-15T00:00:00.000Z');
    expect(nextSnapshot.jackpot.amount - snapshot.jackpot.amount).toBeCloseTo(0.42, 2);
  });
});

describe('formatTournamentCountdown', () => {
  it('formats, clamps, and rejects invalid countdown values', () => {
    expect(
      formatTournamentCountdown(new Date('2026-08-14T20:58:57.000Z'), '2026-08-15T00:00:00.000Z'),
    ).toBe('03:01:03');
    expect(
      formatTournamentCountdown(new Date('2026-08-15T00:00:01.000Z'), '2026-08-15T00:00:00.000Z'),
    ).toBe('00:00:00');
    expect(formatTournamentCountdown(new Date('2026-08-14T20:00:00.000Z'), 'invalid')).toBe(
      '--:--:--',
    );
  });
});

describe('deriveLobbyRewards', () => {
  it('derives current tier, rakeback, next tier, and interval progress from active config', () => {
    const rewards = deriveLobbyRewards(10_000, DEFAULT_VIP_CONFIG.vipTiers);

    expect(rewards.currentTier.name).toBe('SILVER');
    expect(rewards.currentTier.rakeback).toBe(0.02);
    expect(rewards.nextTier?.name).toBe('GOLD');
    expect(rewards.progress).toBe(25);
    expect(rewards.xpToNext).toBe(15_000);
    expect(rewards.isMaxTier).toBe(false);
  });

  it('handles the maximum tier and ignores inactive tiers', () => {
    const tiers = DEFAULT_VIP_CONFIG.vipTiers.map((tier) =>
      tier.name === 'PLATINUM' ? { ...tier, isActive: false } : tier,
    );
    const rewards = deriveLobbyRewards(600_000, tiers);

    expect(rewards.currentTier.name).toBe('DIAMOND');
    expect(rewards.nextTier).toBeNull();
    expect(rewards.progress).toBe(100);
    expect(rewards.xpToNext).toBe(0);
    expect(rewards.isMaxTier).toBe(true);
  });
});
