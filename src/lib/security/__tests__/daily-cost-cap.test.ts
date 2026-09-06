import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(function redisStub() {
    return { incr: mocks.incr, expire: mocks.expire };
  }),
}));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: mocks.captureMessage,
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: vi.fn(async () => true),
}));

import {
  DAILY_COST_CAPS,
  enforceDailyCostCap,
  resetLocalDailyCostCapsForTests,
} from '@/lib/security/daily-cost-cap';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';

describe('enforceDailyCostCap', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    resetLocalDailyCostCapsForTests();
  });

  describe('remote Upstash counter', () => {
    beforeEach(() => {
      vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
      vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token');
      mocks.incr.mockResolvedValue(1);
      mocks.expire.mockResolvedValue(1);
    });

    it('increments a per-user, per-route counter and sets the fixed 24h TTL with NX', async () => {
      const decision = await enforceDailyCostCap('user-1', 'guide-chat');
      expect(decision.allowed).toBe(true);
      expect(mocks.incr).toHaveBeenCalledWith('casino:daily-cost:user-1:guide-chat');
      expect(mocks.expire).toHaveBeenCalledWith(
        'casino:daily-cost:user-1:guide-chat',
        86_400,
        'NX',
      );
    });

    it('re-issues the NX expire on every call so a lost TTL cannot block a user forever', async () => {
      mocks.incr.mockResolvedValue(2);
      await enforceDailyCostCap('user-1', 'guide-chat');
      expect(mocks.expire).toHaveBeenCalledWith(
        'casino:daily-cost:user-1:guide-chat',
        86_400,
        'NX',
      );
    });

    it('blocks with the configured cap once the counter exceeds it', async () => {
      mocks.incr.mockResolvedValue(DAILY_COST_CAPS['guide-chat'] + 1);
      const decision = await enforceDailyCostCap('user-1', 'guide-chat');
      expect(decision.allowed).toBe(false);
      expect(decision.used).toBe(DAILY_COST_CAPS['guide-chat'] + 1);
      expect(decision.cap).toBe(DAILY_COST_CAPS['guide-chat']);
    });

    it('records a dedup-stable cost_cap_reached signal when blocking', async () => {
      mocks.incr.mockResolvedValue(DAILY_COST_CAPS['voice-synthesize'] + 1);
      await enforceDailyCostCap('user-1', 'voice-synthesize');
      expect(recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
      const input = vi.mocked(recordRiskEventBestEffort).mock.calls[0][0];
      expect(input.subjectUserId).toBe('user-1');
      expect(input.signalType).toBe('cost_cap_reached');
      expect(input.evidence).toEqual({
        cap: DAILY_COST_CAPS['voice-synthesize'],
        route: 'voice-synthesize',
      });
    });

    it('keeps the signal fingerprint stable across repeated blocks the same day', async () => {
      mocks.incr.mockResolvedValue(DAILY_COST_CAPS['guide-chat'] + 5);
      await enforceDailyCostCap('user-1', 'guide-chat');
      await enforceDailyCostCap('user-1', 'guide-chat');
      const calls = vi.mocked(recordRiskEventBestEffort).mock.calls;
      expect(calls).toHaveLength(2);
      expect(calls[0][0].windowStart).toBe(calls[1][0].windowStart);
    });

    it('fails closed when Upstash is unreachable', async () => {
      mocks.incr.mockRejectedValue(new Error('redis down'));
      const decision = await enforceDailyCostCap('user-1', 'guide-chat');
      expect(decision.allowed).toBe(false);
      expect(decision.unavailable).toBe(true);
      expect(mocks.captureMessage).toHaveBeenCalled();
    });

    it('keeps counters isolated per user and per route', async () => {
      mocks.incr.mockResolvedValue(1);
      await enforceDailyCostCap('user-1', 'guide-chat');
      await enforceDailyCostCap('user-2', 'voice-transcribe');
      expect(mocks.incr).toHaveBeenNthCalledWith(1, 'casino:daily-cost:user-1:guide-chat');
      expect(mocks.incr).toHaveBeenNthCalledWith(2, 'casino:daily-cost:user-2:voice-transcribe');
    });
  });

  describe('local dev counter (no Upstash configured)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it('allows up to the cap and then blocks', async () => {
      const cap = DAILY_COST_CAPS['voice-transcribe'];
      let last = { allowed: true };
      for (let i = 0; i < cap; i += 1) {
        last = await enforceDailyCostCap('user-1', 'voice-transcribe');
        expect(last.allowed).toBe(true);
      }
      const blocked = await enforceDailyCostCap('user-1', 'voice-transcribe');
      expect(blocked.allowed).toBe(false);
      expect(last.allowed).toBe(true);
    });

    it('blocks in production when Upstash is unconfigured', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const decision = await enforceDailyCostCap('user-1', 'guide-chat');
      expect(decision.allowed).toBe(false);
      expect(decision.unavailable).toBe(true);
    });
  });
});
