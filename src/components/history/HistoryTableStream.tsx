'use client';
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  History,
  ChevronRight,
  Rocket,
  Dices,
  Sparkles,
  RotateCcw,
  Gamepad2,
  Calendar,
} from 'lucide-react';

export interface HistoryRow {
  id: string;
  game: string | null;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

interface HistoryTableStreamProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile?: boolean;
  onSelectRow?: (row: HistoryRow) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

function formatFullTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getGameConfig(game: string | null) {
  const g = (game ?? '').toLowerCase();
  switch (g) {
    case 'crash':
      return {
        name: 'Crash',
        category: 'Original',
        icon: <Rocket size={12} color="#D4AF37" />,
      };
    case 'dice':
      return {
        name: 'Dice',
        category: 'Original',
        icon: <Dices size={12} color="#D4AF37" />,
      };
    case 'slots':
      return {
        name: 'Slots',
        category: 'Original',
        icon: <Sparkles size={12} color="#D4AF37" />,
      };
    case 'roulette':
      return {
        name: 'Roulette',
        category: 'Tisch',
        icon: <RotateCcw size={12} color="#D4AF37" />,
      };
    case 'blackjack':
      return {
        name: 'Blackjack',
        category: 'Tisch',
        icon: <Gamepad2 size={12} color="#D4AF37" />,
      };
    default:
      return {
        name: (game ?? 'Casino').toUpperCase(),
        category: 'Original',
        icon: <Gamepad2 size={12} color="#D4AF37" />,
      };
  }
}

function LoadMoreCTA({
  loadingMore,
  onLoadMore,
}: {
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
      <motion.button
        whileHover={loadingMore ? undefined : { scale: 1.02 }}
        whileTap={loadingMore ? undefined : { scale: 0.98 }}
        onClick={onLoadMore}
        disabled={loadingMore}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          borderRadius: '10px',
          background: loadingMore ? 'rgba(212, 175, 55, 0.06)' : 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          color: loadingMore ? 'rgba(212, 175, 55, 0.55)' : '#D4AF37',
          fontSize: '0.78rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: loadingMore ? 'wait' : 'pointer',
          opacity: loadingMore ? 0.7 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        {loadingMore ? 'Lade …' : 'Mehr laden'}
      </motion.button>
    </div>
  );
}

export function HistoryTableStream({
  loading,
  rows,
  isMobile = false,
  onSelectRow,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: HistoryTableStreamProps) {
  const sessionGroups = useMemo(() => {
    if (rows.length === 0) return [];
    const groups: {
      id: string;
      label: string;
      totalBets: number;
      netProfit: number;
      rows: HistoryRow[];
    }[] = [];

    let currentGroup: {
      id: string;
      label: string;
      totalBets: number;
      netProfit: number;
      rows: HistoryRow[];
    } | null = null;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowDate = new Date(row.created_at);
      const prevRow = rows[i - 1];
      const prevDate = prevRow ? new Date(prevRow.created_at) : null;

      const isNewSession =
        !prevDate || Math.abs(prevDate.getTime() - rowDate.getTime()) > 25 * 60 * 1000;

      if (isNewSession || !currentGroup) {
        const dateLabel = rowDate.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: 'short',
        });
        const timeLabel = rowDate.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        });
        currentGroup = {
          id: `session-${i}-${row.id}`,
          label: `Sitzung ${dateLabel} (${timeLabel})`,
          totalBets: 0,
          netProfit: 0,
          rows: [],
        };
        groups.push(currentGroup);
      }

