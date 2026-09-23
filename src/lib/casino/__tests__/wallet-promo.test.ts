import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletPromo } from '../wallet-promo';
import { WalletService } from '../wallet';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseMock, type SupabaseMock } from './helpers/supabase-mock';

// 03c-W3 L5: Modul-Smoke-Netz für die ausgelagerte Promo-Domäne (geldnah — die RPCs schreiben
// Guthaben, der Service-Layer selbst nicht). Der Test prüft den 1:1-Move: RPC-Namen, Argumente
// und Fail-Closed-Verhalten müssen identisch zum Vorzustand sein.

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const USER_ID = 'user_123';
const ACTOR_ID = 'admin_1';
const REQUEST_ID = '22222222-2222-4222-8222-222222222222';
const TRANSACTION_ID = '11111111-1111-4111-8111-111111111111';

let mock: SupabaseMock;

beforeEach(() => {
  mock = createSupabaseMock();
  vi.mocked(createAdminClient).mockReturnValue(
    mock.client as unknown as ReturnType<typeof createAdminClient>,
  );
});

describe('WalletPromo.redeemPromoCode', () => {
  it('normalises the code and returns the parsed wallet snapshot on success', async () => {
    mock.state.rpcResult = {
      data: {
        ok: true,
        amount: 500,
        balance: 500,
        xp: 0,
        level: 1,
        rank: 'BRONZE',
        transactionId: TRANSACTION_ID,
      },
      error: null,
    };

    const result = await WalletPromo.redeemPromoCode({
      userId: USER_ID,
      code: ' vippro ',
      requestId: REQUEST_ID,
    });

    expect(result).toEqual({
      ok: true,
      amount: 500,
      snapshot: {
        balance: 500,
        xp: 0,
        level: 1,
        rank: 'BRONZE',
        transactionId: TRANSACTION_ID,
      },
    });
    expect(mock.client.rpc).toHaveBeenCalledWith('redeem_promo_code', {
      p_user_id: USER_ID,
      p_code: 'VIPPRO',
      p_request_id: REQUEST_ID,
    });
  });

  it('returns the rejected business result instead of throwing', async () => {
    mock.state.rpcResult = { data: { ok: false, code: 'PROMO_ALREADY_USED' }, error: null };

    await expect(
      WalletPromo.redeemPromoCode({ userId: USER_ID, code: 'X', requestId: REQUEST_ID }),
    ).resolves.toEqual({ ok: false, code: 'PROMO_ALREADY_USED' });
  });

  it('fails closed when the RPC errors', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(
      WalletPromo.redeemPromoCode({ userId: USER_ID, code: 'X', requestId: REQUEST_ID }),
    ).rejects.toThrow('Redeem RPC failed');
  });

  it('auto-provisions VIPPRO once and replays the redemption', async () => {
    mock.state.rpcResult = { data: { ok: false, code: 'PROMO_NOT_FOUND' }, error: null };

    // Second RPC answer (the retry) must be the successful redemption.
    mock.client.rpc
      .mockResolvedValueOnce({ data: { ok: false, code: 'PROMO_NOT_FOUND' }, error: null })
      .mockResolvedValueOnce({
        data: {
          ok: true,
          amount: 500,
          balance: 500,
          xp: 0,
          level: 1,
          rank: 'BRONZE',
          transactionId: TRANSACTION_ID,
        },
        error: null,
      });

    const result = await WalletPromo.redeemPromoCode({
      userId: USER_ID,
      code: 'VIPPRO',
      requestId: REQUEST_ID,
    });

    expect(result).toMatchObject({ ok: true, amount: 500 });
    expect(mock.builder.upsert).toHaveBeenCalledWith(
      {
        code: 'VIPPRO',
        amount: 500.0,
        max_uses: 10000,
        used_count: 0,
        active: true,
        created_by: 'system_welcome',
      },
      { onConflict: 'code' },
    );
    expect(mock.client.from).toHaveBeenCalledWith('promo_codes');
    expect(mock.client.rpc).toHaveBeenCalledTimes(2);
  });
});

describe('WalletPromo.reversePromoCode', () => {
  it('forwards actor, reason and normalised code to reverse_promo_code', async () => {
    mock.state.rpcResult = {
      data: {
        ok: true,
        amount: 500,
        shortfall: 0,
        balance: 0,
        xp: 0,
        level: 1,
        rank: 'BRONZE',
        transactionId: TRANSACTION_ID,
        replayed: false,
      },
      error: null,
    };

    const result = await WalletPromo.reversePromoCode({
      actorId: ACTOR_ID,
      userId: USER_ID,
      code: 'vippro',
      requestId: REQUEST_ID,
      reason: 'fraud',
    });

    expect(result).toMatchObject({ ok: true, amount: 500, shortfall: 0, replayed: false });
    expect(mock.client.rpc).toHaveBeenCalledWith('reverse_promo_code', {
      p_actor_id: ACTOR_ID,
      p_user_id: USER_ID,
      p_code: 'VIPPRO',
      p_request_id: REQUEST_ID,
      p_reason: 'fraud',
    });
  });

  it('reports the shortfall honestly instead of hiding it', async () => {
    mock.state.rpcResult = {
      data: {
        ok: true,
        amount: 500,
        shortfall: 120,
        balance: 0,
        xp: 0,
        level: 1,
        rank: 'BRONZE',
        transactionId: TRANSACTION_ID,
        replayed: false,
      },
      error: null,
    };

    const result = await WalletPromo.reversePromoCode({
      actorId: ACTOR_ID,
      userId: USER_ID,
      code: 'VIPPRO',
      requestId: REQUEST_ID,
      reason: 'fraud',
    });

    expect(result).toMatchObject({ ok: true, shortfall: 120 });
  });

  it('fails closed when the RPC errors', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(
      WalletPromo.reversePromoCode({
        actorId: ACTOR_ID,
        userId: USER_ID,
        code: 'VIPPRO',
        requestId: REQUEST_ID,
        reason: 'fraud',
      }),
    ).rejects.toThrow('Promo reversal RPC failed');
  });
});

describe('WalletService façade', () => {
  it('delegates the promo methods to the module', async () => {
    mock.state.rpcResult = { data: { ok: false, code: 'PROMO_INVALID' }, error: null };

    await WalletService.redeemPromoCode({ userId: USER_ID, code: 'X', requestId: REQUEST_ID });

    expect(mock.client.rpc).toHaveBeenCalledWith('redeem_promo_code', {
      p_user_id: USER_ID,
      p_code: 'X',
      p_request_id: REQUEST_ID,
    });

    await WalletService.reversePromoCode({
      actorId: ACTOR_ID,
      userId: USER_ID,
      code: 'vippro',
      requestId: REQUEST_ID,
      reason: 'fraud',
    });

    expect(mock.client.rpc).toHaveBeenCalledWith('reverse_promo_code', {
      p_actor_id: ACTOR_ID,
      p_user_id: USER_ID,
      p_code: 'VIPPRO',
      p_request_id: REQUEST_ID,
      p_reason: 'fraud',
    });
  });
});
