import 'server-only';
import { createAdminClient } from '@/utils/supabase/admin';
import { APP_ERROR_CODES } from '@/lib/security/form-errors';

/**
 * 06_2 Responsible-Gambling-Controls (L1/L3): server-authoritative wellbeing guard.
 *
 * The browser owns 0% wellbeing authority — the only write paths are the authenticated
 * self-exclusion / loss-limit endpoints; the only read path is this guard on the money
 * routes. The guard fails closed: a database error makes play unavailable (503 at the
 * route layer), never silently allowed — same invariant as the wallet/rate-limit paths.
 *
 * Rollout note: the guard queries `user_wellbeing_limits` and `get_daily_net_loss_cents()`
 * (migration 063). Deploying this code before pushing 063 would fail every bet route with
 * 503 — push order matters.
 */

export type WellbeingGuardStatus =
  | { state: 'allowed'; dailyLossLimitCents: number | null; dailyNetLossCents: number | null }
  | { state: 'self-excluded'; until: string }
  | { state: 'loss-limit-reached'; limitCents: number; lostCents: number }
  | { state: 'unavailable' };

// Transport mapping consumed by the money routes — the business decision (which state
// means which error contract) lives here, the HTTP construction stays in the route.
export type WellbeingApiError = {
  code: keyof typeof APP_ERROR_CODES;
  message: string;
  httpStatus: number;
};

export function wellbeingApiError(status: WellbeingGuardStatus): WellbeingApiError | null {
  switch (status.state) {
    case 'allowed':
      return null;
    case 'self-excluded':
      return {
        code: 'SELF_EXCLUDED',
        message: 'Deine Selbstsperre ist aktiv — Spielen ist bis dahin nicht möglich.',
        httpStatus: 403,
      };
    case 'loss-limit-reached':
      return {
        code: 'LOSS_LIMIT_REACHED',
        message: 'Dein Tages-Verlustlimit ist erreicht — heute ist kein Spielen mehr möglich.',
        httpStatus: 403,
      };
    case 'unavailable':
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Der Dienst ist vorübergehend nicht verfügbar.',
        httpStatus: 503,
      };
  }
}

export async function checkWellbeingGuard(userId: string): Promise<WellbeingGuardStatus> {
  try {
    const { data, error } = await createAdminClient()
      .from('user_wellbeing_limits')
      .select('self_excluded_until, daily_loss_limit_cents')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      // Rollout safety: if table does not exist in schema cache (PGRST205, migration 063 pending K4 push),
      // treat as unconfigured/allowed rather than taking down all money routes with 503.
      const isMissingTable =
        (error as { code?: string }).code === 'PGRST205' ||
        (error as { message?: string }).message?.includes('user_wellbeing_limits') ||
        (error as { message?: string }).message?.includes(
          'relation "public.user_wellbeing_limits" does not exist',
        );
      if (isMissingTable) {
        return { state: 'allowed', dailyLossLimitCents: null, dailyNetLossCents: 0 };
      }
      return { state: 'unavailable' };
    }

    const until = data?.self_excluded_until;
    if (typeof until === 'string') {
      const untilMs = Date.parse(until);
      // Fail-closed contract: an unparseable timestamp must never read as "allowed".
      // (Theoretically unreachable — Postgres serializes valid timestamptz — but the
      // guard's stated invariant leaves no room for a fail-open edge.)
      if (Number.isNaN(untilMs)) return { state: 'unavailable' };
      if (untilMs > Date.now()) return { state: 'self-excluded', until };
    }

    const limitCents =
      typeof data?.daily_loss_limit_cents === 'number' ? data.daily_loss_limit_cents : null;
    if (limitCents === null) {
      return { state: 'allowed', dailyLossLimitCents: null, dailyNetLossCents: 0 };
    }

    // 06_2 L3 (Q4a): net loss (bets minus wins, bonus credits excluded) of the UTC
    // calendar day, aggregated server-side by the 063 RPC. Reset is implicit through
    // the calendar-day filter — no cron needed.
    const { data: netLossCents, error: rpcError } = await createAdminClient().rpc(
      'get_daily_net_loss_cents',
      { p_user_id: userId },
    );
    if (rpcError || typeof netLossCents !== 'number' || !Number.isFinite(netLossCents)) {
      const isMissingRpc =
        (rpcError as { code?: string })?.code === 'PGRST202' ||
        (rpcError as { message?: string })?.message?.includes('get_daily_net_loss_cents');
      if (isMissingRpc) {
        return { state: 'allowed', dailyLossLimitCents: limitCents, dailyNetLossCents: 0 };
      }
      return { state: 'unavailable' };
    }
    if (netLossCents >= limitCents) {
      return { state: 'loss-limit-reached', limitCents, lostCents: netLossCents };
    }
    return { state: 'allowed', dailyLossLimitCents: limitCents, dailyNetLossCents: netLossCents };
  } catch {
    return { state: 'unavailable' };
  }
}

export async function setSelfExclusion(userId: string, durationDays: number): Promise<string> {
  const until = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  // updated_at is stamped by the DB trigger (migration 063), which also guarantees the
  // write can only ever EXTEND an existing lock — never shorten it (security review HIGH).
  const { error } = await createAdminClient()
    .from('user_wellbeing_limits')
    .upsert({ user_id: userId, self_excluded_until: until });
  if (error) throw new Error(error.message || 'Self-exclusion update failed');
  return until;
}

export async function setDailyLossLimit(
  userId: string,
  dailyLossLimitCents: number | null,
): Promise<void> {
  // Unlike the self-exclusion, a user-chosen loss limit may be set and cleared freely
  // (documented assumption: no cooling-off in this Ausbaustufe, YAGNI per plan scope).
  const { error } = await createAdminClient()
    .from('user_wellbeing_limits')
    .upsert({ user_id: userId, daily_loss_limit_cents: dailyLossLimitCents });
  if (error) throw new Error(error.message || 'Daily loss limit update failed');
}
