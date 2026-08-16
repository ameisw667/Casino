import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 'server-only' is a Next.js build-time guard resolved via its webpack alias;
// plain Vite/vitest module resolution can't find the bare package, so it needs
// a no-op mock whenever a test imports the real (unmocked) module that uses it.
vi.mock('server-only', () => ({}));

const { redisState } = vi.hoisted(() => ({
  redisState: {
    store: new Map<string, unknown>(),
    throwOnGet: false,
    throwOnSet: false,
    throwOnDel: false,
  },
}));

vi.mock('@upstash/redis', () => {
  class FakeRedis {
    async get(key: string) {
      if (redisState.throwOnGet) throw new Error('redis get failed');
      return redisState.store.has(key) ? redisState.store.get(key) : null;
    }
    async set(key: string, value: unknown) {
      if (redisState.throwOnSet) throw new Error('redis set failed');
      redisState.store.set(key, value);
      return 'OK';
    }
    async del(key: string) {
      if (redisState.throwOnDel) throw new Error('redis del failed');
      redisState.store.delete(key);
      return 1;
    }
  }
  return { Redis: FakeRedis };
});

const { supabaseState } = vi.hoisted(() => ({
  supabaseState: {
    data: null as Record<string, unknown>[] | null,
    error: null as { message: string } | null,
  },
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: supabaseState.data, error: supabaseState.error })),
      })),
    })),
  })),
}));

import { createAdminClient } from '@/utils/supabase/admin';
import { DEFAULT_GAME_CONFIG } from '../game-config';
import {
  clearGameConfigCache,
  loadGameConfig,
  resetGameConfigCacheForTests,
} from '../game-config-server';

const CACHE_TTL_MS = 5 * 60 * 1000;
const REDIS_KEY = 'casino:game-config:v1';

function limitsRow(betMin: unknown, betMax: unknown) {
  return {
    category: 'limits',
    config_key: 'limits',
    is_active: true,
    value: { bet_min: betMin, bet_max: betMax, max_bet_hardcap: 100_000_000 },
  };
}

