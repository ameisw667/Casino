import 'server-only';

import { z } from 'zod';
import { WalletService } from './wallet';
import { DEFAULT_VIP_CONFIG, getVipTierByXp } from './vip-config';
import { CasinoLogger } from './logger';

export const GUIDE_TOOL_NAMES = [
  'get_player_vip_progress',
  'get_player_session_stats',
  'get_player_account_limits',
  'trigger_ui_action',
] as const;

export type GuideToolName = (typeof GUIDE_TOOL_NAMES)[number];

export const GUIDE_OPENAI_TOOLS = [
  {
    type: 'function',
    name: 'get_player_vip_progress',
    description:
      "Returns the authenticated player's live VIP progress: current level, XP, VIP rank tier, current rakeback rate, next tier, and XP needed to level up.",
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_player_session_stats',
    description:
      "Returns the authenticated player's live gameplay statistics: total bets placed, wins, win rate percentage, total wagered amount, and net profit.",
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_player_account_limits',
    description:
      'Returns the platform betting limits, min/max allowed wagers per round, and guide rate limits.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'trigger_ui_action',
    description:
      'Attaches an interactive UI action button below the assistant message, allowing the player to open a page/modal (vault, settings, rank_benefits, history, leaderboard) or navigate to a game (blackjack, crash, dice, roulette, slots).',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'open_vault',
            'open_settings',
            'open_rank_benefits',
            'open_history',
            'navigate_game',
            'open_leaderboard',
          ],
          description: 'The UI action type to trigger.',
        },
        target: {
          type: 'string',
          description:
            'The target game (blackjack, crash, dice, roulette, slots) or modal/page identifier.',
        },
        label: {
          type: 'string',
          description:
            'Short, clean button label in German (e.g. "Vault öffnen", "Zu Blackjack", "Wett-Verlauf", "Rang-Vorteile").',
        },
      },
      required: ['action', 'label'],
      additionalProperties: false,
    },
    strict: false,
  },
] as const;

export type PlayerVipProgressResult = {
  level: number;
  xp: number;
  currentRank: string;
  rakebackRatePercent: string;
  nextTier: string | null;
  nextTierMinXp: number | null;
  xpNeededForNextTier: number;
};

export type PlayerSessionStatsResult = {
  totalBets: number;
  totalWins: number;
  winRatePercent: string;
  totalWagered: string;
  totalProfit: string;
};

export type PlayerAccountLimitsResult = {
  minBetPerRound: string;
  maxBetPerRound: string;
  guideRateLimit: string;
  provablyFairVerification: string;
};

export async function executeGetPlayerVipProgress(
  userId?: string,
): Promise<PlayerVipProgressResult> {
  if (!userId || userId === 'dev_user_fallback') {
    return {
      level: 1,
      xp: 0,
      currentRank: 'BRONZE',
      rakebackRatePercent: '1%',
      nextTier: 'SILVER',
      nextTierMinXp: 5000,
      xpNeededForNextTier: 5000,
    };
  }

  try {
    const wallet = await WalletService.getWallet(userId);
    const tiers = DEFAULT_VIP_CONFIG.vipTiers;
    const currentTier = getVipTierByXp(tiers, wallet.xp);

    const sortedTiers = [...tiers].sort((a, b) => a.minXp - b.minXp);
    const currentIndex = sortedTiers.findIndex((t) => t.name === currentTier.name);
    const nextTier = currentIndex >= 0 && currentIndex < sortedTiers.length - 1 ? sortedTiers[currentIndex + 1] : null;

    const remainingXp = nextTier ? Math.max(0, nextTier.minXp - wallet.xp) : 0;

    return {
      level: wallet.level,
      xp: wallet.xp,
      currentRank: wallet.rank,
      rakebackRatePercent: `${(currentTier.rakeback * 100).toFixed(1).replace(/\.0$/, '')}%`,
      nextTier: nextTier ? nextTier.name : null,
      nextTierMinXp: nextTier ? nextTier.minXp : null,
      xpNeededForNextTier: remainingXp,
    };
  } catch (error) {
    CasinoLogger.error('GuideTools', 'Failed to load player VIP progress', error instanceof Error ? error : undefined);
    return {
      level: 1,
      xp: 0,
      currentRank: 'BRONZE',
      rakebackRatePercent: '1%',
      nextTier: 'SILVER',
      nextTierMinXp: 5000,
      xpNeededForNextTier: 5000,
    };
  }
}

export async function executeGetPlayerSessionStats(
  userId?: string,
): Promise<PlayerSessionStatsResult> {
  if (!userId || userId === 'dev_user_fallback') {
    return {
      totalBets: 0,
      totalWins: 0,
      winRatePercent: '0.0%',
      totalWagered: '$0.00',
      totalProfit: '$0.00',
    };
  }

  try {
    const stats = await WalletService.getUserStats(userId);
    return {
      totalBets: stats.totalBets,
      totalWins: stats.totalWins,
      winRatePercent: `${((stats.winRate ?? 0) * 100).toFixed(1)}%`,
      totalWagered: `$${(stats.totalWagered ?? 0).toFixed(2)}`,
      totalProfit: `${(stats.totalProfit ?? 0) >= 0 ? '+' : '-'}$${Math.abs(stats.totalProfit ?? 0).toFixed(2)}`,
    };
  } catch (error) {
    CasinoLogger.error('GuideTools', 'Failed to load player session stats', error instanceof Error ? error : undefined);
    return {
      totalBets: 0,
      totalWins: 0,
      winRatePercent: '0.0%',
      totalWagered: '$0.00',
      totalProfit: '$0.00',
    };
  }
}

export function executeGetPlayerAccountLimits(): PlayerAccountLimitsResult {
  return {
    minBetPerRound: '$0.10',
    maxBetPerRound: '$10,000.00',
    guideRateLimit: '10 Anfragen pro 60 Sekunden',
    provablyFairVerification: 'Aktiv (HMAC-SHA256 mit Client Seed & Nonce)',
  };
}

export async function executeGuideTool(
  toolName: string,
  _args: Record<string, unknown>,
  userId?: string,
): Promise<Record<string, unknown>> {
  switch (toolName) {
    case 'get_player_vip_progress':
      return await executeGetPlayerVipProgress(userId);
    case 'get_player_session_stats':
      return await executeGetPlayerSessionStats(userId);
    case 'get_player_account_limits':
      return executeGetPlayerAccountLimits();
    case 'trigger_ui_action':
      return {
        success: true,
        action: typeof _args.action === 'string' ? _args.action : 'open_vault',
        target: typeof _args.target === 'string' ? _args.target : undefined,
        label: typeof _args.label === 'string' ? _args.label : 'Öffnen',
      };
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
