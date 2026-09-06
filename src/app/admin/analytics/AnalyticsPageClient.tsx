'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { VibeMotion } from '@/components/ui/VibeMotion';

type RetentionValue = { eligible: number; retained: number; rate: number | null };
type CohortRow = {
  cohort: string;
  users: number;
  d1: RetentionValue;
  d7: RetentionValue;
  d30: RetentionValue;
};
type AnalyticsResponse = {
  generatedAt: string;
  cohorts: { registration: CohortRow[]; firstWager: CohortRow[] };
  summary: {
    registeredUsers: number;
    activatedUsers: number;
    activeUsers7d: number;
    churnRiskUsers: number;
    wager: number;
    payout: number;
    ggr: number;
  };
  funnel: Array<{ key: string; label: string; users: number; rate: number }>;
  vipDistribution: Array<{ tier: string; users: number }>;
  deposits: { available: boolean; count: number; amount: number };
  operational: {
    activeUsers24h: number;
    settledBets24h: number;
    wager24h: number;
    ggr24h: number;
    signals: Array<{ level: 'warning'; message: string }>;
  };
  guide?:
    | {
        status: 'ready';
        asOf: string;
        pricingVersions: string[];
        last24h: GuideWindow;
        last7d: GuideWindow;
      }
    | { status: 'unavailable' };
};

type GuideWindow = {
  requests: number;
  uniqueActors: number;
  successRate: number | null;
  errorRate: number | null;
  outcomes: Record<
    'success' | 'configuration' | 'quota' | 'upstream' | 'invalid_response' | 'rate_limited',
    number
  >;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  tokens: {
    input: number | null;
    cachedInput: number | null;
    output: number | null;
    reasoning: number | null;
    total: number | null;
  };
  estimatedCostMicrousd: number | null;
};

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const preciseCurrency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 4,
});
const number = new Intl.NumberFormat('de-DE');

function retentionText(value: RetentionValue) {
  return value.rate === null ? '—' : `${value.rate.toFixed(1)} %`;
}

function Card({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <section className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}>
      <p
        style={{
          color: 'hsl(var(--text-dim))',
          fontSize: 'var(--font-xs)',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <strong
        style={{
          display: 'block',
          fontSize: 'var(--font-xl)',
          marginTop: '6px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
      <span style={{ color: 'hsl(var(--text-muted))', fontSize: 'var(--font-xs)' }}>{detail}</span>
    </section>
  );
}

function guideValue(value: number | null, suffix = '') {
  return value === null ? '—' : `${number.format(value)}${suffix}`;
}

function guideRate(value: number | null) {
  return value === null ? '—' : `${value.toFixed(1)} %`;
}

function GuideWindowCards({ label, window }: { label: string; window: GuideWindow }) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
      }}
      aria-label={`Royale Guide ${label}`}
    >
      <Card
        label={`${label} Anfragen`}
        value={number.format(window.requests)}
        detail={`${number.format(window.uniqueActors)} pseudonyme Akteure`}
      />
      <Card
        label={`${label} Erfolg`}
        value={guideRate(window.successRate)}
        detail={`Fehler: ${guideRate(window.errorRate)}`}
      />
      <Card
        label={`${label} p95`}
        value={guideValue(window.p95LatencyMs, ' ms')}
        detail={`Ø ${guideValue(window.averageLatencyMs, ' ms')}`}
      />
      <Card
        label={`${label} Tokens`}
        value={guideValue(window.tokens.total)}
        detail={`In ${guideValue(window.tokens.input)} · Out ${guideValue(window.tokens.output)}`}
      />
      <Card
        label={`${label} Kosten`}
        value={
          window.estimatedCostMicrousd === null
            ? '—'
            : preciseCurrency.format(window.estimatedCostMicrousd / 1_000_000)
        }
        detail="Schätzung"
      />
    </section>
  );
}