      currentGroup.rows.push(row);
      currentGroup.totalBets += 1;
      currentGroup.netProfit += row.amount;
    }

    return groups;
  }, [rows]);

  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(16, 18, 26, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backdropFilter: 'blur(16px)',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '46px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: '50px 24px',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            color: '#D4AF37',
            background: 'rgba(212, 175, 55, 0.08)',
            padding: '14px',
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <History size={32} />
        </div>
        <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>
          Keine Wetten im gewählten Filter gefunden
        </div>
        <div
          style={{
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.45)',
            maxWidth: '340px',
            lineHeight: 1.4,
          }}
        >
          Passe deine Filter an oder starte ein Casino Original, um neue Runden aufzuzeichnen.
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {sessionGroups.map((group) => (
            <div
              key={group.id}
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(212, 175, 55, 0.18)',
                background:
                  'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 12, 16, 0.96) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              {/* Session Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={11} color="#D4AF37" />
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 900,
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {group.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.60rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontWeight: 700,
                    }}
                  >
                    • {group.totalBets}R
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.70rem',
                    fontWeight: 900,
                    color: group.netProfit >= 0 ? '#10b981' : '#ef4444',
                    background:
                      group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {group.netProfit >= 0 ? '+' : '-'}${Math.abs(group.netProfit).toFixed(2)}
                </span>
              </div>

              {/* Rows in Session */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {group.rows.map((row, idx) => {
                  const isWin = row.amount > 0;
                  const cfg = getGameConfig(row.game);
                  const absAmount = Math.abs(row.amount);
                  const multValue = isWin ? (row.amount / 10 + 1).toFixed(2) : '0.00';
                  const isBigMultiplier = isWin && parseFloat(multValue) >= 3.0;

                  return (
                    <motion.div
                      key={row.id || idx}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                      onClick={() => onSelectRow?.(row)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderBottom:
                          idx === group.rows.length - 1
                            ? 'none'
                            : '1px solid rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        background: 'transparent',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Left: Game Icon, Name, Time */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          minWidth: 0,
                          flex: '1 1 auto',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: 'rgba(212, 175, 55, 0.08)',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {cfg.icon}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1px',
                            minWidth: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 800,
                              color: '#ffffff',
                              fontSize: '0.76rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cfg.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.58rem',
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontFamily: 'monospace',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatFullTime(row.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Profit/Loss, Multiplier & Chevron */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexShrink: 0,
                          marginLeft: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '1px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontWeight: 950,
                              fontSize: '0.80rem',
                              color: isWin ? '#10b981' : '#ef4444',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isWin ? '+' : '-'}${absAmount.toFixed(2)}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '0.58rem',
                              color: isBigMultiplier ? '#FFD700' : 'rgba(255, 255, 255, 0.45)',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {multValue}x
                          </span>
                        </div>
                        <ChevronRight size={12} color="#D4AF37" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </AnimatePresence>
        {hasMore && onLoadMore ? (
          <LoadMoreCTA loadingMore={loadingMore} onLoadMore={onLoadMore} />
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        background:
          'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 12, 16, 0.96) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.8rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(0, 0, 0, 0.35)',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.64rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <th style={{ padding: '14px 18px' }}>Spiel & Kategorie</th>
              <th style={{ padding: '14px 18px' }}>Zeitpunkt</th>
              <th style={{ padding: '14px 18px' }}>Multiplikator</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ergebnis / Profit</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Kontostand Danach</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Quittung</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sessionGroups.map((group) => (
                <React.Fragment key={group.id}>
                  {/* Session Header Row */}
                  <tr
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <td colSpan={6} style={{ padding: '8px 18px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={12} color="#D4AF37" />
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 900,
                              color: 'rgba(255, 255, 255, 0.85)',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {group.label}
                          </span>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontWeight: 700,
                            }}
                          >
                            • {group.totalBets} {group.totalBets === 1 ? 'Runde' : 'Runden'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontWeight: 700,
                            }}
                          >
                            Sitzungs-Netto:
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '0.72rem',
                              fontWeight: 900,
                              color: group.netProfit >= 0 ? '#10b981' : '#ef4444',
                              background:
                                group.netProfit >= 0
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {group.netProfit >= 0 ? '+' : '-'}$
                            {Math.abs(group.netProfit).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Bets within Session */}
                  {group.rows.map((row, idx) => {
                    const isWin = row.amount > 0;
                    const cfg = getGameConfig(row.game);
                    const absAmount = Math.abs(row.amount);

                    const multValue = isWin ? (row.amount / 10 + 1).toFixed(2) : '0.00';
                    const isBigMultiplier = isWin && parseFloat(multValue) >= 3.0;

                    return (
                      <motion.tr
                        key={row.id || idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        onClick={() => onSelectRow?.(row)}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.025)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'linear-gradient(90deg, rgba(212, 175, 55, 0.06) 0%, rgba(212, 175, 55, 0.01) 100%)';
                          const indicator = e.currentTarget.querySelector(
                            '.history-receipt-indicator',
                          ) as HTMLElement | null;
                          if (indicator) {
                            indicator.style.color = '#D4AF37';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          const indicator = e.currentTarget.querySelector(
                            '.history-receipt-indicator',
                          ) as HTMLElement | null;
                          if (indicator) {
                            indicator.style.color = 'rgba(255, 255, 255, 0.35)';
                          }
                        }}
                      >
                        {/* Game & Category: High-Density Single Line */}
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                background: 'rgba(212, 175, 55, 0.08)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {cfg.icon}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontWeight: 800,
                                  color: '#ffffff',
                                  fontSize: '0.82rem',
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                {cfg.name}
                              </span>
                              <span
                                style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.7rem' }}
                              >
                                •
                              </span>
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  color: 'rgba(255, 255, 255, 0.4)',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {cfg.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td
                          style={{
                            padding: '12px 18px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatFullTime(row.created_at)}
                        </td>

                        {/* Multiplier Badge */}
                        <td style={{ padding: '12px 18px' }}>
                          {isWin ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: isBigMultiplier
                                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)'
                                  : 'rgba(16, 185, 129, 0.12)',
                                border: isBigMultiplier
                                  ? '1px solid rgba(255, 215, 0, 0.5)'
                                  : '1px solid rgba(16, 185, 129, 0.25)',
                                color: isBigMultiplier ? '#FFD700' : '#10b981',
                                fontFamily: 'var(--font-mono, monospace)',
                                fontWeight: 900,
                                fontSize: '0.74rem',
                                boxShadow: isBigMultiplier
                                  ? '0 0 10px rgba(212, 175, 55, 0.25)'
                                  : 'none',
                              }}
                            >
                              {multValue}x
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.06)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                color: 'rgba(239, 68, 68, 0.65)',
                                fontFamily: 'var(--font-mono, monospace)',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                              }}
                            >
                              0.00x
                            </span>
                          )}
                        </td>

                        {/* Result / Profit */}
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontWeight: 950,
                              fontSize: '0.88rem',
                              color: isWin ? '#10b981' : '#ef4444',
                              letterSpacing: '-0.01em',
                              textShadow: isWin ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none',
                            }}
                          >
                            {isWin ? '+' : '-'}$
                            {absAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </td>

                        {/* Balance After */}
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontWeight: 700,
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.82rem',
                            }}
                          >
                            $
                            {row.balance_after.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>

                        {/* Receipt Indicator */}
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <div
                            className="history-receipt-indicator"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'rgba(255, 255, 255, 0.35)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <ShieldCheck size={13} color="#D4AF37" />
                            <span>Quittung</span>
                            <ChevronRight size={12} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {hasMore && onLoadMore ? (
        <LoadMoreCTA loadingMore={loadingMore} onLoadMore={onLoadMore} />
      ) : null}
    </div>
  );
}
