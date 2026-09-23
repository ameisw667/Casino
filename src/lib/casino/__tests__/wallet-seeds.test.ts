import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletSeeds } from '../wallet-seeds';
import { WalletService } from '../wallet';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseMock, type SupabaseMock } from './helpers/supabase-mock';

// 03c-W3 L3: Modul-Smoke-Netz für die ausgelagerte Provably-Fair-Seed-Domäne
// (vorher: getUserSeeds/rotateUserSeed je 1 Aufruf im Bestand, getSeedHistory 0).

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const USER_ID = 'user_123';
const REQUEST_ID = '22222222-2222-4222-8222-222222222222';

let mock: SupabaseMock;

beforeEach(() => {
  mock = createSupabaseMock();
  vi.mocked(createAdminClient).mockReturnValue(
    mock.client as unknown as ReturnType<typeof createAdminClient>,
  );
});

describe('WalletSeeds.consumeActiveSeed', () => {
  it('validates and returns the seed/nonce of the active chain', async () => {
    mock.state.rpcResult = {
      data: { serverSeed: 's', serverSeedHash: 'h', nonce: 3, replayed: false },
      error: null,
    };

    const seed = await WalletSeeds.consumeActiveSeed({ userId: USER_ID, requestId: REQUEST_ID });

    expect(seed).toEqual({ serverSeed: 's', serverSeedHash: 'h', nonce: 3, replayed: false });
    expect(mock.client.rpc).toHaveBeenCalledWith('consume_active_seed', {
      p_user_id: USER_ID,
      p_request_id: REQUEST_ID,
    });
  });

  it('rejects a malformed RPC payload instead of returning it', async () => {
    mock.state.rpcResult = {
      data: { serverSeed: '', serverSeedHash: 'h', nonce: -1 },
      error: null,
    };

    await expect(
      WalletSeeds.consumeActiveSeed({ userId: USER_ID, requestId: REQUEST_ID }),
    ).rejects.toThrow();
  });

  it('throws when the RPC fails', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(
      WalletSeeds.consumeActiveSeed({ userId: USER_ID, requestId: REQUEST_ID }),
    ).rejects.toThrow('Failed to consume provably fair seed');
  });
});

describe('WalletSeeds.getUserSeeds', () => {
  it('returns the user seed chain from get_or_create_user_seed', async () => {
    mock.state.rpcResult = {
      data: { clientSeed: 'client', serverSeedHash: 'hash', nonce: 9 },
      error: null,
    };

    await expect(WalletSeeds.getUserSeeds(USER_ID)).resolves.toEqual({
      clientSeed: 'client',
      serverSeedHash: 'hash',
      nonce: 9,
    });
  });

  it('falls back to the documented default chain on error', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(WalletSeeds.getUserSeeds(USER_ID)).resolves.toEqual({
      clientSeed: 'vibe-coder-default',
      serverSeedHash: '',
      nonce: 0,
    });
  });
});

describe('WalletSeeds.rotateUserSeed', () => {
  it('forwards userId and clientSeed to rotate_user_seed', async () => {
    mock.state.rpcResult = {
      data: {
        clientSeed: 'new',
        serverSeedHash: 'hash',
        nonce: 0,
        revealedSeed: 'old',
        revealedSeedHash: 'oldhash',
      },
      error: null,
    };

    const rotated = await WalletSeeds.rotateUserSeed({ userId: USER_ID, clientSeed: 'new' });

    expect(rotated.revealedSeed).toBe('old');
    expect(mock.client.rpc).toHaveBeenCalledWith('rotate_user_seed', {
      p_user_id: USER_ID,
      p_client_seed: 'new',
    });
  });

  it('throws when the RPC fails', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(
      WalletSeeds.rotateUserSeed({ userId: USER_ID, clientSeed: 'new' }),
    ).rejects.toThrow('Failed to rotate seed');
  });
});

describe('WalletSeeds.getSeedHistory', () => {
  it('maps the snake_case rows of seed_history to the camelCase contract', async () => {
    mock.state.listResult = {
      data: [
        {
          server_seed: 's',
          server_seed_hash: 'h',
          client_seed: 'c',
          nonce_at_rotation: 4,
          rotated_at: '2026-09-18T00:00:00.000Z',
        },
      ],
      error: null,
    };

    await expect(WalletSeeds.getSeedHistory(USER_ID)).resolves.toEqual([
      {
        serverSeed: 's',
        serverSeedHash: 'h',
        clientSeed: 'c',
        nonceAtRotation: 4,
        rotatedAt: '2026-09-18T00:00:00.000Z',
      },
    ]);
    expect(mock.client.from).toHaveBeenCalledWith('seed_history');
    expect(mock.builder.eq).toHaveBeenCalledWith('user_id', USER_ID);
  });

  it('returns an empty list when the table query yields no rows', async () => {
    mock.state.listResult = { data: null, error: null };

    await expect(WalletSeeds.getSeedHistory(USER_ID)).resolves.toEqual([]);
  });

  it('throws when the table query fails', async () => {
    mock.state.listResult = { data: null, error: { message: 'boom' } };

    await expect(WalletSeeds.getSeedHistory(USER_ID)).rejects.toThrow(
      'Failed to load seed history',
    );
  });
});

describe('WalletService façade', () => {
  it('delegates the seed methods to the module', async () => {
    mock.state.rpcResult = {
      data: { clientSeed: 'c', serverSeedHash: 'h', nonce: 1 },
      error: null,
    };

    const delegates = [
      vi.spyOn(WalletSeeds, 'consumeActiveSeed'),
      vi.spyOn(WalletSeeds, 'rotateUserSeed'),
      vi.spyOn(WalletSeeds, 'getSeedHistory'),
    ];

    await WalletService.getUserSeeds(USER_ID);
    // Der Erfolgs-/Wurpfad der drei Verfahren ist in ihren eigenen Describes geprüft; hier zählt
    // allein die Delegation — daher allSettled statt Erfolgsannahme über ein Fremd-Payload.
    await Promise.allSettled([
      WalletService.consumeActiveSeed({ userId: USER_ID, requestId: REQUEST_ID }),
      WalletService.rotateUserSeed({ userId: USER_ID, clientSeed: 'new' }),
      WalletService.getSeedHistory(USER_ID),
    ]);

    expect(mock.client.rpc).toHaveBeenCalledWith('get_or_create_user_seed', { p_user_id: USER_ID });
    for (const delegate of delegates) expect(delegate).toHaveBeenCalledTimes(1);
  });
});
