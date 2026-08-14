import { createHash } from 'node:crypto';

export type RiskSignalType =
  | 'voucher_velocity'
  | 'multi_account_indicator'
  | 'idempotency_conflict'
  | 'rate_limit_hit'
  | 'balance_correction';

export type RiskSeverity = 'low' | 'medium' | 'high';

export interface RiskEventInput {
  subjectUserId: string;
  signalType: RiskSignalType;
  severity: RiskSeverity;
  windowStart: string;
  evidence: Record<string, unknown>;
}

export interface RiskEvent {
  subjectUserId: string;
  signalType: RiskSignalType;
  severity: RiskSeverity;
  windowStart: string;
  fingerprint: string;
  evidence: Record<string, unknown>;
}

const SENSITIVE_KEY =
  /(secret|token|cookie|password|server[_-]?seed|^ip$|device|email|authorization|credential)/i;
const MAX_STRING_LENGTH = 256;

function sanitizeValue(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEY.test(key)) return undefined;
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') return value.slice(0, MAX_STRING_LENGTH);
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)).filter((item) => item !== undefined);
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (result, [entryKey, entryValue]) => {
        const sanitized = sanitizeValue(entryValue, entryKey);
        if (sanitized !== undefined) result[entryKey] = sanitized;
        return result;
      },
      {},
    );
  }
  return undefined;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalize((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

export function sanitizeRiskEvidence(input: unknown): Record<string, unknown> {
  const sanitized = sanitizeValue(input);
  if (!sanitized || typeof sanitized !== 'object' || Array.isArray(sanitized)) return {};
  return sanitized as Record<string, unknown>;
}

export function buildRiskEvent(input: RiskEventInput): RiskEvent {
  if (!input.subjectUserId.trim()) throw new Error('Risk event subject is required');
  if (!Number.isFinite(Date.parse(input.windowStart))) {
    throw new Error('Risk event window must be an ISO timestamp');
  }

  const evidence = sanitizeRiskEvidence(input.evidence);
  const fingerprint = createHash('sha256')
    .update(
      JSON.stringify(
        canonicalize({
          subjectUserId: input.subjectUserId,
          signalType: input.signalType,
          severity: input.severity,
          windowStart: input.windowStart,
          evidence,
        }),
      ),
    )
    .digest('hex');

  return { ...input, fingerprint, evidence };
}
