import { beforeEach, describe, expect, it } from 'vitest';

import {
  createCspReportSampler,
  getCspReportSampler,
  resetCspReportSamplingForTests,
} from '@/lib/security/csp-report';

describe('CSP report sampler (06_csp_violation_reporting L2)', () => {
  beforeEach(() => {
    resetCspReportSamplingForTests();
  });

  it('forwards every report while the per-window budget is not exhausted', () => {
    const sampler = createCspReportSampler({ ceiling: 3, divisor: 2, windowMs: 60_000 });
    for (let now = 0; now < 3; now += 1) {
      expect(sampler.decide(now)).toEqual({ forward: true, notifyDrop: false });
    }
    expect(sampler.stats()).toEqual({ forwarded: 3, dropped: 0 });
  });

  it('forwards deterministically every n-th report once the budget is exhausted', () => {
    const sampler = createCspReportSampler({ ceiling: 3, divisor: 2, windowMs: 60_000 });
    const decisions = Array.from({ length: 8 }, (_, i) => sampler.decide(i).forward);
    expect(decisions).toEqual([true, true, true, false, true, false, true, false]);
    expect(sampler.stats()).toEqual({ forwarded: 5, dropped: 3 });
  });

  it('re-arms the full budget when the window rolls over', () => {
    const sampler = createCspReportSampler({ ceiling: 3, divisor: 2, windowMs: 60_000 });
    Array.from({ length: 8 }, (_, i) => sampler.decide(i));
    expect(sampler.decide(60_000).forward).toBe(true);
    expect(sampler.decide(60_001).forward).toBe(true);
    expect(sampler.decide(60_002).forward).toBe(true);
    // Counters are per-window: the previous window's drop tally does not leak into the new one.
    expect(sampler.stats()).toEqual({ forwarded: 3, dropped: 0 });
  });

  it('notifies about dropped reports at most once per window', () => {
    const sampler = createCspReportSampler({ ceiling: 1, divisor: 100, windowMs: 60_000 });
    expect(sampler.decide(0)).toEqual({ forward: true, notifyDrop: false });
    expect(sampler.decide(1)).toEqual({ forward: false, notifyDrop: true });
    expect(sampler.decide(2)).toEqual({ forward: false, notifyDrop: false });
    expect(sampler.decide(60_000)).toEqual({ forward: true, notifyDrop: false });
    expect(sampler.decide(60_001)).toEqual({ forward: false, notifyDrop: true });
  });

  it('exposes a shared route-level sampler that tests can reset to defaults', () => {
    const sampler = getCspReportSampler();
    sampler.configure({ ceiling: 1, divisor: 100, windowMs: 60_000 });
    sampler.decide(0);
    sampler.decide(1);
    resetCspReportSamplingForTests();
    expect(getCspReportSampler().decide(0)).toEqual({ forward: true, notifyDrop: false });
    expect(getCspReportSampler().decide(0)).toEqual({ forward: true, notifyDrop: false });
  });
});