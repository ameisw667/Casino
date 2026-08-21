'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, History, ChevronRight } from 'lucide-react';

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

function getGameFinTechMeta(game: string | null) {
  const g = (game ?? '').toLowerCase();
  switch (g) {
    case 'crash':
      return {
        title: 'CRASH ROCKET',
        category: 'ORIGINAL',
        code: 'CR-01',
      };
    case 'dice':
      return {
        title: 'LUCKY DICE',
        category: 'ORIGINAL',
        code: 'DC-01',
      };
    case 'slots':
      return {
        title: 'NEON SLOTS',
        category: 'ORIGINAL',
        code: 'SL-01',
      };
    case 'roulette':
      return {
        title: 'ROYALE ROULETTE',
        category: 'TISCH',
        code: 'RL-01',
      };
    case 'blackjack':
      return {
        title: 'VIP BLACKJACK',
        category: 'TISCH',
        code: 'BJ-01',
      };
    default:
      return {
        title: (game ?? 'CASINO').toUpperCase(),
        category: 'ORIGINAL',
        code: 'GEN-01',
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
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backdropFilter: 'blur(16px)',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '52px',
              borderRadius: '12px',
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
          padding: '60px 24px',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
          borderRadius: '20px',
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
            background: 'rgba(212, 175, 55, 0.1)',
            padding: '16px',
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          <History size={36} />
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>
          Keine Wetten im gewählten Filter gefunden
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.45)',
            maxWidth: '360px',
            lineHeight: 1.4,
          }}
        >
          Passe deine Filter an oder starte ein Casino Original, um neue Runden aufzuzeichnen.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        background:
          'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 12, 16, 0.96) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.06)',
      }}
    >
      <div style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.82rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.35)',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.66rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <th style={{ padding: '16px 20px' }}>Spiel & Kategorie</th>
              <th style={{ padding: '16px 20px' }}>Zeitpunkt</th>
              <th style={{ padding: '16px 20px' }}>Multiplikator</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Ergebnis / Profit</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Kontostand Danach</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>Quittung</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rows.map((row, idx) => {
                const isWin = row.amount > 0;
                const meta = getGameFinTechMeta(row.game);
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
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.01) 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Game & Category: Option 1 (FinTech-Typografie mit Monochrom-Badge) */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontWeight: 900,
                              color: '#ffffff',
                              fontSize: '0.86rem',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {meta.title}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              color: 'rgba(255, 255, 255, 0.45)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              letterSpacing: '0.04em',
                            }}
                          >
                            [{meta.code}]
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.62rem',
                            color: 'rgba(255, 255, 255, 0.35)',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                          }}
                        >
                          PROVABLY FAIR • {meta.category}
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td
                      style={{
                        padding: '14px 20px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.76rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatFullTime(row.created_at)}
                    </td>

                    {/* Multiplier Badge */}
                    <td style={{ padding: '14px 20px' }}>
                      {isWin ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isBigMultiplier
                              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                              : 'rgba(16, 185, 129, 0.15)',
                            border: isBigMultiplier
                              ? '1px solid #FFD700'
                              : '1px solid rgba(16, 185, 129, 0.3)',
                            color: isBigMultiplier ? '#FFD700' : '#10b981',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 900,
                            fontSize: '0.74rem',
                            boxShadow: isBigMultiplier
                              ? '0 0 12px rgba(212, 175, 55, 0.3)'
                              : 'none',
                          }}
                        >
                          {isBigMultiplier && <span>⚡</span>}
                          <span>{multValue}x</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.18)',
                            color: 'rgba(239, 68, 68, 0.75)',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                          }}
                        >
                          0.00x
                        </span>
                      )}
                    </td>

                    {/* Result / Profit */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 950,
                          fontSize: '0.92rem',
                          color: isWin ? '#10b981' : '#ef4444',
                          letterSpacing: '-0.01em',
                          textShadow: isWin ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                        }}
                      >
                        {isWin ? '+' : '-'}$
                        {absAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </td>

                    {/* Balance After: Subtiler Monospace-Wert */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontSize: '0.84rem',
                        }}
                      >
                        $
                        {row.balance_after.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Receipt: Subtile Glass-Pille */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRow?.(row);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          color: 'rgba(255, 255, 255, 0.55)',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          e.currentTarget.style.color = '#D4AF37';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
                        }}
                      >
                        <ShieldCheck size={10} />
                        <span>Quittung</span>
                        <ChevronRight size={10} />
                      </button>
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
