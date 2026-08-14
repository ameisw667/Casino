import { NextResponse } from 'next/server';
import { z } from 'zod';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { createClient } from '@/utils/supabase/server';

const redeemSchema = z.object({
  code: z.string().trim().min(1, 'Please enter a promo code').max(32, 'Code too long'),
});

const PROMO_ERROR_MESSAGES: Record<string, string> = {
  PROMO_NOT_FOUND: 'Invalid or unknown promo code',
  PROMO_INACTIVE: 'This promo code is no longer active',
  PROMO_EXPIRED: 'This promo code has expired',
  PROMO_EXHAUSTED: 'This promo code has reached its usage limit',
  PROMO_ALREADY_REDEEMED: 'You have already redeemed this promo code',
  PROMO_REQUEST_CONFLICT: 'Promo request conflict',
  PROMO_INVALID: 'Invalid promo code',
};

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  const requestIdHeader = request.headers.get('Idempotency-Key');

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    let userId = authUser?.id;
    if (
      !userId &&
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_FALLBACK === 'true' &&
      !isExplicitSignedOut
    ) {
      userId = 'dev_user_fallback';
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'wallet-redeem',
      10,
      60,
    );
    if (!rate.success) {
      await recordRiskEventBestEffort({
        subjectUserId: userId,
        signalType: 'rate_limit_hit',
        severity: 'medium',
        windowStart: new Date(rate.reset - 60_000).toISOString(),
        evidence: { scope: 'wallet-redeem', limit: rate.limit },
      });
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = redeemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid promo code' },
        { status: 400 },
      );
    }

    const rawCode = parseResult.data.code.toUpperCase();
    const requestId = requestIdHeader;
    if (!requestId || !z.string().uuid().safeParse(requestId).success) {
      return NextResponse.json({ error: 'A valid Idempotency-Key is required' }, { status: 400 });
    }

    const outcome = await WalletService.redeemPromoCode({ userId, code: rawCode, requestId });

    if (!outcome.ok) {
      if (outcome.code === 'PROMO_REQUEST_CONFLICT') {
        await recordRiskEventBestEffort({
          subjectUserId: userId,
          signalType: 'idempotency_conflict',
          severity: 'medium',
          windowStart: new Date().toISOString(),
          evidence: { scope: 'wallet-redeem', outcome: outcome.code },
        });
      } else if (outcome.code === 'PROMO_ALREADY_REDEEMED' || outcome.code === 'PROMO_EXHAUSTED') {
        await recordRiskEventBestEffort({
          subjectUserId: userId,
          signalType: 'voucher_velocity',
          severity: 'low',
          windowStart: new Date().toISOString(),
          evidence: { scope: 'wallet-redeem', outcome: outcome.code },
        });
      }
      return NextResponse.json(
        { error: PROMO_ERROR_MESSAGES[outcome.code] ?? 'Promo code rejected', code: outcome.code },
        { status: outcome.code === 'PROMO_REQUEST_CONFLICT' ? 409 : 400 },
      );
    }

    CasinoLogger.info(
      'API/RedeemCode',
      `Successfully redeemed code ${rawCode} for +$${outcome.amount.toFixed(2)}`,
      { userId },
    );

    return NextResponse.json({
      success: true,
      amount: outcome.amount,
      code: rawCode,
      message: `Successfully redeemed $${outcome.amount.toFixed(2)} bonus credits!`,
      snapshot: outcome.snapshot,
    });
  } catch (error) {
    CasinoLogger.error(
      'API/RedeemCode',
      'Code redemption failed',
      error,
      requestIdHeader ?? undefined,
    );
    return NextResponse.json({ error: 'Failed to redeem voucher code' }, { status: 500 });
  }
}
