'use client';
import React, { useEffect, useState } from 'react';
import { Ticket, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, Undo2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/security/form-errors';

interface PromoCode {
  code: string;
  amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
}

export default function PromoCodesClient() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [redemptions24h, setRedemptions24h] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 06_10 L0: admin-triggered reversal of a fraudulent redemption. Always explicit —
  // userId and reason are required inputs, the route itself is idempotent via
  // Idempotency-Key and rejects a second reversal server-side.
  const [reversal, setReversal] = useState<{ code: string; userId: string; reason: string } | null>(
    null,
  );
  const [reversing, setReversing] = useState(false);
  const [reversalMsg, setReversalMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [form, setForm] = useState({
    code: '',
    amount: '',
    maxUses: '',
    expiresAt: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/promo-codes', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const json = (raw?.data ?? raw) as { codes: PromoCode[]; redemptions24h?: Record<string, number> };
      setCodes(json.codes ?? []);
      setRedemptions24h(json.redemptions24h ?? {});
      setError(null);
    } catch {
      setError('Promo-Codes konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const submitReversal = async () => {
    if (!reversal) return;
    setReversing(true);
    setReversalMsg(null);
    try {
      const res = await fetch(`/api/admin/promo-codes/${encodeURIComponent(reversal.code)}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ userId: reversal.userId.trim(), reason: reversal.reason.trim() }),
      });
      const raw = await res.json();
      if (!res.ok) {
        setReversalMsg({ kind: 'err', text: getApiErrorMessage(raw, 'Rückbuchung fehlgeschlagen') });
        return;
      }
      const json = (raw?.data ?? raw) as { amount?: number; shortfall?: number };
      const shortfallNote = json.shortfall && json.shortfall > 0
        ? ` (uncollectable shortfall $${json.shortfall.toFixed(2)})`
        : '';
      setReversalMsg({
        kind: 'ok',
        text: `$${(json.amount ?? 0).toFixed(2)} zurückgebucht${shortfallNote}`,
      });
      setReversal(null);
      await load();
    } catch {
      setReversalMsg({ kind: 'err', text: 'Netzwerkfehler bei der Rückbuchung' });
    } finally {
      setReversing(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const payload: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        amount: Number(form.amount),
        maxUses: Number(form.maxUses),
        active: form.active,
      };
      if (form.expiresAt) {
        payload.expiresAt = new Date(form.expiresAt).toISOString();
      } else {
        payload.expiresAt = null;
      }
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await res.json();
      if (!res.ok) {
        setSubmitMsg({ kind: 'err', text: getApiErrorMessage(raw, 'Anlegen fehlgeschlagen') });
        return;
      }
      const json = (raw?.data ?? raw) as { success: boolean; code?: PromoCode };
      setSubmitMsg({ kind: 'ok', text: `Code ${json.code?.code} angelegt` });
      setForm({ code: '', amount: '', maxUses: '', expiresAt: '', active: true });
      await load();
    } catch {
      setSubmitMsg({ kind: 'err', text: 'Netzwerkfehler beim Anlegen' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
      >
        <Ticket size={28} color="#D4AF37" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Promo Codes
        </h1>
        <button
          onClick={load}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#D4AF37',
            borderRadius: 8,
            padding: '0.5rem 0.9rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} /> Reload
        </button>
      </header>

      <section
        style={{
          background: 'rgba(10,10,12,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 14,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', color: '#D4AF37', margin: '0 0 1rem' }}>
          <Plus size={16} style={{ display: 'inline', marginRight: 6 }} />
          Neuen Promo-Code anlegen
        </h2>
        <form
          onSubmit={submit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.9rem',
          }}
        >
          <Field label="Code (A-Z 0-9)">
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="JAN100"
              maxLength={32}
              style={inputStyle}
            />
          </Field>
          <Field label="Betrag ($)">
            <input
              required
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="100"
              style={inputStyle}
            />
          </Field>
          <Field label="Max Uses">
            <input
              required
              type="number"
              min="1"
              max="1000000"
              step="1"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              placeholder="100"
              style={inputStyle}
            />
          </Field>
          <Field label="Ablauf (optional)">
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <Field label="Aktiv">
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              aktiv
            </label>
          </Field>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #D4AF37, #b8932f)',
                color: '#050505',
                fontWeight: 700,
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Anlegen…' : 'Anlegen'}
            </button>
          </div>
        </form>
        {submitMsg && (
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: submitMsg.kind === 'ok' ? '#10b981' : '#ef4444',
              fontSize: '0.9rem',
            }}
          >
            {submitMsg.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {submitMsg.text}
          </div>
        )}
      </section>

      <section
        style={{
          background: 'rgba(10,10,12,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: '1.25rem 1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem' }}>Bestehende Codes</h2>
        {loading ? (
          <div style={{ color: '#94a3b8' }}>Laden…</div>
        ) : error ? (
          <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        ) : codes.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>Keine Promo-Codes vorhanden.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  color: '#94a3b8',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Betrag</th>
                <th style={thStyle}>Nutzung</th>
                <th style={thStyle}>24h</th>
                <th style={thStyle}>Ablauf</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const exhausted = c.used_count >= c.max_uses;
                const expired = c.expires_at !== null && new Date(c.expires_at) < new Date();
                return (
                  <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#D4AF37',
                        fontWeight: 600,
                      }}
                    >
                      {c.code}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)' }}>
                      ${c.amount.toFixed(2)}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)' }}>
                      {c.used_count}/{c.max_uses}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: 'var(--font-mono, monospace)',
                        color: (redemptions24h[c.code] ?? 0) >= 5 ? '#ef4444' : undefined,
                      }}
                    >
                      {redemptions24h[c.code] ?? 0}
                    </td>
                    <td style={tdStyle}>
                      {c.expires_at ? (
                        <span
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Clock size={13} />
                          {new Date(c.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '0.15rem 0.55rem',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: !c.active
                            ? '#94a3b8'
                            : expired || exhausted
                              ? '#ef4444'
                              : '#10b981',
                          background: !c.active
                            ? 'rgba(148,163,184,0.12)'
                            : expired || exhausted
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(16,185,129,0.12)',
                        }}
                      >
                        {!c.active
                          ? 'inaktiv'
                          : expired
                            ? 'abgelaufen'
                            : exhausted
                              ? 'aufgebraucht'
                              : 'aktiv'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          setReversal(
                            reversal?.code === c.code ? null : { code: c.code, userId: '', reason: '' },
                          )
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.35)',
                          color: '#ef4444',
                          borderRadius: 6,
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Undo2 size={13} /> Rückbuchen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {reversal && (
          <div
            style={{
              marginTop: '1.25rem',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 10,
              padding: '1rem',
              background: 'rgba(239,68,68,0.05)',
            }}
          >
            <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.75rem' }}>
              Rückbuchung für Code {reversal.code}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.9rem' }}>
              <Field label="Nutzer-ID">
                <input
                  value={reversal.userId}
                  onChange={(e) => setReversal({ ...reversal, userId: e.target.value })}
                  style={inputStyle}
                />
              </Field>
              <Field label="Grund (Pflicht, max. 500 Zeichen)">
                <input
                  value={reversal.reason}
                  maxLength={500}
                  onChange={(e) => setReversal({ ...reversal, reason: e.target.value })}
                  placeholder="z. B. Multi-Account-Cluster bestätigt"
                  style={inputStyle}
                />
              </Field>
            </div>
            <button
              onClick={submitReversal}
              disabled={reversing || reversal.userId.trim() === '' || reversal.reason.trim() === ''}
              style={{
                marginTop: '0.9rem',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                cursor: reversing ? 'not-allowed' : 'pointer',
                opacity: reversing || reversal.userId.trim() === '' || reversal.reason.trim() === '' ? 0.6 : 1,
              }}
            >
              {reversing ? 'Buche zurück…' : 'Rückbuchung ausführen'}
            </button>
            <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#94a3b8' }}>
              Bucht die ursprüngliche Einlösung zurück (max. bis auf 0; ein bereits verspielter
              Teil wird als Fehlbetrag im Ledger vermerkt, nicht ins Negative gebucht).
            </div>
          </div>
        )}
        {reversalMsg && (
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: reversalMsg.kind === 'ok' ? '#10b981' : '#ef4444',
              fontSize: '0.9rem',
            }}
          >
            {reversalMsg.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {reversalMsg.text}
          </div>
        )}
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '0.55rem 0.7rem',
  color: '#fff',
  fontSize: '0.9rem',
};

const thStyle: React.CSSProperties = { padding: '0.5rem 0.4rem', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '0.65rem 0.4rem', color: '#cbd5e1' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        fontSize: '0.78rem',
        color: '#94a3b8',
      }}
    >
      {label}
      {children}
    </label>
  );
}
