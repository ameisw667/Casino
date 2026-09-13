import { describe, expect, it } from 'vitest';
import {
  evaluatePoolerHealth,
  parseSentryDsn,
  buildSentryEnvelope,
  isApiMode,
  normalizeRemoteActivityRows,
  POOLER_HEALTH_THRESHOLDS,
  type PoolerActivityRow,
} from '../../../scripts/check-pooler-health';

describe('isApiMode (L4 Remote-Modus, Säule-7-Konvention)', () => {
  it('is false without token and project ref', () => {
    expect(isApiMode('', '')).toBe(false);
  });

  it('requires both token and project ref', () => {
    expect(isApiMode('token', '')).toBe(false);
    expect(isApiMode('', 'hmqwozhdckbwjqzcmire')).toBe(false);
    expect(isApiMode('token', 'hmqwozhdckbwjqzcmire')).toBe(true);
  });
});

describe('normalizeRemoteActivityRows', () => {
  it('maps Management-API rows to PoolerActivityRow', () => {
    const rows = normalizeRemoteActivityRows([
      { application_name: 'supavisor', state: 'active', connections: 7 },
      { application_name: 'postgrest', state: null, connections: '3' },
      { application_name: null, state: undefined, connections: null },
    ]);

    expect(rows).toEqual([
      { application_name: 'supavisor', state: 'active', connections: 7 },
      { application_name: 'postgrest', state: null, connections: 3 },
      { application_name: '', state: null, connections: 0 },
    ]);
  });
});

describe('evaluatePoolerHealth', () => {
  it('reports normal below the warning threshold', () => {
    const breakdown: PoolerActivityRow[] = [
      { application_name: 'supavisor', state: 'idle', connections: 15 },
      { application_name: 'postgrest', state: 'idle', connections: 4 },
    ];
    const result = evaluatePoolerHealth(breakdown, POOLER_HEALTH_THRESHOLDS);

    expect(result.status).toBe('normal');
    expect(result.activeConnections).toBe(19);
    expect(result.dbConnections).toBe(19);
    expect(result.threshold.dbConnections.warning).toBe(42);
    expect(result.threshold.dbConnections.critical).toBe(55);
  });

  it('reports warning at the documented warning threshold', () => {
    const breakdown: PoolerActivityRow[] = [
      { application_name: 'supavisor', state: 'idle', connections: 44 },
    ];
    expect(evaluatePoolerHealth(breakdown, POOLER_HEALTH_THRESHOLDS).status).toBe('warning');
  });

  it('reports critical at the documented critical threshold', () => {
    const breakdown: PoolerActivityRow[] = [
      { application_name: 'supavisor', state: 'active', connections: 56 },
    ];
    expect(evaluatePoolerHealth(breakdown, POOLER_HEALTH_THRESHOLDS).status).toBe('critical');
  });

  it('counts idle and active states together and keeps the raw breakdown', () => {
    const breakdown: PoolerActivityRow[] = [
      { application_name: 'a', state: 'active', connections: 3 },
      { application_name: 'a', state: 'idle', connections: 2 },
      { application_name: 'b', state: 'idle', connections: 1 },
    ];
    const result = evaluatePoolerHealth(breakdown, POOLER_HEALTH_THRESHOLDS);

    expect(result.activeConnections).toBe(6);
    expect(result.breakdown).toEqual(breakdown);
  });

  it('marks pooler-client connections as not observable via pg_stat_activity', () => {
    const result = evaluatePoolerHealth([], POOLER_HEALTH_THRESHOLDS);
    expect(result.poolerClients).toBeNull();
    expect(result.activeConnections).toBe(0);
    expect(result.status).toBe('normal');
  });
});

describe('parseSentryDsn', () => {
  it('parses a valid DSN into its envelope endpoint parts', () => {
    const dsn = parseSentryDsn('https://publickey123@o0.ingest.sentry.io/1234567');
    expect(dsn).toEqual({
      publicKey: 'publickey123',
      host: 'o0.ingest.sentry.io',
      projectId: '1234567',
    });
  });

  it('returns null for garbage or empty input', () => {
    expect(parseSentryDsn('')).toBeNull();
    expect(parseSentryDsn('not-a-dsn')).toBeNull();
    expect(parseSentryDsn('https://publickey@host/')).toBeNull();
  });
});

describe('buildSentryEnvelope', () => {
  it('builds a two-line envelope with headers and an error-level event', () => {
    const { header, payload } = buildSentryEnvelope(
      { publicKey: 'pk', host: 'host.sentry.io', projectId: '42' },
      'pooler health: critical — 60 DB connections',
      'critical',
    );
    expect(header).toEqual({ event_id: expect.any(String) });
    expect(payload.platform).toBe('javascript');
    expect(payload.level).toBe('error');
    expect(payload.message.formatted).toContain('60 DB connections');
    expect(payload.timestamp).toEqual(expect.any(String));
  });
});
