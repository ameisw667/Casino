import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { unlinkTelegram } from '@/lib/casino/telegram-link';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

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
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'telegram-unlink',
      10,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const ok = await unlinkTelegram(userId);
    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to disconnect telegram' },
        { status: 500, headers: rateLimitHeaders(rate) },
      );
    }

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Telegram/Unlink', 'Failed to disconnect telegram', error);
    return NextResponse.json({ error: 'Failed to disconnect telegram' }, { status: 500 });
  }
}
