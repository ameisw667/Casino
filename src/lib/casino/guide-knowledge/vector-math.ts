/**
 * Computes the dot product of two numerical vectors of the same dimension.
 */
export function dotProduct(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return dot;
}

/**
 * Computes the Euclidean norm (magnitude) of a vector.
 */
export function vectorNorm(v: readonly number[]): number {
  let sumSq = 0;
  for (let i = 0; i < v.length; i++) {
    const val = v[i] ?? 0;
    sumSq += val * val;
  }
  return Math.sqrt(sumSq);
}

/**
 * Computes the Cosine Similarity between two vectors.
 * Returns a value between -1.0 and 1.0 (or 0 for zero-vectors).
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct(a, b) / (normA * normB);
}

/**
 * Normalizes a vector to unit length (L2 norm = 1.0).
 */
export function normalizeVector(v: readonly number[]): number[] {
  const norm = vectorNorm(v);
  if (norm === 0) return Array.from(v);
  return v.map((val) => val / norm);
}
