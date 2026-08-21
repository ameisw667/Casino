'use client';

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { KeyRound, Plus, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { mapAuthError } from '@/lib/security/form-errors';
import { trackAllowedEvent } from '@/lib/analytics/events';
import type { PasskeyListItem } from '@supabase/supabase-js';

const emptySubscribe = () => () => {};
const checkPasskeySupport = () =>
  typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
const getServerPasskeySupport = () => false;

export default function PasskeyManagementSection() {
  const [supabase] = useState(() => createClient());
  const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = useSyncExternalStore(
    emptySubscribe,
    checkPasskeySupport,
    getServerPasskeySupport,
  );

  const loadPasskeys = useCallback(async () => {
    try {
      const { data, error: listError } = await supabase.auth.passkey.list();
      if (listError) {
        // If not signed in or not available, do not crash
        return;
      }
      if (data) {
        setPasskeys(data);
      }
    } catch {
      // Fail closed, keep empty list
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPasskeys();
  }, [loadPasskeys]);

  const handleRegister = async () => {
    setBusy(true);
    setError(null);
    try {
      const { error: regError } = await supabase.auth.registerPasskey();
      if (regError) {
        setError(mapAuthError(regError.message).message);
        return;
      }
      void trackAllowedEvent({ name: 'passkey_registered' });
      await loadPasskeys();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(message).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (passkeyId: string) => {
    setBusy(true);
    setError(null);
    try {
      const { error: delError } = await supabase.auth.passkey.delete({ passkeyId });
      if (delError) {
        setError(mapAuthError(delError.message).message);
        return;
      }
      await loadPasskeys();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(message).message);
    } finally {
      setBusy(false);
    }
  };

  if (!supported) {
    return null;
  }

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <KeyRound size={14} color="hsl(var(--primary))" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
            Passkeys
          </span>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={busy || loading}
          aria-label="Passkey hinzufügen"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'hsla(var(--primary), 0.12)',
            border: '1px solid hsla(var(--primary), 0.3)',
            borderRadius: '6px',
            color: 'hsl(var(--primary))',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '3px 8px',
            cursor: busy || loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
        >
          {busy ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
          Hinzufügen
        </button>
      </div>

      {loading ? (
        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
          Passkeys werden geladen...
        </span>
      ) : passkeys.length === 0 ? (
        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
          Keine Passkeys registriert.
        </span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {passkeys.map((pk) => {
            const label =
              pk.friendly_name ||
              `Passkey (${pk.created_at ? new Date(pk.created_at).toLocaleDateString('de-DE') : pk.id.slice(0, 8)})`;
            return (
              <div
                key={pk.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'hsla(0, 0%, 100%, 0.03)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid hsla(0, 0%, 100%, 0.05)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-main))',
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={pk.id}
                >
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(pk.id)}
                  disabled={busy}
                  aria-label={`Passkey ${label} löschen`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(0, 75%, 60%)',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p
          role="alert"
          style={{
            margin: '2px 0 0',
            color: 'hsl(0, 85%, 65%)',
            fontSize: '0.65rem',
            lineHeight: 1.3,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
