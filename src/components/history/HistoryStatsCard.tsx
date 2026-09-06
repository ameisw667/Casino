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
  const winPercentNum = parseFloat(winRate) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(3, 1fr)',
        gap: isMobile ? '6px' : '14px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Card 1: Wagered & Volume */}
      <div
        style={{
          padding: isMobile ? '8px 6px' : '16px 20px',
          borderRadius: isMobile ? '10px' : '16px',
          background:
            'linear-gradient(135deg, rgba(22, 24, 34, 0.85) 0%, rgba(14, 16, 22, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? 'auto' : '100px',
          minWidth: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMobile ? '3px' : '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '3px' : '6px',
              minWidth: 0,
            }}
          >
            <Coins size={isMobile ? 11 : 14} color="#D4AF37" />
            <span
              style={{
                fontSize: isMobile ? '0.48rem' : '0.64rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isMobile ? 'EINSATZ' : 'GESAMTER EINSATZ'}
            </span>
          </div>
          {!isMobile && (
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#D4AF37',
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                fontFamily: 'monospace',
              }}
            >
              {totalBets} {totalBets === 1 ? 'BET' : 'BETS'}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: isMobile ? '0.74rem' : '1.35rem',
            fontWeight: 900,
            color: '#FFD700',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          ${totalWagered.toFixed(2)}
        </div>
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              fontSize: '0.66rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 600,
            }}
          >
            <Activity size={11} color="#D4AF37" />
            <span>Kumulatives Wettvolumen im Zeitraum</span>
          </div>
        )}
      </div>

      {/* Card 2: Net Profit with Realtime Sparkline */}
      <div
        style={{
          padding: isMobile ? '8px 6px' : '16px 20px',
          borderRadius: isMobile ? '10px' : '16px',
          background: isProfit
            ? 'linear-gradient(135deg, rgba(16, 40, 28, 0.85) 0%, rgba(10, 24, 18, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(40, 16, 18, 0.85) 0%, rgba(24, 10, 12, 0.95) 100%)',
          border: isProfit
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : '1px solid rgba(239, 68, 68, 0.3)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: isProfit
            ? '0 8px 25px rgba(16, 185, 129, 0.15)'
            : '0 8px 25px rgba(239, 68, 68, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? 'auto' : '100px',
          minWidth: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMobile ? '3px' : '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '3px' : '6px',
              minWidth: 0,
            }}
          >
            {isProfit ? (
              <TrendingUp size={isMobile ? 11 : 14} color="#10b981" />
            ) : (
              <TrendingDown size={isMobile ? 11 : 14} color="#ef4444" />
            )}
            <span
              style={{
                fontSize: isMobile ? '0.48rem' : '0.64rem',
                fontWeight: 800,
                color: isProfit ? '#10b981' : '#ef4444',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isMobile ? 'PROFIT' : 'NETTO PROFIT'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '4px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? '0.74rem' : '1.35rem',
              fontWeight: 900,
              color: isProfit ? '#10b981' : '#ef4444',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '…' : `${isProfit ? '+' : '-'}$${Math.abs(netProfit).toFixed(2)}`}
          </div>
          {!isMobile && !loading && <MiniProfitSparkline rows={rows} isProfit={isProfit} />}
        </div>

        {!isMobile && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '0.66rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 600,
            }}
          >
            Echtzeit-Gewinnentwicklung der letzten Runden
          </div>
        )}
      </div>

      {/* Card 3: Win Rate */}
      <div
        style={{
          padding: isMobile ? '8px 6px' : '16px 20px',
          borderRadius: isMobile ? '10px' : '16px',
          background:
            'linear-gradient(135deg, rgba(22, 24, 34, 0.85) 0%, rgba(14, 16, 22, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? 'auto' : '100px',
          minWidth: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMobile ? '3px' : '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '3px' : '6px',
              minWidth: 0,
            }}
          >
            <Award size={isMobile ? 11 : 14} color="#D4AF37" />
            <span
              style={{
                fontSize: isMobile ? '0.48rem' : '0.64rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isMobile ? 'QUOTE' : 'GEWINNQUOTE'}
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: isMobile ? '0.74rem' : '1.35rem',
            fontWeight: 900,
            color: winPercentNum >= 50 ? '#10b981' : '#ffffff',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '…' : `${winRate}%`}
        </div>

        <div style={{ marginTop: isMobile ? '3px' : '8px' }}>
          <div
            style={{
              height: isMobile ? '3px' : '4px',
              borderRadius: '2px',
              background: 'rgba(239, 68, 68, 0.4)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(Math.max(winPercentNum, 0), 100)}%`,
                height: '100%',
                background: '#10b981',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
