import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { after } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { WalletService } from '@/lib/casino/wallet';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { APP_ERROR_CODES, zodErrorResponse } from '@/lib/security/form-errors';

// 06_10 L0: admin-triggered clawback of a promo bonus identified as fraudulent after the
// fact. Always human-initiated (admin action in /admin/promo-codes) — never automatic.
// Same auth/origin/idempotency/rate-limit contract as the other admin mutations
// (admin/users PATCH): Idempotency-Key makes the retry replay the same answer, the RPC
// side (066_promo_reversal_and_expiry.sql) additionally rejects a second reversal of the
// same redemption with a different request id.
const REVERSAL_ERROR_STATUS: Record<string, number> = {
  REVERSAL_NOT_FOUND: 404,
  REVERSAL_ALREADY_DONE: 409,
};

const REVERSAL_ERROR_MESSAGES: Record<string, string> = {
  REVERSAL_NOT_FOUND: 'Für diesen Nutzer existiert keine Einlösung dieses Codes.',
  REVERSAL_ALREADY_DONE: 'Dieser Code wurde für diesen Nutzer bereits zurückgebucht.',
};

const reverseSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().trim().min(1).max(500),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) {
    return apiErrorResponse(
      APP_ERROR_CODES.PERMISSION_DENIED,
      'Keine Berechtigung.',
      originFailure.status || 403,
    );
  }

  const requestId = z.string().uuid().safeParse(request.headers.get('Idempotency-Key'));
  if (!requestId.success) {
    return apiErrorResponse(
      APP_ERROR_CODES.VALIDATION_FAILED,
      'Eine gültige Idempotency-Key-Angabe ist erforderlich.',
      400,
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

    const { code } = await params;
    if (!code || code.trim().length === 0) {
      return apiErrorResponse(APP_ERROR_CODES.VALIDATION_FAILED, 'Ungültiger Code.', 400, {
        requestId: requestId.data,
      });
    }

    const body = await request.json().catch(() => null);
    const parsed = reverseSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400, { requestId: requestId.data });
    }

    const outcome = await WalletService.reversePromoCode({
      actorId: user.id,
      userId: parsed.data.userId,
      code,
      requestId: requestId.data,
      reason: parsed.data.reason,
    });

    if (!outcome.ok) {
      const status = REVERSAL_ERROR_STATUS[outcome.code] ?? 400;
      return apiErrorResponse(
        outcome.code,
        REVERSAL_ERROR_MESSAGES[outcome.code] ?? 'Rückbuchung abgelehnt.',
        status,
        { requestId: requestId.data },
      );
    }

    CasinoLogger.info(
      'API/Admin/PromoReversal',
      `Admin ${user.email} reversed promo code ${`****${code.slice(-4)}`} for user ${parsed.data.userId}`,
      { amount: outcome.amount, shortfall: outcome.shortfall, replayed: outcome.replayed },
    );

    // 06_10 L0: a clawback of granted money is materially different from a routine balance
    // correction (06_9 L1, severity low) — it follows a fraud determination and must stand
    // out in the fraud review stream. Evidence carries the transaction + shortfall so the
    // admin sees the uncollectable part without opening the ledger.
    after(async () => {
      await recordRiskEventBestEffort({
        subjectUserId: parsed.data.userId,
        signalType: 'balance_correction',
        severity: 'medium',
        windowStart: new Date().toISOString(),
        evidence: {
          scope: 'promo-reversal',
          code: `****${code.slice(-4)}`,
          transactionId: outcome.snapshot.transactionId,
          amount: outcome.amount,
          shortfall: outcome.shortfall,
          replayed: outcome.replayed,
        },
      });
    });

    return apiSuccessResponse({
      success: true,
      amount: outcome.amount,
      shortfall: outcome.shortfall,
      snapshot: outcome.snapshot,
    });
  } catch (error) {
    CasinoLogger.error('API/Admin/PromoReversal', 'Promo reversal unexpected failure', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Die Rückbuchung ist vorübergehend nicht verfügbar.',
      503,
    );
  }
}