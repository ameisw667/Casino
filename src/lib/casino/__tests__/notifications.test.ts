import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  publish: vi.fn(),
  error: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: vi.fn(() => ({ from: mocks.from })) }));
vi.mock('@/lib/casino/realtime', () => ({ publishNotificationCreated: mocks.publish }));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: mocks.error } }));

type NotificationModule = {
  createNotification: (input: {
    userId: string;
    kind: 'big_win' | 'achievement' | 'system';
    title: string;
    body: string;
    metadata?: Record<string, string | number | boolean>;
    sourceKey: string;
  }) => Promise<{ id: string; kind: string; readAt: string | null } | null>;
};

function writeChain(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    upsert: vi.fn(() => builder),
    select: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
  };
  return builder;
}

async function loadService(): Promise<NotificationModule | null> {
  return import('../notifications').catch(() => null) as Promise<NotificationModule | null>;
}

afterEach(() => vi.clearAllMocks());

describe('createNotification', () => {
  it('persists a new allowed notification before publishing its private refresh event', async () => {
    const service = await loadService();
    expect(service).not.toBeNull();
    if (!service) return;

    mocks.from.mockReturnValueOnce(
      writeChain({
        data: {
          id: '11111111-1111-4111-8111-111111111111',
          kind: 'big_win',
          title: 'Big Win!',
          body: 'Dice paid 20.00x.',
          metadata: { game: 'dice', payout: 500, multiplier: 20 },
          created_at: '2026-08-23T10:00:00.000Z',
          read_at: null,
        },
        error: null,
      }),
    );

    const result = await service.createNotification({
      userId: 'player-1',
      kind: 'big_win',
      title: 'Big Win!',
      body: 'Dice paid 20.00x.',
      metadata: { game: 'dice', payout: 500, multiplier: 20 },
      sourceKey: 'big-win:request-1',
    });

    expect(result).toMatchObject({ id: '11111111-1111-4111-8111-111111111111', kind: 'big_win', readAt: null });
    expect(mocks.from).toHaveBeenCalledWith('user_notifications');
    expect(mocks.publish).toHaveBeenCalledWith('player-1', {
      notificationId: '11111111-1111-4111-8111-111111111111',
    });
  });

  it('does not publish when the idempotent insert reports an existing source key', async () => {
    const service = await loadService();
    expect(service).not.toBeNull();
    if (!service) return;

    mocks.from.mockReturnValueOnce(writeChain({ data: null, error: null }));

    await expect(
      service.createNotification({
        userId: 'player-1',
        kind: 'achievement',
        title: 'Unlocked',
        body: 'First Bet',
        sourceKey: 'achievement:first_bet',
      }),
    ).resolves.toBeNull();
    expect(mocks.publish).not.toHaveBeenCalled();
  });

  it('rejects a notification kind outside the server allowlist before touching the database', async () => {
    const service = await loadService();
    expect(service).not.toBeNull();
    if (!service) return;

    await expect(
      service.createNotification({
        userId: 'player-1',
        kind: 'system' as never,
        title: 'System',
        body: 'Safe message',
        sourceKey: 'system:1',
        metadata: { unsafe: { nested: true } as never },
      }),
    ).rejects.toThrow();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});