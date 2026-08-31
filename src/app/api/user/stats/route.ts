import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
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

const syncAchievementSchema = z.object({
  achievementId: z.string().min(1).max(64),
  progress: z.number().finite().nonnegative(),
  unlocked: z.boolean(),
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
    if (!userId) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'user-stats-read',
      30,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const stats = await WalletService.getUserStats(userId);

    return apiSuccessResponse(stats, {
      headers: {
        'Cache-Control': 'private, no-store',
        ...rateLimitHeaders(rate),
      },
    });
  } catch (error) {
    CasinoLogger.error('API/User/Stats', 'Failed to load user stats', error);
    return apiErrorResponse('STATS_UNAVAILABLE', 'Stats unavailable', 503);
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
    if (!userId) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);

    const body = await request.json();
    const parsed = syncAchievementSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse('INVALID_ACHIEVEMENT_PAYLOAD', 'Invalid achievement payload', 400);
    }

    await WalletService.syncAchievement({
      userId,
      achievementId: parsed.data.achievementId,
      progress: parsed.data.progress,
      unlocked: parsed.data.unlocked,
    });

    if (parsed.data.unlocked) {
      void Promise.all([
        import('@/lib/casino/achievements-config-server'),
        import('@/lib/casino/notifications'),
      ])
        .then(([{ loadAchievementConfig }, { createNotificationBestEffort }]) =>
          loadAchievementConfig().then((configs) => {
            const config = configs.find((candidate) => candidate.id === parsed.data.achievementId);
            if (!config) return;
            createNotificationBestEffort({
              userId,
              kind: 'achievement',
              title: 'Achievement unlocked',
              body: `${config.title} — ${config.description}`,
              metadata: { achievementId: config.id },
              sourceKey: `achievement:${config.id}`,
            });
          }),
        )
        .catch((error) => {
          CasinoLogger.error('API/User/Stats', 'Failed to create achievement notification', error);
        });
    }

    return apiSuccessResponse({ success: true });
  } catch (error) {
    CasinoLogger.error('API/User/Stats', 'Failed to sync achievement', error);
    return apiErrorResponse('ACHIEVEMENT_SYNC_FAILED', 'Achievement sync failed', 500);
  }
}
