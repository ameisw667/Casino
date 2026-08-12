import { ProvablyFairEngine } from './provably-fair';

export type VerifiableGame = 'dice' | 'crash' | 'roulette' | 'slots' | 'blackjack';

export interface SeedHistoryVerificationInput {
  game: VerifiableGame;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export interface SeedHistoryVerificationResult {
  hashVerified: boolean;
  hmac: string | null;
  computedOutcome: string | null;
}

export async function verifySeedHistoryEntry(
  input: SeedHistoryVerificationInput,
): Promise<SeedHistoryVerificationResult> {
  const hashVerified = await ProvablyFairEngine.verifyHash(input.serverSeed, input.serverSeedHash);
  if (!hashVerified) {
    return { hashVerified: false, hmac: null, computedOutcome: null };
  }

  const { hash: hmac } = await ProvablyFairEngine.calculateOutcome(
    input.serverSeed,
    input.clientSeed,
    input.nonce,
  );

  let computedOutcome: string;
  switch (input.game) {
    case 'dice':
      computedOutcome = `Dice Roll: ${(await ProvablyFairEngine.getDiceRoll(input.serverSeed, input.clientSeed, input.nonce)).toFixed(2)}`;
      break;
    case 'crash':
      computedOutcome = `Crash Multiplier: ${(await ProvablyFairEngine.getCrashMultiplier(input.serverSeed, input.clientSeed, input.nonce)).toFixed(2)}x`;
      break;
    case 'roulette':
      computedOutcome = `Roulette Number: ${await ProvablyFairEngine.getRouletteNumber(input.serverSeed, input.clientSeed, input.nonce)}`;
      break;
    case 'slots':
      computedOutcome = `Slot Reels: [${(await ProvablyFairEngine.getSlotsResult(input.serverSeed, input.clientSeed, input.nonce)).join(', ')}]`;
      break;
    case 'blackjack':
      computedOutcome = `Blackjack Deck Hash: [${(await ProvablyFairEngine.getBlackjackDeal(input.serverSeed, input.clientSeed, input.nonce)).slice(0, 4).join(', ')}...]`;
      break;
  }

  return { hashVerified: true, hmac, computedOutcome };
}
