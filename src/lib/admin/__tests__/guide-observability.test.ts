import { describe, expect, it } from 'vitest';
import { parseGuideObservability } from '../guide-observability';

const readyPayload = {
  status: 'ready',
  asOf: '2026-08-12T12:00:00.000Z',
  last24h: {
    requests: 4,
    uniqueActors: 3,
    successRate: 75,
    errorRate: 25,
    outcomes: {
      success: 3,
      configuration: 0,
      quota: 0,
      upstream: 1,
      invalid_response: 0,
      rate_limited: 0,
    },
    averageLatencyMs: 120,
    p95LatencyMs: 200,
    tokens: { input: 10, cachedInput: 2, output: 4, reasoning: 1, total: 14 },
    estimatedCostMicrousd: 42,
  },
  last7d: {
    requests: 4,
    uniqueActors: 3,
    successRate: 75,
    errorRate: 25,
    outcomes: {
      success: 3,
      configuration: 0,
      quota: 0,
      upstream: 1,
      invalid_response: 0,
      rate_limited: 0,
    },
    averageLatencyMs: 120,
    p95LatencyMs: 200,
    tokens: { input: 10, cachedInput: 2, output: 4, reasoning: 1, total: 14 },
    estimatedCostMicrousd: 42,
  },
  pricingVersions: ['gpt-5-mini-2026-08-12'],
};

describe('guide observability contract', () => {
  it('accepts only aggregate ready data and preserves nullable empty metrics', () => {
    expect(parseGuideObservability(readyPayload)).toEqual(readyPayload);
  });

  it('rejects raw actor data and impossible aggregate values', () => {
    expect(() =>
      parseGuideObservability({ ...readyPayload, actor_hash: 'a'.repeat(64) }),
    ).toThrow();
    expect(() =>
      parseGuideObservability({
        ...readyPayload,
        last24h: { ...readyPayload.last24h, requests: -1 },
      }),
    ).toThrow();
  });

  it('uses the explicit unavailable state when the optional RPC is not ready', () => {
    expect(parseGuideObservability({ status: 'unavailable' })).toEqual({ status: 'unavailable' });
  });
});
