import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildRiskEvent, sanitizeRiskEvidence, type RiskSignalType } from '../risk-signals';

const root = resolve(__dirname, '../../../..');
const migration = readFileSync(resolve(root, 'supabase/migrations/029_risk_events.sql'), 'utf8');
const redeemRoute = readFileSync(resolve(root, 'src/app/api/casino/redeem-code/route.ts'), 'utf8');
const fraudMigration = readFileSync(
  resolve(root, 'supabase/migrations/030_fraud_signal_detection.sql'),
  'utf8',
);
const casinoCore = readFileSync(resolve(root, 'src/lib/casino/casino-core.ts'), 'utf8');
const fraudDetection = readFileSync(resolve(root, 'src/lib/casino/fraud-detection.ts'), 'utf8');
const networkFingerprint = readFileSync(
  resolve(root, 'src/lib/casino/network-fingerprint.ts'),
  'utf8',
);

describe('P1.2 abuse and bonus-fraud signals', () => {
  it('redacts secret and direct-network fields recursively', () => {
    expect(
      sanitizeRiskEvidence({
        attempts: 4,
        token: 'secret-token',
        nested: { ip: '192.0.2.10', note: 'kept' },
      }),
    ).toEqual({ attempts: 4, nested: { note: 'kept' } });
  });

  it('builds a stable deduplication fingerprint from the review window', () => {
    const input = {
      subjectUserId: 'user_test',
      signalType: 'rate_limit_hit' as const,
      severity: 'medium' as const,
      windowStart: '2026-08-14T20:00:00.000Z',
      evidence: { scope: 'wallet-redeem', count: 3 },
    };

    const first = buildRiskEvent(input);
    const second = buildRiskEvent({ ...input, evidence: { count: 3, scope: 'wallet-redeem' } });

    expect(first.fingerprint).toBe(second.fingerprint);
    expect(first.evidence).toEqual(input.evidence);
  });

  it('defines service-role-only storage, deduplication, and human review transitions', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.risk_events');
    expect(migration).toContain('UNIQUE (subject_user_id, fingerprint)');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.record_risk_event');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.review_risk_event');
    expect(migration).toContain(
      'REVOKE ALL ON TABLE public.risk_events FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.record_risk_event');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.review_risk_event');
    expect(migration).toContain("status IN ('open', 'reviewed', 'closed')");
  });

  it('wires voucher conflicts and rate-limit hits into best-effort signal recording', () => {
    expect(redeemRoute).toContain('recordRiskEventBestEffort({');
    expect(redeemRoute).toContain("signalType: 'rate_limit_hit'");
    expect(redeemRoute).toContain("signalType: 'idempotency_conflict'");
    expect(redeemRoute).toContain("signalType: 'voucher_velocity'");
  });
});

describe('P2.8 bet-behavior fraud signals', () => {
  // Compile-time gate (tsc --noEmit): fails to compile if RiskSignalType does not carry these.
  const newSignalTypes: RiskSignalType[] = ['bet_velocity', 'win_rate_anomaly'];

  it('extends both the table CHECK and the record_risk_event() function body', () => {
    // A CHECK-constraint-only extension is not sufficient: record_risk_event() re-validates
    // signal_type independently and would silently reject these values otherwise.
    expect(fraudMigration).toContain("'bet_velocity'");
    expect(fraudMigration).toContain("'win_rate_anomaly'");
    expect(fraudMigration).toContain('ADD CONSTRAINT risk_events_signal_type_check');
    expect(fraudMigration).toContain('CREATE OR REPLACE FUNCTION public.record_risk_event');
    expect(fraudMigration).toContain(
      "'rate_limit_hit', 'balance_correction', 'bet_velocity', 'win_rate_anomaly'",
    );
    expect(newSignalTypes).toHaveLength(2);
  });

  it('keeps signal computation out of the settlement path and vice versa', () => {
    expect(casinoCore).not.toContain('fraud-detection');
    expect(casinoCore).not.toContain('network-fingerprint');
    expect(fraudDetection).not.toContain('casino-core');
    expect(fraudDetection).not.toContain('settle_game_bet');
    expect(networkFingerprint).not.toContain('casino-core');
    expect(networkFingerprint).not.toContain('settle_game_bet');
  });

  it('redacts IP-like keys from bet-behavior evidence just like voucher evidence', () => {
    expect(
      sanitizeRiskEvidence({
        clusterSize: 3,
        linkedUserIds: ['user_a', 'user_b'],
        ip: '203.0.113.7',
        device: 'iPhone',
      }),
    ).toEqual({ clusterSize: 3, linkedUserIds: ['user_a', 'user_b'] });
  });
});
