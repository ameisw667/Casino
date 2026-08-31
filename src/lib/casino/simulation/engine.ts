import {
  type GameConfig,
  calculateSlotsPayoutWithConfig,
  calculateXpGainWithConfig,
  calculateLevelWithConfig,
  getDiceMultiplierWithConfig,
} from '../game-config';
import { CasinoCore, calculateDicePayout, type RouletteBet } from '../casino-core';
import { mulberry32, seedFromText } from './rng';
import {
  rollCrashMultiplier,
  rollDiceOutcome,
  rollRouletteNumber,
  rollSlotsSymbols,
} from './game-roll';

export type SimGameKind = 'DICE' | 'CRASH' | 'ROULETTE' | 'SLOTS';

export type StrategyKind = 'flat' | 'martingale' | 'max-bet-grind';

export interface PlayerSpec {
  id: string;
  game: SimGameKind;
  strategy: StrategyKind;
  startBankroll: number;
  /** Flat/martingale wager; defaults to 1. Max-bet-grind derives its own wager. */
  baseBet?: number;
  maxBetGrindWager?: number;
  diceTarget?: number;
  diceCondition?: 'OVER' | 'UNDER';
  crashCashout?: number;
  /**
   * Total wager per round is the sum of the bet amounts. Note: strategy
   * sizing (martingale doubling, grind wager) only applies to DICE/CRASH/SLOTS;
   * the ROULETTE path sizes its wagers from the bet amounts and caps them at
   * bankroll and betMax.
   */
  rouletteBets?: RouletteBet[];
}

export interface LevelMilestone {
  round: number;
  level: number;
}

export interface PlayerRunResult {
  rounds: number;
  roundsPlayed: number;
  roundsWon: number;
  wager: number;
  wagerTotal: number;
  payout: number;
  payoutTotal: number;
  sumReturn: number;
  sumSqReturn: number;
  bankroll: number;
  peakBankroll: number;
  troughBankroll: number;
  maxWager: number;
  xpTotal: number;
  maxLevelReached: number;
  levelTimeline: LevelMilestone[];
  bankruptRound: number | null;
}

const MONEY_DECIMALS = 2;
const MARTINGALE_MAX_DOUBLINGS = 30;

function roundMoney(value: number): number {
  const factor = 10 ** MONEY_DECIMALS;
  return Math.round(value * factor) / factor;
}

function resolveWager(
  spec: PlayerSpec,
  bankroll: number,
  config: GameConfig,
  lossStreak: number,
): number {
  const { betMin, betMax } = config.limits;
  const baseBet = Math.max(spec.baseBet ?? 1, betMin);
  let wager: number;
  if (spec.strategy === 'martingale') {
    const doubling = Math.min(lossStreak, MARTINGALE_MAX_DOUBLINGS);
    wager = baseBet * 2 ** doubling;
  } else if (spec.strategy === 'max-bet-grind') {
    wager = spec.maxBetGrindWager ?? betMax;
  } else {
    wager = baseBet;
  }
  return Math.min(wager, betMax, roundMoney(bankroll));
}

function settleDice(
  rng: () => number,
  spec: PlayerSpec,
  wager: number,
  config: GameConfig,
): { win: boolean; payout: number } {
  const target = spec.diceTarget ?? 50;
  const condition = spec.diceCondition ?? 'UNDER';
  const roll = rollDiceOutcome(rng());
  const win = condition === 'OVER' ? roll > target : roll < target;
  const multiplier = getDiceMultiplierWithConfig(target, condition, config);
  return { win, payout: calculateDicePayout(wager, multiplier, win, config) };
}

function settleCrash(
  rng: () => number,
  spec: PlayerSpec,
  wager: number,
  config: GameConfig,
): { win: boolean; payout: number } {
  const cashout = spec.crashCashout ?? 2;
  const crashPoint = rollCrashMultiplier(rng(), config.crash.houseEdge);
  const win = crashPoint >= cashout;
  // 2-decimal money rounding is deliberate bankroll hygiene; production
  // CasinoCore returns the raw product and rounds in the wallet RPC instead.
  return { win, payout: win ? Math.round(wager * cashout * 100) / 100 : 0 };
}

