import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { ProvablyFairEngine } from './provably-fair';
import type { GameConfig } from './game-config';
import { CasinoLogger } from './logger';

/**
 * Multiplayer-Crash round clock (worldmap/05_multiplayercrash.md, Option C).
 * Lazy/on-demand scheduler (§4.2) — no cron/Trigger.dev process. Any request
 * that needs the shared round calls ensureCurrentCrashRound(), which nudges
 * the DB-side state machine forward exactly as far as real elapsed time
 * allows, then returns the resulting state.
 */

// Must match the client animation curve exactly (crash/page.tsx:144,
// GROWTH_FACTOR = 0.003 per 16ms frame): next = m + m*GROWTH_FACTOR*(dt/16)
// is the discrete form of m(t) = (1+GROWTH_FACTOR)^(t/16ms). Inverted here
// so the server's crashed_at timestamp lands on the same moment the client
// animation would reach crashPoint on its own.
const CLIENT_GROWTH_FACTOR = 0.003;
const CLIENT_FRAME_MS = 16;

export function durationMsForCrashPoint(crashPoint: number): number {
  return Math.round((CLIENT_FRAME_MS * Math.log(crashPoint)) / Math.log(1 + CLIENT_GROWTH_FACTOR));
}

const crashRoundRowSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['WAITING', 'RUNNING', 'CRASHED']),
  server_seed_hash: z.string().min(1),
  server_seed: z.string().min(1),
  crash_point: z.coerce.number().nullable(),
  betting_ends_at: z.string(),
  started_at: z.string().nullable(),
  crashed_at: z.string().nullable(),
  needsCrashPoint: z.boolean().optional(),
  needsTransition: z.string().optional(),
});

/** Full server-side state, secrets included — never forward this as-is to a client. */
export interface InternalCrashRoundState {
  id: string;
  status: 'WAITING' | 'RUNNING' | 'CRASHED';
  serverSeedHash: string;
  serverSeed: string;
  crashPoint: number | null;
  bettingEndsAt: string;
  startedAt: string | null;
  crashedAt: string | null;
}

/** Client-safe projection — crashPoint/crashedAt/serverSeed only once status is CRASHED (FR5). */
export interface PublicCrashRoundState {
  id: string;
  status: 'WAITING' | 'RUNNING' | 'CRASHED';
  serverSeedHash: string;
  bettingEndsAt: string;
  startedAt: string | null;
  crashedAt: string | null;
  crashPoint: number | null;
  serverSeed: string | null;
}

function fromRow(
  parsed: z.infer<typeof crashRoundRowSchema>,
): InternalCrashRoundState & { needsCrashPoint?: boolean; needsTransition?: string } {
  return {
    id: parsed.id,
    status: parsed.status,
    serverSeedHash: parsed.server_seed_hash,
    serverSeed: parsed.server_seed,
    crashPoint: parsed.crash_point,
    bettingEndsAt: parsed.betting_ends_at,
    startedAt: parsed.started_at,
    crashedAt: parsed.crashed_at,
    needsCrashPoint: parsed.needsCrashPoint,
    needsTransition: parsed.needsTransition,
  };
}

async function callSync(config: GameConfig, crashedAtIso?: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('sync_crash_round', {
    p_betting_window_ms: config.crash.bettingWindowMs,
    p_post_crash_pause_ms: config.crash.postCrashPauseMs,
    // undefined → supabase-js lässt das Feld weg → SQL-DEFAULT NULL greift.
    p_crashed_at: crashedAtIso,
  });
  if (error || !data) throw new Error('Failed to sync crash round');
  return fromRow(crashRoundRowSchema.parse(data));
}

async function setCrashPoint(roundId: string, crashPoint: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('set_crash_round_point', {
    p_round_id: roundId,
    p_crash_point: crashPoint,
  });
  if (error || !data) throw new Error('Failed to set crash round point');
  return fromRow(crashRoundRowSchema.parse(data));
}

// Each branch below strictly advances the state machine or returns — this is
// a safety cap against an unforeseen bug looping forever, never expected to
// trigger in practice (worst real case is 2 iterations: set point, then
// transition).
const MAX_SYNC_ITERATIONS = 4;

/**
 * Ensures the shared crash round clock reflects real elapsed time and
 * returns the resulting state, including secrets. Callers MUST run the
 * result through toPublicRoundState() before it reaches an HTTP response or
 * a broadcast payload.
 */
