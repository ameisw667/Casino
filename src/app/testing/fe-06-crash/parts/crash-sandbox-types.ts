export interface CrashHistoryItem {
  id: string;
  multiplier: number;
  cashedOutAt?: number;
  win: boolean;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ShardParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  life: number;
}

export type FlightState = 'IDLE' | 'FLYING' | 'CRASHED' | 'CASHED_OUT';
