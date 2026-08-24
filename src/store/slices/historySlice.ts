import type { StateCreator } from 'zustand';
import type { CasinoState, HistorySlice } from './types';

export const createHistorySlice: StateCreator<CasinoState, [], [], HistorySlice> = (set, get) => ({
  bets: [],
  crashHistory: [1.24, 5.52, 1.05, 12.43, 2.11, 1.88, 4.2],
  multiplayerCrashHistory: [1.24, 5.52, 1.05, 12.43, 2.11, 1.88, 4.2],
  allBets: [],
  chatMessages: [
    {
      id: '1',
      user: 'System',
      rank: 'MOD',
      message: 'Welcome to Casino Royale! Play fair, win big.',
      time: '10:00 AM',
      isSystem: true,
    },
  ],
  communityWagered: 0,
  communityGoal: 25000.0,
  communityGoalReached: false,
  gameStats: {
    DICE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
    CRASH: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
    ROULETTE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
    SLOTS: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
  },
  analytics: {
    totalWagered: 0,
    totalPayout: 0,
    winRate: 0,
    totalSessionTime: 0,
    activityHeatmap: {},
  },

  addBet: (bet) => {
    set((state) => ({ bets: [bet, ...state.bets].slice(0, 50) }));
  },

  addCrashHistory: (multiplier) =>
    set((state) => ({
      crashHistory: [multiplier, ...state.crashHistory].slice(0, 50),
    })),

  addMultiplayerCrashHistory: (multiplier) =>
    set((state) => ({
      multiplayerCrashHistory: [multiplier, ...state.multiplayerCrashHistory].slice(0, 50),
    })),

  addLiveBet: (bet) =>
    set((state) => ({
      allBets: [
        {
          ...bet,
          id: Math.random().toString(36).substring(2, 9),
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
        ...state.allBets,
      ].slice(0, 30),
    })),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          ...msg,
          id: Math.random().toString(36).substring(2, 9),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ].slice(-50), // Keep last 50 messages
    })),

  resetGameStats: (game) =>
    set((state) => {
      if (game) {
        return {
          gameStats: {
            ...state.gameStats,
            [game]: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
          },
        };
      }
      return {
        gameStats: {
          DICE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
          CRASH: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
          ROULETTE: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
          SLOTS: { totalBets: 0, wins: 0, losses: 0, profit: 0 },
        },
      };
    }),

  updateSessionTime: () => {
    const interval = setInterval(() => {
      set((state) => ({
        analytics: {
          totalWagered: state.analytics?.totalWagered ?? 0,
          totalPayout: state.analytics?.totalPayout ?? 0,
          winRate: state.analytics?.winRate ?? 0,
          totalSessionTime: (state.analytics?.totalSessionTime ?? 0) + 1000,
          activityHeatmap: state.analytics?.activityHeatmap ?? {},
        },
      }));
    }, 1000);
    return () => clearInterval(interval);
  },

  startActivitySimulator: () => {
    if (typeof window === 'undefined') return () => {};

    const games = ['CRASH', 'DICE', 'ROULETTE', 'SLOTS'];
    const users = [
      'Satoshi',
      'Vitalik',
      'Elon',
      'CZ',
      'VibeCoder',
      'Neon_Sniper',
      'SarahSlot',
      'LazyJoe',
      'Bochmann88',
      'Alpha_Wolf',
      'Diamond_Hands',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const game = games[Math.floor(Math.random() * games.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const amount = Math.floor(Math.random() * 50) + 1;
        const multiplier = Math.random() > 0.3 ? Math.random() * 2 + 1.1 : 0;
        const isWin = multiplier > 0;
        const payout = isWin ? amount * multiplier : 0;

        get().addLiveBet({
          user,
          game,
          amount,
          multiplier,
          payout,
          isWin,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  },

  dismissMartingaleWarning: () => {
    set((state) => ({
      responsibleGaming: state.responsibleGaming
        ? { ...state.responsibleGaming, martingaleDetected: false }
        : state.responsibleGaming,
    }));
  },
});
