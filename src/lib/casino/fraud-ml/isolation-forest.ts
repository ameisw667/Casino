// Self-implemented Isolation Forest (Liu, Ting & Zhou 2008) for P27/1.15 Option A
// (worldmap/09_ML_FRAUD_ANOMALY.md). Deliberately not a library import — the point of Option A
// is the learning effect of understanding the algorithm, not calling a black box.
// Pure functions, no DB/network access — fully unit-testable in isolation.

const EULER_MASCHERONI = 0.5772156649;
const DEFAULT_NUM_TREES = 100;
const DEFAULT_SAMPLE_SIZE = 256;

interface SplitNode {
  type: 'split';
  featureIndex: number;
  splitValue: number;
  left: TreeNode;
  right: TreeNode;
}

interface LeafNode {
  type: 'leaf';
  size: number;
}

type TreeNode = SplitNode | LeafNode;

export interface IsolationForestOptions {
  seed: number;
  numTrees?: number;
  sampleSize?: number;
}

export interface IsolationForest {
  trees: TreeNode[];
  sampleSize: number;
}

// mulberry32 — small, fast, seeded PRNG. Deterministic output for a fixed seed is required so a
// same-day rerun (seeded from the UTC day, see fraud-ml/scan.ts) reproduces the same trees rather
// than silently drifting scores between runs.
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// c(n): expected path length of an unsuccessful BST search, used to normalize raw path lengths
// into the standard Isolation Forest score formula s(x,n) = 2^(-E(h(x))/c(n)).
function averagePathLength(n: number): number {
  if (n <= 1) return 0;
  const harmonicApprox = Math.log(n - 1) + EULER_MASCHERONI;
  return 2 * harmonicApprox - (2 * (n - 1)) / n;
}

function sampleWithoutReplacement<T>(items: T[], size: number, rand: () => number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled.slice(0, size);
}

function buildTree(
  samples: number[][],
  depth: number,
  maxDepth: number,
  rand: () => number,
): TreeNode {
  if (samples.length <= 1 || depth >= maxDepth) {
    return { type: 'leaf', size: samples.length };
  }

  const numFeatures = samples[0].length;
  const featureIndex = Math.floor(rand() * numFeatures);
  const values = samples.map((sample) => sample[featureIndex]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { type: 'leaf', size: samples.length };
  }

  const splitValue = min + rand() * (max - min);
  const left = samples.filter((sample) => sample[featureIndex] < splitValue);
  const right = samples.filter((sample) => sample[featureIndex] >= splitValue);

  if (left.length === 0 || right.length === 0) {
    return { type: 'leaf', size: samples.length };
  }

  return {
    type: 'split',
    featureIndex,
    splitValue,
    left: buildTree(left, depth + 1, maxDepth, rand),
    right: buildTree(right, depth + 1, maxDepth, rand),
  };
}

export function buildIsolationForest(
  samples: number[][],
  options: IsolationForestOptions,
): IsolationForest {
  if (samples.length === 0) {
    throw new Error('Isolation forest requires at least one sample');
  }

  const numTrees = options.numTrees ?? DEFAULT_NUM_TREES;
  const sampleSize = Math.min(options.sampleSize ?? DEFAULT_SAMPLE_SIZE, samples.length);
  const maxDepth = Math.ceil(Math.log2(Math.max(sampleSize, 2)));
  const rand = mulberry32(options.seed);

  const trees: TreeNode[] = [];
  for (let i = 0; i < numTrees; i++) {
    const subsample = sampleWithoutReplacement(samples, sampleSize, rand);
    trees.push(buildTree(subsample, 0, maxDepth, rand));
  }

  return { trees, sampleSize };
}

function pathLength(node: TreeNode, point: number[], depth: number): number {
  if (node.type === 'leaf') {
    return depth + averagePathLength(node.size);
  }
  const goLeft = point[node.featureIndex] < node.splitValue;
  return pathLength(goLeft ? node.left : node.right, point, depth + 1);
}

// Returns an anomaly score in [0, 1]; higher means more anomalous. ~0.5 is the neutral baseline
// (indistinguishable from a typical point), the isolation-forest literature convention is that
// scores well above 0.5 indicate anomalies and well below 0.5 indicate clearly normal points.
export function scoreSample(forest: IsolationForest, point: number[]): number {
  const totalPathLength = forest.trees.reduce(
    (sum, tree) => sum + pathLength(tree, point, 0),
    0,
  );
  const avgPathLength = totalPathLength / forest.trees.length;
  const c = averagePathLength(forest.sampleSize);
  if (c === 0) return 0;
  return Math.pow(2, -avgPathLength / c);
}
