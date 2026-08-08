import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletService } from '../wallet';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseMock, type SupabaseMock } from './helpers/supabase-mock';

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const USER_ID = 'user_123';
const TRANSACTION_ID = '11111111-1111-4111-8111-111111111111';
const REQUEST_ID = '22222222-2222-4222-8222-222222222222';
const RESULT_ID = '33333333-3333-4333-8333-333333333333';
const ROUND_ID = '44444444-4444-4444-8444-444444444444';
const ZERO_TRANSACTION_ID = '00000000-0000-0000-0000-000000000000';

let mock: SupabaseMock;

beforeEach(() => {
  mock = createSupabaseMock();
  vi.mocked(createAdminClient).mockReturnValue(
    mock.client as unknown as ReturnType<typeof createAdminClient>
  );
});

describe('WalletService.getWallet', () => {
  it('provisions the user then loads balance/xp/level/rank with the latest transaction id', async () => {
    mock.state.singleResult = {
      data: { balance: '123.45', xp: 10, level: 2, rank: 'Silver' },
      error: null,
    };
    mock.state.maybeSingleResult = { data: { id: TRANSACTION_ID }, error: null };

    const wallet = await WalletService.getWallet(USER_ID);

    expect(wallet).toEqual({
      balance: 123.45,
      xp: 10,
      level: 2,
      rank: 'Silver',
      transactionId: TRANSACTION_ID,
    });
    expect(mock.builder.upsert).toHaveBeenCalledWith(
      { id: USER_ID, username: USER_ID.slice(0, 64) },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    expect(mock.client.from).toHaveBeenCalledWith('users');
    expect(mock.client.from).toHaveBeenCalledWith('wallet_transactions');
  });

  it('falls back to the zero-transaction id when no wallet_transactions row exists', async () => {
    mock.state.singleResult = {
      data: { balance: 0, xp: 0, level: 1, rank: 'Bronze' },
      error: null,
    };
    mock.state.maybeSingleResult = { data: null, error: null };

    const wallet = await WalletService.getWallet(USER_ID);

    expect(wallet.transactionId).toBe(ZERO_TRANSACTION_ID);
  });

  it('throws when the transaction lookup itself errors instead of silently falling back to the zero-transaction id (wallet.ts:74)', async () => {
    mock.state.singleResult = {
      data: { balance: 0, xp: 0, level: 1, rank: 'Bronze' },
      error: null,
    };
    mock.state.maybeSingleResult = { data: null, error: { message: 'connection reset' } };

    await expect(WalletService.getWallet(USER_ID)).rejects.toThrow(
      'Wallet transaction history could not be loaded'
    );
  });

  it('throws when user provisioning fails', async () => {
    mock.state.upsertResult = { error: { message: 'db down' } };

    await expect(WalletService.getWallet(USER_ID)).rejects.toThrow(
      'Wallet user could not be provisioned'
    );
  });

  it('throws when the user row cannot be loaded', async () => {
    mock.state.singleResult = { data: null, error: { message: 'not found' } };
    mock.state.maybeSingleResult = { data: null, error: null };

    await expect(WalletService.getWallet(USER_ID)).rejects.toThrow(
      'Wallet could not be loaded'
    );
  });

  it('rejects a malformed rank via the wallet snapshot schema instead of returning it', async () => {
    mock.state.singleResult = {
      data: { balance: 0, xp: 0, level: 1, rank: '' },
      error: null,
    };
    mock.state.maybeSingleResult = { data: null, error: null };

    await expect(WalletService.getWallet(USER_ID)).rejects.toThrow();
  });
});

describe('WalletService.settleBet', () => {
  const params = {
    userId: USER_ID,
    requestId: REQUEST_ID,
    resultId: RESULT_ID,
    game: 'DICE' as const,
    amount: 10,
    payout: 19,
    xpGain: 5,
    result: { roll: 42 },
  };

  it('calls settle_game_bet with the exact RPC contract', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 100,
        xp: 20,
        level: 2,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        result: { roll: 42 },
        replayed: false,
      },
      error: null,
    };

    await WalletService.settleBet(params);

    expect(mock.client.rpc).toHaveBeenCalledWith('settle_game_bet', {
      p_user_id: USER_ID,
      p_request_id: REQUEST_ID,
      p_result_id: RESULT_ID,
      p_game: 'DICE',
      p_amount: 10,
      p_payout: 19,
      p_xp_gain: 5,
      p_result: { roll: 42 },
    });
  });

  it('returns replayed:true unchanged on an idempotent replay', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 100,
        xp: 20,
        level: 2,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        result: { roll: 42 },
        replayed: true,
      },
      error: null,
    };

    const result = await WalletService.settleBet(params);
    expect(result.replayed).toBe(true);
  });

  it('maps an "Insufficient" RPC error to a balance error', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'Insufficient funds' } };

    await expect(WalletService.settleBet(params)).rejects.toThrow('Insufficient balance');
  });

  it('maps any other RPC error to a generic settlement failure', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'deadlock detected' } };

    await expect(WalletService.settleBet(params)).rejects.toThrow(
      'Atomic bet settlement failed'
    );
  });

  it('rejects a malformed RPC response instead of returning it', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 100,
        xp: 20,
        level: 2,
        rank: 'Bronze',
        transactionId: 'not-a-uuid',
        replayed: false,
      },
      error: null,
    };

    await expect(WalletService.settleBet(params)).rejects.toThrow();
  });
});

