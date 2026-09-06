'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, Loader2, Copy, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { mapAuthError } from '@/lib/security/form-errors';
import { trackAllowedEvent } from '@/lib/analytics/events';
import type { Factor } from '@supabase/supabase-js';

export default function MfaManagementSection() {
  const [supabase] = useState(() => createClient());
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Enrollment State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [copied, setCopied] = useState(false);

  const loadFactors = useCallback(async () => {
    try {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) return;
      if (data?.totp) {
        const verified = data.totp.filter((f) => f.status === 'verified');
        setFactors(verified);
      }
    } catch {
      // Fail closed
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFactors();
  }, [loadFactors]);

  const handleStartEnroll = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });
      if (enrollErr || !data) {
        setError(
          mapAuthError(enrollErr?.message ?? 'Fehler beim Erstellen des 2FA-Faktors').message,
        );
        return;
      }
      setEnrollData({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setIsEnrolling(true);
      setVerifyCode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(msg).message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyEnroll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enrollData || verifyCode.trim().length < 6) return;

    setBusy(true);
    setError(null);
    try {
      const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollData.factorId,
        code: verifyCode.trim(),
      });
      if (verifyErr) {
        setError(mapAuthError(verifyErr.message).message);
        return;
      }
      void trackAllowedEvent({ name: 'mfa_totp_enrolled' });
      setSuccess('2FA erfolgreich aktiviert!');
      setIsEnrolling(false);
      setEnrollData(null);
      setVerifyCode('');
      await loadFactors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(msg).message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancelEnroll = async () => {
    if (enrollData) {
      // Clean up unverified factor
      try {
        await supabase.auth.mfa.unenroll({ factorId: enrollData.factorId });
      } catch {
        // Silent cleanup
      }
    }
    setIsEnrolling(false);
    setEnrollData(null);
    setVerifyCode('');
    setError(null);
  };

  const handleUnenroll = async (factorId: string) => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollErr) {
        setError(mapAuthError(unenrollErr.message).message);
        return;
      }
      void trackAllowedEvent({ name: 'mfa_totp_unenrolled' });
      setSuccess('2FA erfolgreich deaktiviert.');
      await loadFactors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(mapAuthError(msg).message);
    } finally {
      setBusy(false);
    }
  };

  const copySecret = () => {
    if (!enrollData?.secret) return;
    navigator.clipboard.writeText(enrollData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasActiveMfa = factors.length > 0;

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
          <ShieldCheck
            size={14}
            color={hasActiveMfa ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
            Zwei-Faktor (2FA)
          </span>
        </div>

        {!isEnrolling && !hasActiveMfa && (
          <button
            type="button"
            onClick={handleStartEnroll}
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
            Aktivieren
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
          <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>
            Lade 2FA-Status...
          </span>
        </div>
      ) : hasActiveMfa && !isEnrolling ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {factors.map((factor) => (
            <div
              key={factor.id}
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
                <ShieldCheck size={12} color="#10B981" />
                <span
                  style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-main))' }}
                >
                  {factor.friendly_name || 'Authenticator App'}
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
                  AKTIV
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleUnenroll(factor.id)}
                disabled={busy}
                title="2FA deaktivieren"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'hsl(var(--text-muted))',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Enrollment View */}
      {isEnrolling && enrollData && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            borderRadius: '10px',
            background: 'hsla(0, 0%, 0%, 0.4)',
            border: '1px solid hsla(var(--primary), 0.3)',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
            1. QR-Code mit Authenticator-App scannen:
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '8px',
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '140px',
              margin: '0 auto',
            }}
          >
            {/* Supabase TOTP QR is an inline SVG Data URL — kept as native <img>: next/image cannot optimize SVG data URLs and any re-encoding risks corrupting the scannable QR. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enrollData.qrCode}
              alt="2FA QR Code"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.62rem', color: 'hsl(var(--text-muted))' }}>
              Oder Schlüssel manuell eingeben:
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'hsla(0, 0%, 100%, 0.05)',
                border: '1px solid hsla(0, 0%, 100%, 0.1)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'hsl(var(--text-main))',
              }}
            >
              <span
                style={{ letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {enrollData.secret}
              </span>
              <button
                type="button"
                onClick={copySecret}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#10B981' : 'hsl(var(--primary))',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
              </button>
            </div>
          </div>

          <form
            onSubmit={handleVerifyEnroll}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
              2. 6-stelligen Code eingeben:
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'hsla(0, 0%, 100%, 0.05)',
                border: '1px solid hsla(var(--primary), 0.4)',
                color: 'hsl(var(--text-main))',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                textAlign: 'center',
                letterSpacing: '0.2em',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={busy || verifyCode.length < 6}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  cursor: verifyCode.length < 6 || busy ? 'not-allowed' : 'pointer',
                  opacity: verifyCode.length < 6 || busy ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Bestätigen
              </button>
              <button
                type="button"
                onClick={handleCancelEnroll}
                disabled={busy}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'hsla(0, 0%, 100%, 0.05)',
                  border: '1px solid hsla(0, 0%, 100%, 0.1)',
                  color: 'hsl(var(--text-muted))',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
