import { describe, expect, test } from 'vitest';
import { EXPLOSION_SHAKE_INTENSITY } from '../particles-physics';
import {
  SHAKE_ACTIVE_THRESHOLD,
  SHAKE_DECAY_FACTOR,
  decayShakeIntensity,
  getExplosionShakeIntensity,
  getShakeOffset,
  isShakeActive,
} from '../viewport-shake';

describe('isShakeActive', () => {
  test('schweigt an und unter der Schwelle', () => {
    expect(isShakeActive(0)).toBe(false);
    expect(isShakeActive(SHAKE_ACTIVE_THRESHOLD)).toBe(false);
  });

  test('greift knapp über der Schwelle', () => {
    expect(isShakeActive(SHAKE_ACTIVE_THRESHOLD + 0.01)).toBe(true);
    expect(isShakeActive(18)).toBe(true);
  });
});

describe('getShakeOffset', () => {
  test('bleibt innerhalb der halben Intensität', () => {
    const intensity = 18;
    const half = intensity / 2;

    const offsets = [
      getShakeOffset(intensity, () => 0),
      getShakeOffset(intensity, () => 1),
      getShakeOffset(intensity, () => 0.5),
    ];

    expect(offsets[0].x).toBe(-half);
    expect(offsets[1].x).toBe(half);
    expect(offsets[2].x).toBe(0);
    offsets.forEach((offset) => {
      expect(Math.abs(offset.x)).toBeLessThanOrEqual(half);
      expect(Math.abs(offset.y)).toBeLessThanOrEqual(half);
    });
  });

  test('zieht x vor y', () => {
    const calls: number[] = [];
    getShakeOffset(10, () => {
      calls.push(1);
      return 0.5;
    });

    expect(calls).toHaveLength(2);
  });
});

describe('decayShakeIntensity', () => {
  test('dämpft pro Bild um den Faktor 0,9', () => {
    expect(decayShakeIntensity(18)).toBeCloseTo(18 * SHAKE_DECAY_FACTOR);
    expect(decayShakeIntensity(10, 0.5)).toBe(5);
  });

  test('klingt über mehrere Bilder unter die Schwelle ab', () => {
    let intensity = 18;
    for (let frame = 0; frame < 60; frame++) {
      intensity = decayShakeIntensity(intensity);
    }

    expect(isShakeActive(intensity)).toBe(false);
  });
});

describe('getExplosionShakeIntensity', () => {
  test('liefert die volle Intensität bei normaler Bewegung', () => {
    expect(getExplosionShakeIntensity(false)).toBe(EXPLOSION_SHAKE_INTENSITY);
  });

  test('lässt die Intensität bei reduzierter Bewegung unangetastet', () => {
    expect(getExplosionShakeIntensity(true)).toBeNull();
  });
});
