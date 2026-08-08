import * as http from 'http';

/**
 * Audit script to verify game routes performance
 * Run: npx tsx scripts/audit-games-perf.ts
 */

const GAMES = ['crash', 'dice', 'roulette', 'slots', 'blackjack'];
const BASE_URL = 'http://localhost:3001';
const TIMEOUT_MS = 5000;
const THRESHOLD_MS = 2000; // Alert if load time > 2s

interface AuditResult {
  game: string;
  loadTime: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
}

async function checkGameRoute(game: string): Promise<AuditResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}/games/${game}`;

  try {
    const response = await new Promise<http.IncomingMessage>(
      (resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('Timeout')),
          TIMEOUT_MS
        );

        http
          .get(url, (res) => {
            clearTimeout(timeout);
            resolve(res);
          })
          .on('error', reject);
      }
    );

    const loadTime = Date.now() - startTime;
    const statusCode = response.statusCode ?? 500;

    if (statusCode !== 200) {
      return {
        game,
        loadTime,
        status: 'FAIL',
        message: `HTTP ${statusCode}`
      };
    }

    if (loadTime > THRESHOLD_MS) {
      return {
        game,
        loadTime,
        status: 'WARN',
        message: `Slow load: ${loadTime}ms`
      };
    }

    return {
      game,
      loadTime,
      status: 'PASS',
      message: `OK (${loadTime}ms)`
    };
  } catch (error) {
    return {
      game,
      loadTime: TIMEOUT_MS,
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function runAudit() {
  console.log('🧪 Game Routes Performance Audit');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Threshold: ${THRESHOLD_MS}ms\n`);

  const results = await Promise.all(
    GAMES.map((game) => checkGameRoute(game))
  );

  const passed = results.filter((r) => r.status === 'PASS').length;
  const warned = results.filter((r) => r.status === 'WARN').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log('Results:');
  console.log('────────────────────────────────────────');
  results.forEach((result) => {
    const icon =
      result.status === 'PASS'
        ? '✅'
        : result.status === 'WARN'
          ? '⚠️'
          : '❌';
    console.log(
      `${icon} ${result.game.padEnd(12)} ${result.loadTime.toString().padStart(5)}ms  ${result.message}`
    );
  });

  console.log('────────────────────────────────────────');
  console.log(
    `Summary: ${passed} passed, ${warned} warned, ${failed} failed`
  );

  process.exit(failed > 0 ? 1 : 0);
}

runAudit().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
