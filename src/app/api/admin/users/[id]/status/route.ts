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

// 06_3 L2 (Multi-Account-Abuse-Prevention): admin-initiated fraud enforcement — freeze or
// unfreeze an account confirmed (by human review) to be multi-account abuse. Modeled on the
// Zod/Auth/Rate-Limit pattern of admin/promo-codes and admin/users. Never automatic: no
// code path writes account_status except this admin route (plan question Q3, answered a —
// no retroactive freeze of existing open clusters). Enforcement happens in
// checkWellbeingGuard, which blocks all four money routes for frozen accounts.
const statusUpdateSchema = z.object({
  status: z.enum(['active', 'frozen']),
  reason: z.string().trim().min(1).max(500),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
      'admin-users-status-write',
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

    const { id: targetUserId } = await params;
    if (!z.string().uuid().safeParse(targetUserId).success) {
      return apiErrorResponse(APP_ERROR_CODES.VALIDATION_FAILED, 'Ungültige Nutzer-ID.', 400);
    }

    const body = await request.json().catch(() => null);
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400);
    }

    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from('users')
      .update({ account_status: parsed.data.status })
      .eq('id', targetUserId)
      .select('id, account_status')
      .maybeSingle();

    if (error) {
      CasinoLogger.error('API/Admin/Users/Status', `Status update failed for ${targetUserId}`, error);
      return apiErrorResponse(
        APP_ERROR_CODES.INTERNAL_ERROR,
        'Die Kontosperrung konnte nicht verarbeitet werden.',
        500,
      );
    }
    if (!updated) {
      return apiErrorResponse(APP_ERROR_CODES.VALIDATION_FAILED, 'Nutzer nicht gefunden.', 404);
    }

    CasinoLogger.info(
      'API/Admin/Users/Status',
      `Admin ${user.email} set account ${targetUserId} to ${parsed.data.status}`,
      { reason: parsed.data.reason },
    );

    return apiSuccessResponse({ success: true, user: updated });
  } catch (error) {
    CasinoLogger.error('API/Admin/Users/Status', 'Status update unexpected failure', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Die Nutzerverwaltung ist vorübergehend nicht verfügbar.',
      503,
    );
  }
}