export async function ensureCurrentCrashRound(
  config: GameConfig,
): Promise<InternalCrashRoundState> {
  let state = await callSync(config);
  for (let i = 0; i < MAX_SYNC_ITERATIONS; i++) {
    if (state.needsCrashPoint) {
      const crashPoint = await ProvablyFairEngine.getCrashMultiplier(
        state.serverSeed,
        state.id,
        0,
        config.crash.houseEdge,
      );
      state = await setCrashPoint(state.id, crashPoint);
      continue;
    }
    if (state.needsTransition === 'RUNNING' && state.crashPoint !== null) {
      const durationMs = durationMsForCrashPoint(state.crashPoint);
      const crashedAtIso = new Date(
        new Date(state.bettingEndsAt).getTime() + durationMs,
      ).toISOString();
      state = await callSync(config, crashedAtIso);
      continue;
    }
    return state;
  }
  CasinoLogger.warn('CrashRound', 'sync_crash_round loop hit iteration cap', { roundId: state.id });
  return state;
}

/**
 * Direct, non-advancing read of one specific round by id — used to resolve a
 * cashout/resolve against the exact round a bet was placed in, which may no
 * longer be the current/latest round returned by ensureCurrentCrashRound().
 * A past round's crash_point/crashed_at are already fixed at creation/
 * transition time, so no scheduler nudge is needed to read them correctly.
 */
export async function getCrashRoundById(crashRoundId: string): Promise<InternalCrashRoundState> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('crash_rounds')
    .select(
      'id, status, server_seed_hash, server_seed, crash_point, betting_ends_at, started_at, crashed_at',
    )
    .eq('id', crashRoundId)
    .single();
  if (error || !data) throw new Error('Crash round not found');
  const parsed = crashRoundRowSchema.parse(data);
  return fromRow(parsed);
}

/**
 * Per-round seat label for the live player list (FR3) — a plain sequential
 * position ("Spieler 3"), never a username/user id. Deliberately minimal:
 * no new identity system, resets every round, zero PII by construction.
 */
export function deriveSeatLabel(participants: Array<{ userId: string }>, userId: string): string {
  const index = participants.findIndex((p) => p.userId === userId);
  return `Spieler ${index >= 0 ? index + 1 : participants.length + 1}`;
}

/** Mirrors sanitizeActiveRoundState() in active-round/route.ts for the shared round. */
export function toPublicRoundState(state: InternalCrashRoundState): PublicCrashRoundState {
  const revealed = state.status === 'CRASHED';
  return {
    id: state.id,
    status: state.status,
    serverSeedHash: state.serverSeedHash,
    bettingEndsAt: state.bettingEndsAt,
    startedAt: state.startedAt,
    // crashed_at is written at the WAITING→RUNNING transition as exactly
    // bettingEndsAt + durationMsForCrashPoint(crashPoint) (migration 037/038),
    // so exposing it mid-flight would let any client invert the deterministic
    // growth curve and recover the secret crash point mid-flight.
    crashedAt: revealed ? state.crashedAt : null,
    crashPoint: revealed ? state.crashPoint : null,
    serverSeed: revealed ? state.serverSeed : null,
  };
}

// C3 (TO-04 fund matrix): once the crash point is publicly revealed, any claim
// at/below it is a sure win — so the server authorizes a cashout against the
// round clock instead of trusting the client's timing.
export const CASHOUT_LATENCY_GRACE_MS = 1000;
// A claim whose legit display time lies inside this final slice of the flight
// can only come from a client that saw the crash reveal (the honest display
// time of a pre-reveal press lies strictly before the crash instant).
export const CASHOUT_PRESS_MARGIN_MS = 100;

/**
 * Server-side fair-window check for a claimed multiplayer crash cashout.
 * Uses only server-known values — no client clock is consulted:
 * 1. The flight must have started (claims during the betting window are a
 *    risk-free refund+XP farm, since the crash point is floored at 1.00).
 * 2. The claim may not be late by more than one network-latency grace past
 *    its legit display time (the claimed multiplier's display time is
 *    bettingEndsAt + durationMsForCrashPoint(m) on the shared curve).
 * 3. Once the crash instant is known, the claim's display time must lie at
 *    least one press margin before it (blocks the reveal-snipe of claiming
 *    the exact crash point after the CRASHED broadcast).
 */
export function isWithinCrashCashoutFairWindow(args: {
  nowMs: number;
  bettingEndsAtMs: number;
  crashedAtMs: number | null;
  requestedMultiplier: number;
}): boolean {
  const { nowMs, bettingEndsAtMs, crashedAtMs, requestedMultiplier } = args;
  if (!Number.isFinite(nowMs) || !Number.isFinite(bettingEndsAtMs)) return false;
  if (!Number.isFinite(requestedMultiplier) || requestedMultiplier <= 0) return false;
  if (nowMs < bettingEndsAtMs) return false;
  const multiplierClaimTimeMs = bettingEndsAtMs + durationMsForCrashPoint(requestedMultiplier);
  if (nowMs > multiplierClaimTimeMs + CASHOUT_LATENCY_GRACE_MS) return false;
  if (crashedAtMs !== null) {
    if (!Number.isFinite(crashedAtMs)) return false;
    if (multiplierClaimTimeMs > crashedAtMs - CASHOUT_PRESS_MARGIN_MS) return false;
  }
  return true;
}