describe('WalletService.startRound', () => {
  const params = {
    userId: USER_ID,
    requestId: REQUEST_ID,
    game: 'CRASH' as const,
    amount: 5,
    state: { seed: 'abc' },
  };

  it('calls start_game_round with the exact RPC contract', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 95,
        xp: 0,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        replayed: false,
        roundId: ROUND_ID,
        state: { seed: 'abc' },
        version: 1,
      },
      error: null,
    };

    await WalletService.startRound(params);

    expect(mock.client.rpc).toHaveBeenCalledWith('start_game_round', {
      p_user_id: USER_ID,
      p_request_id: REQUEST_ID,
      p_game: 'CRASH',
      p_amount: 5,
      p_state: { seed: 'abc' },
    });
  });

  it('returns replayed:true on an idempotent replay', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 95,
        xp: 0,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        replayed: true,
        roundId: ROUND_ID,
        state: { seed: 'abc' },
        version: 1,
      },
      error: null,
    };

    const result = await WalletService.startRound(params);
    expect(result.replayed).toBe(true);
  });

  it('maps an "Insufficient" RPC error to a balance error', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'Insufficient balance for round' } };

    await expect(WalletService.startRound(params)).rejects.toThrow('Insufficient balance');
  });

  it('maps any other RPC error to a generic start failure', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'lock timeout' } };

    await expect(WalletService.startRound(params)).rejects.toThrow(
      'Game round could not be started'
    );
  });

  it('rejects a malformed round-start response', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 95,
        xp: 0,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        replayed: false,
        roundId: ROUND_ID,
        state: {},
        version: -1,
      },
      error: null,
    };

    await expect(WalletService.startRound(params)).rejects.toThrow();
  });
});

describe('WalletService.getActiveRound', () => {
  it('returns the active round with the exact filter contract', async () => {
    mock.state.singleResult = {
      data: { bet_amount: '5.00', state: { seed: 'abc' }, version: 1 },
      error: null,
    };

    const round = await WalletService.getActiveRound(USER_ID, ROUND_ID, 'CRASH');

    expect(round).toEqual({ betAmount: 5, state: { seed: 'abc' }, version: 1 });
    expect(mock.client.from).toHaveBeenCalledWith('game_rounds');
    expect(mock.builder.eq).toHaveBeenNthCalledWith(1, 'id', ROUND_ID);
    expect(mock.builder.eq).toHaveBeenNthCalledWith(2, 'user_id', USER_ID);
    expect(mock.builder.eq).toHaveBeenNthCalledWith(3, 'game', 'CRASH');
    expect(mock.builder.eq).toHaveBeenNthCalledWith(4, 'status', 'ACTIVE');
  });

  it('throws when no active round is found', async () => {
    mock.state.singleResult = { data: null, error: { message: 'no rows' } };

    await expect(
      WalletService.getActiveRound(USER_ID, ROUND_ID, 'CRASH')
    ).rejects.toThrow('Active game round not found');
  });
});

