#!/usr/bin/env node
// 03a-R07: Duplikat-Detection per Zeilen-Fenster-Heuristik (0 Dependencies).
// Findet Blöcke von >= DUPLICATE_WINDOW inhaltsgleichen Zeilen, die in
// >= 2 verschiedenen Dateien vorkommen. Warn-Level: exit 0, Fundliste auf stdout.
// Usage: node scripts/check-duplication.mjs [--strict] [--window 30]

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DUPLICATE_WINDOW = 30;
const SCAN_ROOT = 'src';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const windowArg = args.find((a) => a.startsWith('--window'));
const windowSize = windowArg ? Number(windowArg.split('=')[1]) : DUPLICATE_WINDOW;

const EXCLUDE_PARTS = ['__tests__', 'node_modules', '.next', 'coverage'];
// Sandboxes unter src/app/testing sind bewusst duplizierte Design-Vergleiche
// (03a-R02-Befund: einheitliches Client+parts-Muster) — kein Duplikat-Fehlerfall.
const EXCLUDE_PATH_PREFIX = 'src/app/testing/';

function* walkTsFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_PARTS.includes(entry.name)) continue;
      yield* walkTsFiles(fullPath);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

function significantLines(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith('//') &&
        !line.startsWith('*') &&
        !line.startsWith('/*'),
    );
}

const files = [];
for (const filePath of walkTsFiles(SCAN_ROOT)) {
  const relPath = relative('.', filePath).split(sep).join('/');
  if (relPath.replace(/\\/g, '/').startsWith(EXCLUDE_PATH_PREFIX)) continue;
  const lines = significantLines(readFileSync(filePath, 'utf8'));
  files.push({ path: relPath, lines });
}

const windowMap = new Map();
for (const file of files) {
  if (file.lines.length < windowSize) continue;
  for (let i = 0; i <= file.lines.length - windowSize; i++) {
    const key = file.lines.slice(i, i + windowSize).join('\n');
    if (!windowMap.has(key)) windowMap.set(key, []);
    windowMap.get(key).push({ path: file.path, line: i + 1 });
  }
}

const matchesByPair = new Map();
for (const occurrences of windowMap.values()) {
  const byFile = new Map();
  for (const { path, line } of occurrences) {
    if (!byFile.has(path)) byFile.set(path, []);
    byFile.get(path).push(line);
  }
  if (byFile.size < 2) continue;
  const paths = [...byFile.keys()].sort();
  for (let a = 0; a < paths.length; a++) {
    for (let b = a + 1; b < paths.length; b++) {
      const pairKey = `${paths[a]}|${paths[b]}`;
      if (!matchesByPair.has(pairKey))
        matchesByPair.set(pairKey, { fileA: paths[a], fileB: paths[b], linesA: [], linesB: [] });
      const entry = matchesByPair.get(pairKey);
      entry.linesA.push(...byFile.get(paths[a]));
      entry.linesB.push(...byFile.get(paths[b]));
    }
  }
}

function mergeRuns(sortedLines, window) {
  const runs = [];
  let start = sortedLines[0];
  let prev = sortedLines[0];
  for (const line of sortedLines.slice(1)) {
    if (line === prev + 1) {
      prev = line;
    } else {
      runs.push([start, prev + window - 1]);
      start = line;
      prev = line;
    }
  }
  runs.push([start, prev + window - 1]);
  return runs;
}

const findings = [];
for (const { fileA, fileB, linesA, linesB } of matchesByPair.values()) {
  const runsA = mergeRuns(
    [...new Set(linesA)].sort((x, y) => x - y),
    windowSize,
  );
  const runsB = mergeRuns(
    [...new Set(linesB)].sort((x, y) => x - y),
    windowSize,
  );
  const blockCount = Math.max(runsA.length, runsB.length);
  findings.push({ fileA, fileB, blockCount, runsA, runsB });
}

findings.sort((x, y) => y.blockCount - x.blockCount);

if (findings.length === 0) {
  console.log(
    'OK: keine Duplikatbloecke von >= ' +
      windowSize +
      ' signifikanten Zeilen ueber Dateien hinweg.',
  );
  process.exit(0);
}

console.log(
  `WARN: ${findings.length} Datei-Paare mit >= ${windowSize} identischen Zeilen (Warn-Level, nicht blockierend):`,
);
for (const { fileA, fileB, blockCount, runsA, runsB } of findings) {
  console.log(`\n${fileA} <-> ${fileB} (${blockCount} Bloecke)`);
  const shown = Math.min(runsA.length, runsB.length, 5);
  for (let i = 0; i < shown; i++) {
    console.log(
      `  ${fileA}:${runsA[i][0]}-${runsA[i][1]}  <->  ${fileB}:${runsB[i][0]}-${runsB[i][1]}`,
    );
  }
  if (runsA.length > shown || runsB.length > shown) {
    console.log(`  ... und ${Math.max(runsA.length, runsB.length) - shown} weitere Bloecke`);
  }
}

process.exit(strict ? 1 : 0);
