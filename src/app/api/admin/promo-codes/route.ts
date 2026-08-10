import { NextResponse } from 'next/server';
import { z } from 'zod';
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

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Code required')
    .max(32, 'Code too long')
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  amount: z.number().finite().positive().max(10000, 'Amount exceeds 10000 cap'),
  maxUses: z.number().int().positive().max(1_000_000, 'max_uses too large'),
  expiresAt: z.string().datetime().optional().nullable(),
  active: z.boolean().optional(),
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
      'admin-promo-read',
      30,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('promo_codes')
      .select('code, amount, max_uses, used_count, expires_at, active, created_by, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      CasinoLogger.error('API/Admin/PromoCodes', 'List failed', error);
      return NextResponse.json({ error: 'Failed to load promo codes' }, { status: 503 });
    }

    return NextResponse.json({ codes: data ?? [] }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Admin/PromoCodes', 'List unexpected failure', error);
    return NextResponse.json({ error: 'Promo codes unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
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
      'admin-promo-write',
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
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid promo code payload' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('promo_codes')
      .insert({
        code: parsed.data.code.toUpperCase(),
        amount: parsed.data.amount,
        max_uses: parsed.data.maxUses,
        expires_at: parsed.data.expiresAt ?? null,
        active: parsed.data.active ?? true,
        created_by: user.id,
      })
      .select('code, amount, max_uses, used_count, expires_at, active, created_at')
      .single();

    if (error) {
      const msg = (error as { message?: string }).message ?? '';
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('23505')) {
        return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
      }
      CasinoLogger.error('API/Admin/PromoCodes', 'Create failed', error);
      return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
    }

    CasinoLogger.info('API/Admin/PromoCodes', `Admin ${user.email} created code ${data.code}`, {
      amount: data.amount,
      max_uses: data.max_uses,
    });

    return NextResponse.json({ success: true, code: data });
  } catch (error) {
    CasinoLogger.error('API/Admin/PromoCodes', 'Create unexpected failure', error);
    return NextResponse.json({ error: 'Promo code creation unavailable' }, { status: 503 });
  }
}
