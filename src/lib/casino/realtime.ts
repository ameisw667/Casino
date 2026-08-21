import 'server-only';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import {
  CRASH_REALTIME_CHANNEL,
  CRASH_ROUND_EVENT,
  CRASH_PLAYER_EVENT,
  type CrashRoundBroadcastPayload,
  type CrashPlayerBroadcastPayload,
} from './realtime-types';

/**
 * Server-side publisher for the Multiplayer-Crash broadcast channel
 * (worldmap/05_multiplayercrash.md §4.1). Broadcast, not Postgres Changes —
 * the server decides exactly what goes out, so crashPoint/serverSeed can
 * never leak via table replication before a round has actually crashed.
 *
 * supabase-js sends a broadcast over the Realtime HTTP endpoint without
 * needing an open, subscribed websocket (supported since supabase-js
 * v2.37 — this project is on ^2.105, see package.json) — appropriate for a
 * serverless request/response lifecycle that never stays alive between
 * calls. Best-effort throughout: a failed broadcast must never fail or
 * delay the bet/cashout response it originates from (NFR3's REST fallback
 * exists precisely so a dropped broadcast is never the only source of truth).
 */
async function publish(event: string, payload: unknown): Promise<void> {
  const supabase = createAdminClient();
  const channel = supabase.channel(CRASH_REALTIME_CHANNEL);
  try {
    await channel.send({ type: 'broadcast', event, payload });
  } catch (error) {
    CasinoLogger.warn('Realtime', `Failed to publish crash broadcast event "${event}"`, error);
  } finally {
    await supabase.removeChannel(channel);
  }
}

export async function publishCrashRoundState(round: CrashRoundBroadcastPayload): Promise<void> {
  await publish(CRASH_ROUND_EVENT, round);
}

export async function publishCrashPlayerEvent(event: CrashPlayerBroadcastPayload): Promise<void> {
  await publish(CRASH_PLAYER_EVENT, event);
}
