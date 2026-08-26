'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LeaderRow {
  username: string;
  level: number;
  rank: string;
  total_wagered: number;
  biggest_win: number;
}

interface LeaderboardStreamTableProps {
  loading: boolean;
  rows: LeaderRow[];
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function LeaderboardStreamTable({ loading, rows }: LeaderboardStreamTableProps) {
  if (loading) {
    return (
      <div
        style={{
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '48px',
              borderRadius: '6px',
              background: '#161616',
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
          background: '#111111',
          borderRadius: '12px',
          border: '1px solid #222222',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
          Leaderboard wird synchronisiert
        </div>
        <div style={{ fontSize: '0.85rem', color: '#737373', maxWidth: '340px' }}>
          Sobald Einsätze getätigt werden, erscheinen die qualifizierten Spieler hier.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '12px',
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
          <tr style={{ borderBottom: '1px solid #222222' }}>
            <th
              style={{
                padding: '16px 20px',
                color: '#8A8A8A',
                fontSize: '0.85rem',
                fontWeight: 700,
                width: '80px',
              }}
            >
              Rang
            </th>
            <th
              style={{
                padding: '16px 20px',
                color: '#8A8A8A',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              Spieler
            </th>
            <th
              style={{
                padding: '16px 20px',
                color: '#8A8A8A',
                fontSize: '0.85rem',
                fontWeight: 700,
                width: '180px',
              }}
            >
              VIP-Status
            </th>
            <th
              style={{
                padding: '16px 24px',
                color: '#8A8A8A',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'right',
                width: '220px',
              }}
            >
              Einsatz gesamt
            </th>
            <th
              style={{
                padding: '16px 24px',
                color: '#8A8A8A',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'right',
                width: '200px',
              }}
            >
              Höchster Gewinn
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {rows.map((r, i) => {
              const isFirst = i === 0;
              const isSecond = i === 1;
              const isThird = i === 2;
              const isLast = i === rows.length - 1;
              const initials = getInitials(r.username);

              return (
                <motion.tr
                  key={r.username + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ backgroundColor: '#161616' }}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid #1A1A1A',
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  {/* Rank Column — Enlarged Badges for Platz 1, 2, 3 */}
                  <td style={{ padding: '14px 20px' }}>
                    {isFirst ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(212, 175, 55, 0.18)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          color: '#D4AF37',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                        }}
                      >
                        1
                      </span>
                    ) : isSecond ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#262626',
                          border: '1px solid #383838',
                          color: '#E5E5E5',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                        }}
                      >
                        2
                      </span>
                    ) : isThird ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#262626',
                          border: '1px solid rgba(217, 119, 6, 0.35)',
                          color: '#D97706',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                        }}
                      >
                        3
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#8A8A8A',
                          paddingLeft: '10px',
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </td>

                  {/* Player Name with Avatar Initials — Enlarged */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#1F1F1F',
                          border: '1px solid #2E2E2E',
                          color: '#D4D4D4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '1.02rem',
                          color: isFirst ? '#D4AF37' : '#FFFFFF',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {r.username}
                      </span>
                    </div>
                  </td>

                  {/* VIP Status — Enlarged & Clear */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: isFirst ? '#D4AF37' : '#E5E5E5',
                        }}
                      >
                        {r.rank}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 500 }}>
                        Lv. {r.level}
                      </span>
                    </div>
                  </td>

                  {/* Total Wagered — Enlarged & Tight Right-Aligned */}
                  <td
                    style={{
                      padding: '14px 24px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                      color: isFirst ? '#D4AF37' : '#FFFFFF',
                      fontSize: '1.05rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    $
                    {r.total_wagered.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Highest Win — Enlarged & Tight Right-Aligned */}
                  <td
                    style={{
                      padding: '14px 24px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#10B981',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    +$
                    {r.biggest_win.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
