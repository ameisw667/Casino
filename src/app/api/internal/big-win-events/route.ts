import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { tasks } from '@trigger.dev/sdk';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';

// Called only by the pg_net POST inside public.notify_big_win_event() (see migration
// 047_event_bus_big_win_consumer.sql) right after emit_big_win_notify_event() inserts a
// wallet_events row, and by the pg_cron backstop (public.retry_stale_big_win_events()) re-POSTing
// here for events that never got acknowledged. Own dedicated secret — deliberately not
// WALLET_EVENT_SECRET (4.1) — so this consumer's auth boundary is independent of the xp_gain one.
function hasValidBigWinEventSecret(request: Request): boolean {
  const expected = process.env.BIG_WIN_EVENT_SECRET;
  const provided = request.headers.get('x-big-win-event-secret');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

const bodySchema = z.object({
  eventId: z.string().uuid(),
});

const claimResultSchema = z.object({
  success: z.boolean(),
  alreadyProcessed: z.boolean().optional(),
  userId: z.string().optional(),
  payload: z
    .object({
      game: z.string(),
      payout: z.coerce.number(),
      multiplier: z.coerce.number(),
    })
    .nullable()
    .optional(),
  error: z.string().optional(),
});

export async function POST(request: Request) {
  if (!hasValidBigWinEventSecret(request)) {
    return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiErrorResponse('INVALID_PAYLOAD', 'Invalid payload', 400);
  }

  const supabase = createAdminClient();
  const { data: claimData, error: claimError } = await supabase.rpc('claim_big_win_notify_event', {
    p_event_id: parsed.data.eventId,
  });

  if (claimError) {
    CasinoLogger.error('BigWinEvents', 'claim_big_win_notify_event RPC call failed', claimError);
    return apiErrorResponse('CLAIM_FAILED', 'Failed to claim big win notify event', 500);
  }

  const claim = claimResultSchema.safeParse(claimData);
  if (!claim.success || !claim.data.success) {
    CasinoLogger.error('BigWinEvents', 'claim_big_win_notify_event reported failure', claim);
    return apiErrorResponse('CLAIM_REJECTED', 'Claim reported failure', 500);
  }
  if (claim.data.alreadyProcessed || !claim.data.payload || !claim.data.userId) {
    return apiSuccessResponse({ ok: true });
  }

  try {
    await tasks.trigger('big-win-notify', {
      userId: claim.data.userId,
      game: claim.data.payload.game,
      payout: claim.data.payload.payout,
      multiplier: claim.data.payload.multiplier,
      win: true,
      replayed: false,
    });
  } catch (error) {
    // No ack — processed_at stays NULL, so the pg_cron backstop retries this event later.
    CasinoLogger.error('BigWinEvents', `Trigger.dev dispatch failed: ${String(error)}`);
    return apiErrorResponse('TRIGGER_DISPATCH_FAILED', 'Trigger.dev dispatch failed', 500);
  }

  const { error: ackError } = await supabase.rpc('ack_big_win_notify_event', {
    p_event_id: parsed.data.eventId,
  });
  if (ackError) {
    CasinoLogger.error('BigWinEvents', 'ack_big_win_notify_event RPC call failed', ackError);
    return apiErrorResponse('ACK_FAILED', 'Failed to ack big win notify event', 500);
  }

  return apiSuccessResponse({ ok: true });
}
