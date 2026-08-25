'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Info, Trophy, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getNotificationRealtimeChannel, NOTIFICATION_REALTIME_EVENT } from '@/lib/casino/realtime-types';
import { applyReadState, countUnread } from './notification-center-state';
import { getNotificationCardStyle, notificationInboxSurfaceStyle } from './notification-center-surface';

type InboxNotification = {
  id: string;
  kind: 'big_win' | 'achievement' | 'system';
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export function NotificationCenter({ userId, isMobile }: { userId: string | null; isMobile: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      if (!response.ok) throw new Error('Inbox unavailable');
      const data = (await response.json()) as { notifications: InboxNotification[]; unreadCount: number };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch {
      setError('Notifications are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // On-mount inbox fetch: setState inside the effect is the intended side effect of loading
    // notifications (React 19's set-state-in-effect rule flags data-fetch effects; this is the
    // accepted pattern, not a cascading-render hazard — refresh runs once per userId change).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return undefined;
    const channel = supabase
      .channel(getNotificationRealtimeChannel(userId))
      .on('broadcast', { event: NOTIFICATION_REALTIME_EVENT }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, supabase, userId]);

  const markRead = async (id: string) => {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { Origin: window.location.origin },
    });
    if (!response.ok) {
      setError('Could not update this notification.');
      return;
    }
    const { notification } = (await response.json()) as { notification: InboxNotification };
    setNotifications((current) => applyReadState(current, id, notification.readAt ?? new Date().toISOString()));
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const markAllRead = async () => {
    const response = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Origin: window.location.origin },
    });
    if (!response.ok) {
      setError('Could not update notifications.');
      return;
    }
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => ({ ...item, readAt })));
    setUnreadCount(0);
  };

  if (!userId) return null;
  const displayedUnread = Math.max(unreadCount, countUnread(notifications));

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={`Notifications${displayedUnread ? `, ${displayedUnread} unread` : ''}`}
        aria-expanded={isOpen}
        className="btn btn-ghost"
        style={{ position: 'relative', width: '40px', height: '40px', padding: 0, display: 'grid', placeItems: 'center' }}
      >
        <Bell size={18} />
        {displayedUnread > 0 && (
          <span aria-live="polite" style={{ position: 'absolute', top: '-3px', right: '-3px', minWidth: '17px', height: '17px', padding: '0 4px', borderRadius: '999px', background: 'hsl(var(--primary))', color: '#000', fontSize: '0.62rem', fontWeight: 900, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)' }}>
            {displayedUnread > 99 ? '99+' : displayedUnread}
          </span>
        )}
      </button>
      {isOpen && (
        <section
          aria-label="Notification inbox"
          className="glass"
          style={{
            ...notificationInboxSurfaceStyle,
            position: 'absolute',
            zIndex: 70,
            top: '48px',
            right: 0,
            width: isMobile ? 'min(92vw, 360px)' : '380px',
            maxHeight: 'min(70vh, 560px)',
            overflowY: 'auto',
            borderRadius: '16px',
            padding: '12px',
          }}
        >
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <strong style={{ color: 'hsl(var(--text-main))' }}>Notifications</strong>
            <div style={{ display: 'flex', gap: '4px' }}>
              {displayedUnread > 0 && <button type="button" onClick={() => void markAllRead()} className="btn btn-ghost" aria-label="Mark all notifications as read" style={{ padding: '6px' }}><CheckCheck size={16} /></button>}
              <button type="button" onClick={() => setIsOpen(false)} className="btn btn-ghost" aria-label="Close notifications" style={{ padding: '6px' }}><X size={16} /></button>
            </div>
          </header>
          {error && <p role="status" style={{ margin: '8px 0', color: 'hsl(var(--error))', fontSize: '0.8rem' }}>{error}</p>}
          {loading && notifications.length === 0 ? <p style={{ color: 'hsl(var(--text-muted))' }}>Loading inbox…</p> : notifications.length === 0 ? <p style={{ color: 'hsl(var(--text-muted))', padding: '16px 4px' }}>No notifications yet.</p> : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {notifications.map((notification) => (
                <button key={notification.id} type="button" onClick={() => { if (!notification.readAt) void markRead(notification.id); }} style={{
                    ...getNotificationCardStyle(notification.readAt !== null),
                    textAlign: 'left',
                    cursor: notification.readAt ? 'default' : 'pointer',
                    display: 'flex',
                    gap: '10px',
                    width: '100%',
                    borderRadius: '12px',
                    padding: '10px',
                    color: 'hsl(var(--text-main))',
                  }}>
                  {notification.kind === 'big_win' ? <Trophy size={18} color="hsl(var(--primary))" /> : notification.kind === 'achievement' ? <Check size={18} color="hsl(var(--success))" /> : <Info size={18} color="hsl(var(--primary))" />}
                  <span style={{ minWidth: 0, flex: 1 }}><strong style={{ display: 'block', fontSize: '0.82rem' }}>{notification.title}</strong><span style={{ display: 'block', marginTop: '3px', color: 'hsl(var(--text-muted))', fontSize: '0.76rem' }}>{notification.body}</span><time style={{ display: 'block', marginTop: '5px', color: 'hsl(var(--text-muted))', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>{new Date(notification.createdAt).toLocaleString()}</time></span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}