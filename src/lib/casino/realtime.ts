import 'server-only';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import {
  CRASH_REALTIME_CHANNEL,
  CRASH_ROUND_EVENT,
  CRASH_PLAYER_EVENT,
  getNotificationRealtimeChannel,
  type CrashRoundBroadcastPayload,
  type CrashPlayerBroadcastPayload,
  type NotificationCreatedBroadcastPayload,
  NOTIFICATION_REALTIME_EVENT,
} from './realtime-types';

/**
 * Server-side publisher for Realtime Broadcast. Broadcast payloads are only
 * hints: every consumer must refresh its server-authorized source of truth.
 */
async function publish(channelName: string, event: string, payload: unknown): Promise<void> {
  const supabase = createAdminClient();
  const channel = supabase.channel(channelName);
  try {
    await channel.send({ type: 'broadcast', event, payload });
  } catch (error) {
    CasinoLogger.warn('Realtime', `Failed to publish broadcast event "${event}"`, error);
  } finally {
    await supabase.removeChannel(channel);
  }
}

export async function publishCrashRoundState(round: CrashRoundBroadcastPayload): Promise<void> {
  await publish(CRASH_REALTIME_CHANNEL, CRASH_ROUND_EVENT, round);
}

export async function publishCrashPlayerEvent(event: CrashPlayerBroadcastPayload): Promise<void> {
  await publish(CRASH_REALTIME_CHANNEL, CRASH_PLAYER_EVENT, event);
}

/** Publishes no content and no user id: the private topic identifies the recipient. */
export async function publishNotificationCreated(
  userId: string,
  payload: NotificationCreatedBroadcastPayload,
): Promise<void> {
  await publish(getNotificationRealtimeChannel(userId), NOTIFICATION_REALTIME_EVENT, payload);
}