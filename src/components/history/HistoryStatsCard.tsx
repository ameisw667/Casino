'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Award, Activity } from 'lucide-react';
import { HistoryRow } from './HistoryTableStream';

interface HistoryStatsCardProps {
  loading: boolean;
  totalWagered: number;
  netProfit: number;
  winRate: string;
  totalBets: number;
  isMobile: boolean;
  rows?: HistoryRow[];
}

function MiniProfitSparkline({ rows, isProfit }: { rows: HistoryRow[]; isProfit: boolean }) {
  if (!rows || rows.length < 2) {
    return (
      <div style={{ height: '32px', display: 'flex', alignItems: 'center', opacity: 0.2 }}>
        <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.3)' }} />
      </div>
    );
  }

  // Calculate cumulative profit from oldest to newest (up to last 25 bets)
  const sorted = [...rows].reverse().slice(-25);
  let cum = 0;
  const points = [0];
  sorted.forEach((r) => {
    cum += r.amount;
    points.push(cum);
  });

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;
  const width = 120;
  const height = 32;

  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const strokeColor = isProfit ? '#10b981' : '#ef4444';
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div style={{ width: '120px', height: '32px', flexShrink: 0 }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`sparkGrad-${isProfit ? 'win' : 'loss'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#sparkGrad-${isProfit ? 'win' : 'loss'})`} />
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function HistoryStatsCard({
  loading,
  totalWagered,
  netProfit,
  winRate,
  totalBets,
  isMobile,
  rows = [],
}: HistoryStatsCardProps) {
  const isProfit = netProfit >= 0;
  const winCount = rows.filter((r) => r.amount > 0).length;
  const lossCount = rows.filter((r) => r.amount < 0).length;
  const winPercentNum = parseFloat(winRate) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '10px' : '14px',
      }}
    >
      {/* Card 1: Wagered & Volume */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background:
            'linear-gradient(135deg, rgba(22, 24, 34, 0.85) 0%, rgba(14, 16, 22, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={14} color="#D4AF37" />
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              GESAMTER EINSATZ
            </span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#D4AF37',
              background: 'rgba(212, 175, 55, 0.1)',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            {loading ? '…' : `${totalBets} RUNDEN`}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            fontWeight: 950,
            color: '#D4AF37',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {loading
            ? '…'
            : `$${totalWagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </div>
        <div
          style={{
            fontSize: '0.62rem',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Activity size={10} color="#D4AF37" />
          <span>Kumulatives Wettvolumen im Zeitraum</span>
        </div>
      </div>

      {/* Card 2: Net Profit & Trend Sparkline */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background:
            'linear-gradient(135deg, rgba(22, 24, 34, 0.85) 0%, rgba(14, 16, 22, 0.95) 100%)',
          border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isProfit ? (
              <TrendingUp size={14} color="#10b981" />
            ) : (
              <TrendingDown size={14} color="#ef4444" />
            )}
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              NETTO PROFIT
            </span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: isProfit ? '#10b981' : '#ef4444',
              background: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '2px 8px',
              borderRadius: '12px',
              border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            }}
          >
            {isProfit ? 'PROFITABEL' : 'DRAWDOWN'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: isMobile ? '1.4rem' : '1.6rem',
              fontWeight: 950,
              color: isProfit ? '#10b981' : '#ef4444',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {loading
              ? '…'
              : `${isProfit ? '+' : '-'}$${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          {!loading && <MiniProfitSparkline rows={rows} isProfit={isProfit} />}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>
          Echtzeit-Gewinnentwicklung der letzten Runden
        </div>
      </div>

      {/* Card 3: Win Rate & Ratio Bar */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background:
            'linear-gradient(135deg, rgba(22, 24, 34, 0.85) 0%, rgba(14, 16, 22, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#D4AF37" />
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              GEWINNQUOTE
            </span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {winCount}W / {lossCount}L
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            fontWeight: 950,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {loading ? '…' : `${winRate}%`}
        </div>
        {/* Win/Loss Segment Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(239, 68, 68, 0.4)',
            marginTop: '8px',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, winPercentNum))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
