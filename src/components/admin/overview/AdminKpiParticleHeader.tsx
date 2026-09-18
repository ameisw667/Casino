'use client';

import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { CursorParticleTypography } from '@/components/casino/fx/CursorParticleTypography';

export interface AdminKpiParticleHeaderProps {
  totalWagered?: string;
  netProfit?: string;
  activePlayers?: string;
  systemHealth?: string;
  currencyPrefix?: string;
  onRefresh?: () => void;
}

export function AdminKpiParticleHeader({
  totalWagered = '$1,248,500',
  netProfit = '+$384,120',
  activePlayers = '1,482',
  systemHealth = '99.98%',
  currencyPrefix = '',
}: AdminKpiParticleHeaderProps) {
  const [activeMetric, setActiveMetric] = useState<'wagered' | 'profit'>('wagered');

  const displayValue =
    activeMetric === 'wagered'
      ? `${currencyPrefix}${totalWagered}`
      : `${currencyPrefix}${netProfit}`;

  const metricLabel = activeMetric === 'wagered' ? 'GROSS TOTAL WAGERED' : 'NET OPERATING PROFIT';
  const metricSubtitle =
    activeMetric === 'wagered'
      ? 'All-Time Casino Volume · Real-Time Provably Fair Settlement'
      : 'Platform Yield · 2.45% Avg House Edge Net Margin';

  return (
    <div
      data-testid="admin-kpi-particle-header"
      style={{
        position: 'relative',
        borderRadius: '24px',
        padding: '28px 32px',
        background:
          'linear-gradient(135deg, rgba(11, 14, 20, 0.95) 0%, rgba(18, 24, 38, 0.85) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.2)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background gold aura */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: '500px',
          height: '350px',
          background:
            'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '10%',
          width: '350px',
          height: '250px',
          background:
            'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar: Executive Badge & Metric Toggle */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          position: 'relative',
          zIndex: 2,
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#D4AF37',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span>Executive Command · High-Yield KPIs</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={13} />
            <span>Secured Invariant (Fail-Closed)</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMetric('wagered')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeMetric === 'wagered' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              color: activeMetric === 'wagered' ? '#D4AF37' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Total Wagered
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('profit')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeMetric === 'profit' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeMetric === 'profit' ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Net Profit
          </button>
        </div>
      </div>

      {/* Main KPI Particle Typography Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: activeMetric === 'wagered' ? '#D4AF37' : '#10b981',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {metricLabel}
          </div>

          {/* Interactive Particle Typography Canvas */}
          <div
            style={{
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Hover or move cursor over numbers to interact with golden quantum particles"
          >
            <CursorParticleTypography
              key={displayValue}
              text={displayValue}
              fontSize={54}
              fontFamily="'JetBrains Mono', 'SF Mono', Consolas, monospace"
              fontWeight={900}
              repulsionRadius={75}
              repulsionForce={5.5}
              maxDisplacement={24}
              stiffness={0.05}
              damping={0.86}
              ambientFlakes={true}
              ambientCount={30}
              palette={
                activeMetric === 'wagered'
                  ? ['#FFEBAA', '#F5D77F', '#D4AF37', '#AA771C', '#FFFFFF']
                  : ['#A7F3D0', '#34D399', '#10B981', '#059669', '#FFFFFF']
              }
              style={{
                width: '100%',
                maxWidth: '520px',
                height: '84px',
              }}
            />
          </div>

          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            {metricSubtitle}
          </p>
        </div>

        {/* Secondary Executive Quick Glance Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#3b82f6',
                marginBottom: '4px',
              }}
            >
              <Activity size={14} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Active Players
              </span>
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#fff',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {activePlayers}
            </div>
            <div
              style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}
            >
              +14.2% concurrent
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#a855f7',
                marginBottom: '4px',
              }}
            >
              <TrendingUp size={14} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Uptime Health
              </span>
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#fff',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {systemHealth}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              0 Fail-Closed Events
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
