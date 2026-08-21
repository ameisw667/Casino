import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  sendTelegramMessage: vi.fn(),
  setMetadata: vi.fn(),
  waitFor: vi.fn(),
  setTelegramNotificationsEnabled: vi.fn(async () => true),
}));

vi.mock('server-only', () => ({}));
vi.mock('@trigger.dev/sdk', () => ({
  schemaTask: vi.fn((opts) => opts),
  task: vi.fn((opts) => opts),
  schedules: { task: vi.fn((opts) => opts) },
  idempotencyKeys: { create: vi.fn(async (k) => k) },
  logger: { log: vi.fn(), error: vi.fn() },
  metadata: { set: mocks.setMetadata },
  wait: {
    for: mocks.waitFor,
  },
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
}));

vi.mock('@/lib/casino/telegram-api', () => ({
  sendTelegramMessage: mocks.sendTelegramMessage,
}));

vi.mock('@/lib/casino/telegram-link', () => ({
  setTelegramNotificationsEnabled: mocks.setTelegramNotificationsEnabled,
}));

import {
  buildDay0WelcomeMessage,
  buildDay2Message,
  buildDay7Message,
  executePlayerOnboardingDrip,
  playerOnboardingDripPayloadSchema,
} from '@/trigger/player-onboarding-drip';

function createDbMock(betsCount = 0, notificationsEnabled = true) {
  mocks.from.mockImplementation((table: string) => {
    if (table === 'telegram_links') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: notificationsEnabled ? { notifications_enabled: true } : null,
          error: null,
        }),
      };
    }
    if (table === 'wallet_transactions' || table === 'game_rounds') {
      const rows = Array.from({ length: betsCount }, (_, i) => ({ id: `bet_${i}` }));
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: rows, error: null }),
      };
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
  });
}

describe('Player Onboarding Drip (Option B)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendTelegramMessage.mockResolvedValue({ ok: true, status: 200 });
  });

  describe('Message Builders', () => {
    it('builds Day 0 welcome message with username', () => {
      const msg = buildDay0WelcomeMessage('jan_casino');
      expect(msg).toContain('Willkommen im Royale Casino, Hallo @jan_casino!');
      expect(msg).toContain('10.000 Coins');
    });

    it('builds Day 0 welcome message without username', () => {
      const msg = buildDay0WelcomeMessage();
      expect(msg).toContain('Willkommen im Royale Casino, Hallo!');
    });

    it('builds Day 2 inactive reminder when bet count is 0', () => {
      const msg = buildDay2Message(0);
      expect(msg).toContain('💎 Dein Startguthaben wartet!');
      expect(msg).toContain('noch nicht eingesetzt');
    });

    it('builds Day 2 active progress message when bet count > 0', () => {
      const msg = buildDay2Message(5);
      expect(msg).toContain('🔥 Starker Einstieg!');
      expect(msg).toContain('5 Wetten');
      expect(msg).toContain('VIP-Vault');
    });

    it('builds Day 7 completion and recap handoff message', () => {
      const msg = buildDay7Message();
      expect(msg).toContain('🏆 Willkommen im regulären Spielbetrieb!');
      expect(msg).toContain('Montag um 09:00 Uhr');
    });
  });

  describe('Schema Validation', () => {
    it('validates correct payload', () => {
      const valid = { userId: 'u_123', chatId: 998877, username: 'testuser' };
      expect(playerOnboardingDripPayloadSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid payload', () => {
      const invalid = { userId: '', chatId: 'not-a-number' };
      expect(playerOnboardingDripPayloadSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Workflow Execution & Branching', () => {
    it('completes all 3 stages with active branching and durable sleep pauses', async () => {
      createDbMock(3, true);

      const result = await executePlayerOnboardingDrip({
        userId: 'u_123',
        chatId: 998877,
        username: 'jan_pro',
      });

      expect(result.completed).toBe(true);
      expect(result.stagesCompleted).toBe(3);

      // Verify 2 durable sleeps: 2 days, then 5 days
      expect(mocks.waitFor).toHaveBeenNthCalledWith(1, { days: 2 });
      expect(mocks.waitFor).toHaveBeenNthCalledWith(2, { days: 5 });

      // Verify 3 telegram messages sent
      expect(mocks.sendTelegramMessage).toHaveBeenCalledTimes(3);
    });

    it('aborts early if user unlinked or disabled notifications at Stage 1', async () => {
      createDbMock(0, false); // notifications disabled

      const result = await executePlayerOnboardingDrip({
        userId: 'u_123',
        chatId: 998877,
      });

      expect(result.completed).toBe(false);
      expect(result.reason).toBe('unlinked_or_muted');
      expect(mocks.waitFor).not.toHaveBeenCalled();
    });

    it('mutes user and aborts when Telegram returns 403 (bot blocked)', async () => {
      createDbMock(0, true);
      mocks.sendTelegramMessage.mockResolvedValueOnce({ ok: false, status: 403 });

      const result = await executePlayerOnboardingDrip({
        userId: 'u_123',
        chatId: 998877,
      });

      expect(result.completed).toBe(false);
      expect(result.reason).toBe('unlinked_or_muted');
      expect(mocks.setTelegramNotificationsEnabled).toHaveBeenCalledWith('u_123', false);
    });
  });
});
