'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { CasinoLogger } from '@/lib/casino/logger';

// 06_2 L2/L3: Nutzer-seitige Selbstsperre (R1) und Tages-Verlustlimit (R2) im
// Settings-Modal. Die Sperre kann nach Aktivierung nicht aufgehoben werden (Q3a) —
// nur verlängern. Deshalb: zweistufige Bestätigung vor dem irreversiblen POST. Das
// Verlustlimit darf frei gesetzt und entfernt werden (dokumentierte Annahme L3).

interface WellbeingStatus {
  selfExcluded: boolean;
  selfExcludedUntil: string | null;
  dailyLossLimitCents: number | null;
  dailyNetLossCents: number | null;
}

const UNLOCKED_STATUS: WellbeingStatus = {
  selfExcluded: false,
  selfExcludedUntil: null,
  dailyLossLimitCents: null,
  dailyNetLossCents: null,
};

export const DURATION_OPTIONS: ReadonlyArray<{ days: number; label: string }> = [
  { days: 1, label: '1 Tag' },
  { days: 7, label: '7 Tage' },
  { days: 30, label: '30 Tage' },
  { days: 90, label: '90 Tage' },
  { days: 365, label: '365 Tage' },
];

// Defensive client-side parse of the server payload: anything unexpected falls back to
// "unlocked" instead of showing a wrong lock state (the server answer is the only truth).
export function deriveWellbeingStatus(payload: unknown): WellbeingStatus {
  if (!payload || typeof payload !== 'object') return UNLOCKED_STATUS;
  const data = payload as {
    selfExcluded?: unknown;
    selfExcludedUntil?: unknown;
    dailyLossLimitCents?: unknown;
    dailyNetLossCents?: unknown;
  };
  if (data.selfExcluded === true && typeof data.selfExcludedUntil === 'string') {
    return { ...UNLOCKED_STATUS, selfExcluded: true, selfExcludedUntil: data.selfExcludedUntil };
  }
  const isLimitCents = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0;
  return {
    ...UNLOCKED_STATUS,
    dailyLossLimitCents: isLimitCents(data.dailyLossLimitCents) ? data.dailyLossLimitCents : null,
    dailyNetLossCents: isLimitCents(data.dailyNetLossCents) ? data.dailyNetLossCents : null,
  };
}

