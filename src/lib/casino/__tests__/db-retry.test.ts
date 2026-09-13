import { afterEach, describe, expect, it, vi } from 'vitest';
import { WalletService } from '../wallet';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseMock, type SupabaseMock } from './helpers/supabase-mock';
import { CONNECTION_RETRY_MAX_ATTEMPTS, isConnectionError, withConnectionRetry } from '../db-retry';

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

interface RpcResult {
  data: Record<string, unknown> | null;
  error: { message: string; code?: string | null } | null;
}

const okResult = (balance: number): RpcResult => ({
  data: {
    balance,
    xp: 5,
    level: 1,
    rank: 'Bronze',
    transactionId: '11111111-1111-4111-8111-111111111111',
    replayed: false,
  },
  error: null,
});

const connectionErrorResult = (): RpcResult => ({
  data: null,
  // postgrest-js 2.x formt Netzwerkfehler (POST wirft sie) in genau dieses Shape:
  // message "<Name>: <Text>", code "" (leer, kein Postgres-Errorcode), status 0.
  error: { message: 'TypeError: fetch failed', code: '' },
});

afterEach(() => {
  expect(CONNECTION_RETRY_MAX_ATTEMPTS).toBe(2);
});

describe('isConnectionError', () => {
  it('classifies postgrest-js network failure shapes as connection errors', () => {
    expect(
      isConnectionError({ message: 'FetchError: connect ECONNREFUSED 127.0.0.1:54322', code: '' }),
    ).toBe(true);
    expect(isConnectionError({ message: 'TypeError: fetch failed', code: '' })).toBe(true);
    expect(isConnectionError({ message: 'TypeError: fetch failed' })).toBe(true);
  });

  it('classifies thrown undici fetch failures with connection cause codes', () => {
    const thrown = new TypeError('fetch failed');
    (thrown as TypeError & { cause: { code: string } }).cause = { code: 'ECONNREFUSED' };
    expect(isConnectionError(thrown)).toBe(true);
    expect(isConnectionError(new Error('connect ECONNRESET'))).toBe(true);
  });

  it('rejects business-logic and database errors from retry', () => {
    // Postgres-RPC-Error mit echtem Errorcode → Geschäftslogik, niemals retryen.
    expect(
      isConnectionError({ message: 'INSUFFICIENT_BALANCE: balance too low', code: 'P0001' }),
    ).toBe(false);
    expect(isConnectionError({ message: 'Insufficient balance', code: '' })).toBe(false);
    expect(isConnectionError(new Error('Insufficient balance'))).toBe(false);
    // Abort/Timeout: ein gehängter RPC könnte committet haben — fail-closed statt Retry.
    const abort = new Error('This operation was aborted');
    abort.name = 'AbortError';
    expect(isConnectionError(abort)).toBe(false);
    // DOMException aus AbortSignal.timeout() surfaces als TimeoutError (Security-Review LOW-Fund).
    const timeout = new Error('The operation was aborted due to timeout');
    timeout.name = 'TimeoutError';
    expect(isConnectionError(timeout)).toBe(false);
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError('connection error')).toBe(false);
  });
});

describe('withConnectionRetry', () => {
  it('retries exactly once when the first attempt fails on the connection level', async () => {
    let calls = 0;
    const result = await withConnectionRetry(
      () => {
        calls += 1;
        return Promise.resolve(calls === 1 ? connectionErrorResult() : okResult(109));
      },
      { backoffMs: 0 },
    );

    expect(calls).toBe(2);
    expect(result.error).toBeNull();
    expect(result.data?.balance).toBe(109);
  });

  it('returns the first result without retry on business-logic errors', async () => {
    let calls = 0;
    const result = await withConnectionRetry(
      () => {
        calls += 1;
        return Promise.resolve<RpcResult>({
          data: null,
          error: { message: 'INSUFFICIENT_BALANCE', code: 'P0001' },
        });
      },
      { backoffMs: 0 },
    );

    expect(calls).toBe(1);
    expect((result.error as { code?: string } | null)?.code).toBe('P0001');
  });

  it('survives a thrown connection error on the first attempt', async () => {
    let calls = 0;
    const result = await withConnectionRetry(
      () => {
        calls += 1;
        if (calls === 1) return Promise.reject(new Error('FetchError: socket hang up'));
        return Promise.resolve(okResult(90));
      },
      { backoffMs: 0 },
    );

    expect(calls).toBe(2);
    expect(result.data?.balance).toBe(90);
  });

  it('propagates the second failure without further retries', async () => {
    let calls = 0;
    const result = await withConnectionRetry(
      () => {
        calls += 1;
        return Promise.resolve(connectionErrorResult());
      },
      { backoffMs: 0 },
    );

    expect(calls).toBe(2);
    expect(result.error?.message).toBe('TypeError: fetch failed');
  });

  it('propagates non-connection rejections immediately', async () => {
    let calls = 0;
    await expect(
      withConnectionRetry(
        () => {
          calls += 1;
          return Promise.reject(new Error('Insufficient balance'));
        },
        { backoffMs: 0 },
      ),
    ).rejects.toThrow('Insufficient balance');
    expect(calls).toBe(1);
  });

  it('never retries a TimeoutError DOMException (fail-closed)', async () => {
    let calls = 0;
    const timeout = new Error('The operation was aborted due to timeout');
    timeout.name = 'TimeoutError';
    await expect(
      withConnectionRetry(
        () => {
          calls += 1;
          return Promise.reject(timeout);
        },
        { backoffMs: 0 },
      ),
    ).rejects.toBe(timeout);
    expect(calls).toBe(1);
  });
});

describe('WalletService.settleBet (integration through the retry boundary)', () => {
  it('returns 200-class success when a one-time connection fault is retried', async () => {
    const mock: SupabaseMock = createSupabaseMock();
    let rpcCalls = 0;
    mock.client.rpc.mockImplementation(() => {
      rpcCalls += 1;
      return Promise.resolve(rpcCalls === 1 ? connectionErrorResult() : okResult(109));
    });
    vi.mocked(createAdminClient).mockReturnValue(
      mock.client as unknown as ReturnType<typeof createAdminClient>,
    );

    const settlement = await WalletService.settleBet({
      userId: 'user_retry',
      requestId: '22222222-2222-4222-8222-222222222222',
      resultId: '33333333-3333-4333-8333-333333333333',
      game: 'DICE',
      amount: 10,
      payout: 19,
      xpGain: 5,
      result: { roll: 42 },
    });

    // Genau 2 RPC-Calls mit identischen Argumenten (dieselbe requestId): der zweite
    // Aufruf wäre im echten Betrieb der Idempotenz-Replay — kein doppelter Buchungseffekt.
    expect(rpcCalls).toBe(2);
    expect(mock.client.rpc.mock.calls[0]?.[1]).toEqual(mock.client.rpc.mock.calls[1]?.[1]);
    expect(settlement.balance).toBe(109);
  });
});
