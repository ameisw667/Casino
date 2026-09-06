import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import {
  adminAnalyticsSnapshotPayloadSchema,
  computeAdminAnalyticsFromDb,
} from '@/lib/admin/analytics-source';
import {
  parseGuideObservability,
  unavailableGuideObservability,
} from '@/lib/admin/guide-observability';
import { CasinoLogger } from '@/lib/casino/logger';
import { isAdminEmail } from '@/lib/security/admin';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (!isAdminEmail(user.email)) return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-analytics-read',
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

    const admin = createAdminClient();
    const asOf = new Date().toISOString();
    const [snapshotResult, guideResult] = await Promise.all([
      admin
        .from('admin_analytics_snapshots')
        .select('payload, generated_at')
        .eq('id', 1)
        .maybeSingle(),
      Promise.resolve(admin.rpc('get_guide_observability', { p_as_of: asOf })).catch(() => ({
        data: null,
        error: true,
      })),
    ]);

    let guide = unavailableGuideObservability();
    if (!guideResult.error) {
      try {
        guide = parseGuideObservability(guideResult.data);
      } catch (error) {
        CasinoLogger.error(
          'API/Admin/Analytics',
          'Guide observability data failed validation',
          error,
        );
      }
    } else {
      CasinoLogger.error(
        'API/Admin/Analytics',
        'Guide observability RPC failed',
        guideResult.error,
      );
    }

    let analytics: Omit<Awaited<ReturnType<typeof computeAdminAnalyticsFromDb>>, 'guide'> | null =
      null;
    if (!snapshotResult.error && snapshotResult.data) {
      const parsedSnapshot = adminAnalyticsSnapshotPayloadSchema.safeParse(
        snapshotResult.data.payload,
      );
      if (parsedSnapshot.success) analytics = parsedSnapshot.data;
      else
        CasinoLogger.error(
          'API/Admin/Analytics',
          'Snapshot payload failed validation',
          parsedSnapshot.error,
        );
    }

    if (!analytics) {
      try {
        analytics = await computeAdminAnalyticsFromDb(admin);
        CasinoLogger.warn(
          'API/Admin/Analytics',
          'Falling back to live aggregation — no valid snapshot found',
        );
      } catch (error) {
        CasinoLogger.error('API/Admin/Analytics', 'Analytics data unavailable', error);
        return apiErrorResponse('ANALYTICS_UNAVAILABLE', 'Analytics data unavailable', 503);
      }
    }

    return apiSuccessResponse(
      { ...analytics, guide },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Admin/Analytics', 'Admin analytics unexpected failure', error);
    return apiErrorResponse('ANALYTICS_UNAVAILABLE', 'Analytics data unavailable', 503);
  }
}
