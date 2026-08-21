import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  trigger: vi.fn(),
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
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
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

describe('notifyBigWinIfEligible (M2 async dispatch)', () => {
  it('skips replayed settlements without triggering background task', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, replayed: true });
    expect(result).toBe('skipped');
    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('skips losses without triggering background task', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, win: false });
    expect(result).toBe('skipped');
    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('skips wins below big-win thresholds without triggering background task', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, payout: 10, multiplier: 2 });
    expect(result).toBe('skipped');
    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('triggers big-win-notify background task on eligible big win', async () => {
    mocks.trigger.mockResolvedValueOnce({ id: 'run_bigwin_1' });
    const result = await notifyBigWinIfEligible(baseInput);

    expect(result).toBe('sent');
    expect(mocks.trigger).toHaveBeenCalledWith('big-win-notify', {
      userId: 'user-1',
      game: 'DICE',
      payout: 1000,
      multiplier: 25,
      win: true,
      replayed: false,
    });
  });

  it('swallows trigger errors and never throws in the bet response path', async () => {
    mocks.trigger.mockRejectedValueOnce(new Error('Trigger service down'));
    const result = await notifyBigWinIfEligible(baseInput);

    expect(result).toBe('skipped');
    expect(mocks.error).toHaveBeenCalled();
  });
});

describe('bigWinNotify helpers and schema', () => {
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
