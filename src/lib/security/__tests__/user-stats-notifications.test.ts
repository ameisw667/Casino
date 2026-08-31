import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  validateMutationOrigin: vi.fn(),
  WalletService: { syncAchievement: vi.fn() },
  loadAchievementConfig: vi.fn(),
  createNotificationBestEffort: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/wallet', () => ({ WalletService: mocks.WalletService }));
vi.mock('@/lib/casino/achievements-config-server', () => ({
  loadAchievementConfig: mocks.loadAchievementConfig,
}));
vi.mock('@/lib/casino/notifications', () => ({
  createNotificationBestEffort: mocks.createNotificationBestEffort,
}));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: vi.fn() } }));

import { POST } from '@/app/api/user/stats/route';

function authClient(user: { id: string } | null) {
  return { auth: { getUser: async () => ({ data: { user } }) } };
}

function request(body: Record<string, unknown>) {
  return new Request('https://casino.test/api/user/stats', {
    method: 'POST',
    headers: { origin: 'https://casino.test', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateMutationOrigin.mockReturnValue(null);
  mocks.createClient.mockResolvedValue(authClient({ id: 'player-1' }));
  mocks.loadAchievementConfig.mockResolvedValue([
    { id: 'first_bet', title: 'First Bet', description: 'Place your first bet' },
  ]);
});

describe('achievement inbox producer', () => {
  it('creates one best-effort inbox entry only for an unlocked, known achievement', async () => {
    const response = await POST(
      request({ achievementId: 'first_bet', progress: 1, unlocked: true }),
    );

    expect(response.status).toBe(200);
    await vi.waitFor(() => {
      expect(mocks.createNotificationBestEffort).toHaveBeenCalledWith({
        userId: 'player-1',
        kind: 'achievement',
        title: 'Achievement unlocked',
        body: 'First Bet — Place your first bet',
        metadata: { achievementId: 'first_bet' },
        sourceKey: 'achievement:first_bet',
      });
    });
  });

  it('does not create an inbox entry for progress updates or unknown achievement ids', async () => {
    await POST(request({ achievementId: 'first_bet', progress: 0.5, unlocked: false }));
    await POST(request({ achievementId: 'unknown', progress: 1, unlocked: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mocks.createNotificationBestEffort).not.toHaveBeenCalled();
  });
});
