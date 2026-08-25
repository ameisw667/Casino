import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import {
  authMethodSchema,
  loginStatusSchema,
  recordLoginAuditEntry,
} from '@/lib/security/login-audit';

const postBodySchema = z.strictObject({
  authMethod: authMethodSchema,
  status: loginStatusSchema.optional().default('success'),
});

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'login-history-read',
      30,
      60,
    );

    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const { data, error } = await supabase
      .from('user_login_history')
      .select('id, auth_method, device_info, ip_masked, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[LoginHistory] Select error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 });
    }

    const records = (data || []).map((row) => ({
      id: row.id,
      authMethod: row.auth_method,
      deviceInfo: row.device_info,
      ipMasked: row.ip_masked,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json(
      { history: records },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (err) {
    console.error('[LoginHistory] GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'login-history-write',
      10,
      60,
    );

    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = postBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip');

    const success = await recordLoginAuditEntry({
      userId: user.id,
      authMethod: parseResult.data.authMethod,
      status: parseResult.data.status,
      userAgent,
      rawIp,
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to record login entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[LoginHistory] POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
