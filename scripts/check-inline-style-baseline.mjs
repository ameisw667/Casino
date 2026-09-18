#!/usr/bin/env node
// Anti-regression gate for the style-src 'unsafe-inline' residual gap
// (T_SECURITY_HARDENING/01_csp_script_hardening.md L4, 2026-09-12).
//
// Counts `style={{` occurrences under src/ and compares against the baseline
// in scripts/inline-style-baseline.json. The count may only grow if the
// baseline file is consciously updated in the same change (deliberate opt-in
// for growth) — an unnoticed increase fails this check.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const baselinePath = join(root, 'scripts', 'inline-style-baseline.json');
const SRC_DIR = join(root, 'src');
const PATTERN = 'style={{';

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function countOccurrences(files) {
  let occurrences = 0;
  let matchedFiles = 0;
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const matches = content.split(PATTERN).length - 1;
    if (matches > 0) {
      matchedFiles += 1;
      occurrences += matches;
    }
  }
  return { occurrences, matchedFiles };
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const { occurrences, matchedFiles } = countOccurrences(walk(SRC_DIR));

console.log(
  `Inline-style baseline check: ${occurrences} occurrences in ${matchedFiles} files ` +
    `(pattern: '${PATTERN}'; baseline: ${baseline.count} in ${baseline.files} files)`,
);

if (occurrences < baseline.count) {
  console.log(
    'Inline-style count decreased — consider lowering the baseline ' +
      'in scripts/inline-style-baseline.json to lock in the improvement.',
  );
  process.exit(0);
}

if (occurrences === baseline.count) {
  process.exit(0);
}

console.error(
  `Inline-style count grew from ${baseline.count} to ${occurrences} without a baseline update.\n` +
    'This is the style-src: unsafe-inline regression gate (T_SECURITY_HARDENING/01 L4).\n' +
    'If the growth is intentional, consciously update scripts/inline-style-baseline.json ' +
    'in the same change with the new count, the current date and a one-line reason.',
);
process.exit(1);
