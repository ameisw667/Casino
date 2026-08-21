import { z } from 'zod';

export const dailyRaceStandingSchema = z.object({
  rank: z.coerce.number().int().min(1).max(3),
  username: z.string().min(1),
  wagered: z.coerce.number().nonnegative(),
  prize: z.coerce.number().positive(),
});

export type DailyRaceStanding = z.infer<typeof dailyRaceStandingSchema>;

export interface DailyRaceSnapshot {
  standings: DailyRaceStanding[];
  secondsUntilResetUtc: number;
}

/**
 * Seconds remaining until the next UTC midnight, from the given reference time.
 * Shared definition for both the API response (worldmap/05_DAILY_TOURNAMENT.md L4)
 * and the client-side countdown re-sync (L5) so both derive from the same UTC
 * wall-clock boundary as the pg_cron settlement job ('0 0 * * *').
 */
export function secondsUntilNextUtcMidnight(reference: Date = new Date()): number {
  const todayUtcStart = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate(),
  );
  const nextUtcMidnight = todayUtcStart + 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((nextUtcMidnight - reference.getTime()) / 1000));
}
