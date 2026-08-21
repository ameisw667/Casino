import { describe, expect, it } from 'vitest';
import { buildIsolationForest, scoreSample } from '../isolation-forest';

function makeCluster(size: number): number[][] {
  return Array.from({ length: size }, (_, i) => [Math.sin(i) * 0.5, Math.cos(i) * 0.5]);
}

describe('buildIsolationForest / scoreSample', () => {
  it('scores a clear outlier higher than every inlier in a dense cluster', () => {
    const cluster = makeCluster(30);
    const outlier: number[] = [50, 50];
    const samples = [...cluster, outlier];

    const forest = buildIsolationForest(samples, { seed: 42, numTrees: 100 });

    const outlierScore = scoreSample(forest, outlier);
    const maxInlierScore = Math.max(...cluster.map((point) => scoreSample(forest, point)));

    expect(outlierScore).toBeGreaterThan(maxInlierScore);
    expect(outlierScore).toBeGreaterThan(0.6);
  });

  it('is deterministic for a fixed seed (required for same-day-rerun dedup)', () => {
    const samples = Array.from({ length: 20 }, (_, i) => [i, i * 2]);

    const forestA = buildIsolationForest(samples, { seed: 7 });
    const forestB = buildIsolationForest(samples, { seed: 7 });

    const point = [5, 10];
    expect(scoreSample(forestA, point)).toBe(scoreSample(forestB, point));
  });

  it('produces different trees for different seeds', () => {
    const samples = Array.from({ length: 20 }, (_, i) => [i, i * 2]);

    const forestA = buildIsolationForest(samples, { seed: 1 });
    const forestB = buildIsolationForest(samples, { seed: 2 });

    const point = [50, 100];
    // Not a hard guarantee for every seed pair, but overwhelmingly true for random trees
    // built from a different PRNG state — a stable check that seeding actually matters.
    expect(scoreSample(forestA, point)).not.toBe(scoreSample(forestB, point));
  });

  it('throws for an empty sample set', () => {
    expect(() => buildIsolationForest([], { seed: 1 })).toThrow();
  });

  it('returns a neutral ~0.5 score when every sample is identical (no separable structure)', () => {
    const samples = Array.from({ length: 10 }, () => [1, 1]);
    const forest = buildIsolationForest(samples, { seed: 3 });

    const score = scoreSample(forest, [1, 1]);
    expect(score).toBeCloseTo(0.5, 1);
  });

  it('caps sampleSize at the available sample count without throwing', () => {
    const samples = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const forest = buildIsolationForest(samples, { seed: 9, sampleSize: 256 });
    expect(forest.sampleSize).toBe(3);
    expect(() => scoreSample(forest, [1, 2])).not.toThrow();
  });
});
