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

export const GROWTH_FACTOR = 0.003;
export const MAX_POINTS = 500;
export const WINDOW_POINTS = 180;
export const ROCKET_X_FRACTION = 0.68;

export interface CrashTrajectoryState {
  padX: number;
  padY: number;
  rocketX: number;
  rocketY: number;
  flightAngle: number;
  maxClimb: number;
}

export function getCrashTrajectoryState(
  width: number,
  height: number,
  m: number,
): CrashTrajectoryState {
  const padX = Math.max(52, width * 0.085);
  const padY = height * 0.86;
  const targetRocketX = width * ROCKET_X_FRACTION;
  const maxClimb = padY - height * 0.22;

  // Multiplier-based launch transition (smooth liftoff from pad)
  const launchT = Math.min(1, Math.max(0, (m - 1) / 0.35));
  const smoothTakeoff = 0.5 - 0.5 * Math.cos(launchT * Math.PI);
  const rocketX = padX + (targetRocketX - padX) * smoothTakeoff;

  // Asymptotic smooth altitude curve matching the horizon grid
  const altitudeRatio = 1 - 1 / Math.pow(Math.max(1, m), 0.48);
  const rocketY = padY - altitudeRatio * maxClimb;

  // Tangent flight angle (pointing up-right)
  const dx = Math.max(1, (rocketX - padX) * 1.15);
  const dy = -(padY - rocketY) * 2.15;
  const flightAngle = Math.atan2(dy, dx);

  return {
    padX,
    padY,
    rocketX,
    rocketY,
    flightAngle,
    maxClimb,
  };
}

export function getCrashMilestoneY(milestoneValue: number, padY: number, maxClimb: number): number {
  const ratio = 1 - 1 / Math.pow(Math.max(1, milestoneValue), 0.48);
  return padY - ratio * maxClimb;
}
