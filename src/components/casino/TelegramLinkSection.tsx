'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { CasinoLogger } from '@/lib/casino/logger';

interface TelegramStatus {
  configured: boolean;
  linked: boolean;
  username: string | null;
  notificationsEnabled: boolean;
}

const IDLE_STATUS: TelegramStatus = {
  configured: false,
  linked: false,
  username: null,
  notificationsEnabled: false,
};

export default function TelegramLinkSection() {
  const [status, setStatus] = useState<TelegramStatus>(IDLE_STATUS);
  // Distinct from "configured: false" (a real, known state from the server): this stays
  // false while unauthenticated or on a transient error, so the section renders nothing
  // instead of a misleading "Not available yet" for a case that isn't actually that.
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/telegram/status');
      if (!response.ok) {
        setVisible(false);
        return;
      }
      const data = (await response.json()) as TelegramStatus;
      setStatus(data);
      setVisible(true);
    } catch (error) {
      CasinoLogger.error('TelegramLinkSection', 'Failed to load telegram status', error);
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshStatus();
  }, [refreshStatus]);

  const handleConnect = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/telegram/link', { method: 'POST' });
      if (!response.ok) return;
      const data = (await response.json()) as { deepLink: string };
      window.open(data.deepLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      CasinoLogger.error('TelegramLinkSection', 'Failed to start telegram link flow', error);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/telegram/unlink', { method: 'POST' });
      if (response.ok) await refreshStatus();
    } catch (error) {
      CasinoLogger.error('TelegramLinkSection', 'Failed to disconnect telegram', error);
    } finally {
      setBusy(false);
    }
  }, [refreshStatus]);

  const handleToggleMute = useCallback(async () => {
    const nextEnabled = !status.notificationsEnabled;
    setBusy(true);
    try {
      const response = await fetch('/api/telegram/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      if (response.ok) setStatus((prev) => ({ ...prev, notificationsEnabled: nextEnabled }));
    } catch (error) {
      CasinoLogger.error('TelegramLinkSection', 'Failed to update telegram mute preference', error);
    } finally {
      setBusy(false);
    }
  }, [status.notificationsEnabled]);

  if (!visible) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderTop: '1px solid hsla(0, 0%, 100%, 0.06)',
        paddingTop: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Send size={14} color="hsl(var(--primary))" />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
          Telegram Notifications
        </span>
      </div>

      {!status.configured && (
        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
          Not available yet.
        </span>
      )}

      {status.configured && !status.linked && (
        <button
          type="button"
          onClick={handleConnect}
          disabled={busy}
          className="btn btn-ghost"
          style={{ justifyContent: 'flex-start', gap: '6px' }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Connect Telegram</span>
        </button>
      )}

      {status.configured && status.linked && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
              {status.username ? `Connected as @${status.username}` : 'Connected'}
            </span>
            <button
              onClick={handleToggleMute}
              disabled={busy}
              aria-label={
                status.notificationsEnabled ? 'Mute notifications' : 'Unmute notifications'
              }
              style={{
                width: '36px',
                height: '18px',
                borderRadius: '9px',
                background: status.notificationsEnabled
                  ? 'hsl(var(--primary))'
                  : 'hsla(0, 0%, 100%, 0.12)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: status.notificationsEnabled ? '20px' : '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: status.notificationsEnabled ? '#000' : '#fff',
                  transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={busy}
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', gap: '6px' }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>
              Disconnect
            </span>
          </button>
        </>
      )}
    </div>
  );
}
