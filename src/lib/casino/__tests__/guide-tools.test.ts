import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  GUIDE_OPENAI_TOOLS,
  executeGetPlayerAccountLimits,
  executeGetPlayerSessionStats,
  executeGetPlayerVipProgress,
  executeGuideTool,
} from '../guide-tools';
import { WalletService } from '../wallet';

describe('Guide Tools Specification & Execution', () => {
  it('defines 4 strictly typed tools for OpenAI', () => {
    expect(GUIDE_OPENAI_TOOLS).toHaveLength(4);
    const names = GUIDE_OPENAI_TOOLS.map((t) => t.name);
    expect(names).toContain('get_player_vip_progress');
    expect(names).toContain('get_player_session_stats');
    expect(names).toContain('get_player_account_limits');
    expect(names).toContain('trigger_ui_action');
  });

  it('returns default VIP progress for fallback dev/anonymous user', async () => {
    const vip = await executeGetPlayerVipProgress('dev_user_fallback');
    expect(vip.level).toBe(1);
    expect(vip.xp).toBe(0);
    expect(vip.currentRank).toBe('BRONZE');
    expect(vip.rakebackRatePercent).toBe('1%');
    expect(vip.nextTier).toBe('SILVER');
    expect(vip.xpNeededForNextTier).toBe(5000);
  });

  it('computes live VIP progress correctly for an authenticated user', async () => {
    const mockWallet = {
      balance: 100,
      xp: 12000,
      level: 15,
      rank: 'SILVER',
      transactionId: 'tx-123',
    };
    vi.spyOn(WalletService, 'getWallet').mockResolvedValue(mockWallet);

    const vip = await executeGetPlayerVipProgress('test-user-id');
    expect(vip.level).toBe(15);
    expect(vip.xp).toBe(12000);
    expect(vip.currentRank).toBe('SILVER');
    expect(vip.nextTier).toBe('GOLD');
    expect(vip.nextTierMinXp).toBe(25000);
    expect(vip.xpNeededForNextTier).toBe(13000);
  });

  it('returns formatted session stats for an authenticated user', async () => {
    const mockStats = {
      totalBets: 50,
      totalWins: 25,
      totalWagered: 500,
      totalPayout: 550,
      totalProfit: 50,
      winRate: 0.5,
      achievements: [],
      perGame: [],
    };
    vi.spyOn(WalletService, 'getUserStats').mockResolvedValue(mockStats);

    const stats = await executeGetPlayerSessionStats('test-user-id');
    expect(stats.totalBets).toBe(50);
    expect(stats.totalWins).toBe(25);
    expect(stats.winRatePercent).toBe('50.0%');
    expect(stats.totalWagered).toBe('$500.00');
    expect(stats.totalProfit).toBe('+$50.00');
  });

  it('returns platform account limits without database access', () => {
    const limits = executeGetPlayerAccountLimits();
    expect(limits.minBetPerRound).toBe('$0.10');
    expect(limits.maxBetPerRound).toBe('$10,000.00');
    expect(limits.guideRateLimit).toBe('30 Anfragen pro 60 Sekunden');
    expect(limits.provablyFairVerification).toContain('HMAC-SHA256');
  });

  it('flags VIP progress as unavailable instead of presenting fabricated stats on a DB error', async () => {
    vi.spyOn(WalletService, 'getWallet').mockRejectedValue(new Error('db down'));

    const vip = await executeGetPlayerVipProgress('test-user-id');
    expect(vip.dataUnavailable).toBe(true);
    expect(vip.currentRank).toBe('BRONZE');
  });

  it('flags session stats as unavailable instead of presenting fabricated stats on a DB error', async () => {
    vi.spyOn(WalletService, 'getUserStats').mockRejectedValue(new Error('db down'));

    const stats = await executeGetPlayerSessionStats('test-user-id');
    expect(stats.dataUnavailable).toBe(true);
    expect(stats.totalBets).toBe(0);
  });

  it('does not flag the dev/anonymous fallback as a data error', async () => {
    const vip = await executeGetPlayerVipProgress('dev_user_fallback');
    expect(vip.dataUnavailable).toBeUndefined();
  });

  it('routes tool calls by name via executeGuideTool', async () => {
    const limitsResult = await executeGuideTool('get_player_account_limits', {});
    expect(limitsResult.minBetPerRound).toBe('$0.10');

    const actionResult = await executeGuideTool('trigger_ui_action', {
      action: 'open_vault',
      target: 'vault',
      label: 'Vault öffnen',
    });
    expect(actionResult.success).toBe(true);
    expect(actionResult.action).toBe('open_vault');
    expect(actionResult.target).toBe('vault');
    expect(actionResult.label).toBe('Vault öffnen');

    const unknownResult = await executeGuideTool('unknown_tool', {});
    expect(unknownResult.error).toContain('Unknown tool');
  });

  it('falls back to a safe default when the model sends an action outside the declared enum', async () => {
    const result = await executeGuideTool('trigger_ui_action', {
      action: 'delete_account',
      target: 'vault',
      label: 'Konto löschen',
    });
    expect(result.action).toBe('open_vault');
  });

  it('drops a target that is not on the known page/game allowlist instead of forwarding it verbatim', async () => {
    const result = await executeGuideTool('trigger_ui_action', {
      action: 'navigate_game',
      target: 'javascript:alert(1)',
      label: 'Spielen',
    });
    expect(result.target).toBeUndefined();
  });

  it('truncates an overlong model-generated label instead of forwarding it verbatim', async () => {
    const result = await executeGuideTool('trigger_ui_action', {
      action: 'open_vault',
      label: 'x'.repeat(500),
    });
    expect((result.label as string).length).toBe(60);
  });
});
