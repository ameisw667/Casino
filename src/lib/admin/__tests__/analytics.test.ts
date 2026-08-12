import { describe, expect, it } from 'vitest';
import { buildAdminAnalytics } from '../analytics';

describe('buildAdminAnalytics', () => {
  it('keeps registration and first-wager cohorts distinct while measuring eligible retention', () => {
    const analytics = buildAdminAnalytics({
      now: '2026-08-10T12:00:00.000Z',
      users: [
        { id: 'early-player', createdAt: '2026-07-01T10:00:00.000Z', xp: 6_000 },
        { id: 'late-player', createdAt: '2026-07-02T10:00:00.000Z', xp: 0 },
      ],
      bets: [
        { userId: 'early-player', occurredAt: '2026-07-02T10:00:00.000Z', wager: 5, payout: 0 },
        { userId: 'early-player', occurredAt: '2026-07-03T10:00:00.000Z', wager: 100, payout: 80 },
        { userId: 'early-player', occurredAt: '2026-07-04T10:00:00.000Z', wager: 50, payout: 0 },
        { userId: 'early-player', occurredAt: '2026-07-08T10:00:00.000Z', wager: 10, payout: 0 },
        { userId: 'early-player', occurredAt: '2026-07-09T10:00:00.000Z', wager: 10, payout: 0 },
        { userId: 'early-player', occurredAt: '2026-07-10T10:00:00.000Z', wager: 20, payout: 40 },
        { userId: 'late-player', occurredAt: '2026-07-20T10:00:00.000Z', wager: 20, payout: 0 },
      ],
      vipTiers: [
        { name: 'BRONZE', minXp: 0 },
        { name: 'SILVER', minXp: 5_000 },
      ],
    });

    expect(analytics.cohorts.registration).toEqual([
      {
        cohort: '2026-06-29',
        users: 2,
        d1: { eligible: 2, retained: 1, rate: 50 },
        d7: { eligible: 2, retained: 1, rate: 50 },
        d30: { eligible: 2, retained: 0, rate: 0 },
      },
    ]);
    expect(analytics.cohorts.firstWager).toEqual([
      {
        cohort: '2026-06-29',
        users: 1,
        d1: { eligible: 1, retained: 1, rate: 100 },
        d7: { eligible: 1, retained: 1, rate: 100 },
        d30: { eligible: 1, retained: 0, rate: 0 },
      },
      {
        cohort: '2026-07-20',
        users: 1,
        d1: { eligible: 1, retained: 0, rate: 0 },
        d7: { eligible: 1, retained: 0, rate: 0 },
        d30: { eligible: 0, retained: 0, rate: null },
      },
    ]);
  });

  it('derives money, funnel, VIP distribution and operational signals from settled bets only', () => {
    const analytics = buildAdminAnalytics({
      now: '2026-08-10T12:00:00.000Z',
      users: [
        { id: 'active-vip', createdAt: '2026-07-01T10:00:00.000Z', xp: 6_000 },
        { id: 'churned-bronze', createdAt: '2026-07-02T10:00:00.000Z', xp: 0 },
        { id: 'never-activated', createdAt: '2026-08-09T10:00:00.000Z', xp: 0 },
      ],
      bets: [
        { userId: 'active-vip', occurredAt: '2026-08-10T10:00:00.000Z', wager: 100, payout: 80 },
        { userId: 'active-vip', occurredAt: '2026-08-09T10:00:00.000Z', wager: 20, payout: 10 },
        { userId: 'churned-bronze', occurredAt: '2026-07-20T10:00:00.000Z', wager: 40, payout: 0 },
      ],
      vipTiers: [
        { name: 'BRONZE', minXp: 0 },
        { name: 'SILVER', minXp: 5_000 },
      ],
    });

    expect(analytics.summary).toMatchObject({
      registeredUsers: 3,
      activatedUsers: 2,
      activeUsers7d: 1,
      churnRiskUsers: 1,
      wager: 160,
      payout: 90,
      ggr: 70,
    });
    expect(analytics.funnel).toEqual([
      { key: 'registered', label: 'Registriert', users: 3, rate: 100 },
      { key: 'activated', label: 'Erste Wette', users: 2, rate: 66.7 },
      { key: 'active7d', label: 'Aktiv (7 Tage)', users: 1, rate: 33.3 },
      { key: 'returning', label: 'Wiederkehrend', users: 1, rate: 33.3 },
    ]);
    expect(analytics.vipDistribution).toEqual([
      { tier: 'BRONZE', users: 2 },
      { tier: 'SILVER', users: 1 },
    ]);
    expect(analytics.operational).toMatchObject({
      activeUsers24h: 1,
      settledBets24h: 1,
      ggr24h: 20,
    });
    expect(analytics.deposits).toEqual({ available: false, count: 0, amount: 0 });
  });
});
