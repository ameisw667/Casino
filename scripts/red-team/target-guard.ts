import { fileURLToPath } from 'node:url';
import { assertSafePhase1Target as assertSharedTarget } from '../phase1-target-guard';

export const RED_TEAM_CONFIRMATION_VARIABLE = 'PHASE1_TARGET_CONFIRMED';
export const assertSafePhase1Target = assertSharedTarget;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const target = assertSafePhase1Target();
    console.log(`P1.4 target guard passed for non-production host ${target.host}`);
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : 'P1.4 target guard failed');
    process.exitCode = 1;
  }
}
