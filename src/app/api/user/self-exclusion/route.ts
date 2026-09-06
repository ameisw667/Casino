import { z } from 'zod';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  resolveDevFallbackUserId,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { createClient } from '@/utils/supabase/server';
import { APP_ERROR_CODES, apiErrorResponse, zodErrorResponse } from '@/lib/security/form-errors';
import { apiSuccessResponse } from '@/lib/api/response';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  checkWellbeingGuard,
  setDailyLossLimit,
  setSelfExclusion,
} from '@/lib/casino/responsible-gambling';

// 06_2 L1: Aktivierung der Selbstsperre. Kein Endpunkt zum vorzeitigen Deaktivieren
// (Q3a) — die Sperre läuft ausschließlich über die gesetzte Frist ab.
const selfExclusionSchema = z.object({
  durationDays: z
    .number()
    .int('Die Dauer muss ganzzahlig sein.')
    .min(1, 'Die Dauer muss mindestens 1 Tag betragen.')
    .max(365, 'Die Dauer darf maximal 365 Tage betragen.'),
});

// 06_2 L3: Tages-Verlustlimit in Cents. Anders als die Selbstsperre darf es frei
// gesetzt und entfernt werden (dokumentierte Annahme: keine Cooling-off-Stufe).
const DAILY_LOSS_LIMIT_MAX_CENTS = 1_000_000; // 10.000,00 EUR
const dailyLossLimitSchema = z.object({
  dailyLossLimitCents: z
    .number()
    .int('Das Limit muss ganzzahlig sein.')
    .min(1, 'Das Limit muss mindestens 1 Cent betragen.')
    .max(DAILY_LOSS_LIMIT_MAX_CENTS, 'Das Limit ist zu hoch.')
    .nullable(),
});

async function resolveUserId(request: Request) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const cookieHeader = request.headers.get('cookie') || '';
  const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

  return authUser?.id ?? resolveDevFallbackUserId(request, isExplicitSignedOut) ?? undefined;
}

export async function GET(request: Request) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return apiErrorResponse(APP_ERROR_CODES.AUTHENTICATION_REQUIRED, 'Bitte melde dich an.', 401);
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'self-exclusion-read',
      30,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? APP_ERROR_CODES.SERVICE_UNAVAILABLE : APP_ERROR_CODES.RATE_LIMITED,
        rate.unavailable
          ? 'Der Dienst ist vorübergehend nicht verfügbar.'
          : 'Zu viele Anfragen. Bitte versuche es später erneut.',
        rate.unavailable ? 503 : 429,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const wellbeing = await checkWellbeingGuard(userId);
    if (wellbeing.state === 'unavailable') {
      return apiErrorResponse(
        APP_ERROR_CODES.SERVICE_UNAVAILABLE,
        'Der Dienst ist vorübergehend nicht verfügbar.',
        503,
      );
    }

    return apiSuccessResponse(
      wellbeing.state === 'self-excluded'
        ? {
            selfExcluded: true,
            selfExcludedUntil: wellbeing.until,
            dailyLossLimitCents: null,
            dailyNetLossCents: null,
          }
        : wellbeing.state === 'allowed'
          ? {
              selfExcluded: false,
              dailyLossLimitCents: wellbeing.dailyLossLimitCents,
              dailyNetLossCents: wellbeing.dailyNetLossCents,
            }
          : {
              // 06_2 L3: loss-limit-reached ist kein Sperrzustand der Selbstsperre —
              // das Limit mit dem heutigen Verlust bleibt sichtbar.
              selfExcluded: false,
              dailyLossLimitCents: wellbeing.limitCents,
              dailyNetLossCents: wellbeing.lostCents,
            },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/User/SelfExclusion', 'Wellbeing status read failed closed', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Der Dienst ist vorübergehend nicht verfügbar.',
      503,
    );
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
    const userId = await resolveUserId(request);
    if (!userId) {
      return apiErrorResponse(APP_ERROR_CODES.AUTHENTICATION_REQUIRED, 'Bitte melde dich an.', 401);
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'self-exclusion',
      5,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? APP_ERROR_CODES.SERVICE_UNAVAILABLE : APP_ERROR_CODES.RATE_LIMITED,
        rate.unavailable
          ? 'Der Dienst ist vorübergehend nicht verfügbar.'
          : 'Zu viele Anfragen. Bitte versuche es später erneut.',
        rate.unavailable ? 503 : 429,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const parsed = selfExclusionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400);
    }

    const selfExcludedUntil = await setSelfExclusion(userId, parsed.data.durationDays);
    return apiSuccessResponse({ selfExcludedUntil });
  } catch (error) {
    CasinoLogger.error('API/User/SelfExclusion', 'Self-exclusion activation failed closed', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Die Selbstsperre konnte nicht aktiviert werden. Bitte versuche es später erneut.',
      503,
    );
  }
}

export async function PUT(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) {
    return apiErrorResponse(
      APP_ERROR_CODES.PERMISSION_DENIED,
      'Keine Berechtigung.',
      originFailure.status || 403,
    );
  }

  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return apiErrorResponse(APP_ERROR_CODES.AUTHENTICATION_REQUIRED, 'Bitte melde dich an.', 401);
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'self-exclusion',
      5,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? APP_ERROR_CODES.SERVICE_UNAVAILABLE : APP_ERROR_CODES.RATE_LIMITED,
        rate.unavailable
          ? 'Der Dienst ist vorübergehend nicht verfügbar.'
          : 'Zu viele Anfragen. Bitte versuche es später erneut.',
        rate.unavailable ? 503 : 429,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const parsed = dailyLossLimitSchema.safeParse(await request.json());
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400);
    }

    await setDailyLossLimit(userId, parsed.data.dailyLossLimitCents);
    return apiSuccessResponse({ dailyLossLimitCents: parsed.data.dailyLossLimitCents });
  } catch (error) {
    CasinoLogger.error('API/User/SelfExclusion', 'Daily loss limit update failed closed', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Das Verlustlimit konnte nicht gespeichert werden. Bitte versuche es später erneut.',
      503,
    );
  }
}

export const dynamic = 'force-dynamic';
