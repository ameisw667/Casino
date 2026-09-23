import { z } from 'zod';
import type { DailyRaceSnapshot } from './daily-race';

export const walletSnapshotSchema = z.object({
  balance: z.number().finite().nonnegative(),
  xp: z.number().int().nonnegative(),
  level: z.number().int().min(1),
  rank: z.string().min(1).max(64),
  transactionId: z.string().uuid(),
});

export type WalletSnapshot = z.infer<typeof walletSnapshotSchema>;

export const settledGameResultSchema = z.object({
  resultId: z.string().uuid(),
  game: z.enum(['DICE', 'ROULETTE', 'SLOTS', 'CRASH', 'BLACKJACK']),
  amount: z.number().finite().positive(),
  multiplier: z.number().finite().nonnegative(),
  payout: z.number().finite().nonnegative(),
  win: z.boolean(),
  replayed: z.boolean(),
  wallet: walletSnapshotSchema,
});

export type SettledGameResult = z.infer<typeof settledGameResultSchema>;

// ── Domänen-Verträge (03c-W3 L1, 2026-09-18) ──
// `WalletService` bleibt die eine Fassade für alle Importeure; diese Interfaces beschreiben den
// statischen Vertrag je Domäne. Die vier Domänen-Module (wallet-social / -seeds / -gamification /
// -promo) sind mit ihrem Interface annotiert, der Geld-Kern über `WalletServiceContract` —
// ein verlorenes oder in der Signatur gedriftetes Verfahren bricht damit `npm run typecheck`
// statt erst den aufrufenden Endpunkt.

export type WalletSettlement = WalletSnapshot & {
  result: unknown;
  replayed: boolean;
};

export type GameRoundStart = WalletSnapshot & {
  roundId: string;
  state: unknown;
  version: number;
  replayed: boolean;
};

export type ActiveRoundView = {
  betAmount: number;
  state: Record<string, unknown>;
  version: number;
};

export type BlackjackActionView = WalletSnapshot & {
  state: unknown;
  version: number;
  settled: boolean;
};

export type GameActiveRoundView = {
  hasActiveRound: boolean;
  roundId?: string;
  requestId?: string;
  betAmount?: number;
  state?: Record<string, unknown>;
  version?: number;
};

export type CrashRoundParticipant = {
  userId: string;
  betAmount: number;
  status: 'ACTIVE' | 'SETTLED';
  state: Record<string, unknown>;
};

export type ConsumedSeed = {
  serverSeed: string;
  serverSeedHash: string;
  nonce: number;
  replayed: boolean;
};

export type UserSeedChain = {
  clientSeed: string;
  serverSeedHash: string;
  nonce: number;
};

export type RotatedSeed = UserSeedChain & {
  revealedSeed: string | null;
  revealedSeedHash: string | null;
};

export type SeedHistoryEntry = {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonceAtRotation: number;
  rotatedAt: string;
};

export type ChatMessage = {
  id: string;
  user: string;
  rank: string;
  message: string;
  time: string;
  isSystem?: boolean;
  isWin?: boolean;
};

export type CommunityStats = {
  communityWagered: number;
  communityGoal: number;
  communityGoalReached: boolean;
};

export type UserStatsAchievement = {
  id: string;
  unlocked: boolean;
  progress: number;
};

export type UserStatsPerGame = {
  game: string;
  bets: number;
  wins: number;
  wagered: number;
  payout: number;
  profit: number;
  winRate: number;
};

export type UserStats = {
  totalBets: number;
  totalWins: number;
  totalWagered: number;
  totalPayout: number;
  totalProfit: number;
  winRate: number;
  achievements: UserStatsAchievement[];
  perGame: UserStatsPerGame[];
};

export type PromoRedemption =
  { ok: true; amount: number; snapshot: WalletSnapshot } | { ok: false; code: string };

export type PromoReversal =
  | { ok: true; amount: number; shortfall: number; replayed: boolean; snapshot: WalletSnapshot }
  | { ok: false; code: string };

export interface WalletCoreContract {
  getWallet(userId: string): Promise<WalletSnapshot>;
  settleBet(params: {
    userId: string;
    requestId: string;
    resultId: string;
    game: 'DICE' | 'ROULETTE' | 'SLOTS';
    amount: number;
    payout: number;
    xpGain: number;
    result: Record<string, unknown>;
    serverSeedHash?: string;
    nonce?: number;
  }): Promise<WalletSettlement>;
  startRound(params: {
    userId: string;
    requestId: string;
    game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER';
    amount: number;
    state: Record<string, unknown>;
  }): Promise<GameRoundStart>;
  getActiveRound(
    userId: string,
    roundId: string,
    game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER',
  ): Promise<ActiveRoundView>;
  settleRound(params: {
    userId: string;
    roundId: string;
    requestId: string;
    resultId: string;
    payout: number;
    xpGain: number;
    result: Record<string, unknown>;
  }): Promise<WalletSettlement>;
  advanceBlackjackRound(params: {
    userId: string;
    roundId: string;
    requestId: string;
    resultId: string;
    expectedVersion: number;
    state: Record<string, unknown>;
    additionalBet: number;
    settled: boolean;
    payout: number;
    xpGain: number;
    result: Record<string, unknown>;
  }): Promise<BlackjackActionView>;
}

export interface CrashRoundContract {
  autoReconcileStaleCrashRound(userId: string): Promise<boolean>;
  computeRoundJackpotRoll(
    state: Record<string, unknown>,
    nonce: number,
  ): Promise<number | undefined>;
  getGameActiveRound(params: {
    userId: string;
    game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER';
  }): Promise<GameActiveRoundView>;
  linkCrashRound(roundId: string, crashRoundId: string): Promise<void>;
  getCrashRoundParticipants(crashRoundId: string): Promise<CrashRoundParticipant[]>;
}

export interface ProvablyFairSeedContract {
  consumeActiveSeed(params: { userId: string; requestId: string }): Promise<ConsumedSeed>;
  getUserSeeds(userId: string): Promise<UserSeedChain>;
  rotateUserSeed(params: { userId: string; clientSeed: string }): Promise<RotatedSeed>;
  getSeedHistory(userId: string): Promise<SeedHistoryEntry[]>;
}

export interface PromoCodeContract {
  redeemPromoCode(params: {
    userId: string;
    code: string;
    requestId: string;
  }): Promise<PromoRedemption>;
  reversePromoCode(params: {
    actorId: string;
    userId: string;
    code: string;
    requestId: string;
    reason: string;
  }): Promise<PromoReversal>;
}

export interface GamificationContract {
  getUserStats(userId: string): Promise<UserStats>;
  syncAchievement(params: {
    userId: string;
    achievementId: string;
    progress: number;
    unlocked: boolean;
  }): Promise<void>;
  getJackpotPool(): Promise<{ currentAmount: number; lastWonAt: string | null }>;
  getDailyRaceStandings(): Promise<DailyRaceSnapshot>;
  emitBigWinNotifyEvent(params: {
    userId: string;
    requestId: string;
    game: string;
    payout: number;
    multiplier: number;
  }): Promise<void>;
}

export interface SocialChatContract {
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  postChatMessage(params: { userId: string; message: string }): Promise<ChatMessage>;
  getCommunityStats(): Promise<CommunityStats>;
}

export interface WalletAnalyticsContract {
  isFirstEverBet(userId: string): Promise<boolean>;
}

export type WalletServiceContract = WalletCoreContract &
  CrashRoundContract &
  ProvablyFairSeedContract &
  PromoCodeContract &
  GamificationContract &
  SocialChatContract &
  WalletAnalyticsContract;
