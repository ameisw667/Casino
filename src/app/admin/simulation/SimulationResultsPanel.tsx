'use client';
import { AlertTriangle, FlaskConical, Percent, TrendingUp } from 'lucide-react';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SimResult } from '@/lib/casino/admin/simulation-engine';

const RTP_OK_MIN = 94;
const RTP_OK_MAX = 101;

interface SimulationResultsPanelProps {
  result: SimResult | null;
}

function RtpVerdictCard({ result, rtpOk }: { result: SimResult; rtpOk: boolean }) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: rtpOk ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${rtpOk ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        {rtpOk ? (
          <Percent size={18} color="#10b981" />
        ) : (
          <AlertTriangle size={18} color="#ef4444" />
        )}
        <span style={{ fontWeight: 900, fontSize: '1rem', color: rtpOk ? '#10b981' : '#ef4444' }}>
          RTP {rtpOk ? '✓ Validated' : '⚠ Out of Bounds'}
        </span>
      </div>
      <div
        style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: rtpOk ? '#10b981' : '#ef4444',
        }}
      >
        {result.rtp}%
      </div>
      {!rtpOk && (
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
          Expected {RTP_OK_MIN}–{RTP_OK_MAX}% range
        </div>
      )}
    </div>
  );
}

function StatGrid({ result }: { result: SimResult }) {
  const stats = [
    { label: 'Runs', value: result.runs.toLocaleString('en-US') },
    {
      label: 'Wins',
      value: `${result.wins.toLocaleString('en-US')} (${Math.round((result.wins / result.runs) * 100)}%)`,
    },
    { label: 'Total Wagered', value: `$${result.totalWagered.toLocaleString('en-US')}` },
    {
      label: 'Total Payout',
      value: `$${Math.round(result.totalPayout).toLocaleString('en-US')}`,
    },
    ...(result.bustRate !== undefined
      ? [{ label: 'Bust Rate (≤1.01x)', value: `${result.bustRate}%` }]
      : []),
    {
      label: 'House Take',
      value: `$${Math.round(result.totalWagered - result.totalPayout).toLocaleString('en-US')}`,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
      {stats.map(({ label, value }) => (
        <div
          key={label}
          style={{
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}
          >
            {label}
          </div>
          <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function RtpConvergenceChart({ result }: { result: SimResult }) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: '0.9rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <TrendingUp size={15} color="#D4AF37" /> RTP Convergence
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={result.samples}>
          <XAxis
            dataKey="i"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            domain={[85, 105]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '11px',
            }}
            formatter={(v) => [`${v}%`, 'RTP']}
          />
          <ReferenceLine
            y={99}
            stroke="rgba(212,175,55,0.3)"
            strokeDasharray="4 4"
            label={{
              value: 'Theoretical',
              fill: 'rgba(212,175,55,0.5)',
              fontSize: 10,
              position: 'right',
            }}
          />
          <Line type="monotone" dataKey="rtp" stroke="#D4AF37" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyResultsPlaceholder() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.01)',
        border: '1px dashed rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <FlaskConical size={40} />
      <div style={{ fontWeight: 700 }}>
        Configure parameters and run the simulation to validate RTP
      </div>
    </div>
  );
}

export function SimulationResultsPanel({ result }: SimulationResultsPanelProps) {
  if (!result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <EmptyResultsPlaceholder />
      </div>
    );
  }

  const rtpOk = result.rtp >= RTP_OK_MIN && result.rtp <= RTP_OK_MAX;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <RtpVerdictCard result={result} rtpOk={rtpOk} />
      <StatGrid result={result} />
      <RtpConvergenceChart result={result} />
    </div>
  );
}
