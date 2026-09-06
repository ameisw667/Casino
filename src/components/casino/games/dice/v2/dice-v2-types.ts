import type { DiceHistoryItem } from '@/components/casino/games/dice/dice-config';

export type DiceRollState = 'idle' | 'rolling' | 'landing' | 'settled';

export interface DiceV2AnimationConfig {
  durationMs: number; // 900ms standard dramaturgie
  rollImpulseY: number; // Höhe des Sprungs
  rotationSpins: number; // Anzahl der Umdrehungen
}

export interface Dice3DRotation {
  x: number;
  y: number;
  z: number;
}

export interface DiceCenterStageV2Props {
  isMobile: boolean;
  loading: boolean;
  lastResult: DiceHistoryItem | null;
  history: DiceHistoryItem[];
  winStreak: number;
  targetPoint: number;
  isRollOver: boolean;
  winChance: number;
  multiplier: number;
  isDraggingThumb: boolean;
  sliderRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onUpdateFromWinChance: (val: number) => void;
  onUpdateFromMultiplier: (val: number) => void;
  onUpdateFromTarget: (val: number) => void;
  onToggleRollMode: () => void;
  soundEnabled?: boolean;
}
