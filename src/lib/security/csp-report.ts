// Shared processing helpers for the CSP violation report sink
// (src/app/api/internal/csp-report/route.ts, T_SECURITY_HARDENING/06_csp_violation_reporting.md).
// Kept out of the route file so the sampling/dedup/normalisation logic is unit-testable without
// exercising the transport layer.

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