import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';

const SNAPSHOT_STALE_AFTER_HOURS = 25;
const DEAD_LETTER_ATTEMPT_THRESHOLD = 5;

interface JobHealthPayload {
  snapshot: {
    generatedAt: string | null;
    ageHours: number | null;
    isStale: boolean;
  };
  deadLetters: {
    xpGain: number;
    bigWinNotify: number;
  };
}

function countDeadLetters(rows: Array<{ event_type: string }>): JobHealthPayload['deadLetters'] {
  return rows.reduce(
    (counts, row) => {
      if (row.event_type === 'xp_gain') return { ...counts, xpGain: counts.xpGain + 1 };
      if (row.event_type === 'big_win_notify') {
        return { ...counts, bigWinNotify: counts.bigWinNotify + 1 };
      }
      return counts;
    },
    { xpGain: 0, bigWinNotify: 0 },
  );
}

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
      'admin-job-health-read',
      60,
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

    const [snapshotResult, deadLetterResult] = await Promise.all([
      admin.from('admin_analytics_snapshots').select('generated_at').eq('id', 1).maybeSingle(),
      admin
        .from('wallet_events')
        .select('event_type')
        .is('processed_at', null)
        .gte('attempts', DEAD_LETTER_ATTEMPT_THRESHOLD),
    ]);

    if (snapshotResult.error) {
      CasinoLogger.error('API/Admin/JobHealth', 'Snapshot lookup failed', snapshotResult.error);
      return apiErrorResponse('JOB_HEALTH_UNAVAILABLE', 'Job health data unavailable', 503);
    }
    if (deadLetterResult.error) {
      CasinoLogger.error(
        'API/Admin/JobHealth',
        'Dead-letter lookup failed',
        deadLetterResult.error,
      );
      return apiErrorResponse('JOB_HEALTH_UNAVAILABLE', 'Job health data unavailable', 503);
    }

    const generatedAt = (snapshotResult.data?.generated_at as string | null | undefined) ?? null;
    const ageHours = generatedAt
      ? (Date.now() - new Date(generatedAt).getTime()) / (1000 * 60 * 60)
      : null;

    const payload: JobHealthPayload = {
      snapshot: {
        generatedAt,
        ageHours,
        isStale: ageHours === null ? true : ageHours > SNAPSHOT_STALE_AFTER_HOURS,
      },
      deadLetters: countDeadLetters((deadLetterResult.data ?? []) as Array<{ event_type: string }>),
    };

    return apiSuccessResponse(payload, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Admin/JobHealth', 'Unexpected failure', error);
    return apiErrorResponse('JOB_HEALTH_UNAVAILABLE', 'Job health data unavailable', 503);
  }
}
