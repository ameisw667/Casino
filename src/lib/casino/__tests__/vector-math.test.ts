import { describe, expect, it } from 'vitest';
import {
  cosineSimilarity,
  dotProduct,
  normalizeVector,
  vectorNorm,
} from '../guide-knowledge/vector-math';

describe('Vector Math Module', () => {
  it('calculates dot product accurately', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    expect(dotProduct(a, b)).toBe(32);
  });

  it('throws error when vector dimensions mismatch in dotProduct', () => {
    expect(() => dotProduct([1, 2], [1, 2, 3])).toThrow('Vector dimension mismatch');
  });

  it('calculates vector norm (Euclidean length)', () => {
    const v = [3, 4];
    // sqrt(3^2 + 4^2) = sqrt(25) = 5
    expect(vectorNorm(v)).toBe(5);
  });

  it('calculates cosine similarity correctly', () => {
    // Identical vectors -> 1.0
    const a = [1, 0, 0];
    expect(cosineSimilarity(a, [1, 0, 0])).toBeCloseTo(1.0, 5);

    // Orthogonal vectors -> 0.0
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0, 5);

    // Opposite vectors -> -1.0
    expect(cosineSimilarity([2, 0], [-2, 0])).toBeCloseTo(-1.0, 5);

    // Zero vector handling -> 0.0
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it('normalizes vector to unit length', () => {
    const v = [3, 4];
    const normalized = normalizeVector(v);

    expect(vectorNorm(normalized)).toBeCloseTo(1.0, 5);
    expect(normalized[0]).toBeCloseTo(0.6, 5);
    expect(normalized[1]).toBeCloseTo(0.8, 5);
  });
});
