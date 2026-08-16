'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, History } from 'lucide-react';

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
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getGameDotColor(game: string | null) {
  const g = (game ?? '').toLowerCase();
  switch (g) {
    case 'crash':
      return '#F59E0B';
    case 'dice':
      return '#60A5FA';
    case 'slots':
      return '#D4AF37';
    case 'roulette':
      return '#EC4899';
    case 'blackjack':
      return '#10B981';
    default:
      return '#D4AF37';
  }
}

export function HistoryTableStream({ loading, rows, isMobile }: HistoryTableStreamProps) {
  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(12, 12, 14, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '42px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
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
          background: 'rgba(12, 12, 14, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <div style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
          <History size={32} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
          Keine Wetten vorhanden
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '340px' }}>
          Sobald du ein Spiel wie Crash, Dice oder Roulette spielst, werden deine Runden hier
          automatisch gelistet.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(12, 12, 14, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflowX: 'auto',
        width: '100%',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <th
              style={{
                padding: '14px 20px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              SPIEL
            </th>
            <th
              style={{
                padding: '14px 20px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              ZEITPUNKT
            </th>
            <th
              style={{
                padding: '14px 20px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              ERGEBNIS
            </th>
            <th
              style={{
                padding: '14px 20px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              BALANCE DANACH
            </th>
            <th
              style={{
                padding: '14px 20px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textAlign: 'right',
              }}
            >
              STATUS
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {rows.map((r, i) => {
              const isWin = r.amount > 0;
              const dotColor = getGameDotColor(r.game);
              const gName = (r.game ?? r.type ?? 'Game').toUpperCase();
              const isLast = i === rows.length - 1;

              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Game Column with clean status dot */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: dotColor,
                          boxShadow: `0 0 6px ${dotColor}80`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {gName}
                      </span>
                    </div>
                  </td>

                  {/* Timestamp Column */}
                  <td
                    style={{
                      padding: '14px 20px',
                      color: 'rgba(255, 255, 255, 0.45)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {formatTime(r.created_at)}
                  </td>

                  {/* Payout / Amount */}
                  <td style={{ padding: '14px 20px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: isWin ? '#10b981' : '#f87171',
                      }}
                    >
                      {isWin ? `+$${r.amount.toFixed(2)}` : `-$${Math.abs(r.amount).toFixed(2)}`}
                    </div>
                  </td>

                  {/* Balance After */}
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      color: '#D4AF37',
                      fontSize: '0.85rem',
                    }}
                  >
                    $
                    {r.balance_after.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Verification Badge */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                      }}
                    >
                      <ShieldCheck size={11} />
                      <span>VERIFIED</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
