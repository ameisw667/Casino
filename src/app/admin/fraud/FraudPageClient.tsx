'use client';
import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, AlertCircle, Search, Radar } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/security/form-errors';

type RiskStatus = 'open' | 'reviewed' | 'closed';
type RiskSeverity = 'low' | 'medium' | 'high';

interface RiskEvent {
  id: string;
  subject_user_id: string;
  signal_type: string;
  severity: RiskSeverity;
  status: RiskStatus;
  occurrences: number;
  evidence: Record<string, unknown>;
  window_start: string;
  created_at: string;
  last_seen_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_reason: string | null;
}

interface ScanSummary {
  createdOrUpdated: number;
  partialFailures: number;
  bySignalType: Record<string, number>;
}

const SIGNAL_LABELS: Record<string, string> = {
  voucher_velocity: 'Voucher-Velocity',
  multi_account_indicator: 'Multi-Account',
  idempotency_conflict: 'Idempotency-Konflikt',
  rate_limit_hit: 'Rate-Limit',
  balance_correction: 'Balance-Korrektur',
  bet_velocity: 'Bet-Velocity',
  win_rate_anomaly: 'Win-Rate-Anomalie',
  ml_anomaly_score: 'ML-Anomalie-Score',
  // 06_1 Bot-Automation Detection (L0–L5): neue Bot-/Kosten-Signal-Typen
  bot_signal_honeypot: 'Signup-Honeypot',
  bot_signal_timing: 'Signup-Timing',
  bot_signal_login_flood: 'Login-Flood',
  cost_cap_reached: 'Tageslimit erreicht',
};

