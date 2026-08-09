'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Target, Trophy, ShieldCheck } from 'lucide-react';

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

function GameIcon({ game }: { game: string | null }) {
  const g = (game ?? '').toLowerCase();
  if (g === 'crash') return <TrendingUp size={14} />;
  if (g === 'dice') return <Zap size={14} />;
  if (g === 'slots') return <Trophy size={14} />;
  if (g === 'roulette') return <Target size={14} />;
  return <Target size={14} />;
}

export function HistoryTableStream({ loading, rows, isMobile }: HistoryTableStreamProps) {
  if (loading) {
    return (
      <div style={{ padding: '24px', textIndent: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '44px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              marginBottom: '8px',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
        }}
      >
        <thead>
          <tr
            style={{
              background: 'var(--stealth-surface, #141923)',
              borderBottom: '1px solid var(--stealth-border, #1e2638)',
            }}
          >
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              GAME
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              TIMESTAMP
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              PAYOUT
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              BALANCE AFTER
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              VERIFICATION
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {rows.map((r) => {
              const isWin = r.amount > 0;
              const gName = (r.game ?? r.type ?? 'Game').toUpperCase();
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    borderBottom: '1px solid var(--stealth-border, #1e2638)',
                    background: isWin ? 'rgba(0, 230, 118, 0.02)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          background: 'rgba(203, 213, 225, 0.08)',
                          color: 'var(--stealth-accent, #cbd5e1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <GameIcon game={r.game} />
                      </div>
                      <span>{gName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'hsl(var(--text-dim))' }}>
                    {formatTime(r.created_at)}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      fontWeight: 800,
                      color: isWin
                        ? 'var(--stealth-emerald, #00e676)'
                        : 'var(--stealth-crimson, #ff3366)',
                    }}
                  >
                    {isWin ? `+$${r.amount.toFixed(2)}` : `-$${Math.abs(r.amount).toFixed(2)}`}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'hsl(var(--text-muted))' }}>
                    ${r.balance_after.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(203, 213, 225, 0.06)',
                        border: '1px solid rgba(203, 213, 225, 0.12)',
                        color: 'var(--stealth-accent, #cbd5e1)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                      }}
                    >
                      <ShieldCheck size={12} />
                      <span>HMAC SHA-256</span>
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
