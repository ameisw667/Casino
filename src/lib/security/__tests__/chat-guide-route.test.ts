import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const mocks = vi.hoisted(() => {
  class GuideError extends Error {
    constructor(public readonly kind: 'configuration' | 'quota' | 'upstream' | 'invalid-response') {
      super('Casino guide is temporarily unavailable');
      this.name = 'CasinoGuideError';
    }
  }

  return {
    createClient: vi.fn(),
    validateMutationOrigin: vi.fn(),
    enforceRateLimit: vi.fn(),
    getClientIdentifier: vi.fn(() => 'user:player-1'),
    rateLimitHeaders: vi.fn(() => ({ 'X-RateLimit-Limit': '10' })),
    requestCasinoGuideAnswer: vi.fn(),
    recordGuideTelemetry: vi.fn(async () => 'recorded'),
    casinoLoggerError: vi.fn(),
    GuideError,
  };
});

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimitHeaders: mocks.rateLimitHeaders,
}));
vi.mock('@/lib/casino/chat-guide', () => ({
  CASINO_GUIDE_CONTEXT_VERSION: '2026-08-21',
  CasinoGuideError: mocks.GuideError,
  guidePersonaSchema: z.string(),
  requestCasinoGuideAnswer: mocks.requestCasinoGuideAnswer,
}));
vi.mock('@/lib/casino/guide-telemetry', () => ({
  recordGuideTelemetry: mocks.recordGuideTelemetry,
}));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: mocks.casinoLoggerError } }));

import { POST } from '@/app/api/chat/bot-response/route';

function authClient(user: { id: string } | null) {
  return { auth: { getUser: async () => ({ data: { user } }) } };
}

function request(message = 'How does Dice work?') {
  return new Request('https://casino.test/api/chat/bot-response', {
    method: 'POST',
    headers: { origin: 'https://casino.test', 'content-type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateMutationOrigin.mockReturnValue(null);
  mocks.createClient.mockResolvedValue(authClient({ id: 'player-1' }));
  mocks.enforceRateLimit.mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60_000,
  });
  mocks.requestCasinoGuideAnswer.mockResolvedValue({
    answer: 'Set a target before you roll.',
    model: 'gpt-4o-mini',
    usage: null,
  });
});

describe('chat guide response route', () => {
  it('rejects an invalid origin before authentication or a guide request', async () => {
    mocks.validateMutationOrigin.mockReturnValue(
      new Response(JSON.stringify({ error: 'Invalid request origin' }), { status: 403 }),
    );

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.requestCasinoGuideAnswer).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests before requesting a guide answer', async () => {
    mocks.createClient.mockResolvedValue(authClient(null));

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(mocks.requestCasinoGuideAnswer).not.toHaveBeenCalled();
  });

  it('rate-limits per user, not on a single shared bucket (regression: identifier/scope args were swapped)', async () => {
    await POST(request());

    // enforceRateLimit(identifier, scope, limit, windowSeconds) — identifier must be the
    // per-user/IP key (here the mocked getClientIdentifier() result), not the constant scope
    // name. Swapping them made every user share one 'guide-chat' bucket and, on Upstash, leaked
    // one uncollected Ratelimit/Redis client per distinct user for the life of the process.
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith('user:player-1', 'guide-chat', 30, 60);
  });

  it('returns a success response without caching an authorized guide answer', async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    await expect(response.json()).resolves.toEqual({
      answer: 'Set a target before you roll.',
      contextVersion: '2026-08-21',
    });
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'player-1',
        outcome: 'success',
        model: 'gpt-4o-mini',
        usage: null,
      }),
    );
  });

  it('rejects a malformed guide payload before the guide service runs', async () => {
    const response = await POST(request(' '));

    expect(response.status).toBe(400);
    expect(mocks.requestCasinoGuideAnswer).not.toHaveBeenCalled();
    expect(mocks.recordGuideTelemetry).not.toHaveBeenCalled();
  });

  it('fails closed when the guide rate-limit service is unavailable', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: true,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Rate limit service unavailable' });
    expect(mocks.requestCasinoGuideAnswer).not.toHaveBeenCalled();
    expect(mocks.recordGuideTelemetry).not.toHaveBeenCalled();
  });

  it('rejects requests after the per-user guide quota is exhausted', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'Too Many Requests' });
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(mocks.requestCasinoGuideAnswer).not.toHaveBeenCalled();
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'player-1',
        outcome: 'rate_limited',
        rateLimitWindowStartedAt: expect.any(Date),
      }),
    );
  });

  it('does not expose configuration failures from the guide service', async () => {
    mocks.requestCasinoGuideAnswer.mockRejectedValue(new mocks.GuideError('configuration'));

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Casino guide is temporarily unavailable' });
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'configuration' }),
    );
    expect(mocks.casinoLoggerError).toHaveBeenCalledWith(
      'CasinoGuide',
      'Guide service request failed',
    );
  });

  it('maps exhausted provider credits to a generic service-unavailable response', async () => {
    mocks.requestCasinoGuideAnswer.mockRejectedValue(new mocks.GuideError('quota'));

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ error: 'Casino guide is temporarily unavailable' });
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'quota' }),
    );
  });

  it('maps upstream and invalid guide responses to a generic bad-gateway response', async () => {
    mocks.requestCasinoGuideAnswer.mockRejectedValue(new mocks.GuideError('invalid-response'));

    const response = await POST(request());

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'Casino guide is temporarily unavailable' });
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'invalid_response' }),
    );
  });
});
