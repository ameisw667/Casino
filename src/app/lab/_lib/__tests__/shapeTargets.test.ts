import { describe, expect, it } from 'vitest';
import {
  buildChaosField,
  buildCrashCurve,
  buildGroundLine,
  mapPointsToPlane,
  PLANE_HALF_HEIGHT,
  PLANE_HALF_WIDTH,
  samplePointsFromAlphaGrid,
} from '../shapeTargets';
import { mulberry32 } from '../seededRandom';

const COUNT = 200;

describe('samplePointsFromAlphaGrid', () => {
  it('sammelt nur Punkte über der Alpha-Schwelle und liefert count Ergebnisse', () => {
    const pixels = new Uint8ClampedArray(100 * 64 * 4);
    pixels[12903] = 255; // Alpha-Kanal von Pixel (x=25, y=32) — Mitte, kein Rand-Jitter
    const rand = mulberry32(1);
    const points = samplePointsFromAlphaGrid(pixels, 100, 64, 10, rand);
    expect(points).toHaveLength(10);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    });
  });

  it('leeres Feld → leere Liste statt Fallback', () => {
    const pixels = new Uint8ClampedArray(40 * 40 * 4);
    expect(samplePointsFromAlphaGrid(pixels, 40, 40, 10, mulberry32(1))).toEqual([]);
  });
});

describe('mapPointsToPlane', () => {
  it('bildet [0..1]² auf die Weltebene (Y invertiert) und Z=0', () => {
    const out = mapPointsToPlane([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 0.5, y: 0.5 },
    ]);
    expect(out[0]).toBeCloseTo(-PLANE_HALF_WIDTH, 5);
    expect(out[1]).toBeCloseTo(PLANE_HALF_HEIGHT, 5);
    expect(out[3]).toBeCloseTo(PLANE_HALF_WIDTH, 5);
    expect(out[4]).toBeCloseTo(-PLANE_HALF_HEIGHT, 5);
    expect(out[8]).toBe(0);
  });
});

describe('Form-Builder', () => {
  it('Chaos-, Kurve- und Boden-Arrays haben exakt count×3 Koordinaten', () => {
    const rand = mulberry32(42);
    expect(buildChaosField(COUNT, rand)).toHaveLength(COUNT * 3);
    expect(buildCrashCurve(COUNT, rand)).toHaveLength(COUNT * 3);
    expect(buildGroundLine(COUNT, rand)).toHaveLength(COUNT * 3);
  });

  it('Crash-Kurve verläuft unten links → oben rechts', () => {
    const curve = buildCrashCurve(COUNT, mulberry32(42));
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < curve.length; i += 3) {
      minX = Math.min(minX, curve[i]);
      maxX = Math.max(maxX, curve[i]);
      minY = Math.min(minY, curve[i + 1]);
      maxY = Math.max(maxY, curve[i + 1]);
    }
    expect(minX).toBeLessThan(-3);
    expect(maxX).toBeGreaterThan(3);
    expect(minY).toBeLessThan(-1);
    expect(maxY).toBeGreaterThan(2);
  });

  it('Bodenlinie bleibt am unteren Rand', () => {
    const ground = buildGroundLine(COUNT, mulberry32(3));
    for (let i = 1; i < ground.length; i += 3) {
      expect(ground[i]).toBeLessThan(-PLANE_HALF_HEIGHT + 1.2);
    }
  });
});
