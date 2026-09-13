import { fileURLToPath } from 'node:url';
import { assertSafePhase1Target as assertSharedTarget } from '../phase1-target-guard';

export const RED_TEAM_CONFIRMATION_VARIABLE = 'PHASE1_TARGET_CONFIRMED';
export const assertSafePhase1Target = assertSharedTarget;

// 06_4 (T5/L1): shared CLI failure reporter. The red-team scripts wire their guard with
// `main().catch(reportCliFailure)` — a function reference instead of an inline arrow — so no
// extra uncovered function scope appears in the coverage-included script files.
export function reportCliFailure(error: unknown): void {
  console.error(error instanceof Error ? error.message : 'P1.4 red-team probe failed');
  process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const target = assertSafePhase1Target();
    console.log(`P1.4 target guard passed for non-production host ${target.host}`);
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : 'P1.4 target guard failed');
    process.exitCode = 1;
  }
}
