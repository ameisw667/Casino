import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getTelegramLinkStatus } from '@/lib/casino/telegram-link';
import { CasinoLogger } from '@/lib/casino/logger';

const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const status = await getTelegramLinkStatus(userId);
    return NextResponse.json(status, { headers: PRIVATE_NO_STORE_HEADERS });
  } catch (error) {
    CasinoLogger.error('API/Telegram/Status', 'Failed to read telegram link status', error);
    return NextResponse.json(
      { error: 'Failed to read telegram link status' },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
