/**
 * TO-09 — Economy & bet-balancing mass simulation (offline, read-only).
 *
 * Spawns thousands of virtual bankrolled players, runs them through the
 * SAME settlement formulas the production services use (game-config.ts /
 * casino-core.ts) and reports: empirical house edge per game, XP/level
 * progression tempo, abuse patterns (martingale, max-bet grinding) and a
 * 4-week bankroll outlook. Pure CLI analysis — no Supabase access, no writes.
 *
 * Run: npm run sim:economy [-- --scenario rtp|progression|abuse|week|all] [-- --players N] [-- --rounds N] [-- --seed text] [-- --out file] [-- --json]
 */

import fs from 'fs';
import {
  DEFAULT_GAME_CONFIG,
  calculateSlotsPayoutWithConfig,
  calculateLevelWithConfig,
  type GameConfig,
} from '../src/lib/casino/game-config';
import { runRounds, type PlayerSpec, type SimGameKind } from '../src/lib/casino/simulation/engine';
import { computeEdge, type EdgeEstimate } from '../src/lib/casino/simulation/statistics';

const SLOTS_REEL_COUNT = 5;
const SLOTS_SYMBOLS_PER_REEL = 8;
const MIN_RTP_ROUNDS = 100_000;
const PROGRESSION_ROUND_MULTIPLIER = 10;
const WEEKS = 4;
const SESSIONS_PER_WEEK = 3;
const ROUNDS_PER_SESSION = 100;

interface SimulationConfig {
  players: number;
  rounds: number;
  seed: string;
  scenario: string;
  out: string | null;
}

function parseArgs(argv: string[]): SimulationConfig {
  const findArg = (name: string): string | null => {
    const index = argv.indexOf(`--${name}`);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : null;
  };
  const players = Number(findArg('players') ?? 1000);
  const rounds = Number(findArg('rounds') ?? 500);
  if (!Number.isInteger(players) || players <= 0) {
    throw new Error(`--players must be a positive integer, got: ${findArg('players') ?? players}`);
  }
  if (!Number.isInteger(rounds) || rounds <= 0) {
    throw new Error(`--rounds must be a positive integer, got: ${findArg('rounds') ?? rounds}`);
  }
  return {
    players,
    rounds,
    seed: findArg('seed') ?? 'to09-baseline',
    scenario: findArg('scenario') ?? 'all',
    out: findArg('out'),
  };
}

function sollEdgeFor(game: SimGameKind, config: GameConfig): number | null {
  if (game === 'DICE') return config.dice.houseEdge;
  if (game === 'CRASH') return config.crash.houseEdge;
  if (game === 'ROULETTE') return 1 / 37;
  if (game === 'SLOTS') {
    const reel: number[] = new Array(SLOTS_REEL_COUNT).fill(0);
    let combos = 0;
    let totalMultiplier = 0;
    const recurse = (index: number): void => {
      if (index === SLOTS_REEL_COUNT) {
        combos += 1;
        totalMultiplier += calculateSlotsPayoutWithConfig(reel, config);
        return;
      }
      for (let symbol = 0; symbol < SLOTS_SYMBOLS_PER_REEL; symbol += 1) {
        reel[index] = symbol;
        recurse(index + 1);
      }
    };
    recurse(0);
    return 1 - totalMultiplier / combos;
  }
  return null;
}

function playersToEdge(
  spec: PlayerSpec,
  players: number,
  rounds: number,
  seed: string,
  config: GameConfig,
): EdgeEstimate {
  let roundsTotal = 0;
  let wager = 0;
  let payout = 0;
  let sumReturn = 0;
  let sumSqReturn = 0;
  for (let player = 0; player < players; player += 1) {
    const result = runRounds(spec, rounds, `${seed}:${spec.id}:${player}`, config);
    roundsTotal += result.roundsPlayed;
    wager += result.wagerTotal;
    payout += result.payoutTotal;
    sumReturn += result.sumReturn;
    sumSqReturn += result.sumSqReturn;
  }
  return computeEdge({ rounds: roundsTotal, wager, payout, sumReturn, sumSqReturn });
}

function flatSpec(game: SimGameKind, id: string, baseBet?: number): PlayerSpec {
  return { id, game, strategy: 'flat', startBankroll: 1e9, baseBet };
}

function runRtpScenario(sim: SimulationConfig, config: GameConfig) {
  const games: SimGameKind[] = ['DICE', 'CRASH', 'ROULETTE', 'SLOTS'];
  const roundsPerGame = Math.max(MIN_RTP_ROUNDS, sim.rounds);
  return games.map((game) => ({
    game,
    roundsPerPlayer: roundsPerGame,
    players: sim.players,
    sollEdge: sollEdgeFor(game, config),
    edge: playersToEdge(
      flatSpec(game, 'rtp', 1),
      sim.players,
      roundsPerGame,
      `${sim.seed}:rtp`,
      config,
    ),
  }));
}

