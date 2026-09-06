import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
  rateLimitHeaders: vi.fn(),
  WalletService: {
    rotateUserSeed: vi.fn(),
    postChatMessage: vi.fn(),
    syncAchievement: vi.fn(),
  },
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimitHeaders: mocks.rateLimitHeaders,
}));
vi.mock('@/lib/casino/wallet', () => ({ WalletService: mocks.WalletService }));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: vi.fn() } }));

import { POST as rotateSeed } from '@/app/api/casino/seeds/route';
import { POST as postChat } from '@/app/api/chat/route';
import { POST as syncAchievement } from '@/app/api/user/stats/route';

const rejectedOrigin = new Response('Cross-site mutation rejected', { status: 403 });
const EXPECTED_ENVELOPE = { error: { code: 'PERMISSION_DENIED', message: 'Keine Berechtigung.' } };

function request(path: string, body: Record<string, unknown>) {
  return new Request(`https://casino.test${path}`, {
    method: 'POST',
    headers: { origin: 'https://evil.test', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateMutationOrigin.mockReturnValue(rejectedOrigin);
});

describe('newly hardened browser mutation routes', () => {
  it.each([
    ['seed rotation', rotateSeed, '/api/casino/seeds', { clientSeed: 'player-seed' }],
    ['chat post', postChat, '/api/chat', { message: 'Hello' }],
    [
      'achievement synchronization',
      syncAchievement,
      '/api/user/stats',
      { achievementId: 'first-bet', progress: 1, unlocked: true },
    ],
  ])(
    '%s returns the origin rejection before authentication or mutation',
    async (_name, handler, path, body) => {
      const response = await handler(request(path, body));

      expect(response.status).toBe(403);
      expect(response.headers.get('content-type')).toBe('application/json');
      await expect(response.json()).resolves.toEqual(EXPECTED_ENVELOPE);
      expect(mocks.createClient).not.toHaveBeenCalled();
      expect(mocks.WalletService.rotateUserSeed).not.toHaveBeenCalled();
      expect(mocks.WalletService.postChatMessage).not.toHaveBeenCalled();
      expect(mocks.WalletService.syncAchievement).not.toHaveBeenCalled();
    },
  );
});
