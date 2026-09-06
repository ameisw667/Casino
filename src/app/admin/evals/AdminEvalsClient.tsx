'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Coins,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface WindowMetrics {
  requests: number;
  uniqueActors: number;
  successRate: number | null;
  errorRate: number | null;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  tokens: {
    input: number;
    cachedInput: number;
    output: number;
    reasoning: number;
    total: number;
  };
  estimatedCostMicrousd: number;
  outcomes: {
    success: number;
    configuration: number;
    quota: number;
    upstream: number;
    invalid_response: number;
    rate_limited: number;
  };
}

interface EvalsData {
  observability: {
    status: string;
    asOf: string;
    last24h: WindowMetrics;
    last7d: WindowMetrics;
    pricingVersions: string[];
  };
  feedback: {
    totalRatings: number;
    positiveRatings: number;
    negativeRatings: number;
    satisfactionRate: number;
    recentFeedback: Array<{
      id: string;
      createdAt: string;
      rating: 1 | -1;
      category?: string | null;
      comment?: string | null;
    }>;
  };
}

const OUTCOME_COLORS: Record<string, string> = {
  success: '#10b981',
  rate_limited: '#f59e0b',
  upstream: '#ef4444',
  invalid_response: '#ec4899',
  quota: '#8b5cf6',
  configuration: '#6b7280',
};

