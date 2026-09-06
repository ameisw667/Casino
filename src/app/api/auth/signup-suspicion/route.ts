import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { CasinoLogger } from '@/lib/casino/logger';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import type { SignupSuspicionReason } from '@/lib/security/signup-guard';
import type { RiskSignalType } from '@/lib/casino/risk-signals';

// 06_1 Bot-Automation Detection (L3, V1): receiver for the signup honeypot/timing trap.
// The client reports suspicion fire-and-forget AFTER a successful signup — the risk_events
// FK (subject_user_id -> users.id, migration 029) makes pre-signup recording impossible, so
// the signal is attributed to the just-created account instead. Without a session the
// suspicion is only visible as a structured log entry (fail-open, never blocks UX).
const SUSPICION_LIMIT = 10;
const SUSPICION_WINDOW_SECONDS = 60;

const postBodySchema = z.strictObject({
  reason: z.enum(['honeypot', 'timing']),
});

const SIGNAL_BY_REASON: Record<
  SignupSuspicionReason,
  Extract<RiskSignalType, 'bot_signal_honeypot' | 'bot_signal_timing'>
> = {
  honeypot: 'bot_signal_honeypot',
  timing: 'bot_signal_timing',
};

export async function POST(request: Request) {
  try {
    const rate = await enforceRateLimit(
      getClientIdentifier(request),
      'signup-suspicion',
      SUSPICION_LIMIT,
      SUSPICION_WINDOW_SECONDS,
    );

    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: { ...rateLimitHeaders(rate), 'Cache-Control': 'no-store' } },
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = postBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return apiErrorResponse('INVALID_REQUEST_BODY', 'Invalid request body', 400);
    }

    const reason = parseResult.data.reason;
    // Cheap pre-check (security review 2026-09-04 finding #1b): skip the Supabase Auth
    // round trip entirely when the request carries no plausible Supabase auth cookie —
    // anonymous floods get a constant response without touching Supabase.
    const cookieHeader = request.headers.get('cookie');
    const hasAuthCookie = cookieHeader?.includes('auth-token') ?? false;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = hasAuthCookie ? await supabase.auth.getUser() : { data: { user: null } };

    if (!user) {
      CasinoLogger.warn('API/Auth/SignupSuspicion', 'Suspicion reported without a session', {
        reason,
      });
      return apiSuccessResponse({ recorded: false }, { headers: { 'Cache-Control': 'no-store' } });
    }

    await recordRiskEventBestEffort({
      subjectUserId: user.id,
      signalType: SIGNAL_BY_REASON[reason],
      severity: 'low',
      windowStart: new Date().toISOString().slice(0, 10),
      evidence: { reason },
    });

    return apiSuccessResponse({ recorded: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    CasinoLogger.error('API/Auth/SignupSuspicion', 'POST error', err);
    // Observability receiver: never block the (already completed) signup flow.
    return apiSuccessResponse({ recorded: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