function settleRoulette(
  rng: () => number,
  spec: PlayerSpec,
  bankroll: number,
  config: GameConfig,
): { win: boolean; payout: number; wager: number } {
  const bets = spec.rouletteBets ?? [
    {
      type: { type: 'COLOR' as const, value: 'RED' },
      amount: Math.max(spec.baseBet ?? 1, config.limits.betMin),
    },
  ];
  const total = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const cap = Math.min(bankroll, config.limits.betMax);
  const scale = total > cap ? cap / total : 1;
  const scaled: RouletteBet[] =
    scale === 1
      ? bets
      : bets.map((bet) => ({ ...bet, amount: Math.round(bet.amount * scale * 100) / 100 }));
  const wager = scaled.reduce((sum, bet) => sum + bet.amount, 0);
  const roll = rollRouletteNumber(rng());
  const payout = CasinoCore.calculateRoulettePayout(roll, scaled, config);
  return { win: payout > 0, payout, wager };
}

function settleSlots(
  rng: () => number,
  spec: PlayerSpec,
  wager: number,
  config: GameConfig,
): { win: boolean; payout: number } {
  const u = [rng(), rng(), rng(), rng(), rng()];
  const symbols = rollSlotsSymbols(u);
  const payoutMultiplier = calculateSlotsPayoutWithConfig(symbols, config);
  return {
    win: payoutMultiplier > 0,
    payout: Math.round(wager * payoutMultiplier * 100) / 100,
  };
}

/**
 * Runs one simulated bankroll for up to `rounds` rounds, fully offline.
 * Bet strategies and settlement formulas reuse the production functions from
 * game-config.ts / casino-core.ts — the simulation must never re-implement payouts.
 */
export function runRounds(
  spec: PlayerSpec,
  rounds: number,
  seedText: string,
  config: GameConfig,
): PlayerRunResult {
  let bankroll = spec.startBankroll;
  let totalXp = 0;
  let level = calculateLevelWithConfig(totalXp, config);
  let lossStreak = 0;
  let wagerTotal = 0;
  let payoutTotal = 0;
  let sumReturn = 0;
  let sumSqReturn = 0;
  let roundsWon = 0;
  let played = 0;
  let troughBankroll = bankroll;
  let peakBankroll = bankroll;
  let maxWager = 0;
  const levelTimeline: LevelMilestone[] = [];
  let bankruptRound: number | null = null;

  for (let round = 0; round < rounds; round += 1) {
    let wager = resolveWager(spec, bankroll, config, lossStreak);
    if (wager < config.limits.betMin) {
      bankruptRound = round;
      break;
    }

    const rng = mulberry32(seedFromText(`${seedText}:${spec.id}:${round}`));
    let win: boolean;
    let payout: number;
    if (spec.game === 'DICE') {
      ({ win, payout } = settleDice(rng, spec, wager, config));
    } else if (spec.game === 'CRASH') {
      ({ win, payout } = settleCrash(rng, spec, wager, config));
    } else if (spec.game === 'ROULETTE') {
      ({ win, payout, wager } = settleRoulette(rng, spec, bankroll, config));
    } else {
      ({ win, payout } = settleSlots(rng, spec, wager, config));
    }

    bankroll = Math.round((bankroll - wager + payout) * 100) / 100;
    troughBankroll = Math.min(troughBankroll, bankroll);
    peakBankroll = Math.max(peakBankroll, bankroll);

    wagerTotal += wager;
    payoutTotal += payout;
    maxWager = Math.max(maxWager, wager);
    sumReturn += payout / wager;
    sumSqReturn += (payout / wager) ** 2;
    if (win) roundsWon += 1;
    played += 1;

    totalXp += calculateXpGainWithConfig(wager, level, config);
    const nextLevel = calculateLevelWithConfig(totalXp, config);
    if (nextLevel > level) {
      levelTimeline.push({ round, level: nextLevel });
      level = nextLevel;
    }

    if (bankroll < config.limits.betMin) {
      bankruptRound = round + 1;
      break;
    }
    lossStreak = win ? 0 : lossStreak + 1;
  }

  return {
    rounds,
    roundsPlayed: played,
    roundsWon,
    wager: wagerTotal,
    wagerTotal,
    payout: payoutTotal,
    payoutTotal,
    sumReturn,
    sumSqReturn,
    bankroll,
    peakBankroll,
    troughBankroll,
    maxWager,
    xpTotal: totalXp,
    maxLevelReached: level,
    levelTimeline,
    bankruptRound,
  };
}
