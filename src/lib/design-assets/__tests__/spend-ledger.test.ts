import { describe, expect, it } from 'vitest';
import {
  checkMonthlyCap,
  createEmptyLedger,
  getMonthKey,
  parseSpendLedger,
  recordLedgerSpend,
} from '../spend-ledger';

describe('spend-ledger', () => {
  it('generates correct month keys (YYYY-MM)', () => {
    const d = new Date('2026-08-31T20:00:00Z');
    expect(getMonthKey(d)).toBe('2026-08');
  });

  it('records spend and aggregates monthly and lifetime metrics', () => {
    const initial = createEmptyLedger();
    const date = new Date('2026-08-31T20:00:00Z');

    const step1 = recordLedgerSpend(initial, {
      name: 'hero-banner',
      size: '1792x1024',
      quality: 'high',
      costUsd: 0.16,
      date,
    });

    const step2 = recordLedgerSpend(step1, {
      name: 'icon-dice',
      size: '1024x1024',
      quality: 'medium',
      costUsd: 0.08,
      date,
    });

    expect(step2.totalSpentUsd).toBe(0.24);
    expect(step2.monthlySpentUsd['2026-08']).toBe(0.24);
    expect(step2.lifetimeCalls).toBe(2);
    expect(step2.history).toHaveLength(2);
  });

  it('enforces monthly cap and blocks when budget exceeded', () => {
    const ledger = createEmptyLedger();
    ledger.monthlySpentUsd['2026-08'] = 19.9;
    const date = new Date('2026-08-31T20:00:00Z');

    const check1 = checkMonthlyCap(ledger, 0.08, 20.0, date);
    expect(check1.allowed).toBe(true);

    const check2 = checkMonthlyCap(ledger, 0.2, 20.0, date);
    expect(check2.allowed).toBe(false);
    expect(check2.reason).toContain('Monatsbudget für 2026-08 überschritten');
  });

  it('safely parses invalid json to an empty ledger fallback', () => {
    const parsed = parseSpendLedger({ corrupt: true });
    expect(parsed.totalSpentUsd).toBe(0);
    expect(parsed.history).toEqual([]);
  });
});
