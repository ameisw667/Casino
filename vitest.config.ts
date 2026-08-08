import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
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
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
