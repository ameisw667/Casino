'use client';
import React from 'react';
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

export function HistoryTableStream({
  loading,
  rows,
  isMobile: _isMobile = false,
  onSelectRow,
}: HistoryTableStreamProps) {
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
          background: 'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
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
        <div style={{ color: '#D4AF37', background: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: '50%', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <History size={32} />
        </div>
        <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>
          Keine Wetten im gewählten Filter gefunden
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', maxWidth: '340px', lineHeight: 1.4 }}>
          Passe deine Filter an oder starte ein Casino Original, um neue Runden aufzuzeichnen.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        background: 'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 12, 16, 0.96) 100%)',
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
              {rows.map((row, idx) => {
                const isWin = row.amount > 0;
                const cfg = getGameConfig(row.game);
                const absAmount = Math.abs(row.amount);

                // Derived approximate multiplier or outcome display
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
                      const indicator = e.currentTarget.querySelector('.history-receipt-indicator') as HTMLElement | null;
                      if (indicator) {
                        indicator.style.color = '#D4AF37';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      const indicator = e.currentTarget.querySelector('.history-receipt-indicator') as HTMLElement | null;
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
                          <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.82rem', letterSpacing: '-0.01em' }}>
                            {cfg.name}
                          </span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.7rem' }}>•</span>
                          <span style={{ fontSize: '0.66rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, letterSpacing: '0.04em' }}>
                            {cfg.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td style={{ padding: '12px 18px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {formatFullTime(row.created_at)}
                    </td>

                    {/* Multiplier Badge (0 Emojis) */}
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
                            boxShadow: isBigMultiplier ? '0 0 10px rgba(212, 175, 55, 0.25)' : 'none',
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
                        {isWin ? '+' : '-'}${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        ${row.balance_after.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Receipt Indicator: Subtiles Lucide-Vektor-Icon */}
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
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
