import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundManager } from '@/lib/casino/sound-manager';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  type VipTier,
  type Rank,
  DEFAULT_VIP_CONFIG,
  getVipTierByXp,
  getRankByLevel,
} from '@/lib/casino/vip-config';
import {
  type GameConfig,
  DEFAULT_GAME_CONFIG,
  getBetLimits,
  calculateXpGainWithConfig,
  calculateLevelWithConfig,
  getRouletteMultiplierWithConfig,
  calculateSlotsPayoutWithConfig,
  getBlackjackMaxPayoutFactor,
  validateBetWithConfig,
} from '@/lib/casino/game-config';
import type { WalletSnapshot } from '@/lib/casino/wallet-contract';
import { walletSnapshotSchema } from '@/lib/casino/wallet-contract';

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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'error' | 'win';
  message: string;
  duration?: number;
}

export interface CasinoState {
  balance: number;
  xp: number;
  level: number;
  rank: string;
  vipTiers: VipTier[];
  ranks: Rank[];
  gameConfig: GameConfig;
  sessionId: string | null;
  bets: Bet[];
  crashHistory: number[];
  achievements: Achievement[];
  provablyFairSettings: {
    clientSeed: string;
    serverSeedHash: string;
    nonce: number;
  };
  toasts: Toast[];
  isMobile: boolean;
  isProcessing: boolean;
  isChatOpen: boolean;
  soundVolume: number;
  hideBalance: boolean;
  anonymousBetting: boolean;
  language: string;
  oddsFormat: string;
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
  gameStats: {
    [key: string]: {
      totalBets: number;
      wins: number;
      losses: number;
      profit: number;
      peakWinMultiplier?: number;
    }
  };
  chatMessages: {
    id: string;
    user: string;
    rank: string;
    message: string;
    time: string;
    isSystem?: boolean;
    isWin?: boolean;
  }[];
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
  communityWagered: number;
  communityGoal: number;
  onboardingStep: 'NONE' | 'WELCOME' | 'LOGIN' | 'TOUR_VAULT' | 'OPEN_CASE' | 'COMPLETED';
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
  communityGoalReached: boolean;
  affiliateRef: string | null;
  setAffiliateRef: (ref: string | null) => void;
  clearToasts: () => void;
  applyServerWalletSnapshot: (snapshot: WalletSnapshot) => void;

  processGameResult: (params: {
    game: string;
    amount: number;
    multiplier: number;
    payout: number;
    win: boolean;
    resultId: string;
    crashMultiplier?: number;
    isSettlement?: boolean;
  }) => void;

  // VIP / Rank config
  loadVipConfig: () => Promise<void>;
  getVipTierByXp: (xp?: number) => VipTier;
  getRankByLevel: (level?: number) => Rank;

  // Game config
  loadGameConfig: () => Promise<void>;
  getBetLimits: () => { betMin: number; betMax: number };
  getRouletteMultiplier: (betType: { type: string; value: number | string }) => number;
  getSlotsPayout: (symbols: number[]) => number;
  getBlackjackMaxPayoutFactor: () => number;
  validateBet: (betAmount: number, balance: number) => string | null;
  getXpGain: (wager: number, level?: number) => number;
  calculateLevel: (totalXp: number) => number;

  // Anonymous session
  setSessionId: (sessionId: string | null) => void;
  syncAnonymousSession: () => Promise<void>;
  migrateAnonymousSession: () => Promise<boolean>;

