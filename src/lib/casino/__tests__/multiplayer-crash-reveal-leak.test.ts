import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * Regression test for the CRITICAL finding from the L6 security review of
 * worldmap/05_multiplayercrash.md (2026-08-21) and updated in worldmap/05_v2_multiplayer_crash.md:
 * CASHOUT_CRASH_MULTIPLAYER/RESOLVE_CRASH_MULTIPLAYER
 * echoed the shared room's TRUE crash_point back to the client unconditionally
 * — regardless of whether the room had actually crashed yet — via
 * `...(settlement.result as object)`. Because a single account could hold two
 * simultaneous ACTIVE crash rounds in the same shared room (no guard existed),
 * this was a real, single-account exploit: sacrifice one cashout at
 * multiplier=1 (always a win, since crash_point >= 1) to read the room's
 * secret mid-flight, then guarantee-win a second bet with that value.
 *
 * This repo has no live-Postgres/route-invocation integration tests anywhere
 * (see seed-chain-security-surface.test.ts's header comment) — the
 * established pattern for this exact class of guarantee is a static
 * assertion against the route source text. Following that precedent here
 * rather than introducing a new testing style for one file.
 */
describe('multiplayer crash: crashPoint is masked in the CASHOUT/RESOLVE response until the room has actually crashed', () => {
  const betRoute = read('src/app/api/casino/bet-crash-multiplayer/route.ts');
  const cashoutBlock = betRoute.slice(
    betRoute.indexOf("params.action === 'CASHOUT_CRASH_MULTIPLAYER' || params.action === 'RESOLVE_CRASH_MULTIPLAYER'"),
    betRoute.indexOf("return apiErrorResponse(\n      APP_ERROR_CODES.VALIDATION_FAILED,\n      'Ungültige Aktion.'"),
  );

  it('computes reveal eligibility from the shared round status, not from win/loss or replay state', () => {
    expect(cashoutBlock).toContain("const revealCrashPoint = sharedRound.status === 'CRASHED';");
  });

  it('never spreads the raw settlement result without overriding crashPoint in the same response', () => {
    const responseIndex = cashoutBlock.lastIndexOf('return NextResponse.json({');
    expect(responseIndex).toBeGreaterThan(-1);
    const responseBlock = cashoutBlock.slice(responseIndex, cashoutBlock.indexOf('});', responseIndex));

    expect(responseBlock).toContain('...(settlement.result as object)');
    // The override must be a literal sibling key after the spread — object
    // spread semantics mean a later key wins, so ordering here is the actual
    // security property, not just presence of the string somewhere in the file.
    const spreadIndex = responseBlock.indexOf('...(settlement.result as object)');
    const overrideIndex = responseBlock.indexOf('crashPoint: revealCrashPoint ? crashPoint : null');
    expect(overrideIndex).toBeGreaterThan(spreadIndex);
  });

  it('the reveal check is computed before settlement so a replayed request re-evaluates against the CURRENT room state, not a stale one', () => {
    const revealIndex = cashoutBlock.indexOf('const revealCrashPoint');
    const settleIndex = cashoutBlock.indexOf('WalletService.settleRound(');
    expect(revealIndex).toBeGreaterThan(-1);
    expect(revealIndex).toBeLessThan(settleIndex);
  });
});

describe('multiplayer crash: a single account cannot hold two simultaneous ACTIVE crash rounds in the same room', () => {
  const betRoute = read('src/app/api/casino/bet-crash-multiplayer/route.ts');
  const startBlock = betRoute.slice(
    betRoute.indexOf("if (params.action === 'START_CRASH_MULTIPLAYER')"),
    betRoute.indexOf("if (params.action === 'CASHOUT_CRASH_MULTIPLAYER'"),
  );

  it('has a fast TS-side pre-check for a clean error message (not the actual guarantee, see below)', () => {
    expect(startBlock).toContain("WalletService.getGameActiveRound({ userId, game: 'CRASH_MULTIPLAYER' })");
    expect(startBlock).toContain('existingActive.hasActiveRound && existingActive.requestId !== params.requestId');
  });

  it('checks for an existing active round before the shared round is joined or the seed is consumed', () => {
    const guardIndex = startBlock.indexOf('existingActive.hasActiveRound');
    const consumeIndex = startBlock.indexOf('consumeActiveSeed');
    const ensureIndex = startBlock.indexOf('ensureCurrentCrashRound');
    expect(guardIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeLessThan(consumeIndex);
    expect(guardIndex).toBeLessThan(ensureIndex);
  });

  it('still allows an idempotent retry of the SAME requestId through (does not reject a legitimate replay)', () => {
    // The guard compares requestId, not just hasActiveRound — a same-request
    // retry must fall through to start_game_round's own idempotency instead
    // of being rejected here.
    expect(startBlock).not.toMatch(/if \(existingActive\.hasActiveRound\)\s*\{/);
  });

  it('catches the authoritative SQL-side race guard (ACTIVE_CRASH_ROUND_EXISTS) and returns 409, not a 500', () => {
    // L6 follow-up (2026-08-21): the TS pre-check above is a TOCTOU race on
    // its own (two parallel requests can both pass it) — start_game_round's
    // own advisory-locked guard (migration 037 / 050) is the actual authority.
    // This is the route-level handling for when THAT one fires instead.
    expect(startBlock).toContain("error.message === 'ACTIVE_CRASH_ROUND_EXISTS'");
    const catchBlock = startBlock.slice(startBlock.indexOf('} catch (error) {'));
    expect(catchBlock).toContain('409');
  });

  it('WalletService.startRound translates the SQL exception message into a distinguishable error', () => {
    const wallet = read('src/lib/casino/wallet.ts');
    expect(wallet).toContain("error.message.includes('Active crash')");
    expect(wallet).toContain("throw new Error('ACTIVE_CRASH_ROUND_EXISTS')");
  });
});
