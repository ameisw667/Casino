import { describe, expect, it } from 'vitest';
import {
  checkBudget,
  createCostGuard,
  estimateBatchCostUsd,
  getEstimatedCostForRequest,
  recordSpend,
} from '../cost-guard';

describe('cost-guard', () => {
  it('calculates tiered pricing correctly by size and quality', () => {
    expect(getEstimatedCostForRequest('1024x1024', 'low')).toBe(0.04);
    expect(getEstimatedCostForRequest('1024x1024', 'medium')).toBe(0.08);
    expect(getEstimatedCostForRequest('1792x1024', 'high')).toBe(0.16);
  });

  it('allows a call when projected spend stays within the budget', () => {
    const state = createCostGuard(5);

    const result = checkBudget(state, 0.08);

    expect(result.allowed).toBe(true);
    expect(result.projectedSpendUsd).toBe(0.08);
  });

  it('blocks a call when the projected spend would exceed the budget', () => {
    const state = { ...createCostGuard(1), spentUsd: 0.95 };

    const result = checkBudget(state, 0.08);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Budget-Limit erreicht');
  });

  it('returns a new state instead of mutating the original on recordSpend', () => {
    const original = createCostGuard(5);

    const updated = recordSpend(original, 0.12);

    expect(original.spentUsd).toBe(0);
    expect(original.callCount).toBe(0);
    expect(updated.spentUsd).toBe(0.12);
    expect(updated.callCount).toBe(1);
  });

  it('estimates the total cost for a batch of diverse prompt entries', () => {
    const entries = [
      { name: 'banner', prompt: 'hero', size: '1792x1024' as const, quality: 'high' as const },
      { name: 'icon', prompt: 'icon', size: '1024x1024' as const, quality: 'low' as const },
    ];
    const total = estimateBatchCostUsd(entries);

    // 0.16 + 0.04 = 0.20
    expect(total).toBe(0.2);
  });
});
