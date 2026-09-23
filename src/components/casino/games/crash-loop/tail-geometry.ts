import type { RandomSource, TailOrigin, TailOriginResolver } from './particles-physics';

// Dual-Düsen-Sitz der Solo-Rakete: -46 entlang der Schiffsachse, ±11 quer dazu.
export const SOLO_NOZZLE_AXIAL_OFFSET = 46;
export const SOLO_NOZZLE_LATERAL_OFFSET = 11;
export const SOLO_NOZZLE_JITTER = 3;

// Multiplayer zündet aus einem Punkt mit kleiner Streuung statt aus zwei Düsen.
export const MULTIPLAYER_TAIL_JITTER = 4;

export interface NozzlePair {
  nozzle1X: number;
  nozzle1Y: number;
  nozzle2X: number;
  nozzle2Y: number;
}

export function getTailNozzles(x: number, y: number, angle: number): NozzlePair {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const perpX = -sinA;
  const perpY = cosA;

  return {
    nozzle1X: x - SOLO_NOZZLE_AXIAL_OFFSET * cosA + SOLO_NOZZLE_LATERAL_OFFSET * perpX,
    nozzle1Y: y - SOLO_NOZZLE_AXIAL_OFFSET * sinA + SOLO_NOZZLE_LATERAL_OFFSET * perpY,
    nozzle2X: x - SOLO_NOZZLE_AXIAL_OFFSET * cosA - SOLO_NOZZLE_LATERAL_OFFSET * perpX,
    nozzle2Y: y - SOLO_NOZZLE_AXIAL_OFFSET * sinA - SOLO_NOZZLE_LATERAL_OFFSET * perpY,
  };
}

// Solo: alternierend Düse 1/2, jede Position leicht verrauscht (x vor y gezogen).
export function createDualNozzleOriginResolver(
  x: number,
  y: number,
  angle: number,
): TailOriginResolver {
  const { nozzle1X, nozzle1Y, nozzle2X, nozzle2Y } = getTailNozzles(x, y, angle);

  return (index: number, random: RandomSource): TailOrigin => ({
    x: (index % 2 === 0 ? nozzle1X : nozzle2X) + (random() - 0.5) * SOLO_NOZZLE_JITTER,
    y: (index % 2 === 0 ? nozzle1Y : nozzle2Y) + (random() - 0.5) * SOLO_NOZZLE_JITTER,
  });
}

// Multiplayer: ein Emissionspunkt mit quadratischer Streuung (x vor y gezogen).
export function createSinglePointOriginResolver(x: number, y: number): TailOriginResolver {
  return (_index: number, random: RandomSource): TailOrigin => ({
    x: x + (random() - 0.5) * MULTIPLAYER_TAIL_JITTER,
    y: y + (random() - 0.5) * MULTIPLAYER_TAIL_JITTER,
  });
}

// Positioniert den Explosionsklang dort, wo die Rakete auf dem Schirm stand.
export function getPositionalPan(x: number, canvasWidth: number): number {
  return canvasWidth > 0 ? Math.max(-1, Math.min(1, (x / canvasWidth) * 2 - 1)) : 0;
}
