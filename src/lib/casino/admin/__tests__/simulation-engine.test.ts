import { afterEach, describe, expect, it, vi } from 'vitest';
import { simulateCrash, simulateDice } from '../simulation-engine';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('simulateDice', () => {
  it('produces an RTP within the theoretical fair-math bound for a large fixed-random run', () => {
    let call = 0;
    // Deterministic pseudo-random sequence covering the full [0,1) range so
    // roughly half the rolls win and half lose, regardless of target.
    vi.spyOn(Math, 'random').mockImplementation(() => {
      call += 1;
      return (call % 100) / 100;
    });

    const result = simulateDice(1000, 50, 'OVER', 10);

    expect(result.rtp).toBeGreaterThan(80);
    expect(result.rtp).toBeLessThan(120);
  });

  it('derives losses as runs minus wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const result = simulateDice(50, 50, 'OVER', 10);

    expect(result.losses).toBe(result.runs - result.wins);
  });

  it('returns a non-empty samples array when runs > 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = simulateDice(200, 50, 'UNDER', 5);

    expect(result.samples.length).toBeGreaterThan(0);
  });

  it('always wins when the roll is mocked to guarantee a win condition', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = simulateDice(10, 50, 'OVER', 10);

    expect(result.wins).toBe(10);
    expect(result.losses).toBe(0);
  });
});

describe('simulateCrash', () => {
  it('derives losses as runs minus wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = simulateCrash(50, 2, 10);

    expect(result.losses).toBe(result.runs - result.wins);
  });

  it('returns a non-empty samples array when runs > 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = simulateCrash(200, 2, 5);

    expect(result.samples.length).toBeGreaterThan(0);
  });

  it('reports a bustRate between 0 and 100', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.02);

    const result = simulateCrash(100, 2, 10);

    expect(result.bustRate).toBeGreaterThanOrEqual(0);
    expect(result.bustRate).toBeLessThanOrEqual(100);
  });
});
