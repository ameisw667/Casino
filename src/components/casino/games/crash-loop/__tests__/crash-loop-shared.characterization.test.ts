// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Particle, Star } from '../../crash/crash-helpers';
import { soundManager } from '@/lib/casino/sound-manager';
import {
  advanceAndDrawParticles,
  applyTraumaShake,
  createExplosion,
  createTail,
  setupCanvasForFrame,
  updateAndDrawStarfield,
} from '../crash-loop-shared';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: { playPositional: vi.fn() },
}));

interface ContextMock {
  ctx: CanvasRenderingContext2D;
  fills: { color: string; alpha: number }[];
  strokes: string[];
  arcRadii: number[];
  order: string[];
}

function createContextMock(): ContextMock {
  const fills: ContextMock['fills'] = [];
  const strokes: string[] = [];
  const arcRadii: number[] = [];
  const order: string[] = [];

  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 0,
    shadowBlur: 0,
    shadowColor: '',
    save: vi.fn(() => order.push('save')),
    restore: vi.fn(() => order.push('restore')),
    translate: vi.fn((x: number, y: number) => order.push(`translate:${x}:${y}`)),
    scale: vi.fn((x: number, y: number) => order.push(`scale:${x}:${y}`)),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn((_x: number, _y: number, radius: number) => arcRadii.push(radius)),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(function (this: unknown) {
      strokes.push(String((this as { strokeStyle: string }).strokeStyle));
      order.push('stroke');
    }),
    fill: vi.fn(function (this: unknown) {
      const self = this as { fillStyle: string; globalAlpha: number };
      fills.push({ color: String(self.fillStyle), alpha: self.globalAlpha });
      order.push('fill');
    }),
  };

  return { ctx: ctx as unknown as CanvasRenderingContext2D, fills, strokes, arcRadii, order };
}

function createCanvasStub(ctx: CanvasRenderingContext2D | null): {
  canvas: HTMLCanvasElement;
  assignments: string[];
} {
  const assignments: string[] = [];
  const store = { width: 0, height: 0 };

  const canvas = {
    clientWidth: 800,
    clientHeight: 400,
    getContext: () => ctx,
    get width() {
      return store.width;
    },
    set width(value: number) {
      assignments.push(`width:${value}`);
      store.width = value;
    },
    get height() {
      return store.height;
    },
    set height(value: number) {
      assignments.push(`height:${value}`);
      store.height = value;
    },
  };

  return { canvas: canvas as unknown as HTMLCanvasElement, assignments };
}

function makeParticle(overrides: Partial<Particle> = {}): Particle {
  return {
    x: 0,
    y: 0,
    vx: 1,
    vy: 2,
    life: 1,
    maxLife: 1,
    color: '#FFD700',
    size: 10,
    type: 'explosion',
    ...overrides,
  };
}

function seededRandom(seed = 1): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

