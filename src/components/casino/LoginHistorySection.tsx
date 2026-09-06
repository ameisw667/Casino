'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  History,
  RotateCw,
  KeyRound,
  Mail,
  Lock,
  Globe,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { AuthMethod, LoginAuditRecord } from '@/lib/security/login-audit-types';

function getMethodBadge(method: AuthMethod) {
  switch (method) {
    case 'passkey':
      return {
        icon: KeyRound,
        label: 'Passkey (Biometrie)',
        color: '#D4AF37',
      };
    case 'google':
      return {
        icon: Globe,
        label: 'Google Login',
        color: '#60a5fa',
      };
    case 'otp_magic_link':
      return {
        icon: Mail,
        label: 'E-Mail-Code (OTP)',
        color: '#a78bfa',
      };
    case 'password':
    default:
      return {
        icon: Lock,
        label: 'Passwort',
        color: '#e2e8f0',
      };
  }
}

function getDeviceIcon(deviceInfo: string) {
  const lower = deviceInfo.toLowerCase();
  if (lower.includes('ios') || lower.includes('android') || lower.includes('mobile')) {
    return Smartphone;
  }
  return Laptop;
}

function formatRecordDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export default function LoginHistorySection() {
  const [history, setHistory] = useState<LoginAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (_isManualRefresh: boolean = true) => {
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch('/api/user/login-history', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error('Fehler beim Laden der Login-Historie');
      }
      const raw = await res.json();
      const data = raw?.data ?? raw;
      setHistory(data.history || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Konnte nicht geladen werden';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        const res = await fetch('/api/user/login-history', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) {
          throw new Error('Fehler beim Laden der Login-Historie');
        }
        const raw = await res.json();
        const data = raw?.data ?? raw;
        if (!cancelled) {
          setHistory(data.history || []);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Konnte nicht geladen werden';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'hsla(45, 93%, 47%, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid hsla(45, 93%, 47%, 0.25)',
            }}
          >
            <History size={16} color="hsl(var(--primary))" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
              Login-Historie & Sicherheit
            </div>
            <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>
              Protokoll der letzten Anmeldungen & Geräte
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchHistory(true)}
          disabled={loading || refreshing}
          style={{
            background: 'hsla(0, 0%, 100%, 0.05)',
            border: '1px solid hsla(0, 0%, 100%, 0.1)',
            borderRadius: '8px',
            padding: '6px 10px',
            color: 'hsl(var(--text-muted))',
            fontSize: '0.7rem',
            fontWeight: 600,
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCw
            size={12}
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
          Aktualisieren
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: 'hsl(var(--text-muted))',
            background: 'hsla(0, 0%, 100%, 0.02)',
            borderRadius: '8px',
            border: '1px solid hsla(0, 0%, 100%, 0.04)',
          }}
        >
          Lade Login-Historie ...
        </div>
      ) : error ? (
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: 'hsla(0, 84%, 60%, 0.1)',
            border: '1px solid hsla(0, 84%, 60%, 0.25)',
            color: '#f87171',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={14} />
          {error}
        </div>
      ) : history.length === 0 ? (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: 'hsl(var(--text-muted))',
            background: 'hsla(0, 0%, 100%, 0.02)',
            borderRadius: '8px',
            border: '1px solid hsla(0, 0%, 100%, 0.04)',
          }}
        >
          Noch keine Login-Aktivitäten aufgezeichnet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.slice(0, 5).map((item) => {
            const methodInfo = getMethodBadge(item.authMethod);
            const MethodIcon = methodInfo.icon;
            const DeviceIcon = getDeviceIcon(item.deviceInfo);
            const isSuccess = item.status === 'success';

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'hsla(0, 0%, 100%, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid hsla(0, 0%, 100%, 0.05)',
                  fontSize: '0.75rem',
                }}
              >
                {/* Left: Method Icon & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'hsla(0, 0%, 100%, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MethodIcon size={14} color={methodInfo.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'hsl(var(--text-main))' }}>
                      {methodInfo.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'hsl(var(--text-muted))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '2px',
                      }}
                    >
                      <DeviceIcon size={10} />
                      <span>{item.deviceInfo}</span>
                      <span>•</span>
                      <span>IP: {item.ipMasked}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Date & Status Badge */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                    {formatRecordDate(item.createdAt)}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      background: isSuccess
                        ? 'hsla(142, 76%, 36%, 0.15)'
                        : 'hsla(0, 84%, 60%, 0.15)',
                      color: isSuccess ? '#34d399' : '#f87171',
                      border: isSuccess
                        ? '1px solid hsla(142, 76%, 36%, 0.3)'
                        : '1px solid hsla(0, 84%, 60%, 0.3)',
                    }}
                  >
                    {isSuccess ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    {isSuccess ? 'Erfolgreich' : 'Fehlgeschlagen'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
