import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';

// Called only by the pg_net POST inside public.notify_wallet_event() (see migration
// 036_wallet_events_outbox.sql) right after a settlement RPC inserts a wallet_events row, and
// by the pg_cron backstop (public.retry_stale_wallet_events()) calling apply_xp_gain() directly
// instead. Authenticates via a shared secret instead of a Supabase session — pg_net does not
// send browser Origin headers or cookies, same exemption pattern as /api/internal/cron-alert.
function hasValidWalletEventSecret(request: Request): boolean {
  const expected = process.env.WALLET_EVENT_SECRET;
  const provided = request.headers.get('x-wallet-event-secret');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

const bodySchema = z.object({
  eventId: z.string().uuid(),
});

const rpcResultSchema = z.object({
  success: z.boolean(),
  alreadyProcessed: z.boolean().optional(),
  error: z.string().optional(),
});

export async function POST(request: Request) {
  if (!hasValidWalletEventSecret(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('apply_xp_gain', {
    p_event_id: parsed.data.eventId,
  });

  if (error) {
    CasinoLogger.error('WalletEvents', 'apply_xp_gain RPC call failed', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const result = rpcResultSchema.safeParse(data);
  if (!result.success || !result.data.success) {
    CasinoLogger.error('WalletEvents', 'apply_xp_gain reported failure', result);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
