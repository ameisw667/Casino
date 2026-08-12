import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    let userId = authUser?.id;
    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    if (
      !userId &&
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_FALLBACK === 'true' &&
      !isExplicitSignedOut
    ) {
      userId = 'dev_user_fallback';
    }
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'seeds-history',
      20,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: rateLimitHeaders(rate) },
      );
    }

    const history = await WalletService.getSeedHistory(userId);
    return NextResponse.json(history, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Seeds/History', 'Failed to fetch seed history', error);
    return NextResponse.json([], { status: 200 });
  }
}
