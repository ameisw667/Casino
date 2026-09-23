import type { Particle } from '../crash/crash-helpers';

export const EXPLOSION_PARTICLE_COUNT_MOBILE = 25;
export const EXPLOSION_PARTICLE_COUNT_DESKTOP = 55;
export const EXPLOSION_SHAKE_INTENSITY = 18;
export const EXPLOSION_COLORS = ['#FFF', '#FFD700', '#FF8800', '#FF3B30', '#B91C1C'];
export const SHOCKWAVE_COLOR = 'rgba(255, 100, 50, 0.8)';

export const TAIL_PARTICLE_LIMIT_MOBILE = 120;
export const TAIL_PARTICLE_LIMIT_DESKTOP = 250;
export const TAIL_PARTICLE_COUNT_MOBILE = 1;
export const TAIL_PARTICLE_COUNT_DESKTOP = 2;
export const TAIL_EXHAUST_SPREAD_SOLO = 0.35;
export const TAIL_EXHAUST_SPREAD_MULTIPLAYER = 0.45;
export const TAIL_SPARK_THRESHOLD = 0.4;
export const TAIL_COLOR_SPLIT = 0.5;

export type RandomSource = () => number;

export interface TailOrigin {
  x: number;
  y: number;
}

export type TailOriginResolver = (index: number, random: RandomSource) => TailOrigin;

export function getExplosionParticleCount(isMobile: boolean): number {
  return isMobile ? EXPLOSION_PARTICLE_COUNT_MOBILE : EXPLOSION_PARTICLE_COUNT_DESKTOP;
}

export function getTailParticleCount(isMobile: boolean): number {
  return isMobile ? TAIL_PARTICLE_COUNT_MOBILE : TAIL_PARTICLE_COUNT_DESKTOP;
}

export function getTailParticleLimit(isMobile: boolean): number {
  return isMobile ? TAIL_PARTICLE_LIMIT_MOBILE : TAIL_PARTICLE_LIMIT_DESKTOP;
}

export interface ExplosionParticleOptions {
  x: number;
  y: number;
  count: number;
  random: RandomSource;
}

// Ziehfolge der Zufallswerte ist Teil der Optik: shockwave, dann je Partikel
// angle → speed → maxLife → color → size. Nicht umsortieren.
export function createExplosionParticles({
  x,
  y,
  count,
  random,
}: ExplosionParticleOptions): Particle[] {
  const particles: Particle[] = [
    {
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      color: SHOCKWAVE_COLOR,
      size: 10,
      type: 'shockwave',
    },
  ];

  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const speed = 2 + random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.6 + random() * 0.6,
      color: EXPLOSION_COLORS[Math.floor(random() * EXPLOSION_COLORS.length)],
      size: 2 + random() * 3.5,
      type: 'explosion',
    });
  }

  return particles;
}

export interface TailParticleOptions {
  angle: number;
  riskFactor: number;
  exhaustSpread: number;
  count: number;
  random: RandomSource;
  resolveOrigin: TailOriginResolver;
}

// Ziehfolge wie bei der Explosion optikrelevant: je Partikel
// spreadAngle → speed → isSpark → color → origin (x, y) → vy → maxLife → size.
// Die Herkunft kommt über `resolveOrigin`, damit Solo (Dual-Düsen) und
// Multiplayer (Punkt-Jitter) dieselbe Schleife teilen, ohne ihre Geometrie zu verlieren.
export function createTailParticles({
  angle,
  riskFactor,
  exhaustSpread,
  count,
  random,
  resolveOrigin,
}: TailParticleOptions): Particle[] {
  const backAngle = angle + Math.PI;
  const particles: Particle[] = [];

  for (let k = 0; k < count; k++) {
    const spreadAngle = backAngle + (random() - 0.5) * exhaustSpread;
    const speed = 2.0 + riskFactor * 2.5 + random() * 2;

    const isSpark = random() > TAIL_SPARK_THRESHOLD;
    const color = isSpark
      ? random() > TAIL_COLOR_SPLIT
        ? '#FFFDF0'
        : '#FFD700'
      : random() > TAIL_COLOR_SPLIT
        ? '#FF8C00'
        : 'rgba(120, 110, 100, 0.4)';

    const origin = resolveOrigin(k, random);

    particles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(spreadAngle) * speed,
      vy: Math.sin(spreadAngle) * speed + (random() - 0.5) * 0.6,
      life: 1,
      maxLife: isSpark ? 0.35 + random() * 0.25 : 0.65,
      color,
      size: isSpark ? 1.5 + random() * 2 : 3 + random() * 4,
      type: isSpark ? 'spark' : 'smoke',
    });
  }

  return particles;
}
