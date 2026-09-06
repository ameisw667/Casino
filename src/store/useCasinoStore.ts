import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundManager, type SoundKey } from '@/lib/casino/sound-manager';
import { CasinoLogger } from '@/lib/casino/logger';
import { trackAllowedEvent, type GameType as AnalyticsGameType } from '@/lib/analytics/events';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { walletSnapshotSchema } from '@/lib/casino/wallet-contract';
import {
  applyAchievementProgress,
  type AchievementStatSnapshot,
} from '@/lib/casino/achievements-config';

import type { WalletSnapshot } from '@/lib/casino/wallet-contract';
import type { CasinoState, Bet, ProcessGameResultParams, OnboardingStep } from './slices/types';
import { createUISlice } from './slices/uiSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createHistorySlice } from './slices/historySlice';
import { createAchievementsSlice } from './slices/achievementsSlice';
import { createWalletSnapshotSlice } from './slices/walletSnapshotSlice';

export type { Achievement } from '@/lib/casino/achievements-config';
export type { Bet, Toast, CasinoState } from './slices/types';

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

// XP/level/rank are now applied asynchronously by the wallet_events outbox consumer
// (worldmap/05_OutboxWallet.md) instead of synchronously inside the settlement RPC response.
// This polls the existing balance endpoint for a few seconds after each bet until the applied
// value lands. A single interval is shared across rapid-fire bets (autobet) — each new bet just
// resets the remaining attempt budget instead of starting a second poller.
const XP_POLL_INTERVAL_MS = 1200;
const XP_POLL_MAX_ATTEMPTS = 5;
let xpPollTimer: ReturnType<typeof setInterval> | null = null;
let xpPollAttemptsLeft = 0;

function scheduleXpSync(): void {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return;
  xpPollAttemptsLeft = XP_POLL_MAX_ATTEMPTS;
  if (xpPollTimer) return;

  xpPollTimer = setInterval(() => {
    xpPollAttemptsLeft -= 1;
    fetch('/api/user/balance', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        const snapshot =
          raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data
            ? (raw as { data: unknown }).data
            : raw;
        if (snapshot)
          useCasinoStore.getState().applyServerWalletSnapshot(snapshot as WalletSnapshot);
      })
      .catch(() => {});

    if (xpPollAttemptsLeft <= 0 && xpPollTimer) {
      clearInterval(xpPollTimer);
      xpPollTimer = null;
    }
  }, XP_POLL_INTERVAL_MS);
}

// Per-game win/loss sound keys (worldmap/05_1.6_sounddesign.md §3). CRASH's loss entry is
// intentionally null — its loss sound already plays at the visual crash moment
// (createExplosion() in crash/page.tsx, before server settlement confirms), so playing a
// second sound here would be redundant and out of sync.
const GAME_RESULT_SOUNDS: Record<string, { win: SoundKey; loss: SoundKey | null }> = {
  DICE: { win: 'dice-win', loss: 'dice-loss' },
  SLOTS: { win: 'slots-win', loss: 'slots-loss' },
  ROULETTE: { win: 'roulette-win', loss: 'roulette-loss' },
  CRASH: { win: 'crash-win', loss: null },
  BLACKJACK: { win: 'blackjack-win', loss: 'blackjack-loss' },
};

