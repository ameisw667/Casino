import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { publicState } from '@/app/api/casino/blackjack/route';
import type { BlackjackGameState } from '@/lib/games/blackjack';
import {
  ensureCurrentCrashRound,
  getCrashRoundById,
  toPublicRoundState,
} from '@/lib/casino/crash-round';
import type { PublicCrashRoundState } from '@/lib/casino/crash-round';
import { loadGameConfig } from '@/lib/casino/game-config-server';

/**
 * game_rounds.state carries whatever the round needs server-side to resolve
 * itself later — for an ACTIVE round that includes secrets that must never
 * reach the client before resolution: Crash's crashPoint/serverSeed (reveals
 * the exact cashout point in advance) and Blackjack's full deck + dealer
 * hole card. Strip those before this route echoes state back.
 */
function sanitizeActiveRoundState(
  game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER',
  state: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!state) return state;
  const { serverSeed: _serverSeed, ...withoutSeed } = state;
  if (game === 'CRASH' || game === 'CRASH_MULTIPLAYER') {
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
    if (game !== 'CRASH' && game !== 'BLACKJACK' && game !== 'CRASH_MULTIPLAYER') {
      return apiErrorResponse('INVALID_GAME_PARAM', 'Invalid game parameter', 400);
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
    if (!userId) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);

    const round = await WalletService.getGameActiveRound({
      userId,
      game: game as 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER',
    });
    const sanitized = round.hasActiveRound
      ? {
          ...round,
          state: sanitizeActiveRoundState(
            game as 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER',
            round.state,
          ),
        }
      : round;

    // NFR3 (worldmap/05_multiplayercrash.md): REST fallback for the shared
    // room clock, for both a user with an active bet and one just watching.
    // A status poll is a valid lazy-scheduler trigger too (§4.2) — refetch
    // by the bet's own crash_round_id when we have one (a past round may no
    // longer be "current"), otherwise fall back to whatever round is active
    // right now.
    let sharedRound: PublicCrashRoundState | undefined;
    if (game === 'CRASH_MULTIPLAYER') {
      try {
        const linkedRoundId = round.hasActiveRound
          ? z.string().uuid().safeParse(round.state?.crashRoundId).data
          : undefined;
        const internal = linkedRoundId
          ? await getCrashRoundById(linkedRoundId)
          : await ensureCurrentCrashRound(await loadGameConfig());
        sharedRound = toPublicRoundState(internal);
      } catch (error) {
        CasinoLogger.warn('API/ActiveRound', 'Failed to resolve shared crash round', error);
      }
    }

    return apiSuccessResponse(
      { ...sanitized, sharedRound },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/ActiveRound', 'Failed to fetch active round', error);
    return apiSuccessResponse(
      { hasActiveRound: false },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
