import { createAdminClient } from '@/utils/supabase/admin';
import type { ChatMessage, CommunityStats, SocialChatContract } from './wallet-contract';

// ── Abschnitt: Social & Chat (03c-W3 L2, 1:1 aus wallet.ts verschoben) ──
export const WalletSocial: SocialChatContract = {
  async getChatMessages(limit = 50): Promise<ChatMessage[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_recent_chat_messages', {
      p_limit: limit,
    });
    if (error || !data) {
      return [];
    }
    return data as ChatMessage[];
  },

  async postChatMessage(params: { userId: string; message: string }): Promise<ChatMessage> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('post_chat_message', {
      p_user_id: params.userId,
      p_message: params.message,
    });
    if (error || !data) {
      throw new Error('Failed to post chat message');
    }
    return data as ChatMessage;
  },

  async getCommunityStats(): Promise<CommunityStats> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_community_stats');
    if (error || !data) {
      return {
        communityWagered: 0,
        communityGoal: 25000.0,
        communityGoalReached: false,
      };
    }
    return data as CommunityStats;
  },
};
