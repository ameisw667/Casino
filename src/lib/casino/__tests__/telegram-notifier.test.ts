import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  trigger: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  error: vi.fn(),
  setTelegramNotificationsEnabled: vi.fn(async () => true),
}));

vi.mock('server-only', () => ({}));
vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: mocks.trigger },
  logger: { log: vi.fn(), error: vi.fn() },
  schemaTask: vi.fn((opts) => opts),
  task: vi.fn((opts) => opts),
  schedules: { task: vi.fn((opts) => opts) },
  idempotencyKeys: { create: vi.fn(async (k) => k) },
  metadata: { set: vi.fn() },
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from, rpc: mocks.rpc })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.error },
}));
vi.mock('@/lib/casino/telegram-link', () => ({
  setTelegramNotificationsEnabled: mocks.setTelegramNotificationsEnabled,
}));

import { notifyBigWinIfEligible } from '../telegram-notifier';
import { formatBigWinMessage, bigWinNotifyPayloadSchema } from '@/trigger/big-win-notify';

const baseInput = {
  userId: 'user-1',
  requestId: 'req-1',
  game: 'DICE',
  payout: 1000,
  multiplier: 25,
  win: true,
  replayed: false,
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('notifyBigWinIfEligible (4.3 outbox dispatch)', () => {
  it('skips replayed settlements without emitting an outbox event', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, replayed: true });
    expect(result).toBe('skipped');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('skips losses without emitting an outbox event', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, win: false });
    expect(result).toBe('skipped');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('skips wins below big-win thresholds without emitting an outbox event', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, payout: 10, multiplier: 2 });
    expect(result).toBe('skipped');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('emits a big_win_notify outbox event on eligible big win', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { success: true, alreadyExists: false }, error: null });
    const result = await notifyBigWinIfEligible(baseInput);

    expect(result).toBe('sent');
    expect(mocks.rpc).toHaveBeenCalledWith('emit_big_win_notify_event', {
      p_user_id: 'user-1',
      p_request_id: 'req-1',
      p_game: 'DICE',
      p_payout: 1000,
      p_multiplier: 25,
    });
    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('swallows RPC errors and never throws in the settlement response path', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: 'connection lost' } });
    const result = await notifyBigWinIfEligible(baseInput);

    expect(result).toBe('skipped');
    expect(mocks.error).toHaveBeenCalled();
  });
});

describe('bigWinNotify helpers and schema (unchanged Trigger.dev task, now dispatched via the outbox route)', () => {
  it('formats big win messages accurately', () => {
    const msg = formatBigWinMessage('CRASH', 2500, 50);
    expect(msg).toBe('🎉 Big Win! CRASH — $2500.00 at 50.00x');
  });

  it('validates schema correctly', () => {
    const valid = {
      userId: 'user-1',
      game: 'SLOTS',
      payout: 500,
      multiplier: 100,
      win: true,
      replayed: false,
    };
    expect(bigWinNotifyPayloadSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      userId: '',
      game: '',
      payout: -10,
      multiplier: -1,
      win: true,
    };
    expect(bigWinNotifyPayloadSchema.safeParse(invalid).success).toBe(false);
  });
});
