import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { toJsonValue } from './json-value';
import { buildRiskEvent, type RiskEventInput } from './risk-signals';

/**
 * Risk signals are observability data, never an authorization dependency. A
 * database or redaction failure must not block a wallet mutation or turn a
 * legitimate user into an automatic enforcement decision.
 */
export async function recordRiskEventBestEffort(input: RiskEventInput): Promise<boolean> {
  try {
    const event = buildRiskEvent(input);
    const { error } = await createAdminClient().rpc('record_risk_event', {
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
    return true;
  } catch (error) {
    CasinoLogger.error('RiskEvents', 'Risk event recording failed open', error);
    return false;
  }
}
