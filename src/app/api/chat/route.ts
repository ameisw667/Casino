import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { z } from 'zod';

const postChatSchema = z.object({
  message: z.string().min(1).max(500),
});

export async function GET(_request: Request) {
  try {
    const messages = await WalletService.getChatMessages(50);
    return NextResponse.json(
      { messages },
      {
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  } catch (error) {
    CasinoLogger.error('API/Chat', 'Failed to fetch chat messages', error);
    return NextResponse.json({ messages: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

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

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'chat-post', 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json();
    const parsed = postChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const msg = await WalletService.postChatMessage({
      userId,
      message: parsed.data.message,
    });

    return NextResponse.json({ message: msg });
  } catch (error) {
    CasinoLogger.error('API/Chat', 'Failed to post chat message', error);
    return NextResponse.json({ error: 'Chat post failed' }, { status: 500 });
  }
}
