import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildRiskEvent, sanitizeRiskEvidence } from '../risk-signals';

const root = resolve(__dirname, '../../../..');
const migration = readFileSync(resolve(root, 'supabase/migrations/029_risk_events.sql'), 'utf8');
const redeemRoute = readFileSync(resolve(root, 'src/app/api/casino/redeem-code/route.ts'), 'utf8');

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
