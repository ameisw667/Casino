import 'server-only';

import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { publishNotificationCreated } from '@/lib/casino/realtime';

export const notificationKindSchema = z.enum(['big_win', 'achievement', 'system']);
export type NotificationKind = z.infer<typeof notificationKindSchema>;

const notificationMetadataSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
const notificationCreateSchema = z.object({
  userId: z.string().trim().min(1).max(128),
  kind: notificationKindSchema,
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(500),
  metadata: notificationMetadataSchema.default({}),
  sourceKey: z.string().trim().min(1).max(160),
});

export interface NotificationRecord {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  metadata: Record<string, string | number | boolean>;
  createdAt: string;
  readAt: string | null;
}

export class NotificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

const SELECT_COLUMNS = 'id, kind, title, body, metadata, created_at, read_at';

function toNotificationRecord(row: {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  metadata: Record<string, string | number | boolean> | null;
  created_at: string;
  read_at: string | null;
}): NotificationRecord {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

/**
 * Writes the durable inbox entry before signalling the browser. Duplicate
 * source keys intentionally produce no second record and no second broadcast.
 */
export async function createNotification(input: z.input<typeof notificationCreateSchema>): Promise<NotificationRecord | null> {
  const parsed = notificationCreateSchema.parse(input);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_notifications')
    .upsert(
      {
        user_id: parsed.userId,
        kind: parsed.kind,
        title: parsed.title,
        body: parsed.body,
        metadata: parsed.metadata,
        source_key: parsed.sourceKey,
      },
      { onConflict: 'user_id,source_key', ignoreDuplicates: true },
    )
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (error) throw new NotificationServiceError(`Failed to create notification: ${error.message}`);
  if (!data) return null;

  const notification = toNotificationRecord(data as Parameters<typeof toNotificationRecord>[0]);
  await publishNotificationCreated(parsed.userId, { notificationId: notification.id });
  return notification;
}

export async function listNotifications(userId: string): Promise<{ notifications: NotificationRecord[]; unreadCount: number }> {
  const supabase = createAdminClient();
  const [listResult, unreadResult] = await Promise.all([
    supabase
      .from('user_notifications')
      .select(SELECT_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('user_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
  ]);
  if (listResult.error || unreadResult.error) {
    throw new NotificationServiceError('Failed to load notifications');
  }
  return {
    notifications: ((listResult.data ?? []) as Parameters<typeof toNotificationRecord>[0][]).map(toNotificationRecord),
    unreadCount: unreadResult.count ?? 0,
  };
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<NotificationRecord | null> {
  const { data, error } = await createAdminClient()
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .is('read_at', null)
    .select(SELECT_COLUMNS)
    .maybeSingle();
  if (error) throw new NotificationServiceError('Failed to update notification');
  return data ? toNotificationRecord(data as Parameters<typeof toNotificationRecord>[0]) : null;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const { data, error } = await createAdminClient()
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)
    .select('id');
  if (error) throw new NotificationServiceError('Failed to update notifications');
  return data?.length ?? 0;
}

/** Producer failures are intentionally isolated from the game and stats paths. */
export function createNotificationBestEffort(input: z.input<typeof notificationCreateSchema>): void {
  void createNotification(input).catch((error) => {
    CasinoLogger.error('Notifications', `Failed to create notification: ${String(error)}`);
  });
}