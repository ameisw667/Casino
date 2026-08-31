/**
 * Local, synchronous mirrors of the ProvablyFairEngine outcome transformations.
 * The distributions are identical to src/lib/casino/provably-fair.ts:
 * the HMAC only compresses (seed, clientSeed, nonce) into a uniform u in [0,1),
 * after which the same pure transformation produces the roll. Keeping the
 * transformation in one place lets tests verify the 1:1 mirror behavior.
 */

export function rollDiceOutcome(u: number): number {
  return Math.floor(u * 10001) / 100;
}

export function rollCrashMultiplier(u: number, houseEdge: number): number {
  if (u < houseEdge) return 1.0;
  const multiplier = (1 - houseEdge) / (1 - u);
  return Math.max(1.0, Math.floor(multiplier * 100) / 100);
}

export function rollRouletteNumber(u: number): number {
  return Math.floor(u * 37);
}

export function rollSlotsSymbols(u: number[], reelCount = 5, symbolsPerReel = 8): number[] {
  return u.slice(0, reelCount).map((value) => Math.floor(value * symbolsPerReel));
}