describe('WalletService.settleRound', () => {
  const params = {
    userId: USER_ID,
    roundId: ROUND_ID,
    requestId: REQUEST_ID,
    resultId: RESULT_ID,
    payout: 12,
    xpGain: 3,
    result: { multiplier: 2.4 },
  };

  it('calls settle_game_round with the exact RPC contract', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 112,
        xp: 3,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        result: { multiplier: 2.4 },
        replayed: false,
      },
      error: null,
    };

    await WalletService.settleRound(params);

    expect(mock.client.rpc).toHaveBeenCalledWith('settle_game_round', {
      p_user_id: USER_ID,
      p_round_id: ROUND_ID,
      p_request_id: REQUEST_ID,
      p_result_id: RESULT_ID,
      p_payout: 12,
      p_xp_gain: 3,
      p_result: { multiplier: 2.4 },
    });
  });

  it('returns replayed:true on an idempotent replay', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 112,
        xp: 3,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        result: { multiplier: 2.4 },
        replayed: true,
      },
      error: null,
    };

    const result = await WalletService.settleRound(params);
    expect(result.replayed).toBe(true);
  });

  it('special-cases "Insufficient" errors consistently with the other 3 write methods (wallet.ts:185)', async () => {
    mock.state.rpcResult = {
      data: null,
      error: { message: 'Insufficient balance for settlement' },
    };

    await expect(WalletService.settleRound(params)).rejects.toThrow('Insufficient balance');
  });

  it('maps any RPC error to a generic settlement failure', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'constraint violation' } };

    await expect(WalletService.settleRound(params)).rejects.toThrow(
      'Game round settlement failed'
    );
  });
});

describe('WalletService.advanceBlackjackRound', () => {
  const params = {
    userId: USER_ID,
    roundId: ROUND_ID,
    requestId: REQUEST_ID,
    resultId: RESULT_ID,
    expectedVersion: 1,
    state: { hand: ['A', 'K'] },
    additionalBet: 0,
    settled: true,
    payout: 20,
    xpGain: 4,
    result: { outcome: 'WIN' },
  };

  it('calls advance_blackjack_round with the exact RPC contract', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 120,
        xp: 4,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        replayed: false,
        state: { hand: ['A', 'K'] },
        version: 2,
        settled: true,
      },
      error: null,
    };

    await WalletService.advanceBlackjackRound(params);

    expect(mock.client.rpc).toHaveBeenCalledWith('advance_blackjack_round', {
      p_user_id: USER_ID,
      p_round_id: ROUND_ID,
      p_request_id: REQUEST_ID,
      p_result_id: RESULT_ID,
      p_expected_version: 1,
      p_new_state: { hand: ['A', 'K'] },
      p_additional_bet: 0,
      p_settled: true,
      p_payout: 20,
      p_xp_gain: 4,
      p_result: { outcome: 'WIN' },
    });
  });

  it('returns replayed:true on an idempotent replay', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 120,
        xp: 4,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        replayed: true,
        state: { hand: ['A', 'K'] },
        version: 2,
        settled: true,
      },
      error: null,
    };

    const result = await WalletService.advanceBlackjackRound(params);
    expect(result.replayed).toBe(true);
  });

  it('maps an "Insufficient" RPC error to a balance error', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'Insufficient balance for hit' } };

    await expect(WalletService.advanceBlackjackRound(params)).rejects.toThrow(
      'Insufficient balance'
    );
  });

  it('maps a "Stale" RPC error to a stale-action error', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'Stale version conflict' } };

    await expect(WalletService.advanceBlackjackRound(params)).rejects.toThrow(
      'Stale blackjack action'
    );
  });

  it('maps any other RPC error to a generic blackjack failure', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'unexpected' } };

    await expect(WalletService.advanceBlackjackRound(params)).rejects.toThrow(
      'Blackjack action failed'
    );
  });

  it('rejects a malformed blackjack-action response', async () => {
    mock.state.rpcResult = {
      data: {
        balance: 120,
        xp: 4,
        level: 1,
        rank: 'Bronze',
        transactionId: TRANSACTION_ID,
        replayed: false,
        state: {},
        version: 2,
        settled: 'yes',
      },
      error: null,
    };

    await expect(WalletService.advanceBlackjackRound(params)).rejects.toThrow();
  });
});