export function formatExclusionDate(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 06_2 L3: mirror of the server contract (integer cents 1..1_000_000). A strict EUR
// text pattern instead of Number() arithmetic — '12.34' * 100 would hit float noise.
const LOSS_LIMIT_EUR_PATTERN = /^\d+(\.\d{1,2})?$/;
const LOSS_LIMIT_MAX_CENTS = 1_000_000;

export function parseLossLimitEur(input: string): number | null {
  // L3 Security-Review LOW: de-DE users type a comma decimal — normalize before the
  // strict pattern ('1,234.56' becomes '1.234.56' and still fails the pattern).
  const trimmed = input.trim().replace(',', '.');
  if (!LOSS_LIMIT_EUR_PATTERN.test(trimmed)) return null;
  const [euroPart, centPart = ''] = trimmed.split('.');
  const cents = Number(euroPart) * 100 + Number(centPart.padEnd(2, '0'));
  if (cents < 1 || cents > LOSS_LIMIT_MAX_CENTS) return null;
  return cents;
}

export function formatLossLimitCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export default function ResponsibleGamblingSection() {
  const [status, setStatus] = useState<WellbeingStatus>(UNLOCKED_STATUS);
  // Distinct from "unlocked" (a real, known state from the server): stays false while
  // unauthenticated or on a transient error, so the section renders nothing instead of
  // a misleading "no lock active" for a case that isn't actually that.
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [durationDays, setDurationDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [limitBusy, setLimitBusy] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/user/self-exclusion');
      if (!response.ok) {
        setVisible(false);
        return;
      }
      const raw = await response.json();
      setStatus(deriveWellbeingStatus(raw?.data ?? raw));
      setVisible(true);
    } catch (error) {
      CasinoLogger.error('ResponsibleGamblingSection', 'Failed to load wellbeing status', error);
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshStatus();
  }, [refreshStatus]);

  const handleActivate = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/user/self-exclusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays }),
      });
      if (!response.ok) {
        setError('Die Sperre konnte nicht aktiviert werden. Bitte versuche es später erneut.');
        return;
      }
      // The server state is authoritative — it may be later than the requested duration
      // when a longer lock already existed (only-extends invariant, 06_2 L1). Re-fetching
      // also avoids a UI dead-end if the response body were ever missing the timestamp.
      await refreshStatus();
      setConfirming(false);
    } catch (error) {
      CasinoLogger.error('ResponsibleGamblingSection', 'Failed to activate self-exclusion', error);
      setError('Die Sperre konnte nicht aktiviert werden. Bitte versuche es später erneut.');
    } finally {
      setBusy(false);
    }
  }, [durationDays, refreshStatus]);

  const handleSaveLimit = useCallback(
    async (cents: number | null) => {
      setLimitBusy(true);
      setLimitError(null);
      try {
        const response = await fetch('/api/user/self-exclusion', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dailyLossLimitCents: cents }),
        });
        if (!response.ok) {
          setLimitError(
            'Das Verlustlimit konnte nicht gespeichert werden. Bitte versuche es später erneut.',
          );
          return;
        }
        await refreshStatus();
        setLimitInput('');
      } catch (error) {
        CasinoLogger.error('ResponsibleGamblingSection', 'Failed to save daily loss limit', error);
        setLimitError(
          'Das Verlustlimit konnte nicht gespeichert werden. Bitte versuche es später erneut.',
        );
      } finally {
        setLimitBusy(false);
      }
    },
    [refreshStatus],
  );

  if (!visible) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderTop: '1px solid hsla(0, 0%, 100%, 0.06)',
        paddingTop: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldAlert size={14} color="hsl(var(--primary))" />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
          Selbstsperre
        </span>
      </div>

      {status.selfExcluded && status.selfExcludedUntil && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: '10px',
            background: 'hsla(140, 60%, 40%, 0.1)',
            border: '1px solid hsla(140, 60%, 40%, 0.25)',
            fontSize: '0.7rem',
            color: 'hsl(var(--text-main))',
          }}
        >
          Aktiv bis{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {formatExclusionDate(status.selfExcludedUntil)}
          </span>
        </div>
      )}

      <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', margin: 0 }}>
        Während der Sperre ist Spielen nicht möglich. Eine aktive Sperre läuft nur mit Ablauf der
        Frist aus — sie kann nicht vorzeitig aufgehoben, nur verlängert werden.
      </p>

      {!status.selfExcluded && !confirming && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            aria-label="Dauer der Selbstsperre"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '10px',
              background: 'hsla(0, 0%, 100%, 0.05)',
              border: '1px solid hsla(0, 0%, 100%, 0.12)',
              color: 'hsl(var(--text-main))',
              fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.days} value={option.days}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={busy}
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', gap: '6px' }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Selbstsperre aktivieren</span>
          </button>
        </div>
      )}

      {!status.selfExcluded && confirming && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'hsla(0, 80%, 55%, 0.08)',
            border: '1px solid hsla(0, 80%, 55%, 0.3)',
          }}
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
            Wirklich für{' '}
            {DURATION_OPTIONS.find((o) => o.days === durationDays)?.label ?? `${durationDays} Tage`}{' '}
            sperren? Diese Aktion ist nicht rückgängig zu machen.
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleActivate}
              disabled={busy}
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '6px' }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'hsl(0, 80%, 65%)' }}>
                Bestätigen
              </span>
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '6px' }}
            >
              <span
                style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}
              >
                Abbrechen
              </span>
            </button>
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: '0.68rem', color: 'hsl(0, 80%, 65%)' }}>{error}</span>}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderTop: '1px solid hsla(0, 0%, 100%, 0.06)',
          paddingTop: '10px',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
          Tages-Verlustlimit
        </span>
      </div>

      {!status.selfExcluded && (
        <>
          {status.dailyLossLimitCents !== null && (
            <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', margin: 0 }}>
              Limit:{' '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'hsl(var(--text-main))',
                }}
              >
                {formatLossLimitCents(status.dailyLossLimitCents)} €
              </span>
              {' · '}Heute verloren:{' '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'hsl(var(--text-main))',
                }}
              >
                {formatLossLimitCents(status.dailyNetLossCents ?? 0)} €
              </span>
            </p>
          )}

          <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', margin: 0 }}>
            Erreicht das Tageslimit, ist für den Rest des UTC-Tages kein Spielen mehr möglich.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder="z. B. 25,00"
              inputMode="decimal"
              aria-label="Tages-Verlustlimit in EUR"
              disabled={limitBusy}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '8px 10px',
                borderRadius: '10px',
                background: 'hsla(0, 0%, 100%, 0.05)',
                border: '1px solid hsla(0, 0%, 100%, 0.12)',
                color: 'hsl(var(--text-main))',
                fontSize: '0.72rem',
              }}
            />
            <button
              type="button"
              onClick={() => {
                const cents = parseLossLimitEur(limitInput);
                if (cents === null) {
                  setLimitError('Bitte einen Betrag zwischen 0,01 € und 10.000 € eingeben.');
                  return;
                }
                void handleSaveLimit(cents);
              }}
              disabled={limitBusy}
              className="btn btn-ghost"
              style={{ justifyContent: 'center', gap: '6px' }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Limit setzen</span>
            </button>
            {status.dailyLossLimitCents !== null && (
              <button
                type="button"
                onClick={() => void handleSaveLimit(null)}
                disabled={limitBusy}
                className="btn btn-ghost"
                style={{ justifyContent: 'center', gap: '6px' }}
              >
                <span
                  style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}
                >
                  Entfernen
                </span>
              </button>
            )}
          </div>

          {limitError && (
            <span style={{ fontSize: '0.68rem', color: 'hsl(0, 80%, 65%)' }}>{limitError}</span>
          )}
        </>
      )}
    </div>
  );
}
