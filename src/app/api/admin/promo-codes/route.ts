import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
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
import { APP_ERROR_CODES, zodErrorResponse } from '@/lib/security/form-errors';

// 06_1 Bot-Automation Detection (L4, V3): minimum 8 characters (~38-symbol alphabet after
// case-folding ≈ 4.3e12 keyspace — infeasible for a single account within the per-user
// redemption rate limit). Detection-only against distributed multi-account guessing (the
// redeem-side guess counter records voucher_velocity); nothing here hard-blocks, and
// dictionary codes chosen by admins stay guessable — entropy ultimately depends on the
// admin picking non-dictionary codes. Applies only to NEW codes — existing shorter rows
// stay functional (no retroactive change, plan question Q2 answered with option a).
const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(8, 'Code must be at least 8 characters')
    .max(32, 'Code too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric'),
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
    if (!user) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (!isAdminEmail(user.email)) return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-promo-read',
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
    const { data, error } = await admin
      .from('promo_codes')
      .select('code, amount, max_uses, used_count, expires_at, active, created_by, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      CasinoLogger.error('API/Admin/PromoCodes', 'List failed', error);
      return apiErrorResponse('LOAD_FAILED', 'Failed to load promo codes', 503);
    }

    return apiSuccessResponse({ codes: data ?? [] }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Admin/PromoCodes', 'List unexpected failure', error);
    return apiErrorResponse('PROMO_UNAVAILABLE', 'Promo codes unavailable', 503);
  }
}

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) {
    return apiErrorResponse(
      APP_ERROR_CODES.PERMISSION_DENIED,
      'Keine Berechtigung.',
      originFailure.status || 403,
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiErrorResponse(APP_ERROR_CODES.AUTHENTICATION_REQUIRED, 'Bitte melde dich an.', 401);
    }
    if (!isAdminEmail(user.email)) {
      return apiErrorResponse(APP_ERROR_CODES.PERMISSION_DENIED, 'Keine Berechtigung.', 403);
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-promo-write',
      10,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? APP_ERROR_CODES.SERVICE_UNAVAILABLE : APP_ERROR_CODES.RATE_LIMITED,
        rate.unavailable
          ? 'Der Dienst ist vorübergehend nicht verfügbar.'
          : 'Zu viele Anfragen. Bitte versuche es später erneut.',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400);
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
        return apiErrorResponse(
          APP_ERROR_CODES.CONFLICT,
          'Dieser Promo-Code existiert bereits.',
          409,
        );
      }
      CasinoLogger.error('API/Admin/PromoCodes', 'Create failed', error);
      return apiErrorResponse(
        APP_ERROR_CODES.INTERNAL_ERROR,
        'Der Promo-Code konnte nicht erstellt werden.',
        500,
      );
    }

    CasinoLogger.info('API/Admin/PromoCodes', `Admin ${user.email} created code ${data.code}`, {
      amount: data.amount,
      max_uses: data.max_uses,
    });

    return apiSuccessResponse({ success: true, code: data });
  } catch (error) {
    CasinoLogger.error('API/Admin/PromoCodes', 'Create unexpected failure', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Die Promo-Code-Verwaltung ist vorübergehend nicht verfügbar.',
      503,
    );
  }
}
