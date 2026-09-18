import { describe, expect, it } from 'vitest';

import {
  aggregateCspViolations,
  normalizeCspReports,
  parseCspReports,
} from '@/lib/security/csp-report';

describe('CSP report parsing (06_csp_violation_reporting L3)', () => {
  it('keeps a Reporting API batch as-is', () => {
    const batch = [{ type: 'csp-violation', body: {} }];
    expect(parseCspReports(batch)).toEqual(batch);
  });

  it('unwraps the legacy single-object { "csp-report": {...} } shape', () => {
    const body = { 'blocked-uri': 'https://evil.example/x.js' };
    expect(parseCspReports({ 'csp-report': body })).toEqual([body]);
  });

  it('treats a bare object as a single legacy report', () => {
    const body = { 'violated-directive': 'script-src' };
    expect(parseCspReports(body)).toEqual([body]);
  });
});

describe('CSP report normalisation (06_csp_violation_reporting L3)', () => {
  it('accepts a well-formed Reporting API report and strips unknown fields', () => {
    const result = normalizeCspReports([
      {
        type: 'csp-violation',
        url: 'https://casino.test/games/dice',
        body: {
          documentURL: 'https://casino.test/games/dice',
          violatedDirective: 'script-src',
          blockedURL: 'https://evil.example/x.js',
          attackerControlledJunk: 'x'.repeat(4096),
        },
      },
    ]);
    expect(result.malformedCount).toBe(0);
    expect(result.nonCspCount).toBe(0);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].report).toEqual({
      type: 'csp-violation',
      url: 'https://casino.test/games/dice',
      body: {
        documentURL: 'https://casino.test/games/dice',
        violatedDirective: 'script-src',
        blockedURL: 'https://evil.example/x.js',
      },
    });
    expect(result.violations[0].key).toBe('script-src https://evil.example/x.js');
  });

  it('accepts a well-formed legacy report with snake_case fields', () => {
    const result = normalizeCspReports([
      { 'violated-directive': 'style-src', 'blocked-uri': 'inline', 'line-number': 12 },
    ]);
    expect(result.malformedCount).toBe(0);
    expect(result.violations[0].report).toEqual({
      'violated-directive': 'style-src',
      'blocked-uri': 'inline',
      'line-number': 12,
    });
  });

  it('counts a report with wrong field types as malformed instead of forwarding it', () => {
    const result = normalizeCspReports([
      { type: 'csp-violation', body: { violatedDirective: 42, blockedURL: ['x'] } },
    ]);
    expect(result.violations).toHaveLength(0);
    expect(result.malformedCount).toBe(1);
  });

  it('counts a report without any recognised field as malformed', () => {
    const result = normalizeCspReports([{ type: 'csp-violation', body: { junk: 'value' } }]);
    expect(result.violations).toHaveLength(0);
    expect(result.malformedCount).toBe(1);
  });

  it('discards non-CSP reporting payloads without marking them malformed', () => {
    const result = normalizeCspReports([{ type: 'deprecation', body: { message: 'old api' } }]);
    expect(result.violations).toHaveLength(0);
    expect(result.malformedCount).toBe(0);
    expect(result.nonCspCount).toBe(1);
  });

  it('treats non-object entries as malformed', () => {
    const result = normalizeCspReports(['oops', null, 42]);
    expect(result.malformedCount).toBe(3);
  });
});

describe('CSP report aggregation (06_csp_violation_reporting L4)', () => {
  it('groups identical violations by directive and blocked URI with a counter', () => {
    const result = normalizeCspReports([
      {
        type: 'csp-violation',
        body: { violatedDirective: 'script-src', blockedURL: 'https://e/x' },
      },
      {
        type: 'csp-violation',
        body: { violatedDirective: 'script-src', blockedURL: 'https://e/x' },
      },
      {
        type: 'csp-violation',
        body: { violatedDirective: 'script-src', blockedURL: 'https://e/y' },
      },
      {
        type: 'csp-violation',
        body: { violatedDirective: 'style-src', blockedURL: 'https://e/x' },
      },
    ]);
    const aggregated = aggregateCspViolations(result.violations);
    expect(aggregated).toHaveLength(3);
    expect(aggregated.map((violation) => violation.count)).toEqual([2, 1, 1]);
    expect(aggregated[0].report.body).toEqual({
      violatedDirective: 'script-src',
      blockedURL: 'https://e/x',
    });
  });

  it('aggregates the same violation across legacy and Reporting API shapes', () => {
    const result = normalizeCspReports([
      { type: 'csp-violation', body: { violatedDirective: 'script-src', blockedURL: 'inline' } },
      { 'violated-directive': 'script-src', 'blocked-uri': 'inline' },
    ]);
    expect(aggregateCspViolations(result.violations)).toHaveLength(1);
  });
});
