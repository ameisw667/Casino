import { describe, expect, it } from 'vitest';
import {
  DURATION_OPTIONS,
  formatExclusionDate,
  deriveWellbeingStatus,
  parseLossLimitEur,
  formatLossLimitCents,
} from '../ResponsibleGamblingSection';

// 06_2 L2: pure-logic tests for the wellbeing settings section (repo has no DOM
// component-test harness; the section's fetch flow is pinned server-side by
// src/app/api/user/self-exclusion/__tests__/route.test.ts, so these tests pin the
// client-side mapping that links the two — the End-to-End-Konsistenz the plan asks for).

describe('DURATION_OPTIONS', () => {
  it('offers only integer day options between 1 and 365 (server contract)', () => {
    for (const option of DURATION_OPTIONS) {
      expect(Number.isInteger(option.days)).toBe(true);
      expect(option.days).toBeGreaterThanOrEqual(1);
      expect(option.days).toBeLessThanOrEqual(365);
    }
  });

  it('contains at least a short, medium and long option', () => {
    const days = DURATION_OPTIONS.map((o) => o.days);
    expect(days).toContain(1);
    expect(days).toContain(30);
    expect(days).toContain(365);
  });
});

describe('deriveWellbeingStatus', () => {
  it('maps an active server status to a locked state with the ISO timestamp', () => {
    const status = deriveWellbeingStatus({
      selfExcluded: true,
      selfExcludedUntil: '2099-01-01T00:00:00.000Z',
    });
    expect(status).toEqual({
      selfExcluded: true,
      selfExcludedUntil: '2099-01-01T00:00:00.000Z',
      dailyLossLimitCents: null,
      dailyNetLossCents: null,
    });
  });

  it('maps an inactive server status to an unlocked state without a timestamp', () => {
    expect(deriveWellbeingStatus({ selfExcluded: false })).toEqual({
      selfExcluded: false,
      selfExcludedUntil: null,
      dailyLossLimitCents: null,
      dailyNetLossCents: null,
    });
  });

  it('carries the loss limit and today net loss through to the UI', () => {
    expect(
      deriveWellbeingStatus({
        selfExcluded: false,
        dailyLossLimitCents: 5000,
        dailyNetLossCents: 1234,
      }),
    ).toEqual({
      selfExcluded: false,
      selfExcludedUntil: null,
      dailyLossLimitCents: 5000,
      dailyNetLossCents: 1234,
    });
  });

  it('falls back to unlocked when the payload shape is unexpected (defensive parse)', () => {
    expect(deriveWellbeingStatus(null)).toEqual({
      selfExcluded: false,
      selfExcludedUntil: null,
      dailyLossLimitCents: null,
      dailyNetLossCents: null,
    });
    expect(deriveWellbeingStatus({ selfExcluded: true })).toEqual({
      selfExcluded: false,
      selfExcludedUntil: null,
      dailyLossLimitCents: null,
      dailyNetLossCents: null,
    });
    expect(deriveWellbeingStatus({ selfExcluded: true, selfExcludedUntil: 42 })).toEqual({
      selfExcluded: false,
      selfExcludedUntil: null,
      dailyLossLimitCents: null,
      dailyNetLossCents: null,
    });
  });

  it('rejects non-integer or negative limit fields instead of rendering them', () => {
    expect(
      deriveWellbeingStatus({
        selfExcluded: false,
        dailyLossLimitCents: 12.5,
        dailyNetLossCents: -1,
      }),
    ).toEqual({
      selfExcluded: false,
      selfExcludedUntil: null,
      dailyLossLimitCents: null,
      dailyNetLossCents: null,
    });
  });
});

describe('formatExclusionDate', () => {
  it('formats an ISO timestamp as a German locale date-time string', () => {
    const formatted = formatExclusionDate('2027-01-02T03:04:05.000Z');
    expect(formatted).toMatch(/2027/);
    expect(formatted).not.toContain('Invalid');
  });
});

describe('loss-limit helpers (06_2 L3)', () => {
  it('parses a EUR amount into integer cents within the server contract', () => {
    expect(parseLossLimitEur('10')).toBe(1000);
    expect(parseLossLimitEur('12.34')).toBe(1234);
    expect(parseLossLimitEur('0.5')).toBe(50);
    expect(parseLossLimitEur('10000')).toBe(1_000_000);
    expect(parseLossLimitEur('25,00')).toBe(2500);
    expect(parseLossLimitEur(' 0,5 ')).toBe(50);
  });

  it('rejects input outside the server contract (1 cent .. 1_000_000 cents)', () => {
    expect(parseLossLimitEur('0')).toBeNull();
    expect(parseLossLimitEur('-5')).toBeNull();
    expect(parseLossLimitEur('0.001')).toBeNull();
    expect(parseLossLimitEur('10000.01')).toBeNull();
    expect(parseLossLimitEur('abc')).toBeNull();
    expect(parseLossLimitEur('')).toBeNull();
    expect(parseLossLimitEur('1,234.56')).toBeNull();
  });

  it('formats cents as a comma-separated EUR display string', () => {
    expect(formatLossLimitCents(1234)).toBe('12,34');
    expect(formatLossLimitCents(100)).toBe('1,00');
    expect(formatLossLimitCents(5)).toBe('0,05');
  });
});
