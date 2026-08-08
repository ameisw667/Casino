import { z } from 'zod';

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