describe('game-config-server (Upstash L2 cache)', () => {
  beforeEach(() => {
    resetGameConfigCacheForTests();
    redisState.store.clear();
    redisState.throwOnGet = false;
    redisState.throwOnSet = false;
    redisState.throwOnDel = false;
    supabaseState.data = [limitsRow(0.5, 5000)];
    supabaseState.error = null;
    vi.mocked(createAdminClient).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('ohne Upstash-Konfiguration (Verhalten unverändert ggü. Vorgänger)', () => {
    beforeEach(() => {
      vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
      vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    });

    it('lädt aus Supabase und cached danach in L1', async () => {
      const config = await loadGameConfig();
      expect(config.limits.betMin).toBe(0.5);
      expect(config.limits.betMax).toBe(5000);

      await loadGameConfig();
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });

    it('fällt bei Supabase-Fehler auf DEFAULT_GAME_CONFIG zurück', async () => {
      supabaseState.data = null;
      supabaseState.error = { message: 'boom' };

      const config = await loadGameConfig();
      expect(config).toEqual(DEFAULT_GAME_CONFIG);
    });
  });

  describe('mit Upstash-Konfiguration (L2 aktiv)', () => {
    beforeEach(() => {
      vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake.upstash.test');
      vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    });

    it('befüllt L2 bei einem Cache-Miss und liest ihn nach einem simulierten Instanzwechsel (L1-Reset) statt erneut Supabase zu lesen', async () => {
      await loadGameConfig();
      expect(redisState.store.has(REDIS_KEY)).toBe(true);

      resetGameConfigCacheForTests();
      const second = await loadGameConfig();

      expect(second.limits.betMin).toBe(0.5);
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });

    it('behandelt eine abgelaufene L2-TTL als Miss statt als Drift-Hit', async () => {
      redisState.store.set(REDIS_KEY, {
        rows: [limitsRow(9.99, 8888)],
        fetchedAt: Date.now() - CACHE_TTL_MS - 1000,
      });

      const config = await loadGameConfig();

      // Kommt aus dem frischen Supabase-Mock (0.5), nicht aus der abgelaufenen L2-Zeile (9.99)
      expect(config.limits.betMin).toBe(0.5);
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });

    it('normalisiert L2-Rohzeilen genauso streng wie Supabase-Rohzeilen (kein Vertrauensvorsprung)', async () => {
      redisState.store.set(REDIS_KEY, {
        rows: [limitsRow('7.5', 'not-a-number')],
        fetchedAt: Date.now(),
      });

      const config = await loadGameConfig();

      expect(config.limits.betMin).toBe(7.5); // String-Koerzion griff wie beim Supabase-Pfad
      expect(config.limits.betMax).toBe(DEFAULT_GAME_CONFIG.limits.betMax); // Fallback bei ungültigem Wert
      expect(createAdminClient).not.toHaveBeenCalled(); // L2-Hit, kein Supabase-Read nötig
    });

    it.each([
      ['Top-Level-String statt Objekt', 'komplett-kaputte-payload'],
      ['rows ist kein Array', { rows: 'nicht-ein-array', fetchedAt: Date.now() }],
      ['fetchedAt fehlt', { rows: [limitsRow(0.5, 5000)] }],
      ['fetchedAt ist kein Number', { rows: [limitsRow(0.5, 5000)], fetchedAt: 'gestern' }],
    ])(
      'behandelt eine strukturell kaputte L2-Payload (%s) als Miss statt zu crashen',
      async (_label, payload) => {
        redisState.store.set(REDIS_KEY, payload);

        const config = await loadGameConfig();

        expect(config.limits.betMin).toBe(0.5); // Fallback auf Supabase
        expect(createAdminClient).toHaveBeenCalledTimes(1);
      },
    );

    it('bleibt bei einem Redis-GET-Fehler funktionsfähig (fail-open)', async () => {
      redisState.throwOnGet = true;

      const config = await loadGameConfig();

      expect(config.limits.betMin).toBe(0.5);
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });

    it('bleibt bei einem Redis-SET-Fehler funktionsfähig (Supabase-Read zählt trotzdem als Erfolg)', async () => {
      redisState.throwOnSet = true;

      const config = await loadGameConfig();

      expect(config.limits.betMin).toBe(0.5);
      expect(redisState.store.has(REDIS_KEY)).toBe(false);
    });

    it('clearGameConfigCache() löscht L1 und L2, danach erfolgt ein frischer Supabase-Read', async () => {
      await loadGameConfig();
      expect(redisState.store.has(REDIS_KEY)).toBe(true);

      await clearGameConfigCache();
      expect(redisState.store.has(REDIS_KEY)).toBe(false);

      await loadGameConfig();
      expect(createAdminClient).toHaveBeenCalledTimes(2);
    });

    it('ein Redis-DEL-Fehler bei clearGameConfigCache() wird nicht nach außen geworfen', async () => {
      await loadGameConfig();
      redisState.throwOnDel = true;

      await expect(clearGameConfigCache()).resolves.toBeUndefined();
    });
  });
});

describe('Money-Pfad-Isolation (statischer Regressionsschutz)', () => {
  // game-config-server.ts liefert Rate-/Payout-Parameter (limits/houseEdge/paytable/xp),
  // die bereits vor dieser Initiative in die Settlement-Berechnung einflossen (bet/route.ts,
  // blackjack/route.ts) — das ist beabsichtigt. Die tatsächliche Grenze ist: kein Wallet-/
  // Settlement-Modul greift *direkt* auf Redis zu, nur game-config-server.ts und
  // request-security.ts (Rate-Limiter) tun das.
  it('wallet.ts und casino-core.ts importieren @upstash/redis nicht direkt', () => {
    const guardedFiles = ['../wallet.ts', '../casino-core.ts'];
    for (const relativePath of guardedFiles) {
      const content = readFileSync(new URL(relativePath, import.meta.url), 'utf-8');
      expect(content).not.toContain('@upstash/redis');
    }
  });
});
