// Shared processing helpers for the CSP violation report sink
// (src/app/api/internal/csp-report/route.ts, T_SECURITY_HARDENING/06_csp_violation_reporting.md).
// Kept out of the route file so the sampling/dedup/normalisation logic is unit-testable without
// exercising the transport layer.

import { z } from 'zod';

/** Maximum size of any single report field before the report counts as malformed (L3). */
export const CSP_REPORT_FIELD_MAX_LENGTH = 2048;
/** How many reports a single request may contribute to the pipeline (unchanged batch cap). */
export const CSP_REPORT_BATCH_LIMIT = 20;

const boundedText = z.string().max(CSP_REPORT_FIELD_MAX_LENGTH);
// Legacy line/column numbers arrive as integers; some user agents send strings instead.
const boundedNumber = z.union([z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), boundedText]);

// Both report shapes are stripped, not strict: unknown junk fields are dropped rather than
// forwarded verbatim to Sentry, while browsers that add spec fields keep working.
const legacyViolationSchema = z.object({
  'document-uri': boundedText.optional(),
  'violated-directive': boundedText.optional(),
  'effective-directive': boundedText.optional(),
  'blocked-uri': boundedText.optional(),
  disposition: boundedText.optional(),
  'status-code': boundedNumber.optional(),
  'source-file': boundedText.optional(),
  'line-number': boundedNumber.optional(),
  'column-number': boundedNumber.optional(),
  'script-sample': boundedText.optional(),
  referrer: boundedText.optional(),
});

const reportingViolationSchema = z.object({
  documentURL: boundedText.optional(),
  violatedDirective: boundedText.optional(),
  effectiveDirective: boundedText.optional(),
  blockedURL: z.union([boundedText, z.record(z.string(), boundedText)]).optional(),
  disposition: boundedText.optional(),
  statusCode: boundedNumber.optional(),
  sourceFile: boundedText.optional(),
  lineNumber: boundedNumber.optional(),
  columnNumber: boundedNumber.optional(),
  sample: boundedText.optional(),
  referrer: boundedText.optional(),
});

export interface NormalizedCspViolation {
  /** Sanitised payload forwarded as `extra.report` — no unvalidated browser data reaches Sentry. */
  report: Record<string, unknown>;
  /** `violated-directive` + `blocked-uri` identity used for in-batch aggregation (L4). */
  key: string;
}

export interface AggregatedCspViolation {
  key: string;
  report: Record<string, unknown>;
  count: number;
}

export interface CspReportNormalization {
  violations: NormalizedCspViolation[];
  malformedCount: number;
  nonCspCount: number;
}

/** Both report shapes: legacy `{ "csp-report": {...} }` and the Reporting API batch `[...]`. */
export function parseCspReports(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'csp-report' in raw) {
    return [(raw as Record<string, unknown>)['csp-report']];
  }
  return [raw];
}

function blockedUriText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return '[object]';
  return '';
}

function violationKey(directive: string, blockedUri: string): string {
  return `${directive} ${blockedUri}`;
}

function isNonEmptyRecord(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

export function normalizeCspReports(entries: unknown[]): CspReportNormalization {
  const violations: NormalizedCspViolation[] = [];
  let malformedCount = 0;
  let nonCspCount = 0;

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      malformedCount += 1;
      continue;
    }
    const record = entry as Record<string, unknown>;

    if (typeof record.type === 'string') {
      // The report-to endpoint is shared by every registered report type; only CSP violations
      // belong in this sink, anything else is dropped without noise.
      if (record.type !== 'csp-violation') {
        nonCspCount += 1;
        continue;
      }
      const parsed = reportingViolationSchema.safeParse(record.body);
      if (!parsed.success || !isNonEmptyRecord(parsed.data)) {
        malformedCount += 1;
        continue;
      }
      violations.push({
        report: {
          type: record.type,
          ...(typeof record.url === 'string' && record.url.length <= CSP_REPORT_FIELD_MAX_LENGTH
            ? { url: record.url }
            : {}),
          body: parsed.data,
        },
        key: violationKey(
          parsed.data.violatedDirective ?? '',
          blockedUriText(parsed.data.blockedURL),
        ),
      });
      continue;
    }

    const parsed = legacyViolationSchema.safeParse(record);
    if (!parsed.success || !isNonEmptyRecord(parsed.data)) {
      malformedCount += 1;
      continue;
    }
    violations.push({
      report: parsed.data,
      key: violationKey(
        parsed.data['violated-directive'] ?? '',
        blockedUriText(parsed.data['blocked-uri']),
      ),
    });
  }

  return { violations, malformedCount, nonCspCount };
}

