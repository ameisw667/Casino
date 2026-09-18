import { describe, expect, it } from 'vitest';
import {
  assertLoopbackTarget,
  parseExhaustionConfig,
  buildExhaustionMarkdown,
  type ExhaustionOutcome,
} from '../../../scripts/pool-exhaustion-test';

describe('parseExhaustionConfig', () => {
  it('defaults to 120 connections against the local pooler port', () => {
    expect(parseExhaustionConfig([])).toEqual({ count: 120, host: '127.0.0.1', port: 54329 });
  });

  it('parses an explicit --count and clamps it to the safety cap', () => {
    expect(parseExhaustionConfig(['--count', '60']).count).toBe(60);
    expect(parseExhaustionConfig(['--count', '9999']).count).toBe(250);
    expect(parseExhaustionConfig(['--count', 'not-a-number']).count).toBe(120);
  });

  it('never accepts a non-loopback host override', () => {
    expect(() => parseExhaustionConfig(['--host', 'db.remote.supabase.co'])).toThrow(/loopback/i);
  });
});

describe('assertLoopbackTarget', () => {
  it('accepts loopback hosts only', () => {
    expect(assertLoopbackTarget('127.0.0.1')).toBe(true);
    expect(assertLoopbackTarget('localhost')).toBe(true);
    expect(assertLoopbackTarget('::1')).toBe(true);
    expect(() => assertLoopbackTarget('hmqwozhdckbwjqzcmire.supabase.co')).toThrow(/loopback/i);
    expect(() => assertLoopbackTarget('10.0.0.5')).toThrow(/loopback/i);
  });
});

describe('buildExhaustionMarkdown', () => {
  it('documents the observed rejection behavior at the threshold', () => {
    const outcome: ExhaustionOutcome = {
      config: { count: 120, host: '127.0.0.1', port: 54329 },
      openedConnections: 104,
      firstRejectionAt: 105,
      firstRejectionError: 'Error: connect ECONNRESET 127.0.0.1:54329',
      errorClasses: { ECONNRESET: 16, ECONNREFUSED: 1 },
      healthSamples: [
        { sampledAt: '2026-09-13T12:00:00.000Z', status: 'warning', dbConnections: 45 },
      ],
      startedAt: '2026-09-13T12:00:00.000Z',
      finishedAt: '2026-09-13T12:01:00.000Z',
    };
    const markdown = buildExhaustionMarkdown(outcome);

    expect(markdown).toContain('# Pool-Erschöpfungs-Audit');
    expect(markdown).toContain('104');
    expect(markdown).toContain('105');
    expect(markdown).toContain('ECONNRESET');
    expect(markdown).toContain('127.0.0.1:54329');
    expect(markdown).toContain('pool-exhaustion');
  });
});
