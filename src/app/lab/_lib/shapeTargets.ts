export const PLANE_HALF_WIDTH = 7;
export const PLANE_HALF_HEIGHT = 4.2;

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Pixelfeld (RGBA) → `count` Partikelpositionen in Bildschirmkoordinaten
 * [0..1]². Jitter ±0.5px gegen sichtbares Rastermosaik; reine Funktion,
 * damit das Sampling ohne DOM testbar bleibt.
 */
export function samplePointsFromAlphaGrid(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  count: number,
  rand: () => number,
): Point2D[] {
  const candidates: number[] = [];
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 128) candidates.push(i);
  }
  if (candidates.length === 0) return [];
  const points: Point2D[] = [];
  for (let n = 0; n < count; n += 1) {
    const idx = candidates[Math.floor(rand() * candidates.length)];
    const pixelIndex = idx / 4;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);
    points.push({
      x: (px + rand() - 0.5) / width,
      y: (py + rand() - 0.5) / height,
    });
  }
  return points;
}

export function mapPointsToPlane(points: Point2D[]): Float32Array {
  const out = new Float32Array(points.length * 3);
  points.forEach((p, i) => {
    out[i * 3] = (p.x * 2 - 1) * PLANE_HALF_WIDTH;
    out[i * 3 + 1] = (1 - p.y * 2) * PLANE_HALF_HEIGHT;
    out[i * 3 + 2] = 0;
  });
  return out;
}

function jitter(rand: () => number, magnitude: number): number {
  return (rand() * 2 - 1) * magnitude;
}

export function buildChaosField(count: number, rand: () => number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    out[i * 3] = jitter(rand, PLANE_HALF_WIDTH * 1.1);
    out[i * 3 + 1] = jitter(rand, PLANE_HALF_HEIGHT * 1.1);
    out[i * 3 + 2] = jitter(rand, 1.4);
  }
  return out;
}

/**
 * Crash-Kurve als Exponentialzug: x gleichverteilt über die Breite,
 * y exponentiell steigend, Streuung senkrecht zur Kurve.
 */
export function buildCrashCurve(
  count: number,
  rand: () => number,
  halfWidth = PLANE_HALF_WIDTH,
  halfHeight = PLANE_HALF_HEIGHT,
): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const t = rand();
    const x = (t * 2 - 1) * halfWidth * 0.92 + jitter(rand, 0.05);
    const steep = Math.exp(2.6 * t) - 1;
    const steepMax = Math.exp(2.6) - 1;
    const y = -halfHeight * 0.82 + (steep / steepMax) * (halfHeight * 1.55);
    const normal = jitter(rand, 0.34);
    const slope = ((2.6 / steepMax) * (halfHeight * 1.55)) / (2 * halfWidth * 0.92);
    const normLen = Math.sqrt(1 + slope * slope);
    out[i * 3] = x + (normal * -slope) / normLen;
    out[i * 3 + 1] = y + normal / normLen;
    out[i * 3 + 2] = jitter(rand, 0.25);
  }
  return out;
}

export function buildGroundLine(count: number, rand: () => number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    out[i * 3] = jitter(rand, PLANE_HALF_WIDTH);
    out[i * 3 + 1] = -PLANE_HALF_HEIGHT + 0.35 + Math.abs(jitter(rand, 0.55));
    out[i * 3 + 2] = jitter(rand, 0.2);
  }
  return out;
}