describe('advanceAndDrawParticles', () => {
  test('gibt ein neues Array zurück und wirft tote Partikel heraus', () => {
    const { ctx } = createContextMock();
    const input = [makeParticle({ life: 0 }), makeParticle({ life: 0.5 })];

    const survivors = advanceAndDrawParticles(ctx, input);

    expect(survivors).not.toBe(input);
    expect(survivors).toHaveLength(1);
    expect(survivors[0].life).toBeCloseTo(0.475);
  });

  test('verschiebt jedes Partikel um seine Geschwindigkeit', () => {
    const { ctx } = createContextMock();
    const particle = makeParticle({ x: 3, y: 4, vx: 1.5, vy: -2.5 });

    advanceAndDrawParticles(ctx, [particle]);

    expect(particle.x).toBeCloseTo(4.5);
    expect(particle.y).toBeCloseTo(1.5);
  });

  test('zeichnet die Schockwelle als wachsenden Ring mit Schatten', () => {
    const { ctx, fills, strokes } = createContextMock();
    const particle = makeParticle({ type: 'shockwave', size: 10, life: 1 });

    advanceAndDrawParticles(ctx, [particle]);

    expect(particle.size).toBe(16);
    expect(particle.life).toBeCloseTo(0.96);
    expect(strokes).toHaveLength(1);
    expect(strokes[0]).toContain('rgba(255, 120, 50,');
    expect(fills).toHaveLength(0);
  });

  test('lässt Münzen fallen und Rauch aufquellen', () => {
    const { ctx } = createContextMock();
    const coin = makeParticle({ type: 'cashout', size: 5, vy: 0 });
    const smoke = makeParticle({ type: 'smoke', size: 5 });

    advanceAndDrawParticles(ctx, [coin, smoke]);

    expect(coin.vy).toBeCloseTo(0.08);
    expect(coin.life).toBeCloseTo(0.985);
    expect(coin.size).toBe(5);
    expect(smoke.size).toBeCloseTo(5.15);
    expect(smoke.life).toBeCloseTo(0.98);
  });

  test('verblasst Funken und Bruchstücke gleichmäßig', () => {
    const { ctx } = createContextMock();
    const spark = makeParticle({ type: 'spark', life: 1 });
    const debris = makeParticle({ type: 'explosion', life: 1 });

    advanceAndDrawParticles(ctx, [spark, debris]);

    expect(spark.life).toBeCloseTo(0.975);
    expect(debris.life).toBeCloseTo(0.975);
  });

  test('füllt Partikel mit ihrer Deckkraft und setzt Alpha danach zurück', () => {
    const { ctx, fills } = createContextMock();
    const particle = makeParticle({ color: '#FFFDF0', life: 0.5 });

    advanceAndDrawParticles(ctx, [particle]);

    expect(fills).toEqual([{ color: '#FFFDF0', alpha: 0.475 }]);
    expect(ctx.globalAlpha).toBe(1);
  });

  test('setzt Alpha auch bei leerer Partikelliste zurück', () => {
    const { ctx } = createContextMock();

    advanceAndDrawParticles(ctx, []);

    expect(ctx.globalAlpha).toBe(1);
  });

  test('zeichnet den Ring mit dem Radius der Schockwelle', () => {
    const { ctx, arcRadii } = createContextMock();

    advanceAndDrawParticles(ctx, [makeParticle({ type: 'shockwave', size: 10 })]);

    expect(arcRadii).toEqual([16]);
  });
});

describe('setupCanvasForFrame', () => {
  test('skaliert die Zeichenfläche auf die Pixeldichte', () => {
    const { ctx, order } = createContextMock();
    const { canvas, assignments } = createCanvasStub(ctx);
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

    const frame = setupCanvasForFrame(canvas);

    expect(assignments).toEqual(['width:1600', 'height:800']);
    expect(order).toEqual(['save', 'scale:2:2']);
    expect(frame).toEqual(expect.objectContaining({ width: 800, height: 400 }));
  });

  test('fasst die Zeichenfläche nicht erneut an, wenn die Größe stimmt', () => {
    const { ctx } = createContextMock();
    const { canvas, assignments } = createCanvasStub(ctx);
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

    setupCanvasForFrame(canvas);
    assignments.length = 0;
    const frame = setupCanvasForFrame(canvas);

    expect(assignments).toEqual([]);
    expect(frame).not.toBeNull();
  });

  test('arbeitet ohne Pixeldichte des Browsers mit Faktor 1', () => {
    const { ctx } = createContextMock();
    const { canvas, assignments } = createCanvasStub(ctx);
    Object.defineProperty(window, 'devicePixelRatio', { value: 0, configurable: true });

    setupCanvasForFrame(canvas);

    expect(assignments).toEqual(['width:800', 'height:400']);
  });

  test('bricht ab, wenn der Canvas keinen Zeichenkontext liefert', () => {
    const { canvas } = createCanvasStub(null);

    expect(setupCanvasForFrame(canvas)).toBeNull();
  });
});

describe('applyTraumaShake', () => {
  test('schweigt unter der Schwelle und verbraucht keinen Zufall', () => {
    const { ctx, order } = createContextMock();
    const random = vi.fn(() => 0.5);
    const shake = { intensity: 0.1 };

    applyTraumaShake(ctx, shake, random);

    expect(order).toEqual([]);
    expect(shake.intensity).toBe(0.1);
    expect(random).not.toHaveBeenCalled();
  });

  test('verschiebt die Zeichenebene und dämpft die Intensität', () => {
    const { ctx, order } = createContextMock();
    const shake = { intensity: 18 };

    applyTraumaShake(ctx, shake, () => 0.5);

    expect(order).toEqual(['translate:0:0']);
    expect(shake.intensity).toBeCloseTo(16.2);
  });

  test('zieht genau zwei Zufallswerte pro Bild', () => {
    const { ctx } = createContextMock();
    const random = vi.fn(() => 0.75);

    applyTraumaShake(ctx, { intensity: 10 }, random);

    expect(random).toHaveBeenCalledTimes(2);
  });
});

