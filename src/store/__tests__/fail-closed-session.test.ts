// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './helpers/mocks';
import { useCasinoStore } from '../useCasinoStore';
import {
  SAMPLE_TRANSACTION_ID,
  makeSnapshot,
  setupTestEnv,
  teardownTestEnv,
} from './helpers/store-fixture';

beforeEach(() => {
  setupTestEnv();
});

afterEach(() => {
  teardownTestEnv();
});
describe('Fail-closed lokale Finanz-/Progressions-Aktionen (Regressionsschutz)', () => {
  it('addBalance never changes balance', () => {
    useCasinoStore.getState().addBalance(1000);
    expect(useCasinoStore.getState().balance).toBe(0);
  });

  it('removeBalance returns false and never changes balance', () => {
    useCasinoStore.setState({ balance: 50 });
    const result = useCasinoStore.getState().removeBalance(10);
    expect(result).toBe(false);
    expect(useCasinoStore.getState().balance).toBe(50);
  });

  it('redeemCode sends one UUID idempotency key with a promo request', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => SAMPLE_TRANSACTION_ID) });
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: 'Redeemed',
          snapshot: makeSnapshot(),
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    const result = await useCasinoStore.getState().redeemCode('FREEBIE');

    expect(result).toEqual({ success: true, message: 'Redeemed' });
    expect(fetch).toHaveBeenCalledWith('/api/casino/redeem-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': SAMPLE_TRANSACTION_ID,
      },
      body: JSON.stringify({ code: 'FREEBIE' }),
    });
  });
});

describe('anonyme Session-Migration (Regressionsschutz — bewusst deaktiviert)', () => {
  it('syncAnonymousSession is a no-op', async () => {
    const before = useCasinoStore.getState();
    await useCasinoStore.getState().syncAnonymousSession();
    expect(useCasinoStore.getState()).toEqual(before);
  });

  it('migrateAnonymousSession always returns false without mutating state', async () => {
    const before = useCasinoStore.getState();
    const result = await useCasinoStore.getState().migrateAnonymousSession();
    expect(result).toBe(false);
    expect(useCasinoStore.getState()).toEqual(before);
  });
});

describe('initialize', () => {
  it('applies the server wallet snapshot on success', async () => {
    const snapshot = makeSnapshot({ balance: 42, xp: 7, level: 2, rank: 'Silver' });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => snapshot,
    } as unknown as Response);

    await useCasinoStore.getState().initialize();

    expect(useCasinoStore.getState().balance).toBe(42);
    expect(useCasinoStore.getState().rank).toBe('Silver');
  });

  it('fails closed on a non-ok response without throwing or resetting balance', async () => {
    useCasinoStore.setState({ balance: 15 });
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as unknown as Response);

    await expect(useCasinoStore.getState().initialize()).resolves.toBeUndefined();
    expect(useCasinoStore.getState().balance).toBe(15);
  });

  it('fails closed on a network error without throwing', async () => {
    useCasinoStore.setState({ balance: 15 });
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));

    await expect(useCasinoStore.getState().initialize()).resolves.toBeUndefined();
    expect(useCasinoStore.getState().balance).toBe(15);
  });
});
