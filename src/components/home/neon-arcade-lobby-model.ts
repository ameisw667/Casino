import type { VipTier } from '@/lib/casino/vip-config';

export interface LobbyJackpot {
  amount: number;
  cadence: 'server-snapshot';
}

export type LobbyProofMetricId = 'total-paid' | 'average-payout' | 'bets-placed' | 'provably-fair';

export interface LobbyProofMetric {
  id: LobbyProofMetricId;
  label: string;
}

export interface LobbyLeader {
  userId: string;
  displayName: string;
  score: number;
}

export interface LobbyTournament {
  leaders: LobbyLeader[];
  startsAt: string;
  endsAt: string;
}

export interface NeonLobbySnapshot {
  asOf: string;
  jackpot: LobbyJackpot;
  proofMetrics: LobbyProofMetric[];
  tournament: LobbyTournament;
}

export interface LobbyRewards {
  currentTier: VipTier;
  nextTier: VipTier | null;
  progress: number;
  xpToNext: number;
  isMaxTier: boolean;
}

const MS_PER_DAY = 86_400_000;
const POOL_EPOCH_MS = Date.UTC(2026, 0, 1);
const POOL_BASE = 84_200;
const POOL_DAILY_INCREMENT = 0.42;

const PROOF_METRICS: readonly LobbyProofMetric[] = [
  { id: 'total-paid', label: 'Total paid out' },
  { id: 'average-payout', label: 'Average payout' },
  { id: 'bets-placed', label: 'Bets placed' },
  { id: 'provably-fair', label: 'Provably fair rounds' },
];

const COUNTDOWN_ZERO = '00:00:00';
const COUNTDOWN_INVALID = '--:--:--';

/**
 * Deterministic lobby snapshot derived purely from server time. The jackpot
 * pool advances by a fixed daily increment at each UTC day boundary so the
 * value is stable within a day and reproducible across calls for the same `now`.
 */
export function createNeonLobbySnapshot(now: Date): NeonLobbySnapshot {
  const nowMs = now.getTime();
  const utcDay = Math.floor(nowMs / MS_PER_DAY);
  const startsAtMs = utcDay * MS_PER_DAY;
  const endsAtMs = startsAtMs + MS_PER_DAY;
  const poolDay = Math.floor((nowMs - POOL_EPOCH_MS) / MS_PER_DAY);

  return {
    asOf: now.toISOString(),
    jackpot: {
      amount: POOL_BASE + POOL_DAILY_INCREMENT * poolDay,
      cadence: 'server-snapshot',
    },
    proofMetrics: [...PROOF_METRICS],
    tournament: {
      leaders: [],
      startsAt: new Date(startsAtMs).toISOString(),
      endsAt: new Date(endsAtMs).toISOString(),
    },
  };
}

/**
 * Formats the remaining time until `endsAt` as `HH:MM:SS`. Past or invalid
 * endpoints clamp to `00:00:00` / `--:--:--` so the UI never shows negatives.
 */
export function formatTournamentCountdown(now: Date, endsAt: string): string {
  const endsMs = Date.parse(endsAt);
  const remainingMs = endsMs - now.getTime();
  if (Number.isNaN(remainingMs)) return COUNTDOWN_INVALID;
  if (remainingMs <= 0) return COUNTDOWN_ZERO;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

/**
 * Resolves the active VIP tier for `xp`, the next active tier, and the progress
 * percentage within the current tier band. Inactive tiers are skipped so a
 * disabled tier never becomes someone's current or next tier.
 */
export function deriveLobbyRewards(xp: number, tiers: readonly VipTier[]): LobbyRewards {
  const active = [...tiers]
    .filter((tier) => tier.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (active.length === 0) {
    throw new Error('deriveLobbyRewards requires at least one active VIP tier');
  }

  let currentIndex = 0;
  for (let index = 0; index < active.length; index += 1) {
    if (xp >= active[index].minXp) currentIndex = index;
  }

  const currentTier = active[currentIndex];
  const nextTier = active[currentIndex + 1] ?? null;
  const isMaxTier = nextTier === null;

  if (isMaxTier) {
    return { currentTier, nextTier: null, progress: 100, xpToNext: 0, isMaxTier: true };
  }

  const bandStart = currentTier.minXp;
  const bandEnd = nextTier.minXp;
  const bandWidth = bandEnd - bandStart;
  const rawProgress = bandWidth > 0 ? ((xp - bandStart) / bandWidth) * 100 : 100;
  const progress = Math.max(0, Math.min(100, Math.round(rawProgress)));
  const xpToNext = Math.max(0, bandEnd - xp);

  return { currentTier, nextTier, progress, xpToNext, isMaxTier: false };
}
