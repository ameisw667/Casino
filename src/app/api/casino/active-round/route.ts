import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { publicState } from '@/app/api/casino/blackjack/route';
import type { BlackjackGameState } from '@/lib/games/blackjack';

/**
 * game_rounds.state carries whatever the round needs server-side to resolve
 * itself later — for an ACTIVE round that includes secrets that must never
 * reach the client before resolution: Crash's crashPoint/serverSeed (reveals
 * the exact cashout point in advance) and Blackjack's full deck + dealer
 * hole card. Strip those before this route echoes state back.
 */
function sanitizeActiveRoundState(
  game: 'CRASH' | 'BLACKJACK',
  state: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!state) return state;
  const { serverSeed: _serverSeed, ...withoutSeed } = state;
  if (game === 'CRASH') {
    const { crashPoint: _crashPoint, ...withoutCrashPoint } = withoutSeed;
    return withoutCrashPoint;
  }
  return publicState(withoutSeed as unknown as BlackjackGameState) as unknown as Record<
    string,
    unknown
  >;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game')?.toUpperCase();
    if (game !== 'CRASH' && game !== 'BLACKJACK') {
      return NextResponse.json({ error: 'Invalid game parameter' }, { status: 400 });
    }

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

    const round = await WalletService.getGameActiveRound({ userId, game });
    const sanitized = round.hasActiveRound
      ? { ...round, state: sanitizeActiveRoundState(game, round.state) }
      : round;
    return NextResponse.json(sanitized, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/ActiveRound', 'Failed to fetch active round', error);
    return NextResponse.json({ hasActiveRound: false }, { status: 200 });
  }
}
