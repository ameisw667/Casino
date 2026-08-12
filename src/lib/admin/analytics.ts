import type { GuideObservability } from './guide-observability';

export interface AnalyticsUser {
  id: string;
  createdAt: string;
  xp: number;
}

export interface SettledBet {
  userId: string;
  occurredAt: string;
  wager: number;
  payout: number;
}

export interface AnalyticsVipTier {
  name: string;
  minXp: number;
}

export interface RetentionValue {
  eligible: number;
  retained: number;
  rate: number | null;
}

export interface CohortRow {
  cohort: string;
  users: number;
  d1: RetentionValue;
  d7: RetentionValue;
  d30: RetentionValue;
}

export interface AdminAnalyticsInput {
  now?: string;
  users: AnalyticsUser[];
  bets: SettledBet[];
  vipTiers: AnalyticsVipTier[];
  guide?: GuideObservability;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function asDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid analytics timestamp: ${value}`);
  return date;
}

function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function daysBetween(start: Date, end: Date): number {
  return Math.floor((utcDay(end) - utcDay(start)) / DAY_MS);
}

function weekStart(date: Date): string {
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  const monday = new Date(utcDay(date) - mondayOffset * DAY_MS);
  return monday.toISOString().slice(0, 10);
}

function percentage(value: number, total: number): number {
  return total === 0 ? 0 : Math.round((value / total) * 1000) / 10;
}

function retentionValue(
  acquiredAt: Date,
  activity: Date[],
  now: Date,
  horizon: number,
): RetentionValue {
  if (daysBetween(acquiredAt, now) < horizon) return { eligible: 0, retained: 0, rate: null };
  return {
    eligible: 1,
    retained: activity.some((occurredAt) => daysBetween(acquiredAt, occurredAt) === horizon)
      ? 1
      : 0,
    rate: 0,
  };
}

function aggregateRetention(values: RetentionValue[]): RetentionValue {
  const eligible = values.reduce((total, value) => total + value.eligible, 0);
  const retained = values.reduce((total, value) => total + value.retained, 0);
  return { eligible, retained, rate: eligible === 0 ? null : percentage(retained, eligible) };
}

function tierForXp(xp: number, tiers: AnalyticsVipTier[]): string {
  return (
    [...tiers].sort((left, right) => right.minXp - left.minXp).find((tier) => xp >= tier.minXp)
      ?.name ?? 'UNASSIGNED'
  );
}

export function buildAdminAnalytics({ now, users, bets, vipTiers, guide }: AdminAnalyticsInput) {
  const currentTime = asDate(now ?? new Date().toISOString());
  const datedBets = bets.map((bet) => ({ ...bet, occurredAt: asDate(bet.occurredAt) }));
  const betDatesByUser = new Map<string, Date[]>();
  for (const bet of datedBets) {
    const dates = betDatesByUser.get(bet.userId) ?? [];
    dates.push(bet.occurredAt);
    betDatesByUser.set(bet.userId, dates);
  }
  for (const dates of betDatesByUser.values())
    dates.sort((left, right) => left.getTime() - right.getTime());

  const acquisitionByMode = {
    registration: users.map((user) => ({ user, acquiredAt: asDate(user.createdAt) })),
    firstWager: users.flatMap((user) => {
      const acquiredAt = betDatesByUser.get(user.id)?.[0];
      return acquiredAt ? [{ user, acquiredAt }] : [];
    }),
  };

  const buildCohorts = (
    acquisitions: Array<{ user: AnalyticsUser; acquiredAt: Date }>,
  ): CohortRow[] => {
    const grouped = new Map<string, Array<{ user: AnalyticsUser; acquiredAt: Date }>>();
    for (const acquisition of acquisitions) {
      const cohort = weekStart(acquisition.acquiredAt);
      const items = grouped.get(cohort) ?? [];
      items.push(acquisition);
      grouped.set(cohort, items);
    }
    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([cohort, items]) => {
        const retention = (horizon: number) =>
          aggregateRetention(
            items.map(({ user, acquiredAt }) =>
              retentionValue(acquiredAt, betDatesByUser.get(user.id) ?? [], currentTime, horizon),
            ),
          );
        return {
          cohort,
          users: items.length,
          d1: retention(1),
          d7: retention(7),
          d30: retention(30),
        };
      });
  };

  const activeUsersSince = (days: number) => {
    const threshold = currentTime.getTime() - days * DAY_MS;
    return new Set(
      datedBets.filter((bet) => bet.occurredAt.getTime() >= threshold).map((bet) => bet.userId),
    );
  };
  const activatedUsers = new Set(datedBets.map((bet) => bet.userId));
  const active7d = activeUsersSince(7);
  const active24h = activeUsersSince(1);
  const churnRiskUsers = users.filter((user) => {
    const activity = betDatesByUser.get(user.id);
    if (!activity?.length) return false;
    return (
      daysBetween(activity[0], currentTime) >= 14 &&
      daysBetween(activity.at(-1)!, currentTime) >= 14
    );
  }).length;
  const returningUsers = [...betDatesByUser.values()].filter(
    (activity) => new Set(activity.map((date) => utcDay(date))).size >= 2,
  ).length;
  const wager = datedBets.reduce((total, bet) => total + Number(bet.wager), 0);
  const payout = datedBets.reduce((total, bet) => total + Number(bet.payout), 0);
  const recentBets = datedBets.filter(
    (bet) => bet.occurredAt.getTime() >= currentTime.getTime() - DAY_MS,
  );
  const recentWager = recentBets.reduce((total, bet) => total + Number(bet.wager), 0);
  const recentPayout = recentBets.reduce((total, bet) => total + Number(bet.payout), 0);

  const sortedTiers = [...vipTiers].sort((left, right) => left.minXp - right.minXp);
  const tierCounts = new Map(sortedTiers.map((tier) => [tier.name, 0]));
  for (const user of users) {
    const tier = tierForXp(Number(user.xp), sortedTiers);
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
  }

  const operationalSignals = [
    ...(recentBets.length === 0
      ? [
          {
            level: 'warning' as const,
            message: 'Keine abgeschlossenen Wetten in den letzten 24 Stunden.',
          },
        ]
      : []),
    ...(recentWager - recentPayout < 0
      ? [{ level: 'warning' as const, message: 'Negativer GGR in den letzten 24 Stunden.' }]
      : []),
    ...(activatedUsers.size > 0 && churnRiskUsers / activatedUsers.size >= 0.5
      ? [
          {
            level: 'warning' as const,
            message: 'Mindestens 50 % der aktivierten Nutzer sind 14 Tage inaktiv.',
          },
        ]
      : []),
  ];

  return {
    generatedAt: currentTime.toISOString(),
    cohorts: {
      registration: buildCohorts(acquisitionByMode.registration),
      firstWager: buildCohorts(acquisitionByMode.firstWager),
    },
    summary: {
      registeredUsers: users.length,
      activatedUsers: activatedUsers.size,
      activeUsers7d: active7d.size,
      churnRiskUsers,
      wager,
      payout,
      ggr: wager - payout,
    },
    funnel: [
      { key: 'registered', label: 'Registriert', users: users.length, rate: 100 },
      {
        key: 'activated',
        label: 'Erste Wette',
        users: activatedUsers.size,
        rate: percentage(activatedUsers.size, users.length),
      },
      {
        key: 'active7d',
        label: 'Aktiv (7 Tage)',
        users: active7d.size,
        rate: percentage(active7d.size, users.length),
      },
      {
        key: 'returning',
        label: 'Wiederkehrend',
        users: returningUsers,
        rate: percentage(returningUsers, users.length),
      },
    ],
    vipDistribution: [...tierCounts.entries()].map(([tier, count]) => ({ tier, users: count })),
    deposits: { available: false, count: 0, amount: 0 },
    guide,
    operational: {
      activeUsers24h: active24h.size,
      settledBets24h: recentBets.length,
      wager24h: recentWager,
      ggr24h: recentWager - recentPayout,
      signals: operationalSignals,
    },
  };
}