  // Actions
  setIsChatOpen: (open: boolean) => void;
  updateSettings: (settings: Partial<Pick<CasinoState, 'soundVolume' | 'hideBalance' | 'anonymousBetting' | 'language' | 'oddsFormat' | 'soundEnabled'>>) => void;
  updateSessionTime: () => () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  resetGameStats: (game?: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  addChatMessage: (msg: { user: string; rank: string; message: string; isSystem?: boolean; isWin?: boolean }) => void;
  addLiveBet: (bet: { user: string; game: string; amount: number; multiplier: number; payout: number; isWin: boolean }) => void;
  startOnboarding: () => void;
  setOnboardingStep: (step: 'NONE' | 'WELCOME' | 'LOGIN' | 'TOUR_VAULT' | 'OPEN_CASE' | 'COMPLETED') => void;
  addBalance: (amount: number) => void;
  toggleSound: () => void;
  addBet: (bet: Bet) => void;
  calculateXp: (wager: number) => void;
  addCrashHistory: (multiplier: number) => void;
  setProvablyFairSettings: (settings: Partial<CasinoState['provablyFairSettings']>) => void;
  unlockAchievement: (id: string) => void;
  removeBalance: (amount: number) => boolean;
  addToast: (msg: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  setAutoBetSettings: (game: 'dice' | 'crash', settings: Partial<CasinoState['autoBetSettings']['dice'] | CasinoState['autoBetSettings']['crash']>) => void;
  startActivitySimulator: () => (() => void);
  initialize: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  redeemCode: (code: string) => { success: boolean; message: string };
  dismissMartingaleWarning: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  syncToFile: () => void;
}





const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_bet', title: 'First Steps', description: 'Place your first bet', icon: '🎯', unlocked: false, progress: 0, total: 1 },
  { id: 'high_roller', title: 'The Whale', description: 'Wager $1,000 in a single bet', icon: '/images/ach-whale-3d.png', unlocked: false, progress: 0, total: 1000 },
  { id: 'lucky_streak', title: 'Emerald Luck', description: 'Win 5 times in a row', icon: '/images/ach-clover-3d.png', unlocked: false, progress: 0, total: 5 },
  { id: 'big_win', title: 'Jackpot Hunter', description: 'Win over $500 in a single bet', icon: '💰', unlocked: false, progress: 0, total: 500 },
  { id: 'level_10', title: 'Rising Star', description: 'Reach Level 10', icon: '⭐', unlocked: false, progress: 0, total: 10 },
  { id: 'level_50', title: 'Casino Elite', description: 'Reach Level 50', icon: '👑', unlocked: false, progress: 0, total: 50 },
  { id: 'crash_master', title: 'Crash Master', description: 'Hit a 10x multiplier in Crash', icon: '/images/ach-rocket-3d.png', unlocked: false, progress: 0, total: 10 },
  { id: 'daily_grinder', title: 'Daily Grinder', description: 'Claim daily reward 7 days in a row', icon: '📅', unlocked: false, progress: 0, total: 7 },
  { id: 'moon_shot', title: 'Moon Shot', description: 'Hit a 100x multiplier in Crash', icon: '/images/ach-rocket-3d.png', unlocked: false, progress: 0, total: 100 },
];

let syncTimer: ReturnType<typeof setTimeout> | null = null;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROCESSED_RESULT_ID_CAPACITY = 256;
const processedResultIds = new Set<string>();

function rememberProcessedResultId(resultId: string): void {
  if (processedResultIds.size >= PROCESSED_RESULT_ID_CAPACITY) {
    const oldestResultId = processedResultIds.values().next().value;
    if (oldestResultId !== undefined) processedResultIds.delete(oldestResultId);
  }
  processedResultIds.add(resultId);
}

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => ({
      balance: 0,
      xp: 0,
      level: 1,
      rank: 'Bronze',
      vipTiers: DEFAULT_VIP_CONFIG.vipTiers,
      ranks: DEFAULT_VIP_CONFIG.ranks,
      gameConfig: DEFAULT_GAME_CONFIG,
      sessionId: null,
      bets: [],
      crashHistory: [1.24, 5.52, 1.05, 12.43, 2.11, 1.88, 4.20],
      achievements: INITIAL_ACHIEVEMENTS,
      provablyFairSettings: {
        clientSeed: 'vibe-coder-default',
        serverSeedHash: '',
        nonce: 0
      },
      toasts: [],
      isMobile: false,
      isProcessing: false,
      isChatOpen: false,
      soundVolume: 0.5,
      hideBalance: false,
      anonymousBetting: false,
      language: 'en',
      oddsFormat: 'decimal',
      gameStats: {
        DICE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
        CRASH: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
        ROULETTE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
        SLOTS: { totalBets: 0, wins: 0, losses: 0, profit: 0 }
      },
      analytics: {
        totalWagered: 0,
        totalPayout: 0,
        winRate: 0,
        totalSessionTime: 0,
        activityHeatmap: {},
      },
      chatMessages: [
        { id: '1', user: 'System', rank: 'MOD', message: 'Welcome to Casino Royale! Play fair, win big.', time: '10:00 AM', isSystem: true }
      ],
      allBets: [],
      communityWagered: 8420.50,
      communityGoal: 25000.00,
      onboardingStep: 'NONE',
      soundEnabled: true,
      communityGoalReached: false,
      affiliateRef: null,
      autoBetSettings: {
        dice: {
          amount: 1,
          onWin: 0,
          onLoss: 0,
          stopOnProfit: 0,
          stopOnLoss: 0,
          numberOfBets: 0,
        },
        crash: {
          amount: 1,
          cashoutAt: 2.00,
          onLoss: 'RESET',
        },
      },
      _hasHydrated: false,
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      applyServerWalletSnapshot: (snapshot) => {
        const verified = walletSnapshotSchema.parse(snapshot);
        set({
          balance: verified.balance,
          xp: verified.xp,
          level: verified.level,
          rank: verified.rank,
        });
      },
      syncToFile: () => {
        if (process.env.NODE_ENV !== 'development') return;
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
          const state = get();
          const {
            toasts: _t, isProcessing: _p, isMobile: _m, _hasHydrated: _h,
            balance: _balance, xp: _xp, level: _level, rank: _rank,
            bets: _bets, allBets: _allBets,
            ...data
          } = state;
          const serializable = Object.fromEntries(
            Object.entries(data as Record<string, unknown>).filter(([, v]) => typeof v !== 'function')
          );
          fetch('/api/local/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serializable),
          }).catch(() => {});
        }, 500);
      },

    processGameResult: (params: {
      game: string;
      amount: number;
      multiplier: number;
      payout: number;
      win: boolean;
      resultId: string;
      crashMultiplier?: number;
      isSettlement?: boolean; // If true, doesn't subtract amount (it was already subtracted)
    }) => {
      const { game, amount, multiplier, payout, win, resultId, crashMultiplier } = params;
      const config = get().gameConfig;

      // --- 1. Validation & Security ---
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0 || amount > config.limits.betMax) {
        CasinoLogger.error('CasinoCore', `SECURITY ALERT: Invalid bet amount detected: ${amount}`);
        return;
      }
      if (typeof payout !== 'number' || isNaN(payout) || payout < 0) {
        CasinoLogger.error('CasinoCore', `SECURITY ALERT: Invalid payout detected: ${payout}`);
        return;
      }
      if (!UUID_PATTERN.test(resultId)) {
        CasinoLogger.error('CasinoCore', 'SECURITY ALERT: Missing or invalid canonical result ID');
        return;
      }

      if (processedResultIds.has(resultId)) return;
      rememberProcessedResultId(resultId);

      set((state) => {
        // --- 1. Audio Feedback ---
        if (state.soundEnabled) {
          if (win) soundManager.play('win');
          else soundManager.play('loss');
        }

        // Wallet, XP, level and rank are applied separately from the server snapshot.
        // This action records only already-confirmed presentation/history data.
        const newLevel = state.level;
        // --- 4. History & Analytics ---
        const newBet: Bet = {
          id: resultId,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          game,
          user: 'You',
          amount,
          multiplier,
          payout,
          win
        };
        const newBets = [newBet, ...state.bets].slice(0, 50);

        let crashHistoryUpdate = {};
        if (game === 'CRASH' && crashMultiplier !== undefined) {
          crashHistoryUpdate = { crashHistory: [crashMultiplier, ...state.crashHistory].slice(0, 50) };
        }

        // --- 5. Rakeback & Gamification ---
        
        // --- Community Goal Check ---
        const newCommunityWagered = state.communityWagered + amount;
        let communityGoalReached = state.communityGoalReached;
        if (newCommunityWagered >= state.communityGoal && !communityGoalReached) {
          communityGoalReached = true;
          // Trigger Rain Event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('community-goal-reached'));
          }
        }

        // --- 6. Stats Tracking ---
        const prevGameStats = state.gameStats[game] || { totalBets: 0, wins: 0, losses: 0, profit: 0 };
        const updatedGameStats = {
          ...state.gameStats,
          [game]: {
            totalBets: prevGameStats.totalBets + 1,
            wins: win ? prevGameStats.wins + 1 : prevGameStats.wins,
            losses: win ? prevGameStats.losses : prevGameStats.losses + 1,
            profit: prevGameStats.profit + (win ? payout - amount : -amount)
          }
        };

        // --- 7. Achievements ---
        const newAchievements = state.achievements.map(ach => {
          if (ach.unlocked) return ach;
          let unlocked = false;
          let progress = ach.progress;

          if (ach.id === 'first_bet') { unlocked = true; progress = 1; }
          if (ach.id === 'high_roller' && amount >= 1000) { unlocked = true; progress = 1000; }
          if (ach.id === 'big_win' && payout >= 500) { unlocked = true; progress = payout; }
          if (ach.id === 'level_10' && newLevel >= 10) { unlocked = true; progress = 10; }
          if (ach.id === 'level_50' && newLevel >= 50) { unlocked = true; progress = 50; }
          if (ach.id === 'crash_master' && game === 'CRASH' && multiplier >= 10) { unlocked = true; progress = 10; }
          
          return { ...ach, unlocked, progress };
        });

        return {
          bets: newBets,
          achievements: newAchievements,
          isProcessing: false,
          gameStats: updatedGameStats,
          communityWagered: newCommunityWagered,
          communityGoalReached,
          allBets: [
            {
              id: resultId,
              user: 'You',
              game,
              amount,
              multiplier,
              payout,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              isWin: win
            },
            ...state.allBets
          ].slice(0, 30),
          ...crashHistoryUpdate
        };
      });
      get().syncToFile();
    },

      loadVipConfig: async () => {
        try {
          const response = await fetch('/api/casino/config');
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const config = (await response.json()) as {
            vipTiers: VipTier[];
            ranks: Rank[];
            gameConfig: GameConfig;
          };
          set({
            vipTiers: config.vipTiers,
            ranks: config.ranks,
            gameConfig: config.gameConfig ?? DEFAULT_GAME_CONFIG,
          });
        } catch (error) {
          CasinoLogger.error('STORE', 'Failed to load VIP/game config, keeping defaults', error);
        }
      },

      loadGameConfig: async () => {
        try {
          const response = await fetch('/api/casino/config');
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const config = (await response.json()) as { gameConfig: GameConfig };
          set({ gameConfig: config.gameConfig ?? DEFAULT_GAME_CONFIG });
        } catch (error) {
          CasinoLogger.error('STORE', 'Failed to load game config, keeping defaults', error);
        }
      },

      getBetLimits: () => getBetLimits(get().gameConfig),

      getRouletteMultiplier: (betType) => getRouletteMultiplierWithConfig(betType as never, get().gameConfig),

      getSlotsPayout: (symbols) => calculateSlotsPayoutWithConfig(symbols, get().gameConfig),

      getBlackjackMaxPayoutFactor: () => getBlackjackMaxPayoutFactor(get().gameConfig),

      validateBet: (betAmount, balance) => validateBetWithConfig(betAmount, balance, get().gameConfig),

      getXpGain: (wager, level = get().level) => calculateXpGainWithConfig(wager, level, get().gameConfig),

      calculateLevel: (totalXp) => calculateLevelWithConfig(totalXp, get().gameConfig),

      getVipTierByXp: (xp = get().xp) => {
        return getVipTierByXp(get().vipTiers, xp);
      },

      getRankByLevel: (level = get().level) => {
        return getRankByLevel(get().ranks, level);
      },

      setSessionId: (sessionId) => set({ sessionId }),

      syncAnonymousSession: async () => {
        // Anonymous clients cannot submit authoritative XP or wallet state.
      },
      migrateAnonymousSession: async () => {
        // Server wallet provisioning replaces client-supplied session migration.
        return false;
      },
      setIsChatOpen: (open) => set({ isChatOpen: open }),
      updateSettings: (settings) => {
        if (settings.soundEnabled !== undefined) soundManager.toggle(settings.soundEnabled);
        if (settings.soundVolume !== undefined) soundManager.setVolume(settings.soundVolume);
        set((state) => ({ ...state, ...settings }));
      },
      updateSessionTime: () => {
        const interval = setInterval(() => {
          set((state) => ({
            analytics: {
              totalWagered: state.analytics?.totalWagered ?? 0,
              totalPayout: state.analytics?.totalPayout ?? 0,
              winRate: state.analytics?.winRate ?? 0,
              totalSessionTime: (state.analytics?.totalSessionTime ?? 0) + 1000,
              activityHeatmap: state.analytics?.activityHeatmap ?? {},
            }
          }));
        }, 1000);
        return () => clearInterval(interval);
      },
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      resetGameStats: (game) => set((state) => {
        if (game) {
          return {
            gameStats: {
              ...state.gameStats,
              [game]: { totalBets: 0, wins: 0, losses: 0, profit: 0 }
            }
          };
        }
        return {
          gameStats: {
            DICE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
            CRASH: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
            ROULETTE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
            SLOTS: { totalBets: 0, wins: 0, losses: 0, profit: 0 }
          }
        };
      }),
      setIsMobile: (isMobile) => set({ isMobile }),
      toggleSound: () => {
        set((state) => {
          const newEnabled = !state.soundEnabled;
          soundManager.toggle(newEnabled);
          return { soundEnabled: newEnabled };
        });
      },

      addChatMessage: (msg) => set((state) => ({
        chatMessages: [
          ...state.chatMessages,
          {
            ...msg,
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ].slice(-50) // Keep last 50 messages
      })),
      addLiveBet: (bet) => set((state) => ({
        allBets: [
          {
            ...bet,
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...state.allBets
        ].slice(0, 30)
      })),
      
      startOnboarding: () => {
        set({ onboardingStep: 'WELCOME' });
      },
      
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      addBalance: (_amount) => {
        get().addToast('Client-side wallet credits are disabled.', 'error');
      },
      removeBalance: (_amount) => false,
      addBet: (bet) => {
        set((state) => {
          const newBets = [bet, ...state.bets].slice(0, 50);
          
          // Check achievements
          const newAchievements = state.achievements.map(ach => {
            if (ach.id === 'first_bet' && !ach.unlocked) {
              return { ...ach, unlocked: true, progress: 1 };
            }
            if (ach.id === 'high_roller' && bet.amount >= 1000 && !ach.unlocked) {
              return { ...ach, unlocked: true, progress: 1000 };
            }
            return ach;
          });

          return { bets: newBets, achievements: newAchievements };
        });
      },

      calculateXp: (_wager) => {
        get().addToast('XP is updated only from a server wallet snapshot.', 'info');
      },
      addCrashHistory: (multiplier) => set((state) => {
        const newAchievements = state.achievements.map(ach => {
          if (ach.id === 'moon_shot' && multiplier >= 10 && !ach.unlocked) {
            return { ...ach, unlocked: true, progress: 10 };
          }
          return ach;
        });
        return {
          crashHistory: [multiplier, ...state.crashHistory].slice(0, 50),
          achievements: newAchievements
        };
      }),

      setProvablyFairSettings: (settings) => set((state) => ({
        provablyFairSettings: { ...state.provablyFairSettings, ...settings }
      })),

      unlockAchievement: (id) => set((state) => ({
        achievements: state.achievements.map(ach => 
          ach.id === id ? { ...ach, unlocked: true, progress: ach.total } : ach
        )
      })),

      addToast: (message, type = 'info', duration = 4000) => set((state) => {
        const id = Math.random().toString(36).slice(2, 11);
        const newToast = { id, message, type, duration };
        
        setTimeout(() => {
          get().removeToast(id);
        }, duration);

        return { toasts: [...state.toasts, newToast] };
      }),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),

      setAutoBetSettings: (game, settings) => set((state) => ({
        autoBetSettings: {
          ...state.autoBetSettings,
          [game]: { ...state.autoBetSettings[game], ...settings }
        }
      })),

      startActivitySimulator: () => {
        if (typeof window === 'undefined') return () => {};
        
        const games = ['CRASH', 'DICE', 'ROULETTE', 'SLOTS'];
        const users = ['Satoshi', 'Vitalik', 'Elon', 'CZ', 'VibeCoder', 'Neon_Sniper', 'SarahSlot', 'LazyJoe', 'Bochmann88', 'Alpha_Wolf', 'Diamond_Hands'];
        
        const interval = setInterval(() => {
          if (Math.random() > 0.4) {
            const game = games[Math.floor(Math.random() * games.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            const amount = Math.floor(Math.random() * 50) + 1;
            const multiplier = Math.random() > 0.3 ? (Math.random() * 2 + 1.1) : 0;
            const isWin = multiplier > 0;
            const payout = isWin ? amount * multiplier : 0;

            get().addLiveBet({
              user,
              game,
              amount,
              multiplier,
              payout,
              isWin
            });
          }
        }, 3000);

        return () => clearInterval(interval);
      },

      initialize: async () => {
        try {
          const response = await fetch('/api/user/balance', { cache: 'no-store' });
          if (!response.ok) throw new Error(`Wallet request failed with HTTP ${response.status}`);
          get().applyServerWalletSnapshot(await response.json());
        } catch (error) {
          CasinoLogger.error('STORE', 'Server wallet initialization failed closed', error);
        }
      },
      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      redeemCode: (_code) => {
        get().addToast('Voucher credits require server confirmation.', 'info');
        return { success: false, message: 'Server confirmation required' };
      },
      setAffiliateRef: (ref) => set({ affiliateRef: ref }),
      clearToasts: () => set({ toasts: [] }),

      dismissMartingaleWarning: () => {
        set((state) => ({
          responsibleGaming: state.responsibleGaming
            ? { ...state.responsibleGaming, martingaleDetected: false }
            : state.responsibleGaming
        }));
      }
    }),


    {
      name: 'casino-storage',
      skipHydration: true,
      version: 3,
      migrate: (persistedState) => {
        const migrated = {
          ...(persistedState as Partial<CasinoState> & { processedResultIds?: string[] }),
        };
        delete migrated.balance;
        delete migrated.xp;
        delete migrated.level;
        delete migrated.rank;
        delete migrated.bets;
        delete migrated.allBets;
        delete migrated.processedResultIds;
        return migrated as CasinoState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          if (state.soundEnabled !== undefined) soundManager.toggle(state.soundEnabled);
          if (state.soundVolume !== undefined) soundManager.setVolume(state.soundVolume);
        }
      },
      partialize: (state) => {
        const {
          toasts: _t,
          isProcessing: _p,
          isMobile: _m,
          _hasHydrated: _h,
          sessionId: _s,
          gameConfig: _gc,
          vipTiers: _vt,
          ranks: _r,
          bets: _bets,
          allBets: _allBets,
          balance: _balance,
          xp: _xp,
          level: _level,
          rank: _rank,
          ...rest
        } = state;
        return rest;
      }
    }
  )
);

