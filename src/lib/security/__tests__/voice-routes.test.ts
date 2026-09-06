import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(() => 'user:player-1'),
  rateLimitHeaders: vi.fn(() => ({ 'X-RateLimit-Limit': '10' })),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimitHeaders: mocks.rateLimitHeaders,
}));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: mocks.casinoLoggerError } }));

import { POST as transcribePOST } from '@/app/api/chat/voice-transcribe/route';
import { POST as synthesizePOST } from '@/app/api/chat/voice-synthesize/route';

function authClient(user: { id: string } | null) {
  return { auth: { getUser: async () => ({ data: { user } }) } };
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
});

describe('voice-routes security and contract tests', () => {
  describe('POST /api/chat/voice-transcribe', () => {
    it('rejects unauthenticated requests with 401', async () => {
      mocks.createClient.mockResolvedValue(authClient(null));
      const req = new Request('https://casino.test/api/chat/voice-transcribe', { method: 'POST' });
      const res = await transcribePOST(req);
      expect(res.status).toBe(401);
    });

    it('rejects rate-limited requests with 429', async () => {
      mocks.enforceRateLimit.mockResolvedValue({
        success: false,
        unavailable: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60_000,
      });

      const req = new Request('https://casino.test/api/chat/voice-transcribe', { method: 'POST' });
      const res = await transcribePOST(req);
      expect(res.status).toBe(429);
    });

    it('rate-limits per user, not on a single shared bucket (regression: identifier/scope args were swapped)', async () => {
      const req = new Request('https://casino.test/api/chat/voice-transcribe', { method: 'POST' });
      await transcribePOST(req);

      // enforceRateLimit(identifier, scope, limit, windowSeconds) — identifier must be the
      // per-user/IP key, not the constant scope name (see chat-guide-route.test.ts for the
      // sibling regression on bot-response/route.ts, fixed under the same review).
      expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
        'user:player-1',
        'guide-voice-stt',
        10,
        60,
      );
    });
  });

  describe('POST /api/chat/voice-synthesize', () => {
    it('rejects unauthenticated requests with 401', async () => {
      mocks.createClient.mockResolvedValue(authClient(null));
      const req = new Request('https://casino.test/api/chat/voice-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hallo' }),
      });
      const res = await synthesizePOST(req);
      expect(res.status).toBe(401);
    });

    it('rejects empty text payloads with 400', async () => {
      const req = new Request('https://casino.test/api/chat/voice-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '   ' }),
      });
      const res = await synthesizePOST(req);
      expect(res.status).toBe(400);
    });

    it('rate-limits per user, not on a single shared bucket (regression: identifier/scope args were swapped)', async () => {
      const req = new Request('https://casino.test/api/chat/voice-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hallo Spieler' }),
      });
      await synthesizePOST(req);

      expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
        'user:player-1',
        'guide-voice-tts',
        15,
        60,
      );
    });
  });
});
