'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Link2, Unlink, Plus, Check, Loader2, Mail, KeyRound } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { mapAuthError } from '@/lib/security/form-errors';
import { trackAllowedEvent } from '@/lib/analytics/events';
import type { UserIdentity } from '@supabase/supabase-js';

function GoogleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LinkedAccountsSection() {
  const [supabase] = useState(() => createClient());
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadIdentities = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      if (user.identities) {
        setIdentities(user.identities);
      }
    } catch {
      // Fail closed
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadIdentities();
  }, [loadIdentities]);

  const handleLinkGoogle = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined;
      const { error: linkErr } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (linkErr) {
        setError(mapAuthError(linkErr.message).message);
        return;
      }
      void trackAllowedEvent({ name: 'identity_linked' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(msg).message);
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (identity: UserIdentity) => {
    if (identities.length <= 1) {
      setError('Die letzte verbleibende Anmeldemethode kann nicht getrennt werden.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: unlinkErr } = await supabase.auth.unlinkIdentity(identity);
      if (unlinkErr) {
        setError(mapAuthError(unlinkErr.message).message);
        return;
      }
      void trackAllowedEvent({ name: 'identity_unlinked' });
      setSuccess(`${getProviderLabel(identity.provider)} erfolgreich getrennt.`);
      await loadIdentities();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(msg).message);
    } finally {
      setBusy(false);
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google-Konto';
      case 'email':
        return 'E-Mail & Passwort';
      case 'webauthn':
      case 'passkey':
        return 'Passkey';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <GoogleIcon size={14} />;
      case 'email':
        return <Mail size={14} color="hsl(var(--primary))" />;
      case 'webauthn':
      case 'passkey':
        return <KeyRound size={14} color="hsl(var(--primary))" />;
      default:
        return <Link2 size={14} color="hsl(var(--text-muted))" />;
    }
  };

  const hasGoogleLinked = identities.some((i) => i.provider.toLowerCase() === 'google');
  const canUnlink = identities.length > 1;

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
          <Link2 size={14} color="hsl(var(--primary))" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
            Verknüpfte Konten
          </span>
        </div>

        {!hasGoogleLinked && (
          <button
            type="button"
            onClick={handleLinkGoogle}
            disabled={busy || loading}
            className="btn btn-ghost"
            style={{
              padding: '2px 8px',
              fontSize: '0.7rem',
              height: 'auto',
              minHeight: '24px',
              color: 'hsl(var(--primary))',
              gap: '4px',
            }}
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Google verknüpfen
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            fontSize: '0.68rem',
            color: 'hsl(var(--error, 0 70% 60%))',
            background: 'hsla(var(--error, 0 70% 60%), 0.1)',
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid hsla(var(--error, 0 70% 60%), 0.2)',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            fontSize: '0.68rem',
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
          <Loader2 size={12} className="animate-spin" color="hsl(var(--text-muted))" />
          <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>Lade Identitäten...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {identities.map((identity) => (
            <div
              key={identity.id || identity.identity_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '8px',
                background: 'hsla(0, 0%, 100%, 0.03)',
                border: '1px solid hsla(var(--primary), 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getProviderIcon(identity.provider)}
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-main))' }}>
                  {getProviderLabel(identity.provider)}
                </span>
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  VERBUNDEN
                </span>
              </div>

              {canUnlink && identity.provider.toLowerCase() !== 'email' && (
                <button
                  type="button"
                  onClick={() => handleUnlink(identity)}
                  disabled={busy}
                  title="Verknüpfung aufheben"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'hsl(var(--text-muted))',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '0.62rem',
                  }}
                >
                  <Unlink size={12} />
                  Trennen
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
