import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { issueTelegramLinkToken, isTelegramConfigured } from '@/lib/casino/telegram-link';
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

    if (!isTelegramConfigured()) {
      return NextResponse.json(
        { error: 'Telegram notifications are not configured' },
        { status: 503 },
      );
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'telegram-link',
      5,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const issued = await issueTelegramLinkToken(userId);
    if (!issued) {
      return NextResponse.json(
        { error: 'Failed to create link token' },
        { status: 500, headers: rateLimitHeaders(rate) },
      );
    }

    return NextResponse.json(issued, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Telegram/Link', 'Failed to issue telegram link token', error);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
