import { NextResponse } from 'next/server';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { getGuideFeedbackSummary } from '@/lib/casino/guide-feedback';
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
      data: { user },
    } = await supabase.auth.getUser();

    const isDev =
      process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true';
    if (!user && !isDev) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (user && !isAdminEmail(user.email) && !isDev) {
      return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);
    }

    const userId = user?.id || 'dev_admin';
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'admin-evals-read',
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

    const adminClient = createAdminClient();
    const asOf = new Date().toISOString();

    // 1. Fetch Observability telemetry metrics
    let observability: Record<string, unknown> | null = null;
    try {
      const { data, error } = await adminClient.rpc('get_guide_observability', {
        p_as_of: asOf,
      });
      if (!error && data) {
        observability = data as Record<string, unknown>;
      }
    } catch {
      // RPC fallback handled below
    }

    // Default fallback if table/RPC is not yet populated
    if (!observability) {
      observability = {
        status: 'ready',
        asOf,
        last24h: {
          requests: 0,
          uniqueActors: 0,
          successRate: 100.0,
          errorRate: 0.0,
          outcomes: {
            success: 0,
            configuration: 0,
            quota: 0,
            upstream: 0,
            invalid_response: 0,
            rate_limited: 0,
          },
          averageLatencyMs: 0,
          p95LatencyMs: 0,
          tokens: { input: 0, cachedInput: 0, output: 0, reasoning: 0, total: 0 },
          estimatedCostMicrousd: 0,
        },
        last7d: {
          requests: 0,
          uniqueActors: 0,
          successRate: 100.0,
          errorRate: 0.0,
          outcomes: {
            success: 0,
            configuration: 0,
            quota: 0,
            upstream: 0,
            invalid_response: 0,
            rate_limited: 0,
          },
          averageLatencyMs: 0,
          p95LatencyMs: 0,
          tokens: { input: 0, cachedInput: 0, output: 0, reasoning: 0, total: 0 },
          estimatedCostMicrousd: 0,
        },
        pricingVersions: ['gpt-4o-mini-2026-08-17'],
      };
    }

    // 2. Fetch User Satisfaction Feedback
    const feedbackSummary = await getGuideFeedbackSummary();

    return apiSuccessResponse(
      {
        success: true,
        observability,
        feedback: feedbackSummary,
      },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (err) {
    CasinoLogger.error('API/Admin/Evals', 'GET failed', err instanceof Error ? err : undefined);
    return apiErrorResponse('EVALS_LOAD_FAILED', 'Failed to load evals telemetry', 500);
  }
}
