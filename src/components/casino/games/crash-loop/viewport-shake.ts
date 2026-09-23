import { EXPLOSION_SHAKE_INTENSITY, type RandomSource } from './particles-physics';

export const SHAKE_ACTIVE_THRESHOLD = 0.1;
export const SHAKE_DECAY_FACTOR = 0.9;

export interface ShakeOffset {
  x: number;
  y: number;
}

export function isShakeActive(intensity: number): boolean {
  return intensity > SHAKE_ACTIVE_THRESHOLD;
}

export function getShakeOffset(intensity: number, random: RandomSource): ShakeOffset {
  return {
    x: (random() - 0.5) * intensity,
    y: (random() - 0.5) * intensity,
  };
}

export function decayShakeIntensity(
  intensity: number,
  factor: number = SHAKE_DECAY_FACTOR,
): number {
  return intensity * factor;
}

// null = Intensität nicht anfassen (reduzierte Bewegung lässt den Shake unberührt).
export function getExplosionShakeIntensity(prefersReducedMotion: boolean): number | null {
  return prefersReducedMotion ? null : EXPLOSION_SHAKE_INTENSITY;
}
