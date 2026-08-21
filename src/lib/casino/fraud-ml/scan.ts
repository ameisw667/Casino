// No 'server-only' import and no dependency on risk-event-store.ts's recordRiskEventBestEffort()
// — that helper goes through '@/utils/supabase/admin', which imports 'server-only' and throws
// outside a Next.js build (see features.ts for the same constraint). The fingerprint/redaction
// logic from risk-signals.ts (no 'server-only' there) is still reused; only the thin RPC-calling
// wrapper is duplicated here, scoped to the injected client — see worldmap/09_ML_FRAUD_ANOMALY.md.
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildRiskEvent } from '../risk-signals';
import { fetchFraudMlFeatures, toFeatureVector } from './features';
import { buildIsolationForest, scoreSample } from './isolation-forest';
import type { RiskSeverity } from '../risk-signals';

// Below this, an isolation forest has too few points per split to produce a meaningful score —
// the scan skips cleanly instead of emitting noise from a handful of samples.
const MIN_USERS_FOR_SCAN = 5;

// Isolation-forest literature convention: scores well above 0.5 indicate anomalies.
const SEVERITY_HIGH = 0.7;
const SEVERITY_MEDIUM = 0.6;
const SEVERITY_LOW = 0.5;

// Evidence is hashed in full to build the risk_events dedup fingerprint (risk-signals.ts) — a
// same-day rerun must band both the score and the bet count, or tiny fluctuations mint a new
// event instead of bumping `occurrences` (same convention as fraud-detection.ts's bandCount).
const SCORE_BAND_STEP = 0.05;
const BET_COUNT_BAND_STEP = 10;

export interface FraudMlScanSummary {
  usersScored: number;
  eventsRecorded: number;
  skippedReason: string | null;
}

function floorToUtcDayIso(now: Date): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

function bandValue(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function bandCount(count: number, step: number): number {
  return Math.floor(count / step) * step;
}

function severityForScore(score: number): RiskSeverity | null {
  if (score >= SEVERITY_HIGH) return 'high';
  if (score >= SEVERITY_MEDIUM) return 'medium';
  if (score >= SEVERITY_LOW) return 'low';
  return null;
}

// Seeding the forest from the UTC day (not Math.random()) makes reruns on the same day
// deterministic/idempotent — the same convention detectBetVelocityOutliers() etc. use via
// floorToUtcDayIso() for their dedup window, extended here to the forest's random trees too.
function seedFromWindowStart(windowStart: string): number {
  let hash = 0;
  for (let i = 0; i < windowStart.length; i++) {
    hash = (Math.imul(31, hash) + windowStart.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

// Best-effort like recordRiskEventBestEffort() in risk-event-store.ts (which this duplicates
// the RPC call of, see file header): a thrown exception for one user — network blip, transient
// DB error — must not abort the remaining users in the same scan run.
async function recordMlAnomalyEvent(
  client: SupabaseClient,
  subjectUserId: string,
  severity: RiskSeverity,
  windowStart: string,
  score: number,
  betCount: number,
): Promise<boolean> {
  try {
    const event = buildRiskEvent({
      subjectUserId,
      signalType: 'ml_anomaly_score',
      severity,
      windowStart,
      evidence: {
        anomalyScoreBand: bandValue(score, SCORE_BAND_STEP),
        betCountBand: bandCount(betCount, BET_COUNT_BAND_STEP),
      },
    });

    const { error } = await client.rpc('record_risk_event', {
      p_subject_user_id: event.subjectUserId,
      p_signal_type: event.signalType,
      p_severity: event.severity,
      p_fingerprint: event.fingerprint,
      p_window_start: event.windowStart,
      p_evidence: event.evidence,
    });

    if (error) {
      console.error('[FraudMl] Risk event could not be recorded', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[FraudMl] Risk event recording failed open', error);
    return false;
  }
}

export async function runFraudMlScan(client: SupabaseClient): Promise<FraudMlScanSummary> {
  const rows = await fetchFraudMlFeatures(client);

  if (rows.length < MIN_USERS_FOR_SCAN) {
    const skippedReason = `Only ${rows.length} user(s) met the feature window threshold, need at least ${MIN_USERS_FOR_SCAN}`;
    console.log(`[FraudMl] ${skippedReason}`);
    return { usersScored: 0, eventsRecorded: 0, skippedReason };
  }

  const windowStart = floorToUtcDayIso(new Date());
  const forest = buildIsolationForest(rows.map(toFeatureVector), {
    seed: seedFromWindowStart(windowStart),
  });

  let eventsRecorded = 0;
  for (const row of rows) {
    const score = scoreSample(forest, toFeatureVector(row));
    const severity = severityForScore(score);
    if (!severity) continue;

    const recorded = await recordMlAnomalyEvent(
      client,
      row.userId,
      severity,
      windowStart,
      score,
      row.betCount,
    );
    if (recorded) eventsRecorded += 1;
  }

  return { usersScored: rows.length, eventsRecorded, skippedReason: null };
}
