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

const rotateSeedSchema = z.object({
  clientSeed: z.string().min(1).max(128),
});

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

    const seeds = await WalletService.getUserSeeds(userId);
    return NextResponse.json(seeds, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Seeds', 'Failed to fetch seeds', error);
    return NextResponse.json(
      { clientSeed: 'vibe-coder-default', serverSeedHash: '', nonce: 0 },
      { status: 200 },
    );
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

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'seeds-rotate',
      10,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429, headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json();
    const parsed = rotateSeedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid client seed' }, { status: 400 });
    }

    const newSeeds = await WalletService.rotateUserSeed({
      userId,
      clientSeed: parsed.data.clientSeed,
    });

    return NextResponse.json(newSeeds, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Seeds', 'Failed to rotate seeds', error);
    return NextResponse.json({ error: 'Seed rotation failed' }, { status: 500 });
  }
}
