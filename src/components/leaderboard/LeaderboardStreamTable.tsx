'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

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

function getRankBadge(tier: string) {
  const t = (tier ?? '').toLowerCase();
  if (t.includes('diamond')) {
    return { bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' };
  }
  if (t.includes('platinum')) {
    return { bg: 'rgba(226, 232, 240, 0.08)', border: 'rgba(226, 232, 240, 0.2)', color: '#e2e8f0' };
  }
  if (t.includes('gold')) {
    return { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', color: '#D4AF37' };
  }
  if (t.includes('silver')) {
    return { bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.18)', color: '#94a3b8' };
  }
  return { bg: 'rgba(180, 83, 9, 0.08)', border: 'rgba(180, 83, 9, 0.18)', color: '#d97706' };
}

export function LeaderboardStreamTable({ loading, rows }: LeaderboardStreamTableProps) {
  if (loading) {
    return (
      <div
        style={{
          background: '#0F131C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
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
          background: '#0F131C',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <div style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
          <Trophy size={30} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
          Leaderboard wird aktualisiert
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '340px' }}>
          Sobald Einsätze getätigt werden, werden die Top High Roller hier gelistet.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#0F131C',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
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
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <th
              style={{
                padding: '14px 20px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                width: '100px',
              }}
            >
              RANG
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
              SPIELER
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
              VIP TIER
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
              GESAMTER EINSATZ
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
              HÖCHSTER GEWINN
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {rows.map((r, i) => {
              const isFirst = i === 0;
              const isSecond = i === 1;
              const isThird = i === 2;
              const badgeStyle = getRankBadge(r.rank);
              const isLast = i === rows.length - 1;

              return (
                <motion.tr
                  key={r.username + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.025)' }}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Rank Column */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isFirst ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#D4AF37',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trophy size={13} color="#D4AF37" />
                          #1
                        </span>
                      ) : isSecond ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#CBD5E1',
                          }}
                        >
                          #2
                        </span>
                      ) : isThird ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#F59E0B',
                          }}
                        >
                          #3
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: 'rgba(255, 255, 255, 0.35)',
                          }}
                        >
                          #{i + 1}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Player Name */}
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: isFirst ? '#D4AF37' : '#ffffff',
                      }}
                    >
                      {r.username}
                    </span>
                  </td>

                  {/* VIP Tier Badge */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.rank}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        LVL {r.level}
                      </span>
                    </div>
                  </td>

                  {/* Total Wagered */}
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 800,
                      color: isFirst ? '#D4AF37' : '#ffffff',
                      fontSize: '0.88rem',
                    }}
                  >
                    $
                    {r.total_wagered.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Biggest Win */}
                  <td
                    style={{
                      padding: '14px 20px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: '#10b981',
                    }}
                  >
                    $
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
