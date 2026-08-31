export interface WagerSample {
  rounds: number;
  wager: number;
  payout: number;
  /** Sum of per-round returns r_i = payout_i / wager_i (wager_i > 0). */
  sumReturn: number;
  /** Sum of squared per-round returns, for the confidence interval. */
  sumSqReturn: number;
}

export interface EdgeEstimate {
  rounds: number;
  wager: number;
  payout: number;
  /** 1 - payout/wager, money-weighted — same definition as scripts/economy-audit.ts. */
  empiricalEdge: number;
  /**
   * Approximate 95% confidence band around empiricalEdge, derived from the
   * unweighted variance of per-round returns. Approximation: per-round stakes
   * are near-equal (flat strategies). Not valid for highly skewed stakes.
   */
  ci95: [number, number];
}

const Z_95 = 1.96;
const DECIMALS = 6;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeEdge(sample: WagerSample): EdgeEstimate {
  if (sample.wager <= 0 || sample.rounds <= 0) {
    return {
      rounds: sample.rounds,
      wager: sample.wager,
      payout: sample.payout,
      empiricalEdge: 0,
      ci95: [0, 0],
    };
  }
  const empiricalEdge = 1 - sample.payout / sample.wager;
  const n = sample.rounds;
  const meanReturn = sample.sumReturn / n;
  const variance = Math.max(0, sample.sumSqReturn / n - meanReturn * meanReturn);
  const margin = Z_95 * Math.sqrt(variance / n);
  return {
    rounds: n,
    wager: sample.wager,
    payout: sample.payout,
    empiricalEdge: roundTo(empiricalEdge, DECIMALS),
    ci95: [roundTo(empiricalEdge - margin, DECIMALS), roundTo(empiricalEdge + margin, DECIMALS)],
  };
}

/** Standard Wilson score interval for a binomial win rate. */
export function wilsonInterval(wins: number, rounds: number, z = Z_95): [number, number] {
  if (rounds <= 0) return [0, 0];
  const p = wins / rounds;
  const denominator = 1 + (z * z) / rounds;
  const center = (p + (z * z) / (2 * rounds)) / denominator;
  const margin =
    (z * Math.sqrt((p * (1 - p)) / rounds + (z * z) / (4 * rounds * rounds))) / denominator;
  return [roundTo(center - margin, DECIMALS), roundTo(center + margin, DECIMALS)];
}
