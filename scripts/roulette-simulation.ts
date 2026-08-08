/**
 * Standalone simulation for /games/roulette.
 * Mimics three consecutive "Place Bet" clicks by invoking CasinoCore.placeBet
 * with realistic chip placements, exactly as the page does.
 */

import { CasinoCore, type RouletteBet, type RouletteBetType } from '../src/lib/casino/casino-core';

const CLIENT_SEED = 'roulette-simulation';

function buildBets(types: RouletteBetType[], totalAmount: number): RouletteBet[] {
  const perBet = Math.round((totalAmount / types.length) * 100) / 100;
  return types.map((type) => ({ type, amount: perBet }));
}

async function runSimulation(name: string, betTypes: RouletteBetType[], totalAmount: number, nonce: number) {
  const bets = buildBets(betTypes, totalAmount);
  const result = await CasinoCore.placeBet({
    gameType: 'ROULETTE',
    amount: totalAmount,
    bets,
    clientSeed: CLIENT_SEED,
    currentNonce: nonce,
  });

  console.log(`\n--- ${name} ---`);
  console.log(`Roll: ${result.roll}`);
  console.log(`Win: ${result.win}`);
  console.log(`Payout: ${result.payout}`);
  console.log(`Nonce: ${result.nonce}`);
  console.log(`Hash: ${result.serverSeedHash.slice(0, 16)}...`);

  if (result.roll < 0 || result.roll > 36) {
    throw new Error(`Invalid roll: ${result.roll}`);
  }
  if (!Number.isFinite(result.payout) || Number.isNaN(result.payout)) {
    throw new Error(`Invalid payout: ${result.payout}`);
  }
  if (!result.serverSeedHash) {
    throw new Error('Missing server seed hash');
  }

  return result;
}

async function main() {
  console.log('Starting /games/roulette simulation (3 spins)...');

  // Simulation 1: single straight-up bet
  const s1 = await runSimulation(
    'Simulation 1: Straight-up #17',
    [{ type: 'STRAIGHT', value: 17 }],
    10,
    0
  );

  // Simulation 2: color bet
  const s2 = await runSimulation(
    'Simulation 2: RED color',
    [{ type: 'COLOR', value: 'RED' }],
    50,
    s1.nonce
  );

  // Simulation 3: spread bet (straight + dozen + range)
  const s3 = await runSimulation(
    'Simulation 3: Multi-chip spread',
    [
      { type: 'STRAIGHT', value: 7 },
      { type: 'DOZEN', value: 1 },
      { type: 'RANGE', value: '1-18' },
    ],
    30,
    s2.nonce
  );

  console.log('\n=== All 3 simulations completed successfully ===');
  console.log(`Final roll sequence: ${s1.roll}, ${s2.roll}, ${s3.roll}`);
  console.log(`Total payout across spins: $${s1.payout + s2.payout + s3.payout}`);
}

main().catch((err) => {
  console.error('Simulation failed:', err);
  process.exit(1);
});
