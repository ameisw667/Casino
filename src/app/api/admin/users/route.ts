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

const USER_LIST_LIMIT = 200;

interface AdminUserRow {
  id: string;
  username: string;
  email: string | null;
  balance: number;
  xp: number;
  level: number;
  rank: string;
  created_at: string;
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
      'admin-users-read',
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
      .from('users')
      .select('id, username, email, balance, xp, level, rank, created_at')
      .order('balance', { ascending: false })
      .limit(USER_LIST_LIMIT);

    if (error) {
      CasinoLogger.error('API/Admin/Users', 'User list load failed closed', error);
      return apiErrorResponse('USER_LIST_UNAVAILABLE', 'User list unavailable', 503);
    }

    const users = (data ?? []) as AdminUserRow[];
    const totals = users.reduce(
      (acc, u) => ({ balance: acc.balance + Number(u.balance), xp: acc.xp + Number(u.xp) }),
      { balance: 0, xp: 0 },
    );

    return apiSuccessResponse(
      {
        users,
        meta: {
          count: users.length,
          truncated: users.length === USER_LIST_LIMIT,
          totalBalance: totals.balance,
          totalXp: totals.xp,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Admin/Users', 'Admin user list failed closed', error);
    return apiErrorResponse('USER_LIST_UNAVAILABLE', 'User list unavailable', 503);
  }
}

const adminUpdateUserSchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().trim().min(1).max(500),
  balance: z.number().finite().nonnegative().optional(),
  xp: z.number().int().nonnegative().optional(),
  level: z.number().int().positive().optional(),
  rank: z.string().min(1).optional(),
});

export async function PATCH(request: Request) {
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
      'admin-users-write',
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
    const parsed = adminUpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400, { requestId: requestId.data });
    }

    const { targetUserId, reason, ...updates } = parsed.data;
    if (Object.keys(updates).length === 0) {
      return apiErrorResponse(
        APP_ERROR_CODES.VALIDATION_FAILED,
        'Mindestens ein Änderungsfeld ist erforderlich.',
        400,
        { requestId: requestId.data },
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('admin_update_user', {
      p_actor_id: user.id,
      p_target_user_id: targetUserId,
      p_request_id: requestId.data,
      p_reason: reason,
      p_balance: updates.balance ?? null,
      p_xp: updates.xp ?? null,
      p_level: updates.level ?? null,
      p_rank: updates.rank ?? null,
    });

    if (error || !data) {
      CasinoLogger.error('API/Admin/Users', `Admin user update failed for ${targetUserId}`, error);
      return apiErrorResponse(
        APP_ERROR_CODES.INTERNAL_ERROR,
        'Die Nutzeränderung konnte nicht verarbeitet werden.',
        500,
        { requestId: requestId.data },
      );
    }

    CasinoLogger.info('API/Admin/Users', `Admin ${user.email} updated user ${targetUserId}`, {
      fields: Object.keys(updates),
      replayed: data.replayed,
    });

    return apiSuccessResponse({
      success: true,
      user: data.user,
      transactionId: data.transactionId,
      replayed: data.replayed,
    });
  } catch (error) {
    CasinoLogger.error('API/Admin/Users', 'Admin user update unexpected failure', error);
    return apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Die Nutzerverwaltung ist vorübergehend nicht verfügbar.',
      503,
    );
  }
}
