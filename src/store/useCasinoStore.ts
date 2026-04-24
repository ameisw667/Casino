import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  onboardingStep: 'NONE' | 'WELCOME' | 'LOGIN' | 'TOUR_VAULT' | 'OPEN_CASE' | 'COMPLETED';
  
  // Actions
  setIsMobile: (isMobile: boolean) => void;
  startOnboarding: () => void;
  setOnboardingStep: (step: 'NONE' | 'WELCOME' | 'LOGIN' | 'TOUR_VAULT' | 'OPEN_CASE' | 'COMPLETED') => void;
  addBalance: (amount: number) => void;
  removeBalance: (amount: number) => boolean;
  addBet: (bet: Bet) => void;
  calculateXp: (wager: number) => void;
  addCrashHistory: (multiplier: number) => void;
  setProvablyFairSettings: (settings: Partial<CasinoState['provablyFairSettings']>) => void;
  unlockAchievement: (id: string) => void;
  claimDailyReward: () => number | null;
  updateChallenge: (type: Challenge['type'], value: number) => void;
  claimChallenge: (id: string) => void;
  claimRakeback: () => number;
  openCase: () => { reward: number, type: 'balance' | 'xp' };
  addToast: (msg: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const RANKS = [
  { name: 'Bronze', minLevel: 1, color: '#CD7F32', rakeback: 0.01, perks: ['Daily Missions', 'Basic Rakeback'] },
  { name: 'Silver', minLevel: 10, color: '#C0C0C0', rakeback: 0.012, perks: ['Priority Support', 'Enhanced Rakeback'] },
  { name: 'Gold', minLevel: 25, color: '#FFD700', rakeback: 0.015, perks: ['Private Access', 'Weekly Bonuses'] },
  { name: 'Platinum', minLevel: 50, color: '#E5E4E2', rakeback: 0.018, perks: ['VIP Manager', 'Custom Cases'] },
  { name: 'Diamond', minLevel: 100, color: '#B9F2FF', rakeback: 0.02, perks: ['Instant Withdrawals', 'Global Recognition'] },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_bet', title: 'First Steps', description: 'Place your first bet', icon: '🎯', unlocked: false, progress: 0, total: 1 },
  { id: 'high_roller', title: 'High Roller', description: 'Wager $1,000 in a single bet', icon: '🐋', unlocked: false, progress: 0, total: 1000 },
  { id: 'lucky_streak', title: 'Lucky Streak', description: 'Win 5 times in a row', icon: '🔥', unlocked: false, progress: 0, total: 5 },
  { id: 'moon_shot', title: 'Moon Shot', description: 'Hit a 10x multiplier in Crash', icon: '🚀', unlocked: false, progress: 0, total: 10 },
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
      onboardingStep: 'NONE',

      setIsMobile: (isMobile) => set({ isMobile }),
      
      startOnboarding: () => set({ onboardingStep: 'WELCOME' }),
      
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),

      removeBalance: (amount) => {
        const currentBalance = get().balance;
        if (currentBalance < amount) return false;
        set((state) => ({ balance: state.balance - amount }));
        return true;
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
        const rakebackRate = currentRank.rakeback;
        set((state) => ({ rakebackPool: state.rakebackPool + bet.amount * rakebackRate }));
      },

      calculateXp: (wager) => set((state) => {
        const newXp = state.xp + wager * 10;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        
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

      claimDailyReward: () => {
        const now = new Date();
        const lastClaimed = get().dailyRewardLastClaimed;
        
        if (lastClaimed) {
          const lastDate = new Date(lastClaimed);
          if (now.toDateString() === lastDate.toDateString()) return null;
        }

        const reward = 50 + (get().level * 10);
        set((state) => ({
          balance: state.balance + reward,
          dailyRewardLastClaimed: now.toISOString(),
          streak: state.streak + 1
        }));
        return reward;
      },

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

      claimRakeback: () => {
        const amount = get().rakebackPool;
        if (amount <= 0) return 0;
        set((state) => ({
          balance: state.balance + amount,
          rakebackPool: 0
        }));
        return amount;
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
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, message, type, duration };
        
        setTimeout(() => {
          get().removeToast(id);
        }, duration);

        return { toasts: [...state.toasts, newToast] };
      }),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),
    }),
    {
      name: 'casino-storage',
    }
  )
);