function runProgressionScenario(sim: SimulationConfig, config: GameConfig) {
  const classes = [
    { id: 'casual', spec: { ...flatSpec('DICE', 'prog1'), baseBet: 1 } },
    { id: 'mid', spec: { ...flatSpec('DICE', 'prog2'), baseBet: 50 } },
    {
      id: 'max-bet-grind',
      spec: {
        id: 'prog3',
        game: 'DICE' as const,
        strategy: 'max-bet-grind' as const,
        startBankroll: 1e9,
        maxBetGrindWager: 10_000,
      },
    },
  ];
  const targetLevels = [10, 25, 50];
  return classes.map(({ id, spec }) => {
    const results = Array.from({ length: sim.players }, (_, player) =>
      runRounds(
        spec,
        sim.rounds * PROGRESSION_ROUND_MULTIPLIER,
        `${sim.seed}:prog:${id}:${player}`,
        config,
      ),
    );
    const avgTotalXp = Math.round(results.reduce((sum, r) => sum + r.xpTotal, 0) / results.length);
    return {
      classId: id,
      players: sim.players,
      targetLevels: targetLevels.map((level) => {
        const reached = results.filter((result) => result.maxLevelReached >= level);
        const avgRoundsToReach =
          reached.length > 0
            ? Math.round(
                reached.reduce((sum, result) => {
                  const milestone = result.levelTimeline.find((entry) => entry.level >= level);
                  return (
                    sum + (milestone ? milestone.round : sim.rounds * PROGRESSION_ROUND_MULTIPLIER)
                  );
                }, 0) / reached.length,
              )
            : null;
        return {
          level,
          shareReached: Number((reached.length / results.length).toFixed(4)),
          avgRoundsToReach,
        };
      }),
      avgTotalXp,
      levelAfterAllRounds: calculateLevelWithConfig(avgTotalXp, config),
    };
  });
}

function runAbuseScenario(sim: SimulationConfig, config: GameConfig) {
  const profiles = [
    {
      id: 'martingale',
      spec: {
        id: 'abuse1',
        game: 'DICE' as const,
        strategy: 'martingale' as const,
        startBankroll: 500,
        baseBet: 8,
        diceTarget: 50,
        diceCondition: 'UNDER' as const,
      },
    },
    {
      id: 'max-bet-grind',
      spec: {
        id: 'abuse2',
        game: 'DICE' as const,
        strategy: 'max-bet-grind' as const,
        startBankroll: 1e9,
        maxBetGrindWager: 10_000,
        diceTarget: 50,
        diceCondition: 'UNDER' as const,
      },
    },
    {
      id: 'flat-reference',
      spec: { ...flatSpec('DICE', 'abuse3', 10), startBankroll: 1000 },
    },
  ];
  return profiles.map(({ id, spec }) => {
    const results = Array.from({ length: sim.players }, (_, player) =>
      runRounds(spec, sim.rounds, `${sim.seed}:abuse:${id}:${player}`, config),
    );
    const bankrupt = results.filter((r) => r.bankruptRound !== null);
    const perPlayerWager = results.reduce((sum, r) => sum + r.wagerTotal, 0) / results.length;
    const perPlayerXp = results.reduce((sum, r) => sum + r.xpTotal, 0) / results.length;
    let maxObservedWager = 0;
    for (const result of results) {
      maxObservedWager = Math.max(maxObservedWager, result.maxWager);
    }
    return {
      profileId: id,
      players: results.length,
      startBankroll: spec.startBankroll,
      survivalRate: Number((1 - bankrupt.length / results.length).toFixed(4)),
      bankruptShare: Number((bankrupt.length / results.length).toFixed(4)),
      avgTroughBankroll: Number(
        (results.reduce((sum, r) => sum + r.troughBankroll, 0) / results.length).toFixed(2),
      ),
      avgPeakBankroll: Number(
        (results.reduce((sum, r) => sum + r.peakBankroll, 0) / results.length).toFixed(2),
      ),
      maxObservedWager,
      xpPerCurrency: Number((perPlayerXp / perPlayerWager).toFixed(4)),
    };
  });
}

