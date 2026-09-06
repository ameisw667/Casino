// Central store type contract. Slices and the composite both import from here so
// NO slice ever imports the composite module (avoids Slice→Store→Slice circular
// imports, B-I2). CasinoState is the intersection of all slice contracts plus the
// composite-only cross-slice actions — kept in sync by construction.

import type { VipTier, Rank } from '@/lib/casino/vip-config';
import type { GameConfig } from '@/lib/casino/game-config';
import type { Achievement, AchievementConfig } from '@/lib/casino/achievements-config';
import type { WalletSnapshot } from '@/lib/casino/wallet-contract';

export interface Bet {
  id: string;
  time: string;
  game: string;
  user: string;
  amount: number;
  multiplier: number;
  payout: number;
  win: boolean;
}

export interface ToastDetails {
  key?: string;
  title?: string;
  level?: number;
  badgeSrc?: string;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'error' | 'win';
  message: string;
  duration?: number;
  key?: ToastDetails['key'];
  title?: ToastDetails['title'];
  level?: ToastDetails['level'];
  badgeSrc?: ToastDetails['badgeSrc'];
}

export type OnboardingStep = 'NONE' | 'WELCOME' | 'LOGIN' | 'TOUR_VAULT' | 'COMPLETED';

export interface UISlice {
  toasts: Toast[];
  isMobile: boolean;
  isProcessing: boolean;
  isChatOpen: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setIsMobile: (isMobile: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setHasHydrated: (val: boolean) => void;
  addToast: (msg: string, type?: Toast['type'], duration?: number, details?: ToastDetails) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface SettingsSlice {
  soundVolume: number;
  hideBalance: boolean;
  anonymousBetting: boolean;
  language: string;
  oddsFormat: string;
  soundEnabled: boolean;
  autoBetSettings: {
    dice: {
      amount: number;
      onWin: number;
      onLoss: number;
      stopOnProfit: number;
      stopOnLoss: number;
      numberOfBets: number;
    };
    crash: {
      amount: number;
      cashoutAt: number;
      onLoss: 'RESET' | 'DOUBLE';
    };
  };
  provablyFairSettings: {
    clientSeed: string;
    serverSeedHash: string;
    nonce: number;
  };
  affiliateRef: string | null;
  onboardingStep: OnboardingStep;
  onboardingDismissed: boolean;
  updateSettings: (
    settings: Partial<
      Pick<
        SettingsSlice,
        | 'soundVolume'
        | 'hideBalance'
        | 'anonymousBetting'
        | 'language'
        | 'oddsFormat'
        | 'soundEnabled'
      >
    >,
  ) => void;
  toggleSound: () => void;
  setAutoBetSettings: (
    game: 'dice' | 'crash',
    settings: Partial<
      SettingsSlice['autoBetSettings']['dice'] | SettingsSlice['autoBetSettings']['crash']
    >,
  ) => void;
  setProvablyFairSettings: (settings: Partial<SettingsSlice['provablyFairSettings']>) => void;
  setAffiliateRef: (ref: string | null) => void;
  startOnboarding: (force?: boolean) => void;
  dismissOnboarding: () => void;
  setOnboardingStep: (step: OnboardingStep) => void;
}

export interface HistorySlice {
  bets: Bet[];
  crashHistory: number[];
  multiplayerCrashHistory: number[];
  allBets: {
    id: string;
    user: string;
    game: string;
    amount: number;
    multiplier: number;
    payout: number;
    time: string;
    isWin: boolean;
  }[];
  chatMessages: {
    id: string;
    user: string;
    rank: string;
    message: string;
    time: string;
    isSystem?: boolean;
    isWin?: boolean;
  }[];
  communityWagered: number;
  communityGoal: number;
  communityGoalReached: boolean;
  gameStats: {
    [key: string]: {
      totalBets: number;
      wins: number;
      losses: number;
      profit: number;
      peakWinMultiplier?: number;
    };
  };
  analytics?: {
    totalWagered: number;
    totalPayout: number;
    winRate: number;
    totalSessionTime: number;
    activityHeatmap: Record<string, number>;
  };
  responsibleGaming?: {
    sessionDuration: number;
    sessionLoss: number;
    martingaleDetected: boolean;
    lossLimit?: number;
    winLimit?: number;
  };
  addBet: (bet: Bet) => void;
  addCrashHistory: (multiplier: number) => void;
  addMultiplayerCrashHistory: (multiplier: number) => void;
  addLiveBet: (bet: {
    user: string;
    game: string;
    amount: number;
    multiplier: number;
    payout: number;
    isWin: boolean;
  }) => void;
  addChatMessage: (msg: {
    user: string;
    rank: string;
    message: string;
    isSystem?: boolean;
    isWin?: boolean;
  }) => void;
  resetGameStats: (game?: string) => void;
  updateSessionTime: () => () => void;
  startActivitySimulator: () => () => void;
  dismissMartingaleWarning: () => void;
}

export interface AchievementsSlice {
  achievements: Achievement[];
  achievementConfigs: AchievementConfig[];
  currentWinStreak: number;
  unlockAchievement: (id: string) => void;
  mergeServerAchievements: (
    serverAchievements: Array<{ id: string; unlocked: boolean; progress: number }>,
  ) => void;
}

export interface WalletSnapshotSlice {
  balance: number;
  xp: number;
  level: number;
  rank: string;
  vipTiers: VipTier[];
  ranks: Rank[];
  gameConfig: GameConfig;
  sessionId: string | null;
  loadVipConfig: () => Promise<void>;
  loadGameConfig: () => Promise<void>;
  getBetLimits: () => { betMin: number; betMax: number };
  getRouletteMultiplier: (betType: { type: string; value: number | string }) => number;
  getSlotsPayout: (symbols: number[]) => number;
  getBlackjackMaxPayoutFactor: () => number;
  validateBet: (betAmount: number, balance: number) => string | null;
  getXpGain: (wager: number, level?: number) => number;
  calculateLevel: (totalXp: number) => number;
  getVipTierByXp: (xp?: number) => VipTier;
  getRankByLevel: (level?: number) => Rank;
  setSessionId: (sessionId: string | null) => void;
  syncAnonymousSession: () => Promise<void>;
  migrateAnonymousSession: () => Promise<boolean>;
  addBalance: (amount: number) => void;
  removeBalance: (amount: number) => boolean;
  calculateXp: (wager: number) => void;
}

export interface ProcessGameResultParams {
  game: string;
  amount: number;
  multiplier: number;
  payout: number;
  win: boolean;
  resultId: string;
  crashMultiplier?: number;
  isSettlement?: boolean;
  isFirstBet?: boolean;
}

export interface CompositeActions {
  applyServerWalletSnapshot: (snapshot: WalletSnapshot) => void;
  processGameResult: (params: ProcessGameResultParams) => void;
  initialize: () => Promise<void>;
  redeemCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

export type CasinoState = UISlice &
  SettingsSlice &
  HistorySlice &
  AchievementsSlice &
  WalletSnapshotSlice &
  CompositeActions;
