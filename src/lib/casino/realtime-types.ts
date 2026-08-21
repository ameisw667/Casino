/**
 * Shared broadcast contract for Multiplayer-Crash (worldmap/05_multiplayercrash.md).
 * No 'server-only' here on purpose — both the server publisher (realtime.ts)
 * and the browser subscriber (crash/page.tsx) import from this file, so it
 * must stay free of server-only imports (Supabase admin client, secrets).
 */

/** One shared Realtime Broadcast channel for the whole crash room — not per-round, so clients don't need to resubscribe every round. */
export const CRASH_REALTIME_CHANNEL = 'crash-room';

export type CrashRoundStatus = 'WAITING' | 'RUNNING' | 'CRASHED';

/**
 * Round-clock broadcast. crashPoint/serverSeed are only ever non-null when
 * status is 'CRASHED' — enforced server-side by toPublicRoundState()
 * (crash-round.ts), never trust this shape alone as a security boundary on
 * the client. NFR1 in the plan requires a test asserting this never leaks
 * pre-crash.
 */
export interface CrashRoundBroadcastPayload {
  id: string;
  status: CrashRoundStatus;
  serverSeedHash: string;
  bettingEndsAt: string;
  startedAt: string | null;
  crashedAt: string | null;
  crashPoint: number | null;
  serverSeed: string | null;
}

/** One entry in the live player list (FR3) — seat label only, never a raw user id. */
export interface CrashPlayerBroadcastPayload {
  crashRoundId: string;
  seat: string;
  betAmount: number;
  action: 'BET' | 'CASHOUT' | 'BUST';
  multiplier: number | null;
  payout: number | null;
}

export const CRASH_ROUND_EVENT = 'round_state' as const;
export const CRASH_PLAYER_EVENT = 'player_update' as const;