function runWeekScenario(sim: SimulationConfig, config: GameConfig) {
  const classes = [
    { id: 'casual', spec: { ...flatSpec('DICE', 'week1'), baseBet: 1, startBankroll: 1000 } },
    { id: 'regular', spec: { ...flatSpec('DICE', 'week2'), baseBet: 10, startBankroll: 1000 } },
    {
      id: 'martingale',
      spec: {
        id: 'week3',
        game: 'DICE' as const,
        strategy: 'martingale' as const,
        startBankroll: 1000,
        baseBet: 8,
        diceTarget: 50,
        diceCondition: 'UNDER' as const,
      },
    },
  ];
  const totalSessions = WEEKS * SESSIONS_PER_WEEK;
  return classes.map(({ id, spec }) => {
    const ends: number[] = [];
    let busts = 0;
    for (let player = 0; player < sim.players; player += 1) {
      let bankroll = spec.startBankroll;
      for (let session = 0; session < totalSessions; session += 1) {
        const sessionResult = runRounds(
          { ...spec, startBankroll: bankroll },
          ROUNDS_PER_SESSION,
          `${sim.seed}:week:${id}:${player}:${session}`,
          config,
        );
        bankroll = sessionResult.bankroll;
        if (bankroll < config.limits.betMin) {
          busts += 1;
          break;
        }
      }
      ends.push(bankroll);
    }
    const sorted = ends.slice().sort((a, b) => a - b);
    return {
      classId: id,
      players: sim.players,
      weeks: WEEKS,
      sessionsPerWeek: SESSIONS_PER_WEEK,
      roundsPerSession: ROUNDS_PER_SESSION,
      startBankroll: spec.startBankroll,
      avgEndBankroll: Number(
        (sorted.reduce((sum, value) => sum + value, 0) / sorted.length).toFixed(2),
      ),
      bustRate: Number((busts / sim.players).toFixed(4)),
      p10EndBankroll: sorted[Math.floor(sorted.length * 0.1)],
      p90EndBankroll: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))],
    };
  });
}

function formatEdge(edge: EdgeEstimate): string {
  const percent = (value: number): string => `${(value * 100).toFixed(3)}%`;
  return `${percent(edge.empiricalEdge)} [${percent(edge.ci95[0])}, ${percent(edge.ci95[1])}]`;
}

function main(): void {
  const sim = parseArgs(process.argv.slice(2));
  const config = DEFAULT_GAME_CONFIG;
  const report: Record<string, unknown> = {
    seed: sim.seed,
    players: sim.players,
    rounds: sim.rounds,
  };

  if (sim.scenario === 'rtp' || sim.scenario === 'all') {
    const rtp = runRtpScenario(sim, config);
    report.rtp = rtp;
    console.log('\n=== RTP — Empirische House-Edge vs. Soll (flat Spieler) ===');
    for (const row of rtp) {
      const soll = row.sollEdge !== null ? `${(row.sollEdge * 100).toFixed(2)}%` : 'n/a';
      console.log(
        `${row.game.padEnd(9)} soll=${soll}  empirisch=${formatEdge(row.edge)}  ` +
          `wager=${row.edge.wager.toFixed(0)} rounds=${row.edge.rounds}`,
      );
    }
  }

  if (sim.scenario === 'progression' || sim.scenario === 'all') {
    const progression = runProgressionScenario(sim, config);
    report.progression = progression;
    console.log('\n=== XP-/Level-Progression nach Spielerklasse ===');
    for (const row of progression) {
      const levels = row.targetLevels
        .map(
          (entry) =>
            `L${entry.level}: ${entry.avgRoundsToReach ?? '>max'} Runden (${(entry.shareReached * 100).toFixed(1)}% erreichen)`,
        )
        .join(' | ');
      console.log(
        `${row.classId.padEnd(14)} ${levels} | Ende: Level ${row.levelAfterAllRounds} (Ø ${row.avgTotalXp} XP)`,
      );
    }
  }

  if (sim.scenario === 'abuse' || sim.scenario === 'all') {
    const abuse = runAbuseScenario(sim, config);
    report.abuse = abuse;
    console.log('\n=== Missbrauchsprofile ===');
    for (const row of abuse) {
      console.log(
        `${row.profileId.padEnd(14)} survival=${(row.survivalRate * 100).toFixed(1)}% ` +
          `bust=${(row.bankruptShare * 100).toFixed(1)}% peakØ=${row.avgPeakBankroll} ` +
          `troughØ=${row.avgTroughBankroll} maxBet=${row.maxObservedWager} xp/$=${row.xpPerCurrency}`,
      );
    }
  }

  if (sim.scenario === 'week' || sim.scenario === 'all') {
    const week = runWeekScenario(sim, config);
    report.week = week;
    console.log('\n=== 4-Wochen-Bankroll-Verlauf (3 Sessions/Woche à 100 Rounds) ===');
    for (const row of week) {
      console.log(
        `${row.classId.padEnd(11)} start=${row.startBankroll} ØEnde=${row.avgEndBankroll} ` +
          `p10=${row.p10EndBankroll} p90=${row.p90EndBankroll} bust=${(row.bustRate * 100).toFixed(1)}%`,
      );
    }
  }

  if (sim.out) {
    fs.writeFileSync(sim.out, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\nReport geschrieben: ${sim.out}`);
  }
}

main();
