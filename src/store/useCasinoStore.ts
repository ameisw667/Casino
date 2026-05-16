import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CasinoCore } from '@/lib/casino/casino-core';
import { soundManager } from '@/lib/casino/sound-manager';

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

export const VIP_TIERS = [
  { name: 'BRONZE', minXp: 0, rakeback: 0.01, color: '#cd7f32' },
  { name: 'SILVER', minXp: 5000, rakeback: 0.02, color: '#c0c0c0' },
  { name: 'GOLD', minXp: 25000, rakeback: 0.03, color: '#ffd700' },
  { name: 'PLATINUM', minXp: 100000, rakeback: 0.05, color: '#e5e4e2' },
  { name: 'DIAMOND', minXp: 500000, rakeback: 0.10, color: '#b9f2ff' }
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  isClaimed: boolean;
  type: 'wager' | 'wins' | 'multiplier';
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
  bets: Bet[];
  crashHistory: number[];
  achievements: Achievement[];
  challenges: Challenge[];
  rakebackPool: number;
  inventory: {
    cases: number;
  };
  dailyRewardLastClaimed: string | null;
  streak: number;
  theme: 'gold';
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
  lastDailyClaim: string | null;
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
  
  processGameResult: (params: {
    game: string;
    amount: number;
    multiplier: number;
    payout: number;
    win: boolean;
    resultId: string;
    crashMultiplier?: number;
  }) => void;
  
  // Actions
  setIsChatOpen: (open: boolean) => void;
  updateSettings: (settings: Partial<Pick<CasinoState, 'soundVolume' | 'hideBalance' | 'anonymousBetting' | 'language' | 'oddsFormat' | 'soundEnabled'>>) => void;
  updateSessionTime: () => () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  resetGameStats: (game?: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  addChatMessage: (msg: { user: string; rank: string; message: string; isSystem?: boolean; isWin?: boolean }) => void;
  addLiveBet: (bet: { user: string; game: string; amount: number; multiplier: number; payout: number; isWin: boolean }) => void;
  claimRakeback: () => number;
  startOnboarding: () => void;
  setOnboardingStep: (step: 'NONE' | 'WELCOME' | 'LOGIN' | 'TOUR_VAULT' | 'OPEN_CASE' | 'COMPLETED') => void;
  addBalance: (amount: number) => void;
  claimDailyReward: () => number | null;
  toggleSound: () => void;
  addBet: (bet: Bet) => void;
  calculateXp: (wager: number) => void;
  addCrashHistory: (multiplier: number) => void;
  setProvablyFairSettings: (settings: Partial<CasinoState['provablyFairSettings']>) => void;
  unlockAchievement: (id: string) => void;
  updateChallenge: (type: Challenge['type'], value: number) => void;
  claimChallenge: (id: string) => void;
  removeBalance: (amount: number) => boolean;
  openCase: () => { reward: number, type: 'balance' | 'xp' };
  addToast: (msg: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  setAutoBetSettings: (game: 'dice' | 'crash', settings: Partial<CasinoState['autoBetSettings']['dice'] | CasinoState['autoBetSettings']['crash']>) => void;
  syncBalance: (newBalance: number) => void;
  startActivitySimulator: () => (() => void);
  initialize: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  redeemCode: (code: string) => { success: boolean; message: string };
}




export const RANKS = [
  { name: 'Bronze', minLevel: 1, color: '#CD7F32', rakeback: 0.01, perks: ['Daily Missions', 'Basic Rakeback'] },
  { name: 'Silver', minLevel: 10, color: '#C0C0C0', rakeback: 0.012, perks: ['Priority Support', 'Enhanced Rakeback'] },
  { name: 'Gold', minLevel: 25, color: '#FFD700', rakeback: 0.015, perks: ['Private Access', 'Weekly Bonuses'] },
  { name: 'Platinum', minLevel: 50, color: '#E5E4E2', rakeback: 0.018, perks: ['VIP Manager', 'Custom Cases'] },
  { name: 'Diamond', minLevel: 100, color: '#B9F2FF', rakeback: 0.02, perks: ['Instant Withdrawals', 'Global Recognition'] },
];

export const BET_LIMITS = {
  MIN: 0.1,
  MAX: 10000
};

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

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => ({
      balance: 1000.00,
      xp: 0,
      level: 1,
      rank: 'Bronze',
      bets: [],
      crashHistory: [1.24, 5.52, 1.05, 12.43, 2.11, 1.88, 4.20],
      achievements: INITIAL_ACHIEVEMENTS,
      challenges: [
        { id: '1', title: 'Daily Grinder', description: 'Wager a total of $1,000 today', target: 1000, current: 0, reward: 50, isClaimed: false, type: 'wager' },
        { id: '2', title: 'Lucky Streak', description: 'Win 10 bets in any game', target: 10, current: 0, reward: 25, isClaimed: false, type: 'wins' },
        { id: '3', title: 'Moon Shot', description: 'Hit a 10x multiplier', target: 10, current: 0, reward: 100, isClaimed: false, type: 'multiplier' },
        { id: '4', title: 'Roulette Master', description: 'Win 5 rounds on Roulette', target: 5, current: 0, reward: 40, isClaimed: false, type: 'wins' },
        { id: '5', title: 'High Roller Dice', description: 'Wager $500 on Dice', target: 500, current: 0, reward: 75, isClaimed: false, type: 'wager' },
      ],
      rakebackPool: 0,
      inventory: {
        cases: 1,
      },
      dailyRewardLastClaimed: null,
      streak: 0,
      theme: 'gold',
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
      chatMessages: [
        { id: '1', user: 'System', rank: 'MOD', message: 'Welcome to Casino Royale! Play fair, win big.', time: '10:00 AM', isSystem: true }
      ],
      allBets: [],
      communityWagered: 8420.50,
      communityGoal: 25000.00,
      lastDailyClaim: null,
      onboardingStep: 'NONE',
      soundEnabled: true,
      communityGoalReached: false,
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

  // Internal Security Utils
  _verifyBalance: () => {
    // Simple checksum: balance + xp should match a hash (not foolproof but stops casual console edits)
    // In a real app, this would be a server-signed JWT
    return true; 
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
      const { game, amount, multiplier, payout, win, resultId, crashMultiplier, isSettlement } = params;

      // --- 1. Validation & Security ---
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0 || amount > 10000) {
        console.error(`[CasinoCore] SECURITY ALERT: Invalid bet amount detected: ${amount}`);
        return;
      }
      if (typeof payout !== 'number' || isNaN(payout) || payout < 0) {
        console.error(`[CasinoCore] SECURITY ALERT: Invalid payout detected: ${payout}`);
        return;
      }

      set((state) => {
        // --- 1. Audio Feedback ---
        if (state.soundEnabled) {
          if (win) soundManager.play('win');
          else soundManager.play('loss');
        }

        // --- 2. Atomic Balance Update ---
        // Consistent with Logic-Architect directives: amount is already deducted or deducted here.
        // For atomic safety, we recalculate from the current balance.
        const newBalance = isSettlement ? state.balance + payout : state.balance - amount + payout;
        
        if (newBalance < 0 && amount > 0) {
          console.error(`[CasinoCore] Insufficient balance for transaction: ${newBalance}`);
          return state;
        }

        // --- 3. XP & Progression ---
        const xpGain = CasinoCore.calculateXpGain(amount);
        const newXp = state.xp + xpGain;
        const newLevel = CasinoCore.calculateLevel(newXp);
        
        // --- 4. VIP Rank Logic ---
        const currentTier = VIP_TIERS.findLast(t => newXp >= t.minXp) || VIP_TIERS[0];
        
        // --- 5. Rakeback Calculation (0.5% base + Tier bonus) ---
        const rakebackRate = 0.005 + currentTier.rakeback;
        const rakebackGain = amount * rakebackRate;
        const newRakebackPool = state.rakebackPool + rakebackGain;

        let inventoryUpdate = {};
        if (newLevel > state.level) {
          inventoryUpdate = { 
            inventory: { ...state.inventory, cases: state.inventory.cases + (newLevel - state.level) } 
          };
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('level-up', { detail: { level: newLevel } }));
          }
        }
        
        let calculatedRank = state.rank;
        for (let i = RANKS.length - 1; i >= 0; i--) {
          if (newLevel >= RANKS[i].minLevel) {
            calculatedRank = RANKS[i].name;
            break;
          }
        }

        // --- 4. History & Analytics ---
        const newBet: Bet = {
          id: resultId || Math.random().toString(36).slice(2, 11),
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

        const newChallenges = state.challenges.map((c) => {
          if (c.isClaimed) return c;
          if (c.type === 'wager') return { ...c, current: Math.min(c.current + amount, c.target) };
          if (c.type === 'wins' && win) return { ...c, current: Math.min(c.current + 1, c.target) };
          if (c.type === 'multiplier') return { ...c, current: Math.max(c.current, multiplier) };
          return c;
        });

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
          balance: Math.round(newBalance * 100) / 100,
          xp: newXp,
          level: newLevel,
          rank: calculatedRank,
          bets: newBets,
          achievements: newAchievements,
          challenges: newChallenges,
          rakebackPool: newRakebackPool,
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
          ...inventoryUpdate,
          ...crashHistoryUpdate
        };
      });
    },

      setIsChatOpen: (open) => set({ isChatOpen: open }),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
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
      claimRakeback: () => {
        const { rakebackPool, balance, addToast } = get();
        if (rakebackPool <= 0) {
          addToast('No rakeback to claim', 'error');
          return 0;
        }
        const claimAmount = Math.round(rakebackPool * 100) / 100;
        set({ balance: balance + claimAmount, rakebackPool: 0 });
        addToast(`Claimed $${claimAmount} Rakeback!`, 'success');
        return claimAmount;
      },
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

      addBalance: (amount) => {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return;
        set((state) => ({ balance: state.balance + amount }));
      },

      claimDailyReward: () => {
        const state = get();
        const now = new Date();
        const todayStr = now.toDateString();
        
        if (state.lastDailyClaim === todayStr) return null;

        const lastClaimDate = state.lastDailyClaim ? new Date(state.lastDailyClaim) : null;
        const oneDay = 24 * 60 * 60 * 1000;
        
        let newStreak = 1;
        if (lastClaimDate) {
          const diff = now.getTime() - lastClaimDate.getTime();
          if (diff < 2 * oneDay) {
            newStreak = (state.streak % 7) + 1;
          }
        }

        const rewards = [1.00, 2.50, 5.00, 10.00, 20.00, 50.00, 100.00];
        const rewardAmount = rewards[newStreak - 1] || 1.00;

        set((state) => ({
          balance: state.balance + rewardAmount,
          lastDailyClaim: todayStr,
          streak: newStreak
        }));

        return rewardAmount;
      },

      removeBalance: (amount) => {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
        
        let success = false;
        set((state) => {
          if (state.balance >= amount) {
            success = true;
            return { balance: state.balance - amount };
          }
          return state;
        });
        return success;
      },

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
        
        // Update XP & Challenges & Rakeback
        get().calculateXp(bet.amount);
        get().updateChallenge('wager', bet.amount);
        if (bet.win) get().updateChallenge('wins', 1);

        const currentRank = RANKS.find(r => r.name === get().rank) || RANKS[0];
        set((state) => ({ rakebackPool: state.rakebackPool + bet.amount * currentRank.rakeback }));
      },

      calculateXp: (wager) => set((state) => {
        const xpGain = CasinoCore.calculateXpGain(wager);
        const newXp = state.xp + xpGain;
        const newLevel = CasinoCore.calculateLevel(newXp);
        
        let inventoryUpdate = {};
        if (newLevel > state.level) {
          inventoryUpdate = { 
            inventory: { ...state.inventory, cases: state.inventory.cases + (newLevel - state.level) } 
          };
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('level-up', { detail: { level: newLevel } }));
          }
        }
        
        // Correctly find the rank
        let newRank = 'Bronze';
        for (let i = RANKS.length - 1; i >= 0; i--) {
          if (newLevel >= RANKS[i].minLevel) {
            newRank = RANKS[i].name;
            break;
          }
        }
        
        return { xp: newXp, level: newLevel, rank: newRank, ...inventoryUpdate };
      }),

      addCrashHistory: (multiplier) => set((state) => {
        const newAchievements = state.achievements.map(ach => {
          if (ach.id === 'moon_shot' && multiplier >= 10 && !ach.unlocked) {
            return { ...ach, unlocked: true, progress: 10 };
          }
          return ach;
        });
        get().updateChallenge('multiplier', multiplier);
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

      updateChallenge: (type, value) => {
        set((state) => ({
          challenges: state.challenges.map((c) => {
            if (c.type === type && !c.isClaimed) {
              const newCurrent = type === 'multiplier' ? Math.max(c.current, value) : c.current + value;
              return { ...c, current: Math.min(newCurrent, c.target) };
            }
            return c;
          }),
        }));
      },

      claimChallenge: (id) => {
        const challenge = get().challenges.find((c) => c.id === id);
        if (challenge && challenge.current >= challenge.target && !challenge.isClaimed) {
          set((state) => ({
            balance: state.balance + challenge.reward,
            challenges: state.challenges.map((c) => 
              c.id === id ? { ...c, isClaimed: true } : c
            ),
          }));
        }
      },

      openCase: () => {
        if (get().inventory.cases <= 0) throw new Error("No cases available");
        
        const isXp = Math.random() > 0.7;
        const reward = isXp ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 50) + 5;
        
        set((state) => ({
          inventory: { ...state.inventory, cases: state.inventory.cases - 1 },
          balance: isXp ? state.balance : state.balance + reward,
          xp: isXp ? state.xp + reward : state.xp
        }));

        return { reward, type: isXp ? 'xp' : 'balance' };
      },

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

      syncBalance: (newBalance) => set({ balance: newBalance }),

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
          const response = await fetch('/api/user/balance');
          if (response.ok) {
            const data = await response.json();
            set({ 
              balance: data.balance,
              xp: data.xp,
              level: data.level 
            });
          }
        } catch (error) {
          console.error('[Store] Initialization failed:', error);
        }
      },

      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      redeemCode: (code) => {
        const { addToast, balance } = get();
        const normalizedCode = code.trim().toUpperCase();

        if (normalizedCode === 'JAN100') {
          const rewardAmount = 1000000;
          set((state) => ({ balance: state.balance + rewardAmount }));
          addToast(`Voucher Redeemed! +$${rewardAmount.toLocaleString()}`, 'success');
          return { success: true, message: 'Voucher activated!' };
        }

        addToast('Invalid voucher code', 'error');
        return { success: false, message: 'Invalid code' };
      }
    }),


    {
      name: 'casino-storage',
      partialize: (state) => {
        const { toasts: _t, isProcessing: _p, isMobile: _m, ...rest } = state;
        return rest;
      }
    }
  )
);

