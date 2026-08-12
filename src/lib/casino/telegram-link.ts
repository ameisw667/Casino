import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';

const CHAT_ALREADY_LINKED_POSTGRES_CODE = '23505';

export interface TelegramLinkStatus {
  configured: boolean;
  linked: boolean;
  username: string | null;
  notificationsEnabled: boolean;
}

export interface IssuedTelegramLinkToken {
  token: string;
  deepLink: string;
  expiresAt: string;
}

export function isTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim(),
  );
}

export async function issueTelegramLinkToken(
  userId: string,
): Promise<IssuedTelegramLinkToken | null> {
  if (!isTelegramConfigured()) return null;

  const admin = createAdminClient();
  // Only one active link flow per user at a time — replacing an unused token is simpler
  // and safer than accumulating stale ones between now and the daily purge.
  await admin.from('telegram_link_tokens').delete().eq('user_id', userId).is('consumed_at', null);

  const { data, error } = await admin
    .from('telegram_link_tokens')
    .insert({ user_id: userId })
    .select('token, expires_at')
    .single();

  if (error || !data) {
    CasinoLogger.error('TelegramLink', 'Failed to issue link token');
    return null;
  }

  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!.trim();
  return {
    token: data.token as string,
    deepLink: `https://t.me/${username}?start=${data.token}`,
    expiresAt: data.expires_at as string,
  };
}

export type TelegramLinkResult =
  { ok: true } | { ok: false; reason: 'invalid_token' | 'chat_already_linked' };

export async function consumeTelegramLinkToken(input: {
  token: string;
  chatId: number;
  telegramUsername: string | null;
}): Promise<TelegramLinkResult> {
  const admin = createAdminClient();

  // Single atomic claim: the WHERE guard means only one concurrent webhook delivery
  // (e.g. a Telegram retry after a slow response) can ever win this token.
  const { data: consumed, error: consumeError } = await admin
    .from('telegram_link_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('token', input.token)
    .is('consumed_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('user_id')
    .maybeSingle();

  if (consumeError || !consumed) return { ok: false, reason: 'invalid_token' };
  const userId = consumed.user_id as string;

  const { data: conflict } = await admin
    .from('telegram_links')
    .select('user_id')
    .eq('chat_id', input.chatId)
    .maybeSingle();
  if (conflict && conflict.user_id !== userId) {
    return { ok: false, reason: 'chat_already_linked' };
  }

  const { error: linkError } = await admin.from('telegram_links').upsert(
    {
      user_id: userId,
      chat_id: input.chatId,
      telegram_username: input.telegramUsername,
      notifications_enabled: true,
      linked_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (linkError) {
    // A concurrent link to the same chat_id from a different account can still race past
    // the read-then-write check above; the UNIQUE constraint is the real guarantee.
    if (linkError.code === CHAT_ALREADY_LINKED_POSTGRES_CODE) {
      return { ok: false, reason: 'chat_already_linked' };
    }
    CasinoLogger.error('TelegramLink', 'Failed to persist telegram link');
    return { ok: false, reason: 'invalid_token' };
  }

  return { ok: true };
}

export async function unlinkTelegram(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from('telegram_links').delete().eq('user_id', userId);
  if (error) {
    CasinoLogger.error('TelegramLink', 'Failed to unlink telegram');
    return false;
  }
  return true;
}

export async function unlinkTelegramByChatId(chatId: number): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from('telegram_links').delete().eq('chat_id', chatId);
  if (error) {
    CasinoLogger.error('TelegramLink', 'Failed to unlink telegram by chat id');
    return false;
  }
  return true;
}

export async function setTelegramNotificationsEnabled(
  userId: string,
  enabled: boolean,
): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('telegram_links')
    .update({ notifications_enabled: enabled })
    .eq('user_id', userId);
  if (error) {
    CasinoLogger.error('TelegramLink', 'Failed to update telegram notification preference');
    return false;
  }
  return true;
}

export async function getTelegramLinkStatus(userId: string): Promise<TelegramLinkStatus> {
  const configured = isTelegramConfigured();
  if (!configured) {
    return { configured: false, linked: false, username: null, notificationsEnabled: false };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('telegram_links')
    .select('telegram_username, notifications_enabled')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data)
    return { configured: true, linked: false, username: null, notificationsEnabled: false };

  return {
    configured: true,
    linked: true,
    username: data.telegram_username as string | null,
    notificationsEnabled: data.notifications_enabled as boolean,
  };
}
