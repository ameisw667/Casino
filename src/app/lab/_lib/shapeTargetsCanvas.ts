import { mapPointsToPlane, samplePointsFromAlphaGrid, type Point2D } from './shapeTargets';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 360;
const MASK_FONT_SIZE = 220;

export interface TextSamplerDeps {
  createElement: () => HTMLCanvasElement | null;
}

export function isTextSamplingAvailable(): boolean {
  return typeof document !== 'undefined';
}

/**
 * Einmal-Extraktor (DOM-seitig): zeichnet eine Maske mit dem heavy Maske-Font
 * und stößt das pure Sampling an. Bewusst ungetestet (Canvas-Env), damit die
 * Vitest-Suite im node-Env bleibt — die Geometrie-Logik liegt in shapeTargets.
 */
export function sampleTextTarget(
  text: string,
  maskFontFamily: string,
  count: number,
  rand: () => number,
): Float32Array | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${MASK_FONT_SIZE}px ${maskFontFamily}`;
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  const data = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
  const points: Point2D[] = samplePointsFromAlphaGrid(
    data,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    count,
    rand,
  );
  return mapPointsToPlane(points);
}
