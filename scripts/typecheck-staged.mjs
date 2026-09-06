#!/usr/bin/env node
// Type-checks only the given files against the project's tsconfig.json, without
// letting pre-existing errors in unrelated files block the commit.
//
// Why not the `tsc-files` package: on Windows it spawns `tsc.cmd` via
// `spawnSync` without `shell: true`. That fails to launch (ENOENT), spawnSync
// returns `status: null`, and `process.exit(null)` exits 0 — a silent
// false-negative that reports success without ever type-checking anything.
// Verified locally: a staged file with a deliberate type error passed the
// hook silently. This script invokes TypeScript's JS entrypoint
// (`typescript/lib/tsc.js`) directly via `node`, side-stepping the .cmd
// shell-spawn issue on any platform.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);

const files = process.argv
  .slice(2)
  .filter((f) => /\.(ts|tsx)$/.test(f))
  // Agent-eval fixtures under .claude/agent-evals are intentionally broken
  // (residue-scout evals import deliberately removed code) — they must never
  // block a commit; see .claude/agent-evals/11_residue_scout/fixtures/.
  .filter((f) => !f.replace(/\\/g, '/').replace(/^\.\//, '').includes('agent-evals/'));
if (files.length === 0) {
  process.exit(0);
}

const tsconfigPath = path.resolve('tsconfig.json');
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

const tmpDirectory = mkdtempSync(path.join(os.tmpdir(), 'casino-typecheck-'));
const tmpTsconfigPath = path.join(tmpDirectory, 'tsconfig.json');
const tmpTsconfig = {
  ...tsconfig,
  compilerOptions: {
    ...tsconfig.compilerOptions,
    baseUrl: path.resolve('.'),
    // The tmp tsconfig lives outside the project tree, so TS's default
    // typeRoots lookup (relative to the tsconfig's own directory) never
    // finds this project's node_modules/@types — pin it explicitly.
    typeRoots: [path.resolve('node_modules/@types')],
    skipLibCheck: true,
    incremental: false,
  },
  files: files.map((file) => path.resolve(file)),
  include: [],
};
writeFileSync(tmpTsconfigPath, JSON.stringify(tmpTsconfig, null, 2));

let status = 1;
try {
  const tscBin = require.resolve('typescript/lib/tsc.js');
  const result = spawnSync(process.execPath, [tscBin, '-p', tmpTsconfigPath, '--noEmit'], {
    stdio: 'inherit',
  });
  if (result.error) {
    console.error(result.error);
    status = 1;
  } else {
    status = result.status ?? 1;
  }
} finally {
  rmSync(tmpDirectory, { recursive: true, force: true });
}

process.exit(status);