describe('updateAndDrawStarfield', () => {
  const baseStar: Star = {
    x: 100,
    y: 50,
    size: 2,
    speed: 1,
    layer: 1,
    opacity: 0.8,
    twinklePhase: 0,
  };

  test('lässt Sterne im Ruhezustand langsam nach links unten driften', () => {
    const { ctx } = createContextMock();
    const star = { ...baseStar };

    updateAndDrawStarfield({
      ctx,
      stars: [star],
      isRunning: false,
      riskFactor: 0,
      multiplier: 1,
      width: 800,
      height: 400,
    });

    expect(star.x).toBeCloseTo(99.75);
    expect(star.y).toBeCloseTo(50.1);
    expect(star.twinklePhase).toBeCloseTo(0.03);
  });

  test('beschleunigt die Drift mit Risikofaktor während der Fahrt', () => {
    const { ctx } = createContextMock();
    const star = { ...baseStar, layer: 2 };

    updateAndDrawStarfield({
      ctx,
      stars: [star],
      isRunning: true,
      riskFactor: 1,
      multiplier: 2,
      width: 800,
      height: 400,
    });

    expect(star.x).toBeCloseTo(100 - 1 * 2 * 5.8);
    expect(star.y).toBeCloseTo(50 + 1 * 2 * 5.8 * 0.4);
  });

  test('setzt links austretende Sterne rechts oberhalb der Breite neu', () => {
    const { ctx } = createContextMock();
    const star = { ...baseStar, x: -1 };

    updateAndDrawStarfield({
      ctx,
      stars: [star],
      isRunning: false,
      riskFactor: 0,
      multiplier: 1,
      width: 800,
      height: 400,
    });

    expect(star.x).toBeGreaterThanOrEqual(800);
    expect(star.x).toBeLessThan(820);
  });

  test('holt unten austretende Sterne nach oben zurück', () => {
    const { ctx } = createContextMock();
    const star = { ...baseStar, y: 500 };

    updateAndDrawStarfield({
      ctx,
      stars: [star],
      isRunning: true,
      riskFactor: 0.5,
      multiplier: 12,
      width: 800,
      height: 400,
    });

    expect(star.y).toBe(-10);
  });

  test('zeichnet den Hyperraum-Strich nur bei hohem Multiplikator auf Ebene 3', () => {
    const { ctx, fills, strokes } = createContextMock();

    updateAndDrawStarfield({
      ctx,
      stars: [{ ...baseStar, layer: 3 }],
      isRunning: true,
      riskFactor: 1,
      multiplier: 12,
      width: 800,
      height: 400,
    });

    expect(strokes).toHaveLength(1);
    expect(strokes[0]).toContain('rgba(255, 240, 200,');
    expect(fills).toHaveLength(0);
  });

  test('zeichnet goldene Punkte auf Ebene 3, wenn der Multiplikator niedrig bleibt', () => {
    const { ctx, fills } = createContextMock();

    updateAndDrawStarfield({
      ctx,
      stars: [{ ...baseStar, layer: 3 }],
      isRunning: true,
      riskFactor: 1,
      multiplier: 3,
      width: 800,
      height: 400,
    });

    expect(fills).toHaveLength(1);
    expect(fills[0].color).toBe('#FFD700');
    expect(ctx.globalAlpha).toBe(1);
  });

  test('zeichnet weiße Punkte auf den hinteren Ebenen', () => {
    const { ctx, fills } = createContextMock();

    updateAndDrawStarfield({
      ctx,
      stars: [{ ...baseStar, layer: 1 }],
      isRunning: false,
      riskFactor: 0,
      multiplier: 1,
      width: 800,
      height: 400,
    });

    expect(fills[0].color).toBe('#FFFFFF');
  });
});