export default function AnalyticsPageClient() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [mode, setMode] = useState<'registration' | 'firstWager'>('registration');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    return (raw?.data ?? raw) as AnalyticsResponse;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAnalytics()
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) setError('BI-Daten konnten nicht geladen werden.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchAnalytics]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAnalytics());
    } catch {
      setError('BI-Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [fetchAnalytics]);

  const cohorts = data?.cohorts[mode] ?? [];
  const generatedAt = useMemo(
    () =>
      data
        ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(
            new Date(data.generatedAt),
          )
        : '—',
    [data],
  );

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'hsl(var(--primary))',
            }}
          >
            <BarChart3 size={18} aria-hidden="true" />
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, letterSpacing: '0.12em' }}>
              ADMIN BI
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', marginTop: '8px' }}>Cohort & Retention</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '8px' }}>
            Live-Aggregation · Stand {generatedAt}
          </p>
        </div>
        <VibeMotion variant="button">
          <button
            className="btn btn-secondary"
            onClick={() => void load()}
            disabled={loading}
            aria-label="BI-Daten aktualisieren"
          >
            <RefreshCw size={16} aria-hidden="true" /> Aktualisieren
          </button>
        </VibeMotion>
      </header>

      {error && (
        <section
          className="glass-panel"
          role="alert"
          style={{ borderRadius: 'var(--radius-lg)', padding: '16px', color: 'hsl(var(--error))' }}
        >
          {error}
        </section>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
        }}
      >
        <Card
          label="Registriert"
          value={number.format(data?.summary.registeredUsers ?? 0)}
          detail="Alle Nutzer"
        />
        <Card
          label="Aktiv (7 Tage)"
          value={number.format(data?.summary.activeUsers7d ?? 0)}
          detail="Abgeschlossene Wetten"
        />
        <Card
          label="Wager"
          value={currency.format(data?.summary.wager ?? 0)}
          detail="Kanonische Settlements"
        />
        <Card
          label="GGR"
          value={currency.format(data?.summary.ggr ?? 0)}
          detail="Wager minus Payout"
        />
        <Card
          label="Churn-Risiko"
          value={number.format(data?.summary.churnRiskUsers ?? 0)}
          detail="14 Tage inaktiv"
        />
      </section>

      <section
        className="glass-panel"
        style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '18px',
          }}
        >
          <div>
            <h2 style={{ fontSize: 'var(--font-lg)' }}>Retention-Kohorten</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: 'var(--font-sm)' }}>
              D1, D7 und D30 mit altersbereinigter Basis.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }} aria-label="Kohortendefinition">
            {(
              [
                ['registration', 'Registrierung'],
                ['firstWager', 'Erste Wette'],
              ] as const
            ).map(([key, label]) => (
              <VibeMotion key={key} variant="button">
                <button
                  className={mode === key ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => setMode(key)}
                  aria-pressed={mode === key}
                >
                  {label}
                </button>
              </VibeMotion>
            ))}
          </div>
        </div>
        <div className="responsive-table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Woche</th>
                <th>Nutzer</th>
                <th>D1</th>
                <th>D7</th>
                <th>D30</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((row) => (
                <tr key={row.cohort}>
                  <td>{row.cohort}</td>
                  <td>{number.format(row.users)}</td>
                  <td>{retentionText(row.d1)}</td>
                  <td>{retentionText(row.d7)}</td>
                  <td>{retentionText(row.d30)}</td>
                </tr>
              ))}
              {!loading && cohorts.length === 0 && (
                <tr>
                  <td colSpan={5}>Keine Kohortendaten vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        <section
          className="glass-panel"
          style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}
        >
          <h2 style={{ fontSize: 'var(--font-lg)' }}>Aktivierungs-Funnel</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.funnel ?? []}>
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section
          className="glass-panel"
          style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}
        >
          <h2 style={{ fontSize: 'var(--font-lg)' }}>VIP-Verteilung</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.vipDistribution ?? []}>
              <XAxis dataKey="tier" tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="users" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <section
          className="glass-panel"
          style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={18} color="hsl(var(--success))" />
            <h2 style={{ fontSize: 'var(--font-lg)' }}>Operatives Monitoring</h2>
          </div>
          <p
            style={{
              color: 'hsl(var(--text-muted))',
              fontSize: 'var(--font-sm)',
              marginTop: '12px',
            }}
          >
            {number.format(data?.operational.activeUsers24h ?? 0)} aktive Nutzer ·{' '}
            {number.format(data?.operational.settledBets24h ?? 0)} Settlements ·{' '}
            {currency.format(data?.operational.ggr24h ?? 0)} GGR (24 h)
          </p>
          {(data?.operational.signals ?? []).map((signal) => (
            <p
              key={signal.message}
              role="status"
              style={{
                color: 'hsl(var(--warning))',
                fontSize: 'var(--font-sm)',
                marginTop: '10px',
              }}
            >
              <AlertTriangle size={14} aria-hidden="true" /> {signal.message}
            </p>
          ))}
        </section>
        <section
          className="glass-panel"
          style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Users size={18} color="hsl(var(--primary))" />
            <h2 style={{ fontSize: 'var(--font-lg)' }}>Einzahlungen</h2>
          </div>
          <p
            style={{
              color: 'hsl(var(--text-muted))',
              fontSize: 'var(--font-sm)',
              marginTop: '12px',
            }}
          >
            {data?.deposits.available
              ? `${number.format(data.deposits.count)} Einzahlungen · ${currency.format(data.deposits.amount)}`
              : 'Nicht verfügbar: Es existiert noch keine serverautoritative Einzahlungsbuchung.'}
          </p>
        </section>
      </section>

      <section
        className="glass-panel"
        style={{ borderRadius: 'var(--radius-xl)', padding: '20px' }}
        aria-labelledby="royale-guide-health-title"
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldCheck size={18} color="hsl(var(--primary))" aria-hidden="true" />
          <h2 id="royale-guide-health-title" style={{ fontSize: 'var(--font-lg)' }}>
            Royale Guide Health
          </h2>
        </div>
        {data?.guide?.status === 'ready' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
            <GuideWindowCards label="24 h" window={data.guide.last24h} />
            <GuideWindowCards label="7 Tage" window={data.guide.last7d} />
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: 'var(--font-xs)' }}>
              Schätzung – OpenAI Usage ist verbindlich. Preisversion:{' '}
              {data.guide.pricingVersions.length
                ? data.guide.pricingVersions.join(', ')
                : 'noch keine Daten'}
              .
            </p>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: 'var(--font-xs)' }}>
              Fehler: Quota {number.format(data.guide.last24h.outcomes.quota)} · Upstream{' '}
              {number.format(data.guide.last24h.outcomes.upstream)} · Rate Limit{' '}
              {number.format(data.guide.last24h.outcomes.rate_limited)} (24 h)
            </p>
          </div>
        ) : (
          <p
            style={{
              color: 'hsl(var(--text-muted))',
              fontSize: 'var(--font-sm)',
              marginTop: '12px',
            }}
          >
            Guide-Telemetrie ist noch nicht verfügbar. Bestehende BI-Kennzahlen bleiben davon
            unberührt.
          </p>
        )}
      </section>
    </main>
  );
}