// Guards the `game as AnalyticsGameType` cast below: a future new game (or any unexpected
// string) fails this check explicitly instead of silently no-op'ing deep inside
// trackAllowedEvent()'s own Zod validation (code-review finding).
const ANALYTICS_GAME_TYPES: readonly AnalyticsGameType[] = [
  'DICE',
  'SLOTS',
  'ROULETTE',
  'CRASH',
  'BLACKJACK',
];

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get, api) => ({
      ...createUISlice(set, get, api),
      ...createSettingsSlice(set, get, api),
      ...createHistorySlice(set, get, api),
      ...createAchievementsSlice(set, get, api),
      ...createWalletSnapshotSlice(set, get, api),

      applyServerWalletSnapshot: (snapshot: WalletSnapshot | { data: WalletSnapshot }) => {
        const raw =
          snapshot && typeof snapshot === 'object' && 'data' in snapshot && snapshot.data
            ? (snapshot as { data: WalletSnapshot }).data
            : snapshot;
        const verified = walletSnapshotSchema.parse(raw);
        set({
          balance: verified.balance,
          xp: verified.xp,
          level: verified.level,
          rank: verified.rank,
        });
      },

      processGameResult: (params: ProcessGameResultParams) => {
        const { game, amount, multiplier, payout, win, resultId, crashMultiplier, isFirstBet } =
          params;
        const config = get().gameConfig;

        // --- 1. Validation & Security ---
        if (
          typeof amount !== 'number' ||
          isNaN(amount) ||
          amount < 0 ||
          amount > config.limits.betMax
        ) {
          CasinoLogger.error(
            'CasinoCore',
            `SECURITY ALERT: Invalid bet amount detected: ${amount}`,
          );
          return;
        }
        if (typeof payout !== 'number' || isNaN(payout) || payout < 0) {
          CasinoLogger.error('CasinoCore', `SECURITY ALERT: Invalid payout detected: ${payout}`);
          return;
        }
        if (!UUID_PATTERN.test(resultId)) {
          CasinoLogger.error(
            'CasinoCore',
            'SECURITY ALERT: Missing or invalid canonical result ID',
          );
          return;
        }

        if (processedResultIds.has(resultId)) return;
        rememberProcessedResultId(resultId);
        scheduleXpSync();

        // Additive analytics signal only (2.9) — outside set() since trackAllowedEvent() is
        // async; the resultId dedup guard above already ensures this fires at most once per
        // settlement. Explicitly validated against ANALYTICS_GAME_TYPES before the cast, so an
        // unexpected `game` value is a deliberate no-op here, not a silent drop inside
        // trackAllowedEvent()'s own Zod validation.
        if (isFirstBet && (ANALYTICS_GAME_TYPES as readonly string[]).includes(game)) {
          void trackAllowedEvent({
            name: 'first_game_started',
            props: { game: game as AnalyticsGameType },
          });
        }

        set((state) => {
          // --- 1. Audio Feedback ---
          if (state.soundEnabled) {
            const gameSounds = GAME_RESULT_SOUNDS[game];
            const soundKey = win
              ? (gameSounds?.win ?? 'win')
              : gameSounds
                ? gameSounds.loss
                : 'loss';
            if (soundKey) soundManager.play(soundKey);
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
            win,
          };
          const newBets = [newBet, ...state.bets].slice(0, 50);

          let crashHistoryUpdate = {};
          if (game === 'CRASH' && crashMultiplier !== undefined && crashMultiplier !== null) {
            crashHistoryUpdate = {
              crashHistory: [crashMultiplier, ...state.crashHistory].slice(0, 50),
            };
          } else if (
            game === 'CRASH_MULTIPLAYER' &&
            crashMultiplier !== undefined &&
            crashMultiplier !== null
          ) {
            crashHistoryUpdate = {
              multiplayerCrashHistory: [crashMultiplier, ...state.multiplayerCrashHistory].slice(
                0,
                50,
              ),
            };
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
          const prevGameStats = state.gameStats[game] || {
            totalBets: 0,
            wins: 0,
            losses: 0,
            profit: 0,
          };
          const updatedGameStats = {
            ...state.gameStats,
            [game]: {
              totalBets: prevGameStats.totalBets + 1,
              wins: win ? prevGameStats.wins + 1 : prevGameStats.wins,
              losses: win ? prevGameStats.losses : prevGameStats.losses + 1,
              profit: prevGameStats.profit + (win ? payout - amount : -amount),
            },
          };

          // --- 7. Achievements (declarative condition engine, see achievements-config.ts) ---
          const totalBetsCount = Object.values(updatedGameStats).reduce(
            (sum, stats) => sum + stats.totalBets,
            0,
          );
          const newWinStreak = win ? state.currentWinStreak + 1 : 0;
          const statSnapshot: AchievementStatSnapshot = {
            game,
            betAmount: amount,
            payout,
            win,
            multiplier,
            level: newLevel,
            totalBetsCount,
            winStreak: newWinStreak,
          };
          const newAchievements = applyAchievementProgress(
            state.achievements,
            state.achievementConfigs,
            statSnapshot,
          );

          if (typeof window !== 'undefined' && typeof fetch === 'function') {
            const prevById = new Map(state.achievements.map((ach) => [ach.id, ach]));
            for (const ach of newAchievements) {
              const prev = prevById.get(ach.id);
              if (!prev || (prev.unlocked === ach.unlocked && prev.progress === ach.progress)) {
                continue;
              }
              try {
                const res = fetch('/api/user/stats', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    achievementId: ach.id,
                    progress: ach.progress,
                    unlocked: ach.unlocked,
                  }),
                });
                if (res && typeof res.catch === 'function') res.catch(() => {});
              } catch {}
            }
          }

          return {
            bets: newBets,
            achievements: newAchievements,
            currentWinStreak: newWinStreak,
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
                time: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
                isWin: win,
              },
              ...state.allBets,
            ].slice(0, 30),
            ...crashHistoryUpdate,
          };
        });
      },

      initialize: async () => {
        try {
          const [walletRes, statsRes, seedsRes, communityRes, chatRes] = await Promise.all([
            fetch('/api/user/balance', { cache: 'no-store' }),
            fetch('/api/user/stats', { cache: 'no-store' }).catch(() => null),
            fetch('/api/casino/seeds', { cache: 'no-store' }).catch(() => null),
            fetch('/api/community', { cache: 'no-store' }).catch(() => null),
            fetch('/api/chat', { cache: 'no-store' }).catch(() => null),
          ]);

          const isWalletHtml = walletRes.headers?.get?.('content-type')?.includes('text/html');
          if (walletRes.ok && !isWalletHtml) {
            const rawWallet = await walletRes.json();
            const walletData = rawWallet?.data ?? rawWallet;
            get().applyServerWalletSnapshot(walletData);
          }

          const isStatsHtml = statsRes?.headers?.get?.('content-type')?.includes('text/html');
          if (statsRes && statsRes.ok && !isStatsHtml) {
            const rawStats = await statsRes.json();
            const statsData = (rawStats?.data ?? rawStats) as {
              achievements?: Parameters<CasinoState['mergeServerAchievements']>[0];
            };
            if (statsData?.achievements) {
              get().mergeServerAchievements(statsData.achievements);
            }
          }

          const isSeedsHtml = seedsRes?.headers?.get?.('content-type')?.includes('text/html');
          if (seedsRes && seedsRes.ok && !isSeedsHtml) {
            const rawSeeds = await seedsRes.json();
            const seedsData = rawSeeds?.data ?? rawSeeds;
            if (seedsData?.clientSeed && seedsData?.serverSeedHash !== undefined) {
              set({
                provablyFairSettings: {
                  clientSeed: seedsData.clientSeed,
                  serverSeedHash: seedsData.serverSeedHash,
                  nonce: seedsData.nonce ?? 0,
                },
              });
            }
          }

          const isCommunityHtml = communityRes?.headers
            ?.get?.('content-type')
            ?.includes('text/html');
          if (communityRes && communityRes.ok && !isCommunityHtml) {
            const rawComm = await communityRes.json();
            const commData = rawComm?.data ?? rawComm;
            if (commData?.communityWagered !== undefined) {
              set({
                communityWagered: Number(commData.communityWagered) || 0,
                communityGoal: Number(commData.communityGoal) || 25000.0,
                communityGoalReached: Boolean(commData.communityGoalReached),
              });
            }
          }

          const isChatHtml = chatRes?.headers?.get?.('content-type')?.includes('text/html');
          if (chatRes && chatRes.ok && !isChatHtml) {
            const rawChat = await chatRes.json();
            const chatData = rawChat?.data ?? rawChat;
            if (Array.isArray(chatData?.messages) && chatData.messages.length > 0) {
              set({ chatMessages: chatData.messages });
            }
          }
        } catch (error) {
          CasinoLogger.error('STORE', 'Server wallet initialization failed closed', error);
        }
      },

      redeemCode: async (code: string) => {
        try {
          const idempotencyKey = crypto.randomUUID();
          const response = await fetch('/api/casino/redeem-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify({ code }),
          });

          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            const msg = 'Invalid response from server';
            get().addToast(msg, 'error');
            return { success: false, message: msg };
          }

          const raw = await response.json();
          const data = raw?.data ?? raw;
          if (!response.ok || !data.success) {
            const errMsg = getApiErrorMessage(data, 'Invalid promo code');
            get().addToast(errMsg, 'error');
            return { success: false, message: errMsg };
          }

          if (data.snapshot) {
            get().applyServerWalletSnapshot(data.snapshot);
          }

          get().addToast(data.message || 'Voucher code redeemed successfully!', 'success');
          return { success: true, message: data.message };
        } catch (error) {
          CasinoLogger.error('STORE', 'Voucher redemption failed', error);
          const msg = 'Failed to redeem voucher code';
          get().addToast(msg, 'error');
          return { success: false, message: msg };
        }
      },
    }),

    {
      name: 'casino-storage',
      skipHydration: true,
      version: 4,
      migrate: (persistedState) => {
        const migrated = {
          ...(persistedState as Partial<CasinoState> & {
            processedResultIds?: string[];
            onboardingStep?: OnboardingStep;
          }),
        };
        // v4: Der tote Zwischenschritt OPEN_CASE wurde entfernt. Persistierte
        // Alt-Stände werden auf COMPLETED normalisiert, sonst würde kein
        // Onboarding-Rendering mehr greifen und der Flow bliebe unsichtbar hängen.
        // Vergleich über string, da der neue Union-Typ OPEN_CASE nicht mehr kennt.
        if ((migrated.onboardingStep as string | undefined) === 'OPEN_CASE') {
          migrated.onboardingStep = 'COMPLETED';
        }
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
          achievementConfigs: _ac,
          bets: _bets,
          allBets: _allBets,
          balance: _balance,
          xp: _xp,
          level: _level,
          rank: _rank,
          ...rest
        } = state;
        return rest;
      },
    },
  ),
);

// --- Memoized Selectors (Zustand 5 useShallow) to eliminate component re-renders ---
export const useWalletBalance = () =>
  useCasinoStore((s) => ({
    balance: s.balance,
    hideBalance: s.hideBalance,
  }));

export const useVipRankInfo = () =>
  useCasinoStore((s) => ({
    level: s.level,
    xp: s.xp,
    rank: s.rank,
    vipTiers: s.vipTiers,
  }));

export const useSoundSettings = () =>
  useCasinoStore((s) => ({
    soundEnabled: s.soundEnabled,
    soundVolume: s.soundVolume,
    toggleSound: s.toggleSound,
    updateSettings: s.updateSettings,
  }));