function formatMicrousd(microusd: number): string {
  const usd = microusd / 1_000_000;
  if (usd < 0.01 && usd > 0) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export default function AdminEvalsClient() {
  const [data, setData] = useState<EvalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<'last24h' | 'last7d'>('last24h');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/evals', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const json = (raw?.data ?? raw) as EvalsData;
      setData(json);
      setError(null);
    } catch {
      setError('Telemetrie- & Evals-Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        const res = await fetch('/api/admin/evals', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const json = (raw?.data ?? raw) as EvalsData;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Telemetrie- & Evals-Daten konnten nicht geladen werden.');
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

  const metrics = data?.observability ? data.observability[selectedWindow] : null;
  const feedback = data?.feedback;

  // Chart Data: Token Breakdown
  const tokenChartData = metrics
    ? [
        {
          name: 'Input',
          value: metrics.tokens.input - (metrics.tokens.cachedInput || 0),
          fill: '#ffd700',
        },
        { name: 'Cached', value: metrics.tokens.cachedInput || 0, fill: '#38bdf8' },
        { name: 'Output', value: metrics.tokens.output, fill: '#10b981' },
        { name: 'Reasoning', value: metrics.tokens.reasoning || 0, fill: '#a855f7' },
      ]
    : [];

  // Chart Data: Outcomes Breakdown
  const outcomeChartData = metrics
    ? Object.entries(metrics.outcomes)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({
          name: key.replace('_', ' ').toUpperCase(),
          value: count,
          fill: OUTCOME_COLORS[key] || '#9ca3af',
        }))
    : [];

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          paddingBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.65rem',
              borderRadius: 12,
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#ffd700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                LLM Evals & Telemetrie
              </h1>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  color: '#10b981',
                  fontFamily: 'monospace',
                }}
              >
                LIVE TELEMETRY
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              Echtzeit-Monitoring von Latenzen, Token-Kosten, Fehlerraten und Nutzer-Zufriedenheit.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Time Window Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '3px',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedWindow('last24h')}
              style={{
                background: selectedWindow === 'last24h' ? 'rgba(212,175,55,0.2)' : 'transparent',
                border: selectedWindow === 'last24h' ? '1px solid rgba(212,175,55,0.4)' : 'none',
                color: selectedWindow === 'last24h' ? '#ffd700' : 'rgba(255,255,255,0.6)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              24 Stunden
            </button>
            <button
              type="button"
              onClick={() => setSelectedWindow('last7d')}
              style={{
                background: selectedWindow === 'last7d' ? 'rgba(212,175,55,0.2)' : 'transparent',
                border: selectedWindow === 'last7d' ? '1px solid rgba(212,175,55,0.4)' : 'none',
                color: selectedWindow === 'last7d' ? '#ffd700' : 'rgba(255,255,255,0.6)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              7 Tage
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: 8,
              padding: '0.55rem 0.95rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '0.85rem 1rem',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Card 1: Requests & Success Rate */}
        <div
          style={{
            background: 'rgba(10,10,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
              }}
            >
              Anfragen & Stabilität
            </span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
            {metrics?.requests ?? 0}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
              Reqs
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              {metrics?.successRate !== null && metrics?.successRate !== undefined
                ? `${metrics.successRate}% Erfolg`
                : '100% Erfolg'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
              {metrics?.uniqueActors ?? 0} Nutzer
            </span>
          </div>
        </div>

        {/* Card 2: Latency Profile */}
        <div
          style={{
            background: 'rgba(10,10,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
              }}
            >
              Latenz-Profil
            </span>
            <Clock size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
            {metrics?.p95LatencyMs ?? 0}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
              ms (P95)
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Ø Latenz: <strong style={{ color: '#fff' }}>{metrics?.averageLatencyMs ?? 0} ms</strong>
          </div>
        </div>

        {/* Card 3: Tokens & Cost */}
        <div
          style={{
            background: 'rgba(10,10,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
              }}
            >
              Token-Verbrauch & Kosten
            </span>
            <Coins size={18} color="#ffd700" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffd700' }}>
            {formatMicrousd(metrics?.estimatedCostMicrousd ?? 0)}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            {(metrics?.tokens.total ?? 0).toLocaleString()} Total Tokens
          </div>
        </div>

        {/* Card 4: CSAT & Feedback */}
        <div
          style={{
            background: 'rgba(10,10,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
              }}
            >
              Nutzer-Zufriedenheit
            </span>
            <ThumbsUp size={18} color="#ffd700" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
            {feedback?.satisfactionRate ?? 100}%
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ThumbsUp size={11} /> {feedback?.positiveRatings ?? 0}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ThumbsDown size={11} /> {feedback?.negativeRatings ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Chart 1: Token Breakdown */}
        <div
          style={{
            background: 'rgba(10,10,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Cpu size={16} color="#ffd700" />
            Token-Aufschlüsselung ({selectedWindow === 'last24h' ? '24h' : '7d'})
          </h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tokenChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: '#111',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tokenChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Outcomes */}
        <div
          style={{
            background: 'rgba(10,10,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Zap size={16} color="#38bdf8" />
            Antwort-Outcomes
          </h3>
          <div
            style={{
              width: '100%',
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {outcomeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {outcomeChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#111',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                Keine Outcome-Daten vorhanden.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedback Table */}
      <section
        style={{
          background: 'rgba(10,10,12,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ThumbsUp size={16} color="#ffd700" />
            Letzte Nutzer-Bewertungen ({feedback?.recentFeedback.length ?? 0})
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '0.8rem 1rem' }}>Bewertung</th>
                <th style={{ padding: '0.8rem 1rem' }}>Zeitpunkt</th>
                <th style={{ padding: '0.8rem 1rem' }}>Kategorie</th>
                <th style={{ padding: '0.8rem 1rem' }}>Kommentar</th>
              </tr>
            </thead>
            <tbody>
              {!feedback || feedback.recentFeedback.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}
                  >
                    Noch keine Nutzer-Bewertungen vorhanden.
                  </td>
                </tr>
              ) : (
                feedback.recentFeedback.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background:
                            item.rating === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: item.rating === 1 ? '#10b981' : '#ef4444',
                          border: `1px solid ${item.rating === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}
                      >
                        {item.rating === 1 ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                        {item.rating === 1 ? 'Positiv' : 'Negativ'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.8rem 1rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {new Date(item.createdAt).toLocaleString('de-DE')}
                    </td>
                    <td
                      style={{
                        padding: '0.8rem 1rem',
                        color: '#ffd700',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {item.category || 'Allgemein'}
                    </td>
                    <td
                      style={{
                        padding: '0.8rem 1rem',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {item.comment || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