/** In-batch dedup (L4): identical directive+URI pairs become one event with a counter tag. */
export function aggregateCspViolations(
  violations: NormalizedCspViolation[],
): AggregatedCspViolation[] {
  const groups = new Map<string, AggregatedCspViolation>();
  for (const violation of violations) {
    const existing = groups.get(violation.key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    groups.set(violation.key, { key: violation.key, report: violation.report, count: 1 });
  }
  return [...groups.values()];
}

export interface CspReportSamplerConfig {
  /** Length of one sampling window in ms. */
  windowMs: number;
  /** Reports forwarded without restriction at the start of a window. */
  ceiling: number;
  /** After the ceiling: forward exactly one in `divisor` reports. */
  divisor: number;
}

export interface SamplingDecision {
  forward: boolean;
  /** True only for the first dropped report of a window — the caller's signal to emit a single aggregated counter log. */
  notifyDrop: boolean;
}

export interface SamplingStats {
  forwarded: number;
  dropped: number;
}

export interface CspReportSampler {
  decide(now: number): SamplingDecision;
  stats(): SamplingStats;
  configure(config: Partial<CspReportSamplerConfig>): void;
}

export const DEFAULT_CSP_REPORT_SAMPLER_CONFIG: CspReportSamplerConfig = {
  // Threshold rationale (06_csp_violation_reporting.md L2): legitimate CSP violations only fire
  // on a CSP misconfiguration/deploy regression, which peaks in the tens per minute. 30 forwarded
  // per window keeps ~10x headroom above that, and afterwards 1 in 30 still leaves a live sample.
  // Sentry quota budget assumption: CSP reports are warning-class diagnostics worth at most a few
  // thousand events per month, so the sustained worst case (~31/min) is far above the L1 global
  // request cap's marginal value to an attacker while still bounding a burst.
  windowMs: 60_000,
  ceiling: 30,
  divisor: 30,
};

export function createCspReportSampler(
  initialConfig: Partial<CspReportSamplerConfig> = {},
): CspReportSampler {
  let config: CspReportSamplerConfig = { ...DEFAULT_CSP_REPORT_SAMPLER_CONFIG, ...initialConfig };
  let windowStart = 0;
  let forwarded = 0;
  let dropped = 0;
  let overBudget = 0;
  let dropNotified = false;

  return {
    decide(now: number): SamplingDecision {
      if (now - windowStart >= config.windowMs) {
        windowStart = now;
        forwarded = 0;
        dropped = 0;
        overBudget = 0;
        dropNotified = false;
      }

      if (forwarded < config.ceiling) {
        forwarded += 1;
        return { forward: true, notifyDrop: false };
      }

      overBudget += 1;
      const forward = overBudget % config.divisor === 0;
      if (forward) {
        forwarded += 1;
        return { forward: true, notifyDrop: false };
      }
      const notifyDrop = !dropNotified;
      dropNotified = true;
      dropped += 1;
      return { forward: false, notifyDrop };
    },

    stats(): SamplingStats {
      return { forwarded, dropped };
    },

    configure(overrides: Partial<CspReportSamplerConfig>): void {
      config = { ...config, ...overrides };
    },
  };
}

const samplerHolder: { current: CspReportSampler } = { current: createCspReportSampler() };

/** The route resolves the sampler per invocation so test resets are picked up. */
export function getCspReportSampler(): CspReportSampler {
  return samplerHolder.current;
}

/** Route tests need deterministic Sentry event counts — resets config and counters to defaults. */
export function resetCspReportSamplingForTests(): void {
  samplerHolder.current = createCspReportSampler();
}
