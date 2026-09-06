import { describe, expect, it } from 'vitest';
import {
  cashOut,
  CRASH_GROWTH_RATE,
  currentMultiplier,
  drawCrashPoint,
  evaluateRound,
  initialSession,
  MAX_CRASH_POINT,
  multiplierAt,
  recordRound,
  startRound,
} from '../crashRound';
import { mulberry32 } from '../seededRandom';

describe('drawCrashPoint', () => {
  it('liefert Werte im Bereich 1..MAX', () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 200; i += 1) {
      const point = drawCrashPoint(rand);
      expect(point).toBeGreaterThanOrEqual(1);
      expect(point).toBeLessThanOrEqual(MAX_CRASH_POINT);
      expect(Math.abs(point * 100 - Math.round(point * 100))).toBeLessThan(1e-6);
    }
  });

  it('ist deterministisch bei gleichem Seed', () => {
    expect(drawCrashPoint(mulberry32(5))).toBe(drawCrashPoint(mulberry32(5)));
  });

  it('extremes rand() wird geklemmt (Median nahe 2×, langer Schwanz)', () => {
    expect(drawCrashPoint(() => 0)).toBe(1);
    expect(drawCrashPoint(() => 0.5)).toBeCloseTo(1.98, 2);
    expect(drawCrashPoint(() => 0.999999)).toBe(MAX_CRASH_POINT);
  });
});

describe('multiplierAt', () => {
  it('startet bei 1 und wächst exponentiell', () => {
    expect(multiplierAt(0)).toBe(1);
    const at2s = multiplierAt(2000);
    expect(at2s).toBeCloseTo(Math.exp(CRASH_GROWTH_RATE * 2), 6);
    expect(at2s).toBeGreaterThan(1);
  });
});

describe('Runde', () => {
  it('Cash-Out friert den Multiplier vor dem Crashpoint', () => {
    const round = startRound(0, 5);
    let evolved = round;
    for (let now = 100; now < 4000; now += 100) {
      evolved = evaluateRound(evolved, now);
      expect(evolved.phase).toBe('holding');
    }
    const cashed = cashOut(evaluateRound(evolved, 4000), 4000);
    expect(cashed.phase).toBe('cashed');
    expect(currentMultiplier(cashed, 10_000)).toBe(cashed.cashedMultiplier);
    expect(cashed.cashedMultiplier).toBeLessThan(5);
  });

  it('Bust setzt den Zähler auf 0, spätestens am Crashpoint', () => {
    const round = startRound(0, 2);
    const pastCrash = evaluateRound(round, 60_000);
    expect(pastCrash.phase).toBe('busted');
    expect(currentMultiplier(pastCrash, 61_000)).toBe(0);
  });

  it('Cash-Out nach Bust ist ohne Wirkung', () => {
    let round = startRound(0, 1.5);
    round = evaluateRound(round, 60_000);
    expect(cashOut(round, 60_100)).toBe(round);
  });
});

describe('Session', () => {
  it('bucht Cash-Outs und Busts getrennt, mit Best-Multiplier', () => {
    let session = initialSession();
    session = recordRound(session, {
      ...startRound(0, 3),
      phase: 'cashed',
      endedAtMs: 100,
      cashedMultiplier: 2.5,
    });
    session = recordRound(session, { ...startRound(0, 2), phase: 'busted', endedAtMs: 100 });
    session = recordRound(session, {
      ...startRound(0, 10),
      phase: 'cashed',
      endedAtMs: 100,
      cashedMultiplier: 4.2,
    });
    expect(session).toEqual({ cashOuts: 2, busts: 1, bestMultiplier: 4.2 });
  });

  it('ignoriert offene Runden', () => {
    expect(recordRound(initialSession(), startRound(0, 3))).toEqual(initialSession());
  });
});
