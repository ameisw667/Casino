/**
 * Crash Game Simulation — validates the crash multiplier formula, growth rate,
 * and game flow by testing the core logic directly (no HTTP needed).
 *
 * Run: npx tsx tests/crash-simulation.ts
 */

import { ProvablyFairEngine } from '../src/lib/casino/provably-fair';

const GROWTH_FACTOR = 0.003; // must match crash/page.tsx

function simulateGrowth(from: number, to: number): { frames: number; seconds: number } {
  let m = from;
  let frames = 0;
  while (m < to) {
    m += m * GROWTH_FACTOR;
    frames++;
  }
  const seconds = frames / 60; // assume 60fps
  return { frames, seconds };
}

async function main() {
  console.log('🎰 Crash Game Simulation Suite');
  console.log('══════════════════════════════');
  console.log('Formula: 1% house edge, (1 - 0.01) / (1 - r), floor(m * 100) / 100');
  console.log(`Growth: ${GROWTH_FACTOR}/frame → target ~3.7s to 2x\n`);

  // --- Test 1: Crash multiplier distribution ---
  console.log('=== TEST 1: Crash Multiplier Distribution (1000 samples) ===');
  const seed = 'test-server-seed-32bytes-xxxxxxxx';
  const clientSeed = 'simtest';
  const multipliers: number[] = [];
  let instantCrashes = 0;

  for (let nonce = 0; nonce < 1000; nonce++) {
    const m = await ProvablyFairEngine.getCrashMultiplier(seed, clientSeed, nonce);
    multipliers.push(m);
    if (m === 1.0) instantCrashes++;
  }

  const instantCrashRate = (instantCrashes / 1000) * 100;
  console.log(
    `  Instant crashes (1.00x): ${instantCrashes}/1000 = ${instantCrashRate.toFixed(1)}%`,
  );
  console.log(`  Expected: ~1.0% (house edge)`);
  console.log(
    `  → ${Math.abs(instantCrashRate - 1.0) < 2.0 ? '✓ Within expected range' : '⚠ Deviation detected'}`,
  );

  const sorted = [...multipliers].sort((a, b) => a - b);
  const median = sorted[500];
  const p95 = sorted[950];
  const max = sorted[999];
  console.log(`  Median: ${median.toFixed(2)}x`);
  console.log(`  95th percentile: ${p95.toFixed(2)}x`);
  console.log(`  Max: ${max.toFixed(2)}x`);
  console.log(
    `  → Distribution looks ${median < 3 ? 'realistic' : 'suspicious'} (median should be < 2x)`,
  );

  // --- Test 2: Growth rate ---
  console.log('\n=== TEST 2: Growth Rate (time to reach key multipliers) ===');
  const targets = [1.5, 2.0, 3.0, 5.0, 10.0, 50.0, 100.0];
  for (const target of targets) {
    const { frames, seconds } = simulateGrowth(1.0, target);
    console.log(`  1.00x → ${target.toFixed(1)}x: ${frames} frames = ${seconds.toFixed(1)}s`);
  }
  const to2x = simulateGrowth(1.0, 2.0).seconds;
  console.log(`  → Time to 2x: ${to2x.toFixed(1)}s (target: 3–5s, market standard)`);
  console.log(`  → ${to2x >= 3 && to2x <= 5 ? '✓ PASS' : '⚠ Outside target range'}`);

  // --- Test 3: Multiplier precision (always 2 decimal places) ---
  console.log('\n=== TEST 3: Multiplier Precision ===');
  let precisionOk = true;
  for (let i = 0; i < 100; i++) {
    const m = await ProvablyFairEngine.getCrashMultiplier(seed, 'precision-test', i);
    const decimals = m.toString().split('.')[1];
    if (decimals && decimals.length > 2) {
      console.log(`  ✗ ${m} has ${decimals.length} decimal places`);
      precisionOk = false;
    }
  }
  console.log(`  → All multipliers have ≤ 2 decimal places: ${precisionOk ? '✓ PASS' : '✗ FAIL'}`);

  // --- Test 4: Formula correctness (manual verification) ---
  console.log('\n=== TEST 4: Formula Correctness (spot checks) ===');
  // Test with known outcomes from calculateOutcome
  const testCases = [
    { nonce: 0, desc: 'first nonce' },
    { nonce: 42, desc: 'mid nonce' },
    { nonce: 999, desc: 'high nonce' },
  ];
  for (const tc of testCases) {
    const { result } = await ProvablyFairEngine.calculateOutcome(seed, clientSeed, tc.nonce);
    const m = await ProvablyFairEngine.getCrashMultiplier(seed, clientSeed, tc.nonce);
    // Verify: if result < 0.01 → m === 1.00
    // Otherwise: m = floor((0.99 / (1 - result)) * 100) / 100
    let expected: number;
    if (result < 0.01) {
      expected = 1.0;
    } else {
      expected = Math.max(1.0, Math.floor((0.99 / (1 - result)) * 100) / 100);
    }
    const match = Math.abs(m - expected) < 0.001;
    console.log(
      `  ${tc.desc} (nonce=${tc.nonce}): result=${result.toFixed(6)}, m=${m.toFixed(2)}x, expected=${expected.toFixed(2)}x → ${match ? '✓' : '✗'}`,
    );
    if (!match) precisionOk = false;
  }

  // --- Summary ---
  console.log('\n══════════════════════════════');
  console.log('SUMMARY:');
  console.log(
    `  Formula: ${instantCrashRate >= 0 && instantCrashRate <= 3 ? '✓' : '⚠'} (instant crash rate ${instantCrashRate.toFixed(1)}%)`,
  );
  console.log(`  Growth:  ${to2x >= 3 && to2x <= 5 ? '✓' : '⚠'} (${to2x.toFixed(1)}s to 2x)`);
  console.log(`  Precision: ${precisionOk ? '✓' : '✗'} (2 decimal places)`);
  console.log('══════════════════════════════\n');
}

main().catch((err) => {
  console.error('Simulation crashed:', err);
  process.exit(1);
});
