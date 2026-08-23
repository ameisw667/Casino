import type { MutableRefObject } from 'react';

export type CrashStatus = 'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'exhaust' | 'spark' | 'smoke' | 'explosion' | 'cashout' | 'shockwave';
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number;
  opacity: number;
  twinklePhase: number;
}

export interface LiveBet {
  user: string;
  amount: number;
  multiplier: number | null;
  payout: number | null;
  action: 'BET' | 'CASHOUT' | 'BUST';
  _target?: number;
}

export function formatMultiplier(mult: number): string {
  if (mult >= 100000) return `${(mult / 1000).toFixed(0)}k+x`;
  if (mult >= 10000) return `${(mult / 1000).toFixed(1)}kx`;
  return `${mult.toFixed(2)}x`;
}

export function pseudoRandom(seedRef: MutableRefObject<number>): number {
  seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
  return seedRef.current / 0x7fffffff;
}

export const RISK_ESCALATION_RATE = 0.35;

export function getRiskFactor(multiplier: number): number {
  return 1 - 1 / (1 + Math.max(0, multiplier - 1) * RISK_ESCALATION_RATE);
}

export const MILESTONE_VALUES = [2, 5, 10, 25, 50, 100, 250, 500, 1000];

// Render constants shared by the RAF loop (useCrashGameLoop) and the page (cashout coin spawn).
export const GROWTH_FACTOR = 0.003;
export const MAX_POINTS = 500;
export const WINDOW_POINTS = 180;
export const ROCKET_X_FRACTION = 0.62;
