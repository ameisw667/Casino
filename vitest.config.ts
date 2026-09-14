import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['.claude/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // wallet.ts and useCasinoStore.ts added once behavioral tests (mocked
      // Supabase client / jsdom store tests) existed for them — see
      // src/lib/casino/__tests__/wallet.test.ts and
      // src/store/__tests__/useCasinoStore.test.ts. Other casino files
      // (sound-manager, provably-fair, chat-bot) still have no tests.
      include: [
        'src/lib/casino/casino-core.ts',
        'src/lib/casino/wallet.ts',
        'src/store/useCasinoStore.ts',
        'src/lib/casino/sentry-scrub.ts',
        // 06_4 (T7/L2): Rate-Limiting-/Abuse-Prevention-Scope-Dateien, erstmals mit
        // Coverage gemessen (beobachtend, nicht blockierend — Schwellenwerte pro Datei
        // unten = gemessener Ist-Wert minus Toleranz).
        'src/lib/security/request-security.ts',
        'src/lib/security/signup-guard.ts',
        'src/lib/security/daily-cost-cap.ts',
        'src/lib/security/promo-guess-guard.ts',
        'src/lib/security/bet-velocity-guard.ts',
        'src/lib/casino/risk-signals.ts',
        'src/lib/casino/fraud-detection.ts',
        'src/lib/casino/network-fingerprint.ts',
        'src/lib/casino/responsible-gambling.ts',
        'src/app/api/auth/login-guard/route.ts',
        'scripts/red-team/target-guard.ts',
        'scripts/red-team/rate-limit-bypass.ts',
        'scripts/red-team/admin-idor.ts',
        'scripts/red-team/ephemeral-bootstrap.ts',
      ],
      exclude: ['src/lib/casino/__tests__/**', 'src/store/__tests__/**'],
      thresholds: {
        // perFile enforces the minimum on each included file individually —
        // a strong file can no longer hide a weak one in the aggregate.
        perFile: true,
        // Applies to every included file unless overridden by a glob below.
        // casino-core.ts: only calculateDicePayout + MAX_BET are tested
        // (placeBet/roulette/crash/slots need integration tests with mocked
        // ProvablyFairEngine — tracked separately), so no branches floor here.
        functions: 80,
        'src/lib/casino/wallet.ts': { branches: 90, functions: 100 },
        // Actual: ~80% stmts, 66% branches, 85% functions. Untested by design:
        // startActivitySimulator/updateSessionTime (interval-driven UI-only
        // fakes, no financial/security relevance) and addBet (dead code —
        // no caller outside this file; superseded by processGameResult()).
        'src/store/useCasinoStore.ts': { branches: 60, functions: 80 },
        // 06_4 (T7/L2): Scope-Dateien — Schwellen = gemessener Ist-Wert (2026-09-06,
        // coverage-summary.json) minus kleiner Toleranz, damit das beobachtende Gate nicht
        // bei Normaldrift rot wird. Kein hartes CI-Gate in dieser Ausbaustufe.
        'src/lib/security/request-security.ts': { statements: 92, branches: 89, functions: 98 },
        'src/lib/security/signup-guard.ts': { statements: 98, branches: 98, functions: 98 },
        'src/lib/security/daily-cost-cap.ts': { statements: 98, branches: 98, functions: 98 },
        'src/lib/security/promo-guess-guard.ts': { statements: 98, branches: 98, functions: 98 },
        'src/lib/security/bet-velocity-guard.ts': { statements: 98, branches: 98, functions: 98 },
        'src/lib/casino/risk-signals.ts': { statements: 82, branches: 78, functions: 98 },
        'src/lib/casino/fraud-detection.ts': { statements: 88, branches: 64, functions: 98 },
        'src/lib/casino/network-fingerprint.ts': { statements: 98, branches: 98, functions: 98 },
        'src/lib/casino/responsible-gambling.ts': { statements: 93, branches: 88, functions: 98 },
        'src/app/api/auth/login-guard/route.ts': { statements: 98, branches: 98, functions: 98 },
        'scripts/red-team/target-guard.ts': { statements: 47, branches: 60, functions: 98 },
        'scripts/red-team/rate-limit-bypass.ts': { statements: 93, branches: 89, functions: 98 },
        'scripts/red-team/admin-idor.ts': { statements: 78, branches: 68, functions: 98 },
        'scripts/red-team/ephemeral-bootstrap.ts': { statements: 80, branches: 59, functions: 83 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
