'use client';

import type { Particle, Star } from '../crash/crash-helpers';
import { soundManager } from '@/lib/casino/sound-manager';
import {
  getCanvasBackingSize,
  needsBackingStoreUpdate,
  resolveDevicePixelRatio,
  type CanvasBackingSize,
} from './canvas-frame';
import {
  createExplosionParticles,
  createTailParticles,
  getExplosionParticleCount,
  getTailParticleCount,
  getTailParticleLimit,
  TAIL_EXHAUST_SPREAD_MULTIPLAYER,
  TAIL_EXHAUST_SPREAD_SOLO,
  type RandomSource,
  type TailOriginResolver,
} from './particles-physics';
import {
  createDualNozzleOriginResolver,
  createSinglePointOriginResolver,
  getPositionalPan,
} from './tail-geometry';
import {
  decayShakeIntensity,
  getExplosionShakeIntensity,
  getShakeOffset,
  isShakeActive,
} from './viewport-shake';

export interface TraumaShake {
  intensity: number;
}

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  backing: CanvasBackingSize;
}

export interface ExplosionOptions {
  x: number;
  y: number;
  canvasWidth: number;
  particles: Particle[];
  shake: TraumaShake;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  random: RandomSource;
}

export type TailVariant = 'solo' | 'multiplayer';

export interface TailOptions {
  x: number;
  y: number;
  angle: number;
  riskFactor: number;
  particles: Particle[];
  isMobile: boolean;
  random: RandomSource;
  variant: TailVariant;
}

export interface StarfieldOptions {
  ctx: CanvasRenderingContext2D;
  stars: Star[];
  isRunning: boolean;
  riskFactor: number;
  multiplier: number;
  width: number;
  height: number;
}

export function setupCanvasForFrame(canvas: HTMLCanvasElement): CanvasFrame | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const dpr = resolveDevicePixelRatio(window.devicePixelRatio);
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const backing = getCanvasBackingSize(displayWidth, displayHeight, dpr);

  if (needsBackingStoreUpdate(canvas.width, canvas.height, backing)) {
    canvas.width = backing.width;
    canvas.height = backing.height;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  return { ctx, width: displayWidth, height: displayHeight, backing };
}

export function applyTraumaShake(
  ctx: CanvasRenderingContext2D,
  shake: TraumaShake,
  random: RandomSource,
): void {
  if (!isShakeActive(shake.intensity)) return;

  const offset = getShakeOffset(shake.intensity, random);
  ctx.translate(offset.x, offset.y);
  shake.intensity = decayShakeIntensity(shake.intensity);
}

export function createExplosion({
  x,
  y,
  canvasWidth,
  particles,
  shake,
  prefersReducedMotion,
  isMobile,
  random,
}: ExplosionOptions): void {
  const intensity = getExplosionShakeIntensity(prefersReducedMotion);
  if (intensity !== null) shake.intensity = intensity;

  particles.push(
    ...createExplosionParticles({ x, y, count: getExplosionParticleCount(isMobile), random }),
  );

  soundManager.playPositional('crash-explode', getPositionalPan(x, canvasWidth));
}

export function createTail({
  x,
  y,
  angle,
  riskFactor,
  particles,
  isMobile,
  random,
  variant,
}: TailOptions): void {
  if (particles.length > getTailParticleLimit(isMobile)) return;

  const resolveOrigin: TailOriginResolver =
    variant === 'solo'
      ? createDualNozzleOriginResolver(x, y, angle)
      : createSinglePointOriginResolver(x, y);

  particles.push(
    ...createTailParticles({
      angle,
      riskFactor,
      exhaustSpread:
        variant === 'solo' ? TAIL_EXHAUST_SPREAD_SOLO : TAIL_EXHAUST_SPREAD_MULTIPLAYER,
      count: getTailParticleCount(isMobile),
      random,
      resolveOrigin,
    }),
  );
}

export function updateAndDrawStarfield({
  ctx,
  stars,
  isRunning,
  riskFactor,
  multiplier,
  width,
  height,
}: StarfieldOptions): void {
  const starSpeed = isRunning ? 0.8 + riskFactor * 5 : 0.3;

  stars.forEach((star) => {
    // Drift diagonally down-left (ambient drift during IDLE)
    const currentSpeed = isRunning ? starSpeed : 0.25;
    star.x -= star.speed * star.layer * currentSpeed;
    star.y += star.speed * star.layer * (currentSpeed * 0.4);

    // Wrap around canvas
    if (star.x < 0) star.x = width + Math.random() * 20;
    if (star.y > height) star.y = -10;

    star.twinklePhase += 0.03;
    const alpha = star.opacity * (0.6 + Math.sin(star.twinklePhase) * 0.4);

    if (isRunning && multiplier > 10.0 && star.layer === 3) {
      // Hyperspace warp streak
      ctx.strokeStyle = `rgba(255, 240, 200, ${alpha * 0.8})`;
      ctx.lineWidth = star.size * 0.9;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x + 12 * riskFactor, star.y - 6 * riskFactor);
      ctx.stroke();
    } else {
      ctx.fillStyle = star.layer === 3 ? '#FFD700' : '#FFFFFF';
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  });
}

// Mutiert die Partikel in place und liefert die überlebenden zurück — die Aufrufstelle
// schreibt sie zurück in ihre Ref, weil das Filter-Ergebnis ein neues Array ist.
export function advanceAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
): Particle[] {
  const survivors = particles.filter((p) => p.life > 0);

  survivors.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.type === 'shockwave') {
      p.size += 6;
      p.life -= 0.04;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 120, 50, ${p.life * 0.7})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF8800';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (p.type === 'cashout') {
      p.vy += 0.08; // gravity for coins
      p.life -= 0.015;
    } else if (p.type === 'smoke') {
      p.size += 0.15; // expanding smoke
      p.life -= 0.02;
    } else {
      p.life -= 0.025;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1.0;

  return survivors;
}
