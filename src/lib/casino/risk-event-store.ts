import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { toJsonValue } from './json-value';
import { buildRiskEvent, type RiskEvent, type RiskEventInput } from './risk-signals';
import { fraudAlertWait } from '@/trigger/fraud-alert-wait';

/**
 * `record_risk_event` returns the post-upsert row summary (migration 030). Only
 * the fields the alert hook needs are read; anything unexpected is ignored —
 * a malformed RPC payload must degrade to "no alert", never to an exception.
 */
interface RecordRiskEventRpcResult {
  id?: string;
  status?: string;
  occurrences?: number;
  replayed?: boolean;
}

// 06_9 L0: the previously built but never called alert infrastructure gets wired here —
// the single choke point through which every risk signal flows. An alert fires only for
// `high` severity AND the FIRST occurrence of a fingerprint (`occurrences === 1`): repeat
// occurrences of the same fingerprint would otherwise re-alert on every scan run (spam),
// while the event stays visible in /admin/fraud either way. Fire-and-forget on purpose —
// alert dispatch is observability and must never fail (or slow down) the recording that
// guards and money paths rely on. Not using next/server `after()` here because this
// module is a lib function also invoked directly by tests, not a route handler.
function triggerFraudAlertBestEffort(
  event: RiskEvent,
  rpcResult: RecordRiskEventRpcResult,
): void {
  if (event.severity !== 'high' || rpcResult.occurrences !== 1 || !rpcResult.id) return;
  try {
    // Risk events carry no numeric ML score; the schema-required nonnegative score is
    // filled with the first-occurrence count (always 1 on this path), full context rides
    // along in `details`.
    void fraudAlertWait
      .trigger({
        eventId: rpcResult.id,
        userId: event.subjectUserId,
        signalType: event.signalType,
        score: rpcResult.occurrences,
        details: { severity: event.severity, windowStart: event.windowStart },
      })
      .catch((error: unknown) => {
        CasinoLogger.error('RiskEvents', 'Fraud alert trigger failed', error);
      });
  } catch (error) {
    CasinoLogger.error('RiskEvents', 'Fraud alert trigger could not be enqueued', error);
  }
}

/**
 * Risk signals are observability data, never an authorization dependency. A
 * database or redaction failure must not block a wallet mutation or turn a
 * legitimate user into an automatic enforcement decision.
 */
export async function recordRiskEventBestEffort(input: RiskEventInput): Promise<boolean> {
  try {
    const event = buildRiskEvent(input);
    const { data, error } = await createAdminClient().rpc('record_risk_event', {
      p_subject_user_id: event.subjectUserId,
      p_signal_type: event.signalType,
      p_severity: event.severity,
      p_fingerprint: event.fingerprint,
      p_window_start: event.windowStart,
      p_evidence: toJsonValue(event.evidence),
    });
    if (error) {
      CasinoLogger.error('RiskEvents', 'Risk event could not be recorded', error);
      return false;
    }
    triggerFraudAlertBestEffort(event, (data ?? {}) as RecordRiskEventRpcResult);
    return true;
  } catch (error) {
    CasinoLogger.error('RiskEvents', 'Risk event recording failed open', error);
    return false;
  }
}
