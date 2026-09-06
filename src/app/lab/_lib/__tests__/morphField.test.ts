import { describe, expect, it } from 'vitest';
import { applyMorph, cubicInOut, MorphField, rootMeanSquareError } from '../morphField';
import { buildChaosField, buildCrashCurve } from '../shapeTargets';

const COUNT = 300;

function makeField(): MorphField {
  let state = 99;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state >>> 8) / 16777216;
  };
  const field = new MorphField(buildChaosField(COUNT, rand));
  field.beginMorphTo(buildCrashCurve(COUNT, rand));
  return field;
}

describe('cubicInOut', () => {
  it('endet bei 0/1 und ist monoton steigend', () => {
    expect(cubicInOut(0)).toBe(0);
    expect(cubicInOut(1)).toBe(1);
    let previous = -1;
    for (let i = 0; i <= 10; i += 1) {
      const value = cubicInOut(i / 10);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('MorphField', () => {
  it('Morph startet bei 0 und erreicht 1 nach Dauer', () => {
    const field = makeField();
    expect(field.morphProgress).toBe(0);
    const { morph } = field.advance(1);
    expect(morph).toBe(1);
  });

  it('Zielwechsel mid-flight erzeugt keinen Sprung (Kontinuität)', () => {
    const field = makeField();
    field.advance(0.14);
    const beforeSwap = applyMorph(
      field.sourceTarget,
      field.activeTarget,
      cubicInOut(field.morphProgress),
    );
    field.beginMorphTo(buildCrashCurve(COUNT, () => 0.5));
    const afterSwap = applyMorph(
      field.sourceTarget,
      field.activeTarget,
      cubicInOut(field.morphProgress),
    );
    expect(rootMeanSquareError(beforeSwap, afterSwap)).toBeLessThan(0.01);
  });

  it('RMS-Wertung identischer Formen ist 0', () => {
    const a = new Float32Array([1, 2, 3]);
    expect(rootMeanSquareError(a, new Float32Array([1, 2, 3]))).toBe(0);
  });

  it('Falsche Zielgröße wird abgelehnt', () => {
    const field = makeField();
    expect(() => field.beginMorphTo(new Float32Array(3))).toThrow('morph target size mismatch');
  });
});
