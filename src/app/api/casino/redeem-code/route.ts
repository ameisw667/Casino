import { NextResponse } from 'next/server';
import { z } from 'zod';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/security/request-security';
import { createClient } from '@/utils/supabase/server';

const redeemSchema = z.object({
  code: z.string().trim().min(1, 'Please enter a promo code').max(32, 'Code too long'),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    let userId = authUser?.id;
    if (!userId && process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true' && !isExplicitSignedOut) {
      userId = 'dev_user_fallback';
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'wallet-redeem', 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = redeemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid promo code' },
        { status: 400 }
      );
    }

    const rawCode = parseResult.data.code.toUpperCase();

    // Calculate credit amount from code (e.g. JAN100 -> 100, JAN500 -> 500, 100 -> 100)
    let amount = 100;
    const matchedNumber = rawCode.match(/\d+/);
    if (matchedNumber) {
      const parsedVal = parseInt(matchedNumber[0], 10);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        amount = Math.min(parsedVal, 1000); // Cap max bonus credit at 1,000
      }
    }

    const snapshot = await WalletService.creditBonus({
      userId,
      amount,
      code: rawCode,
    });

    CasinoLogger.info('API/RedeemCode', `Successfully redeemed code ${rawCode} for +$${amount.toFixed(2)}`, { userId });

    return NextResponse.json({
      success: true,
      amount,
      code: rawCode,
      message: `Successfully redeemed $${amount.toFixed(2)} bonus credits!`,
      snapshot,
    });
  } catch (error) {
    CasinoLogger.error('API/RedeemCode', 'Code redemption failed', error);
    return NextResponse.json(
      { error: 'Failed to redeem voucher code' },
      { status: 500 }
    );
  }
}
