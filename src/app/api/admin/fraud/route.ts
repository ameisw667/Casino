import { NextResponse } from 'next/server';
import { z } from 'zod';
import { wait } from '@trigger.dev/sdk';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const EVENT_LIST_LIMIT = 200;

const listQuerySchema = z.object({
  status: z.enum(['open', 'reviewed', 'closed']).optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  signalType: z
    .enum([
      'voucher_velocity',
      'multi_account_indicator',
      'idempotency_conflict',
      'rate_limit_hit',
      'balance_correction',
      'bet_velocity',
      'win_rate_anomaly',
    ])
    .optional(),
});

const reviewSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['reviewed', 'closed']),
  reason: z.string().trim().min(1).max(500),
  tokenId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-fraud-read',
      30,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const url = new URL(request.url);
    const filters = listQuerySchema.safeParse({
      status: url.searchParams.get('status') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
      signalType: url.searchParams.get('signalType') ?? undefined,
    });
    if (!filters.success) {
      return NextResponse.json({ error: 'Invalid filter parameters' }, { status: 400 });
    }

    const admin = createAdminClient();
    let query = admin
      .from('risk_events')
      .select(
        'id, subject_user_id, signal_type, severity, status, occurrences, evidence, ' +
          'window_start, created_at, last_seen_at, reviewed_by, reviewed_at, review_reason',
      )
      .order('last_seen_at', { ascending: false })
      .limit(EVENT_LIST_LIMIT);

    if (filters.data.status) query = query.eq('status', filters.data.status);
    if (filters.data.severity) query = query.eq('severity', filters.data.severity);
    if (filters.data.signalType) query = query.eq('signal_type', filters.data.signalType);

    const { data, error } = await query;
    if (error) {
      CasinoLogger.error('API/Admin/Fraud', 'List failed', error);
      return NextResponse.json({ error: 'Failed to load fraud signals' }, { status: 503 });
    }

    return NextResponse.json({ events: data ?? [] }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Admin/Fraud', 'List unexpected failure', error);
    return NextResponse.json({ error: 'Fraud signals unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-fraud-write',
      10,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid review payload' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('review_risk_event', {
      p_event_id: parsed.data.eventId,
      p_reviewer_id: user.id,
      p_status: parsed.data.status,
      p_reason: parsed.data.reason,
    });

    if (error) {
      const msg = (error as { message?: string }).message ?? '';
      if (msg.includes('not found')) {
        return NextResponse.json({ error: 'Fraud signal not found' }, { status: 404 });
      }
      CasinoLogger.error('API/Admin/Fraud', 'Review failed', error);
      return NextResponse.json({ error: 'Failed to review fraud signal' }, { status: 500 });
    }

    if (parsed.data.tokenId) {
      try {
        await wait.completeToken(parsed.data.tokenId, {
          status: parsed.data.status,
          reason: parsed.data.reason,
          reviewerId: user.id,
        });
      } catch (err) {
        CasinoLogger.error('API/Admin/Fraud', 'Wait token completion warning (non-blocking)', err);
      }
    }

    CasinoLogger.info(
      'API/Admin/Fraud',
      `Admin ${user.email} set ${parsed.data.eventId} to ${parsed.data.status}`,
      { reason: parsed.data.reason },
    );

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    CasinoLogger.error('API/Admin/Fraud', 'Review unexpected failure', error);
    return NextResponse.json({ error: 'Fraud signal review unavailable' }, { status: 503 });
  }
}