const SEVERITY_COLORS: Record<RiskSeverity, { color: string; bg: string }> = {
  low: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const STATUS_COLORS: Record<RiskStatus, { color: string; bg: string }> = {
  open: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  reviewed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  closed: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

export default function FraudPageClient() {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RiskStatus | ''>('open');
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | ''>('');

  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (severityFilter) params.set('severity', severityFilter);
      const res = await fetch(`/api/admin/fraud?${params.toString()}`, { cache: 'no-store' });
      const raw = await res.json();
      const json = (raw?.data ?? raw) as { events?: RiskEvent[]; error?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(json, `HTTP ${res.status}`));
      setEvents(json.events ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fraud-Signale konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, severityFilter]);

  const runScan = async () => {
    setScanLoading(true);
    setScanMsg(null);
    try {
      const res = await fetch('/api/admin/fraud/scan', { method: 'POST' });
      const raw = await res.json();
      const json = (raw?.data ?? raw) as ScanSummary & { error?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(json, `HTTP ${res.status}`));
      setScanMsg({
        kind: 'ok',
        text: `Scan abgeschlossen: ${json.createdOrUpdated} Signal(e) geschrieben${
          json.partialFailures > 0 ? `, ${json.partialFailures} fehlgeschlagen` : ''
        }.`,
      });
      await load();
    } catch (err) {
      setScanMsg({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Scan fehlgeschlagen.',
      });
    } finally {
      setScanLoading(false);
    }
  };

  const submitReview = async (eventId: string, status: 'reviewed' | 'closed') => {
    if (!reviewReason.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/admin/fraud', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status, reason: reviewReason.trim() }),
      });
      const json = (await res.json()) as { error?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(json, `HTTP ${res.status}`));
      setReviewingId(null);
      setReviewReason('');
      await load();
    } catch (err) {
      setScanMsg({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Review fehlgeschlagen.',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1300, margin: '0 auto' }}>
      <header
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
      >
        <ShieldAlert size={28} color="#D4AF37" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Anti-Fraud Review
        </h1>
        <button onClick={load} style={{ ...secondaryButtonStyle, marginLeft: 'auto' }}>
          <RefreshCw size={16} /> Reload
        </button>
        <button
          onClick={runScan}
          disabled={scanLoading}
          style={{
            ...primaryButtonStyle,
            opacity: scanLoading ? 0.6 : 1,
            cursor: scanLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <Radar size={16} /> {scanLoading ? 'Scan läuft…' : 'Scan jetzt ausführen'}
        </button>
      </header>

      {scanMsg && (
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: scanMsg.kind === 'ok' ? '#10b981' : '#ef4444',
            fontSize: '0.9rem',
          }}
        >
          {scanMsg.kind === 'err' && <AlertCircle size={16} />}
          {scanMsg.text}
        </div>
      )}

      <section
        style={{
          background: 'rgba(10,10,12,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Search size={16} color="#94a3b8" style={{ alignSelf: 'center' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RiskStatus | '')}
            style={selectStyle}
          >
            <option value="">Alle Status</option>
            <option value="open">Offen</option>
            <option value="reviewed">Geprüft</option>
            <option value="closed">Geschlossen</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | '')}
            style={selectStyle}
          >
            <option value="">Alle Severities</option>
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
          </select>
        </div>

        {loading ? (
          <div style={{ color: '#94a3b8' }}>Laden…</div>
        ) : error ? (
          <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        ) : events.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>Keine Fraud-Signale für diesen Filter.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  color: '#94a3b8',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <th style={thStyle}>Signal</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Vorkommen</th>
                <th style={thStyle}>Evidence</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Zuletzt</th>
                <th style={thStyle}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <React.Fragment key={ev.id}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={tdStyle}>
                      {SIGNAL_LABELS[ev.signal_type] ?? ev.signal_type}
                      {ev.signal_type === 'multi_account_indicator' && (
                        <span
                          title="Basiert auf x-forwarded-for; Vertrauenswürdigkeit dieses Headers auf der Deployment-Plattform noch nicht verifiziert (docs/archive/05_2.8_Anti_Fraud.md N7/R22). Beobachtend, nicht beweiskräftig."
                          style={{
                            marginLeft: '0.4rem',
                            fontSize: '0.7rem',
                            color: '#f59e0b',
                            cursor: 'help',
                          }}
                        >
                          (beobachtend)
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={pillStyle(SEVERITY_COLORS[ev.severity])}>{ev.severity}</span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)' }}>
                      {ev.subject_user_id}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)' }}>
                      {ev.occurrences}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 280, overflow: 'hidden' }}>
                      <code style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {JSON.stringify(ev.evidence)}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <span style={pillStyle(STATUS_COLORS[ev.status])}>{ev.status}</span>
                    </td>
                    <td style={tdStyle}>{new Date(ev.last_seen_at).toLocaleString()}</td>
                    <td style={tdStyle}>
                      {ev.status === 'open' &&
                        (reviewingId === ev.id ? null : (
                          <button
                            onClick={() => {
                              setReviewingId(ev.id);
                              setReviewReason('');
                            }}
                            style={secondaryButtonStyle}
                          >
                            Prüfen
                          </button>
                        ))}
                    </td>
                  </tr>
                  {reviewingId === ev.id && (
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td colSpan={8} style={{ ...tdStyle, background: 'rgba(212,175,55,0.05)' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <input
                            value={reviewReason}
                            onChange={(e) => setReviewReason(e.target.value)}
                            placeholder="Begründung (Pflichtfeld)"
                            maxLength={500}
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            disabled={reviewSubmitting || !reviewReason.trim()}
                            onClick={() => submitReview(ev.id, 'reviewed')}
                            style={{
                              ...secondaryButtonStyle,
                              opacity: reviewSubmitting || !reviewReason.trim() ? 0.5 : 1,
                            }}
                          >
                            Als geprüft markieren
                          </button>
                          <button
                            disabled={reviewSubmitting || !reviewReason.trim()}
                            onClick={() => submitReview(ev.id, 'closed')}
                            style={{
                              ...primaryButtonStyle,
                              opacity: reviewSubmitting || !reviewReason.trim() ? 0.5 : 1,
                            }}
                          >
                            Schließen
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setReviewReason('');
                            }}
                            style={secondaryButtonStyle}
                          >
                            Abbrechen
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function pillStyle({ color, bg }: { color: string; bg: string }): React.CSSProperties {
  return {
    padding: '0.15rem 0.55rem',
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 600,
    color,
    background: bg,
  };
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '0.5rem 0.7rem',
  color: '#fff',
  fontSize: '0.85rem',
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(212,175,55,0.3)',
  color: '#D4AF37',
  borderRadius: 8,
  padding: '0.5rem 0.9rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  marginLeft: '0.6rem',
  background: 'linear-gradient(135deg, #D4AF37, #b8932f)',
  color: '#050505',
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  padding: '0.5rem 0.9rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const thStyle: React.CSSProperties = { padding: '0.5rem 0.4rem', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '0.65rem 0.4rem', color: '#cbd5e1' };
