import { NextResponse } from 'next/server';
import { z } from 'zod';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
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
  PROMO_INVALID: 'Invalid promo code',
};

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

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

    const outcome = await WalletService.redeemPromoCode({ userId, code: rawCode });

    if (!outcome.ok) {
      return NextResponse.json(
        { error: PROMO_ERROR_MESSAGES[outcome.code] ?? 'Promo code rejected', code: outcome.code },
        { status: 400 },
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
    CasinoLogger.error('API/RedeemCode', 'Code redemption failed', error);
    return NextResponse.json({ error: 'Failed to redeem voucher code' }, { status: 500 });
  }
}
