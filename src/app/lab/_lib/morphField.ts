export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function cubicInOut(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function applyMorph(source: Float32Array, target: Float32Array, t: number): Float32Array {
  const out = new Float32Array(source.length);
  applyMorphInto(source, target, t, out);
  return out;
}

/** In-place Variante für stabile GPU-Buffer (keine reallocation im Morph). */
export function applyMorphInto(
  source: Float32Array,
  target: Float32Array,
  t: number,
  out: Float32Array,
): void {
  for (let i = 0; i < source.length; i += 1) {
    out[i] = lerp(source[i], target[i], t);
  }
}

export function rootMeanSquareError(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum / a.length);
}

export const DEFAULT_MORPH_DURATION_S = 0.28;

/**
 * Morph-Zustand der GPU-Partikel: Zielwechsel kostet ausschließlich zwei
 * Einmal-Buffer-Uploads (`aSource` = aktuelle Interpolation in-place,
 * `aTarget` = neue Form) — der Frame-Loop selbst schreibt niemals Buffer.
 * Die Buffer-Arrays bleiben stabil, damit GPU-Attribute die Referenz behalten.
 */
export class MorphField {
  private readonly sourceBuffer: Float32Array;
  private readonly targetBuffer: Float32Array;
  private progress = 1;
  private uploadDirty = false;

  readonly count: number;

  constructor(initialShape: Float32Array, durationS = DEFAULT_MORPH_DURATION_S) {
    this.count = initialShape.length / 3;
    this.sourceBuffer = new Float32Array(initialShape);
    this.targetBuffer = new Float32Array(initialShape);
    this.durationS = Math.max(0.05, durationS);
  }

  private durationS: number;

  get morphProgress(): number {
    return this.progress;
  }

  get sourceTarget(): Float32Array {
    return this.sourceBuffer;
  }

  get activeTarget(): Float32Array {
    return this.targetBuffer;
  }

  beginMorphTo(nextTarget: Float32Array): void {
    if (nextTarget.length !== this.sourceBuffer.length) {
      throw new Error('morph target size mismatch');
    }
    applyMorphInto(
      this.sourceBuffer,
      this.targetBuffer,
      cubicInOut(this.progress),
      this.sourceBuffer,
    );
    this.targetBuffer.set(nextTarget);
    this.progress = 0;
    this.uploadDirty = true;
  }

  advance(dtS: number): { morph: number; needsUpload: boolean } {
    if (this.progress < 1) {
      this.progress = clamp01(this.progress + dtS / this.durationS);
    }
    const needsUpload = this.uploadDirty;
    this.uploadDirty = false;
    return { morph: cubicInOut(this.progress), needsUpload };
  }
}
