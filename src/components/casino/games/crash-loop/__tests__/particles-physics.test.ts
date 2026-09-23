import { describe, expect, test } from 'vitest';
import {
  EXPLOSION_COLORS,
  SHOCKWAVE_COLOR,
  TAIL_EXHAUST_SPREAD_MULTIPLAYER,
  TAIL_EXHAUST_SPREAD_SOLO,
  createExplosionParticles,
  createTailParticles,
  getExplosionParticleCount,
  getTailParticleCount,
  getTailParticleLimit,
  type TailOriginResolver,
} from '../particles-physics';

function seededRandom(seed = 1): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const originAtZero: TailOriginResolver = () => ({ x: 0, y: 0 });

describe('Partikel-Mengen je Gerät', () => {
  test('liefert die schlanken Werte auf Mobilgeräten', () => {
    expect(getExplosionParticleCount(true)).toBe(25);
    expect(getTailParticleCount(true)).toBe(1);
    expect(getTailParticleLimit(true)).toBe(120);
  });

  test('liefert die vollen Werte auf Desktop', () => {
    expect(getExplosionParticleCount(false)).toBe(55);
    expect(getTailParticleCount(false)).toBe(2);
    expect(getTailParticleLimit(false)).toBe(250);
  });
});

describe('createExplosionParticles', () => {
  test('stellt die Schockwelle an die erste Position', () => {
    const particles = createExplosionParticles({ x: 10, y: 20, count: 0, random: seededRandom() });

    expect(particles).toHaveLength(1);
    expect(particles[0]).toEqual({
      x: 10,
      y: 20,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      color: SHOCKWAVE_COLOR,
      size: 10,
      type: 'shockwave',
    });
  });

  test('erzeugt genau count Bruchstücke zusätzlich zur Schockwelle', () => {
    const particles = createExplosionParticles({
      x: 0,
      y: 0,
      count: 25,
      random: seededRandom(),
    });

    expect(particles).toHaveLength(26);
    expect(particles.slice(1).every((p) => p.type === 'explosion')).toBe(true);
  });

  test('hält Geschwindigkeit, Lebensdauer und Größe in den erwarteten Bändern', () => {
    const particles = createExplosionParticles({
      x: 0,
      y: 0,
      count: 200,
      random: seededRandom(7),
    }).slice(1);

    particles.forEach((p) => {
      const speed = Math.hypot(p.vx, p.vy);
      expect(speed).toBeGreaterThanOrEqual(2);
      expect(speed).toBeLessThan(8);
      expect(p.maxLife).toBeGreaterThanOrEqual(0.6);
      expect(p.maxLife).toBeLessThan(1.2);
      expect(p.life).toBe(1);
      expect(p.size).toBeGreaterThanOrEqual(2);
      expect(p.size).toBeLessThan(5.5);
    });
  });

  test('wählt ausschließlich Farben aus der Explosionspalette', () => {
    const particles = createExplosionParticles({
      x: 0,
      y: 0,
      count: 120,
      random: seededRandom(3),
    }).slice(1);

    particles.forEach((p) => {
      expect(EXPLOSION_COLORS).toContain(p.color);
    });
  });

  test('ist bei gleichem Seed reproduzierbar', () => {
    const options = { x: 5, y: 6, count: 30 };
    const first = createExplosionParticles({ ...options, random: seededRandom(42) });
    const second = createExplosionParticles({ ...options, random: seededRandom(42) });

    expect(first).toEqual(second);
  });
});

describe('createTailParticles', () => {
  const baseOptions = {
    angle: 0,
    riskFactor: 0.5,
    exhaustSpread: TAIL_EXHAUST_SPREAD_SOLO,
    count: 2,
    resolveOrigin: originAtZero,
  };

  test('erzeugt genau count Partikel', () => {
    const particles = createTailParticles({ ...baseOptions, random: seededRandom() });

    expect(particles).toHaveLength(2);
  });

  test('markiert Partikel als Funke oder Rauch und hält deren Bänder ein', () => {
    const particles = createTailParticles({
      ...baseOptions,
      count: 200,
      random: seededRandom(11),
    });

    particles.forEach((p) => {
      expect(['spark', 'smoke']).toContain(p.type);
      expect(p.life).toBe(1);

      if (p.type === 'spark') {
        expect(p.maxLife).toBeGreaterThanOrEqual(0.35);
        expect(p.maxLife).toBeLessThan(0.6);
        expect(p.size).toBeGreaterThanOrEqual(1.5);
        expect(p.size).toBeLessThan(3.5);
        return;
      }

      expect(p.maxLife).toBe(0.65);
      expect(p.size).toBeGreaterThanOrEqual(3);
      expect(p.size).toBeLessThan(7);
    });
  });

  test('übernimmt die Herkunft aus dem Resolver', () => {
    const particles = createTailParticles({
      ...baseOptions,
      count: 3,
      random: seededRandom(5),
      resolveOrigin: (index) => ({ x: index * 10, y: index * 100 }),
    });

    expect(particles.map((p) => [p.x, p.y])).toEqual([
      [0, 0],
      [10, 100],
      [20, 200],
    ]);
  });

  test('streut schwächer mit dem Solo-Spreizwert als mit dem Multiplayer-Wert', () => {
    const backAngle = Math.PI;
    const deviation = (spread: number): number => {
      const particles = createTailParticles({
        ...baseOptions,
        exhaustSpread: spread,
        count: 400,
        random: seededRandom(23),
      });

      return Math.max(
        ...particles.map((p) => {
          const direction = Math.atan2(p.vy - 0.3, p.vx) - backAngle;
          return Math.abs(Math.atan2(Math.sin(direction), Math.cos(direction)));
        }),
      );
    };

    expect(deviation(TAIL_EXHAUST_SPREAD_SOLO)).toBeLessThan(0.33);
    expect(deviation(TAIL_EXHAUST_SPREAD_MULTIPLAYER)).toBeLessThan(0.38);
    expect(deviation(TAIL_EXHAUST_SPREAD_MULTIPLAYER)).toBeGreaterThan(
      deviation(TAIL_EXHAUST_SPREAD_SOLO),
    );
  });

  test('reagiert auf den Spreizparameter bei gleichem Seed', () => {
    const solo = createTailParticles({
      ...baseOptions,
      exhaustSpread: TAIL_EXHAUST_SPREAD_SOLO,
      count: 20,
      random: seededRandom(99),
    });
    const multiplayer = createTailParticles({
      ...baseOptions,
      exhaustSpread: TAIL_EXHAUST_SPREAD_MULTIPLAYER,
      count: 20,
      random: seededRandom(99),
    });

    expect(solo).not.toEqual(multiplayer);
    const differingVelocities = solo.filter((p, index) => p.vx !== multiplayer[index].vx).length;
    expect(differingVelocities).toBe(20);
  });
});
