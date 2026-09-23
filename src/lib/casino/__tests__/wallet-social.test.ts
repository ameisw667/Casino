import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletSocial } from '../wallet-social';
import { WalletService } from '../wallet';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseMock, type SupabaseMock } from './helpers/supabase-mock';

// 03c-W3 L2: Modul-Smoke-Netz für die ausgelagerte Social-Domäne. Diese Verfahren hatten vorher
// 0–1 Testaufrufe im Bestand; der Test fängt einen gebrochenen Import, einen falschen RPC-Namen
// oder ein anderes Client-Handling — nicht die Vollabdeckung der Domäne (die bleibt 1:1-Move).

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const USER_ID = 'user_123';

let mock: SupabaseMock;

beforeEach(() => {
  mock = createSupabaseMock();
  vi.mocked(createAdminClient).mockReturnValue(
    mock.client as unknown as ReturnType<typeof createAdminClient>,
  );
});

describe('WalletSocial.getChatMessages', () => {
  it('reads get_recent_chat_messages with the given limit', async () => {
    mock.state.rpcResult = {
      data: [{ id: '1', user: 'a', rank: 'Bronze', message: 'hi', time: 't' }],
      error: null,
    };

    const messages = await WalletSocial.getChatMessages(7);

    expect(messages).toHaveLength(1);
    expect(mock.client.rpc).toHaveBeenCalledWith('get_recent_chat_messages', { p_limit: 7 });
  });

  it('returns an empty list instead of throwing when the RPC fails', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(WalletSocial.getChatMessages()).resolves.toEqual([]);
  });
});

describe('WalletSocial.postChatMessage', () => {
  it('forwards userId and message to post_chat_message', async () => {
    mock.state.rpcResult = {
      data: { id: '1', user: 'a', rank: 'Bronze', message: 'hi', time: 't' },
      error: null,
    };

    const posted = await WalletSocial.postChatMessage({ userId: USER_ID, message: 'hi' });

    expect(posted.message).toBe('hi');
    expect(mock.client.rpc).toHaveBeenCalledWith('post_chat_message', {
      p_user_id: USER_ID,
      p_message: 'hi',
    });
  });

  it('throws when the RPC returns no data', async () => {
    mock.state.rpcResult = { data: null, error: null };

    await expect(WalletSocial.postChatMessage({ userId: USER_ID, message: 'hi' })).rejects.toThrow(
      'Failed to post chat message',
    );
  });
});

describe('WalletSocial.getCommunityStats', () => {
  it('passes the RPC payload through', async () => {
    mock.state.rpcResult = {
      data: { communityWagered: 12.5, communityGoal: 25000, communityGoalReached: false },
      error: null,
    };

    const stats = await WalletSocial.getCommunityStats();

    expect(stats).toEqual({
      communityWagered: 12.5,
      communityGoal: 25000,
      communityGoalReached: false,
    });
    expect(mock.client.rpc).toHaveBeenCalledWith('get_community_stats');
  });

  it('falls back to the documented zero-goal shape on error', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(WalletSocial.getCommunityStats()).resolves.toEqual({
      communityWagered: 0,
      communityGoal: 25000.0,
      communityGoalReached: false,
    });
  });
});

describe('WalletService façade', () => {
  it('delegates all three social methods to the module', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await WalletService.getChatMessages(3);
    await WalletService.getCommunityStats();

    expect(mock.client.rpc).toHaveBeenCalledWith('get_recent_chat_messages', { p_limit: 3 });
    expect(mock.client.rpc).toHaveBeenCalledWith('get_community_stats');

    // postChatMessage wirft ohne Datenlage fail-closed — für die Delegation der Erfolgspfad.
    mock.state.rpcResult = {
      data: { id: '1', user: 'a', rank: 'Bronze', message: 'hi', time: 't' },
      error: null,
    };

    await WalletService.postChatMessage({ userId: USER_ID, message: 'hi' });

    expect(mock.client.rpc).toHaveBeenCalledWith('post_chat_message', {
      p_user_id: USER_ID,
      p_message: 'hi',
    });
  });
});
