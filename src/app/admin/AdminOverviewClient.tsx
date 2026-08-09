'use client';
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface ActivityItem {
  id: string;
  type: string;
  msg: string;
  time: string;
}

interface WagerDataItem {
  hour: string;
  wagered: number;
  profit: number;
}

interface AdminOverviewResponse {
  stats: OverviewStat[];
  wagerData: WagerDataItem[];
  activity: ActivityItem[];
  meta: { totalUsers: number; totalBalances: number; totalWagered: number; netProfit: number };
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wallet,
  TrendingUp,
  Users,
  ShieldCheck,
};

const TYPE_COLOR: Record<string, string> = {
  SUCCESS: '#10b981',
  WARNING: '#D4AF37',
  INFO: '#3b82f6',
};

export default function AdminOverviewClient() {
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/overview', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AdminOverviewResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Übersichtsdaten konnten nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data?.stats ?? [
    { label: 'Total Wagered', value: '—', change: '—', icon: 'Wallet', color: '#D4AF37' },
    { label: 'Net Profit', value: '—', change: '—', icon: 'TrendingUp', color: '#10b981' },
    { label: 'Active Players', value: '—', change: '—', icon: 'Users', color: '#3b82f6' },
    { label: 'System Health', value: '—', change: '—', icon: 'ShieldCheck', color: '#a855f7' },
  ];

  const wagerData = data?.wagerData ?? [];
  const activity = data?.activity ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Live System Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CheckCircle2 size={16} color="#10b981" />
        <span
          style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.03em' }}
        >
          Live DB-Anbindung — Echte System-Metriken & Transaktions-Analytics aktiv.
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Zap size={20} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#D4AF37',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Overview
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-1px',
            margin: 0,
          }}
        >
          Welcome back, <span style={{ color: '#D4AF37' }}>Operator</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '8px' }}>
          {loading ? 'Lädt Echtzeit-Metriken…' : 'Admin Panel — Live-Daten aus Supabase'}
        </p>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {stats.map(({ label, value, change, icon, color }) => {
          const Icon = ICON_MAP[icon] || Wallet;
          return (
            <div
              key={label}
              style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background: color,
                  opacity: 0.06,
                  filter: 'blur(50px)',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    color,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {change.includes('+') && <ArrowUpRight size={13} />}
                  {change}
                </div>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: '1.7rem',
                  fontWeight: 900,
                  marginTop: '4px',
                  fontVariantNumeric: 'tabular-nums',
                  color: '#fff',
                }}
              >
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
        <div
          style={{
            padding: '28px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <TrendingUp size={18} color="#D4AF37" /> Wagered vs. Profit (24h)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={wagerData}>
              <defs>
                <linearGradient id="gWagered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: '#0a0a0c',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="wagered"
                stroke="#D4AF37"
                fillOpacity={1}
                fill="url(#gWagered)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#gProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div
          style={{
            padding: '28px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '20px' }}>
            Live Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activity.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                Keine recenten Transaktionen.
              </div>
            )}
            {activity.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: TYPE_COLOR[a.type] || '#fff', fontWeight: 700 }}>
                  {a.msg}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
