import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  CASHOUT_LATENCY_GRACE_MS,
  durationMsForCrashPoint,
  isWithinCrashCashoutFairWindow,
} from '../crash-round';

// crash-round.ts is server-only (same pattern as crash-round.test.ts).
vi.mock('server-only', () => ({}));

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * TO-04 Fix-Welle (docs/archive/17_TO04_security_fundmatrix.md, C1/C2/C3).
 *
 * Follows the established static-assertion pattern (see
 * seed-chain-security-surface.test.ts): this repo has no live-Postgres
 * integration harness, and the bet routes are only reachable through a real
 * Supabase stack — so each fix is pinned as a static assertion against the
 * calling TypeScript. What these tests CANNOT prove: live runtime ordering
 * of guards — they pin the presence and shape of each guard, not its live
 * behaviour.
 */

describe('TO-04 C1: roulette total stake is coupled to the settlement amount', () => {
  const route = read('src/app/api/casino/bet/route.ts');

  it('enforces a server-computed totalStake for roulette bets[] before settlement', () => {
    expect(route).toContain('totalStake');
    expect(route).toContain('ROULETTE_STAKE_TOLERANCE');
    expect(route).toContain('Math.abs(totalStake - amount) > ROULETTE_STAKE_TOLERANCE');
  });

  it('rejects roulette bets with no individual stake entries', () => {
    expect(route).toContain('if (!bets || bets.length === 0)');
  });

  it('applies maxBetHardcap to every individual roulette bet', () => {
    expect(route).toContain('maxBetHardcap');
  });
});

describe('TO-04 C2: solo crash crashPoint is not revealed before round end', () => {
  const route = read('src/app/api/casino/bet/route.ts');
  const startBlock = route.slice(
    route.indexOf("params.action === 'START_CRASH'"),
    route.indexOf("params.action === 'CASHOUT_CRASH'"),
  );

  it('strips crashPoint from the START_CRASH response entirely', () => {
    // The internal round.state storage keeps crashPoint server-side (needed
    // for settlement); only the apiSuccessResponse payload must be clean.
    expect(startBlock).not.toMatch(/apiSuccessResponse\(\{[\s\S]*?crashPoint/);
  });

  it('resolves abandoned solo rounds without client-side crash knowledge via a flight ceiling', () => {
    expect(read('src/app/games/crash/page.tsx')).toContain('SOLO_CRASH_FLIGHT_CEILING_MULTIPLIER');
  });

  it('uses the server-revealed crashPoint for crash visuals/history after settlement', () => {
    const page = read('src/app/games/crash/page.tsx');
    expect(page).toContain('data.crashPoint');
  });
});

describe('TO-04 C3: multiplayer crash cashout is authorized against the server round clock', () => {
  const route = read('src/app/api/casino/bet-crash-multiplayer/route.ts');

  it('authorizes the payout through the shared behavioral fair-window helper', () => {
    expect(route).toContain('isWithinCrashCashoutFairWindow(');
    expect(route).toContain('isClaimInFairWindow');
  });

  it('stamps the arrival time before any await so server processing is not client lateness', () => {
    expect(route).toContain('requestArrivalMs');
    expect(route.indexOf('requestArrivalMs')).toBeLessThan(
      route.indexOf('await supabase.auth.getUser'),
    );
  });

  it('gates the payout on the fair-window check in addition to requestedMultiplier <= crashPoint', () => {
    expect(route).toMatch(/requestedMultiplier <= crashPoint &&\s*\n\s*isClaimInFairWindow/);
  });
});

describe('TO-04 C3 (behavioral): crash cashout fair-window helper', () => {
  const bettingEndsAtMs = Date.parse('2026-08-29T12:00:00.000Z');
  // durationMsForCrashPoint(2.0) ≈ 4379ms → the 2.00x display happens here:
  const claim2xMs = bettingEndsAtMs + durationMsForCrashPoint(2);
  const crashAt2xMs = claim2xMs; // crash point also 2.0 for the snipe cases

  it('admits an honest claim pressed at its display time (inside the latency grace)', () => {
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: claim2xMs + 250,
        bettingEndsAtMs,
        crashedAtMs: null,
        requestedMultiplier: 2.0,
      }),
    ).toBe(true);
  });

  it('rejects claims during the betting window (risk-free refund/XP farm)', () => {
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: bettingEndsAtMs - 1500,
        bettingEndsAtMs,
        crashedAtMs: null,
        requestedMultiplier: 1.0,
      }),
    ).toBe(false);
  });

  it('rejects claims arriving later than one network-latency grace', () => {
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: claim2xMs + CASHOUT_LATENCY_GRACE_MS + 1,
        bettingEndsAtMs,
        crashedAtMs: null,
        requestedMultiplier: 2.0,
      }),
    ).toBe(false);
  });

  it('rejects the reveal-snipe of claiming the exact crash point', () => {
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: crashAt2xMs + 300,
        bettingEndsAtMs,
        crashedAtMs: crashAt2xMs,
        requestedMultiplier: 2.0,
      }),
    ).toBe(false);
  });

  it('rejects claims inside the final press margin before the crash instant', () => {
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: crashAt2xMs - 30,
        bettingEndsAtMs,
        crashedAtMs: crashAt2xMs,
        requestedMultiplier: 2.0,
      }),
    ).toBe(false);
  });

  it('admits a claim with meaningful display-time distance below the crash instant', () => {
    const crash3x = bettingEndsAtMs + durationMsForCrashPoint(3.0);
    const claim1p5 = bettingEndsAtMs + durationMsForCrashPoint(1.5);
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: claim1p5 + 200,
        bettingEndsAtMs,
        crashedAtMs: crash3x,
        requestedMultiplier: 1.5,
      }),
    ).toBe(true);
  });

  it('fails closed on non-finite inputs', () => {
    expect(
      isWithinCrashCashoutFairWindow({
        nowMs: Number.NaN,
        bettingEndsAtMs,
        crashedAtMs: null,
        requestedMultiplier: 2.0,
      }),
    ).toBe(false);
  });
});

describe('TO-04 C2 residue: the active-round guard still strips crash state', () => {
  it('keeps the existing active-round sanitization in place (no regression)', () => {
    const activeRound = read('src/app/api/casino/active-round/route.ts');
    expect(activeRound).toContain('_crashPoint');
  });
});