describe('createTail', () => {
  const options = {
    angle: 0,
    riskFactor: 0.5,
    isMobile: false,
    random: seededRandom(17),
  };

  test('hängt bei Solo die Partikel hinter den Düsen an', () => {
    const particles: Particle[] = [];

    createTail({ ...options, x: 100, y: 200, particles, variant: 'solo' });

    expect(particles).toHaveLength(2);
    particles.forEach((p) => {
      expect(Math.hypot(p.x - 100, p.y - 200)).toBeGreaterThan(40);
    });
  });

  test('hängt bei Multiplayer die Partikel dicht am Emissionspunkt an', () => {
    const particles: Particle[] = [];

    createTail({ ...options, x: 100, y: 200, particles, variant: 'multiplayer' });

    expect(particles).toHaveLength(2);
    particles.forEach((p) => {
      expect(Math.hypot(p.x - 100, p.y - 200)).toBeLessThan(3);
    });
  });

  test('setzt bei Mobilgeräten nur ein Partikel pro Bild', () => {
    const particles: Particle[] = [];

    createTail({ ...options, x: 100, y: 200, particles, isMobile: true, variant: 'solo' });

    expect(particles).toHaveLength(1);
  });

  test('schweigt, sobald die Partikelgrenze erreicht ist', () => {
    const particles: Particle[] = Array.from({ length: 251 }, () => makeParticle());

    createTail({ ...options, x: 100, y: 200, particles, variant: 'solo' });

    expect(particles).toHaveLength(251);
  });

  test('lässt bestehende Partikel unangetastet und hängt hinten an', () => {
    const existing = makeParticle({ x: 1, y: 1 });
    const particles: Particle[] = [existing];

    createTail({ ...options, x: 100, y: 200, particles, variant: 'solo' });

    expect(particles[0]).toBe(existing);
    expect(particles).toHaveLength(3);
  });
});

describe('createExplosion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseOptions = {
    x: 400,
    canvasWidth: 800,
    particles: [] as Particle[],
    prefersReducedMotion: false,
    isMobile: false,
    random: seededRandom(5),
  };

  test('hängt Schockwelle und Bruchstücke hinten an', () => {
    const particles: Particle[] = [makeParticle({ x: 9, y: 9 })];

    createExplosion({ ...baseOptions, y: 100, particles, shake: { intensity: 0 } });

    expect(particles).toHaveLength(1 + 1 + 55);
    expect(particles[0].x).toBe(9);
    expect(particles[1].type).toBe('shockwave');
    expect(particles[2].type).toBe('explosion');
  });

  test('erzeugt auf Mobilgeräten die schlanke Partikelzahl', () => {
    const particles: Particle[] = [];

    createExplosion({ ...baseOptions, y: 100, particles, isMobile: true, shake: { intensity: 0 } });

    expect(particles).toHaveLength(26);
  });

  test('setzt den Kamera-Ruck auf die volle Intensität', () => {
    const shake = { intensity: 0 };

    createExplosion({ ...baseOptions, y: 100, shake });

    expect(shake.intensity).toBe(18);
  });

  test('lässt den Kamera-Ruck bei reduzierter Bewegung unverändert', () => {
    const shake = { intensity: 4 };

    createExplosion({ ...baseOptions, y: 100, shake, prefersReducedMotion: true });

    expect(shake.intensity).toBe(4);
  });

  test('verortet den Explosionsklang auf der Stereobreite', () => {
    createExplosion({ ...baseOptions, y: 100, shake: { intensity: 0 } });

    expect(soundManager.playPositional).toHaveBeenCalledWith('crash-explode', 0);
  });

  test('schiebt den Klang ohne Breitenangabe in die Mitte', () => {
    createExplosion({ ...baseOptions, y: 100, canvasWidth: 0, shake: { intensity: 0 } });

    expect(soundManager.playPositional).toHaveBeenCalledWith('crash-explode', 0);
  });

  test('verortet einen Treffer am rechten Rand rechts', () => {
    createExplosion({ ...baseOptions, x: 800, y: 100, shake: { intensity: 0 } });

    expect(soundManager.playPositional).toHaveBeenCalledWith('crash-explode', 1);
  });
});
