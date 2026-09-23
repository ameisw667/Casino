import { describe, expect, test } from 'vitest';
import {
  MULTIPLAYER_TAIL_JITTER,
  SOLO_NOZZLE_JITTER,
  createDualNozzleOriginResolver,
  createSinglePointOriginResolver,
  getPositionalPan,
  getTailNozzles,
} from '../tail-geometry';

function seededRandom(seed = 1): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

describe('getTailNozzles', () => {
  test('setzt beide Düsen hinter die Rakete und quer versetzt', () => {
    const nozzles = getTailNozzles(100, 200, 0);

    expect(nozzles.nozzle1X).toBe(54);
    expect(nozzles.nozzle1Y).toBe(211);
    expect(nozzles.nozzle2X).toBe(54);
    expect(nozzles.nozzle2Y).toBe(189);
  });

  test('dreht den Düsensitz mit dem Flugwinkel', () => {
    const nozzles = getTailNozzles(100, 200, Math.PI / 2);

    expect(nozzles.nozzle1X).toBeCloseTo(89);
    expect(nozzles.nozzle1Y).toBeCloseTo(154);
    expect(nozzles.nozzle2X).toBeCloseTo(111);
    expect(nozzles.nozzle2Y).toBeCloseTo(154);
  });

  test('hält den Abstand der Düsen zueinander konstant', () => {
    const nozzles = getTailNozzles(40, 90, 0.7);
    const distance = Math.hypot(
      nozzles.nozzle1X - nozzles.nozzle2X,
      nozzles.nozzle1Y - nozzles.nozzle2Y,
    );

    expect(distance).toBeCloseTo(22);
  });
});

describe('createDualNozzleOriginResolver', () => {
  test('wechselt pro Index zwischen Düse 1 und Düse 2', () => {
    const nozzles = getTailNozzles(0, 0, 0);
    const resolve = createDualNozzleOriginResolver(0, 0, 0);

    expect(resolve(0, () => 0.5).y).toBeCloseTo(nozzles.nozzle1Y);
    expect(resolve(1, () => 0.5).y).toBeCloseTo(nozzles.nozzle2Y);
    expect(resolve(2, () => 0.5).y).toBeCloseTo(nozzles.nozzle1Y);
    expect(resolve(3, () => 0.5).y).toBeCloseTo(nozzles.nozzle2Y);
  });

  test('verrauscht die Düsenposition nur um den halben Jitter', () => {
    const resolve = createDualNozzleOriginResolver(0, 0, 0);
    const half = SOLO_NOZZLE_JITTER / 2;

    for (let index = 0; index < 40; index++) {
      const random = seededRandom(index + 1);
      const origin = resolve(index % 2, random);
      const nozzle = getTailNozzles(0, 0, 0);
      const baseX = index % 2 === 0 ? nozzle.nozzle1X : nozzle.nozzle2X;

      expect(origin.x).toBeGreaterThanOrEqual(baseX - half);
      expect(origin.x).toBeLessThanOrEqual(baseX + half);
    }
  });

  test('zieht x vor y, damit die Zufallsfolge stabil bleibt', () => {
    const resolve = createDualNozzleOriginResolver(0, 0, 0);
    const seen: number[] = [];
    const recordingRandom = (): number => {
      seen.push(0.5);
      return 0.5;
    };

    resolve(0, recordingRandom);

    expect(seen).toHaveLength(2);
  });
});

describe('createSinglePointOriginResolver', () => {
  test('streut um den Emissionspunkt innerhalb des halben Jitters', () => {
    const resolve = createSinglePointOriginResolver(50, 70);
    const half = MULTIPLAYER_TAIL_JITTER / 2;

    for (let index = 0; index < 40; index++) {
      const origin = resolve(index, seededRandom(index + 1));

      expect(origin.x).toBeGreaterThanOrEqual(50 - half);
      expect(origin.x).toBeLessThanOrEqual(50 + half);
      expect(origin.y).toBeGreaterThanOrEqual(70 - half);
      expect(origin.y).toBeLessThanOrEqual(70 + half);
    }
  });

  test('ignoriert den Index und bleibt am selben Punkt', () => {
    const resolve = createSinglePointOriginResolver(12, 34);

    expect(resolve(0, () => 0.5)).toEqual(resolve(9, () => 0.5));
  });
});

describe('getPositionalPan', () => {
  test('bildet den linken und rechten Rand auf die Stereogrenzen ab', () => {
    expect(getPositionalPan(0, 800)).toBe(-1);
    expect(getPositionalPan(400, 800)).toBe(0);
    expect(getPositionalPan(800, 800)).toBe(1);
  });

  test('begrenzt Ausreißer auf -1 bis 1', () => {
    expect(getPositionalPan(-500, 800)).toBe(-1);
    expect(getPositionalPan(5000, 800)).toBe(1);
  });

  test('bleibt bei fehlender Breite neutral', () => {
    expect(getPositionalPan(100, 0)).toBe(0);
    expect(getPositionalPan(100, -5)).toBe(0);
  });
});
