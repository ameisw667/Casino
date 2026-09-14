/**
 * Admin-only statistical sandbox for the RTP validator UI. Uses Math.random()
 * intentionally and has no relationship to the real settlement/RNG path in
 * src/lib/casino/casino-core.ts — this never touches wallet or wager state.
 */
export interface SimSample {
  i: number;
  rtp: number;
}

export interface SimResult {
  runs: number;
  wins: number;
  losses: number;
  totalPayout: number;
  totalWagered: number;
  rtp: number;
  bustRate?: number;
  samples: SimSample[];
}

function sampleInterval(runs: number): number {
  return Math.max(1, Math.floor(runs / 50));
}

export function simulateDice(
  runs: number,
  target: number,
  condition: 'OVER' | 'UNDER',
  betAmount: number,
): SimResult {
  let wins = 0;
  let totalPayout = 0;
  const samples: SimSample[] = [];
  const totalWagered = runs * betAmount;
  const winChance = condition === 'OVER' ? (100 - target) / 100 : target / 100;
  const multiplier = 0.99 / winChance;
  const interval = sampleInterval(runs);

  for (let i = 0; i < runs; i++) {
    const roll = Math.random() * 100;
    const win = condition === 'OVER' ? roll > target : roll < target;
    if (win) {
      wins++;
      totalPayout += betAmount * multiplier;
    }
    if (i % interval === 0) {
      samples.push({
        i,
        rtp: i > 0 ? Math.round((totalPayout / ((i + 1) * betAmount)) * 1000) / 10 : 0,
      });
    }
  }

  return {
    runs,
    wins,
    losses: runs - wins,
    totalPayout,
    totalWagered,
    rtp: Math.round((totalPayout / totalWagered) * 1000) / 10,
    samples,
  };
}

export function simulateCrash(runs: number, cashoutAt: number, betAmount: number): SimResult {
  let wins = 0;
  let totalPayout = 0;
  let busts = 0;
  const samples: SimSample[] = [];
  const totalWagered = runs * betAmount;
  const interval = sampleInterval(runs);

  for (let i = 0; i < runs; i++) {
    const r = Math.random();
    const crashPoint = r < 0.03 ? 1 : Math.max(1, 0.99 / (1 - r));
    const win = crashPoint >= cashoutAt;
    if (crashPoint <= 1.01) busts++;
    if (win) {
      wins++;
      totalPayout += betAmount * cashoutAt;
    }
    if (i % interval === 0) {
      samples.push({
        i,
        rtp: i > 0 ? Math.round((totalPayout / ((i + 1) * betAmount)) * 1000) / 10 : 0,
      });
    }
  }

  return {
    runs,
    wins,
    losses: runs - wins,
    totalPayout,
    totalWagered,
    rtp: Math.round((totalPayout / totalWagered) * 1000) / 10,
    bustRate: Math.round((busts / runs) * 1000) / 10,
    samples,
  };
}
