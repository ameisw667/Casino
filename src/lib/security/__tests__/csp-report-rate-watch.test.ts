import { describe, expect, it } from 'vitest';

import {
  evaluateCspReportRate,
  parseEventsStats,
  renderJobSummary,
} from '../../../../scripts/csp-report-rate-watch.mjs';

describe('Sentry CSP-report rate watch (06_csp_violation_reporting L5)', () => {
  describe('evaluateCspReportRate', () => {
    it('marks a >3x spike over a meaningful baseline as escalated', () => {
      const result = evaluateCspReportRate({ current: 150, previous: 20 });
      expect(result.level).toBe('escalated');
      expect(result.ratio).toBe(7.5);
    });

    it('treats a 3x spike as baseline (strictly above 3x escalates)', () => {
      expect(evaluateCspReportRate({ current: 60, previous: 20 }).level).toBe('normal');
      expect(evaluateCspReportRate({ current: 61, previous: 20 }).level).toBe('escalated');
    });

    it('ignores spikes when the baseline is too small to be meaningful', () => {
      const result = evaluateCspReportRate({ current: 100, previous: 2 });
      expect(result.level).toBe('new-activity');
      expect(result.level).not.toBe('escalated');
    });

    it('flags brand-new violation traffic that crosses the noise floor', () => {
      const result = evaluateCspReportRate({ current: 50, previous: 0 });
      expect(result.level).toBe('new-activity');
    });

    it('stays at baseline for low absolute traffic', () => {
      expect(evaluateCspReportRate({ current: 3, previous: 0 }).level).toBe('normal');
    });

    it('does not divide by zero', () => {
      expect(evaluateCspReportRate({ current: 0, previous: 0 }).ratio).toBe(0);
    });
  });

  describe('parseEventsStats', () => {
    it('sums the bucket values of the events_stats response', () => {
      const payload = {
        data: [
          [
            { timestamp: '2026-09-10T00:00:00Z', values: [{ count: 12, total: 12 }] },
            { timestamp: '2026-09-11T00:00:00Z', values: [{ count: 40, total: 40 }] },
          ],
        ],
      };
      expect(parseEventsStats(payload)).toEqual([12, 40]);
    });

    it('is tolerant against a flat per-bucket shape', () => {
      const payload = {
        data: [
          [
            { timestamp: 't1', count: 5 },
            { timestamp: 't2', count: 9 },
          ],
        ],
      };
      expect(parseEventsStats(payload)).toEqual([5, 9]);
    });

    it('returns an empty bucket list for an unexpected payload instead of throwing', () => {
      expect(parseEventsStats({})).toEqual([]);
      expect(parseEventsStats(null)).toEqual([]);
    });
  });

  describe('renderJobSummary', () => {
    it('marks the escalation in the job summary', () => {
      const lines = renderJobSummary({
        level: 'escalated',
        current: 150,
        previous: 20,
        ratio: 7.5,
        scope: 'berlin-agency/javascript-nextjs',
      });
      expect(lines.join('\n')).toContain('ESCALATION');
      expect(lines.join('\n')).toContain('150');
      expect(lines.join('\n')).toContain('20');
      expect(lines.join('\n')).toContain('berlin-agency/javascript-nextjs');
    });

    it('reports the baseline case without an escalation marker', () => {
      const lines = renderJobSummary({
        level: 'normal',
        current: 4,
        previous: 3,
        ratio: 1.33,
        scope: 'berlin-agency/javascript-nextjs',
      });
      expect(lines.join('\n')).not.toContain('ESCALATION');
      expect(lines.join('\n')).toContain('4');
    });
  });
});
