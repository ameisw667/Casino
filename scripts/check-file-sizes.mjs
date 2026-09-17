#!/usr/bin/env node
// 03a-R10: Dateigroessen-Gate (Regel 10 "Ohne Guardrail verfaellt jede Struktur").
// Hard Gate an der coding-style-Grenze (800 Zeilen) fuer src/**/*.{ts,tsx}.
// Grandfathered Alt-Dateien (Refactor-Optionsgate Plan 03a-r03) warnen, blockieren nicht.
// Usage: node scripts/check-file-sizes.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const MAX_LINES = 800;
const INFO_THRESHOLD = 600;
const SCAN_ROOT = 'src';

// Generierter Code (supabase gen types) — bewusst aus dem Gate (03a-R08-Befund).
const IGNORED_FILES = new Set(['src/types/database.types.ts']);
// Alt-Dateien hinter dem WalletService-/Crash-Loop-Optionsgate — sichtbarer Debt, kein Block.
const LEGACY_WARN_FILES = new Set([
  'src/lib/casino/wallet.ts',
  'src/components/casino/games/crash/useCrashGameLoop.ts',
]);

function* walkTsFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      yield* walkTsFiles(fullPath);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

const oversized = [];
const legacy = [];
const info = [];
let total = 0;

for (const filePath of walkTsFiles(SCAN_ROOT)) {
  const relPath = relative('.', filePath).split(sep).join('/');
  if (IGNORED_FILES.has(relPath)) continue;
  total++;
  const lineCount = readFileSync(filePath, 'utf8').split('\n').length;
  if (lineCount > MAX_LINES) {
    if (LEGACY_WARN_FILES.has(relPath)) legacy.push({ relPath, lineCount });
    else oversized.push({ relPath, lineCount });
  } else if (lineCount > INFO_THRESHOLD && !LEGACY_WARN_FILES.has(relPath)) {
    info.push({ relPath, lineCount });
  }
}

for (const { relPath, lineCount } of legacy) {
  console.log(
    `WARN (grandfathered, Plan 03a-r03): ${relPath} hat ${lineCount} Zeilen (> ${MAX_LINES})`,
  );
}
info.sort((a, b) => b.lineCount - a.lineCount);
if (info.length > 0) {
  console.log(
    `\nINFO: ${info.length} Dateien zwischen ${INFO_THRESHOLD} und ${MAX_LINES} Zeilen (nicht blockierend):`,
  );
  for (const { relPath, lineCount } of info) {
    console.log(`  ${relPath}: ${lineCount}`);
  }
}

if (oversized.length > 0) {
  console.error(`\nERROR: ${oversized.length} Datei(en) ueberschreiten ${MAX_LINES} Zeilen:`);
  for (const { relPath, lineCount } of oversized.sort((a, b) => b.lineCount - a.lineCount)) {
    console.error(`  ${relPath}: ${lineCount}`);
  }
  console.error(
    `Datei aufteilen entlang natuerlicher Grenzen (t_claude_code/01_15_03a_code_modularisierung_regelkatalog.md) — ` +
      'oder nach Jan-Freigabe in LEGACY_WARN_FILES aufnehmen.',
  );
  process.exit(1);
}

console.log(`\nOK: ${total} Dateien geprueft, keine neue Datei ueber ${MAX_LINES} Zeilen.`);
