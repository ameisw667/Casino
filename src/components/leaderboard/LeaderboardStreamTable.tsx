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
    return { bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8' };
  }
  if (t.includes('platinum')) {
    return {
      bg: 'rgba(226, 232, 240, 0.1)',
      border: 'rgba(226, 232, 240, 0.25)',
      color: '#e2e8f0',
    };
  }
  if (t.includes('gold')) {
    return { bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37' };
  }
  if (t.includes('silver')) {
    return { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' };
  }
  return { bg: 'rgba(180, 83, 9, 0.1)', border: 'rgba(180, 83, 9, 0.2)', color: '#d97706' };
}

export function LeaderboardStreamTable({ loading, rows }: LeaderboardStreamTableProps) {
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
          <Trophy size={32} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
          Leaderboard wird aktualisiert
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '340px' }}>
          Sobald Einsätze getätigt werden, werden die Top High Roller hier gelistet.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          'linear-gradient(145deg, rgba(20, 20, 28, 0.75) 0%, rgba(10, 10, 15, 0.9) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.12)',
        borderRadius: '16px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
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

              const rowBackground = isFirst
                ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 100%)'
                : isSecond
                  ? 'linear-gradient(90deg, rgba(226, 232, 240, 0.12) 0%, rgba(226, 232, 240, 0.03) 50%, transparent 100%)'
                  : isThird
                    ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.12) 0%, rgba(217, 119, 6, 0.03) 50%, transparent 100%)'
                    : 'transparent';

              const borderLeftColor = isFirst
                ? '3px solid #D4AF37'
                : isSecond
                  ? '3px solid #e2e8f0'
                  : isThird
                    ? '3px solid #d97706'
                    : '3px solid transparent';

              return (
                <motion.tr
                  key={r.username + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  style={{
                    background: rowBackground,
                    borderLeft: borderLeftColor,
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
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            color: '#D4AF37',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                          }}
                        >
                          <Trophy size={14} color="#D4AF37" />
                          #1
                        </span>
                      ) : isSecond ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#e2e8f0',
                              boxShadow: '0 0 6px rgba(226, 232, 240, 0.6)',
                            }}
                          />
                          #2
                        </span>
                      ) : isThird ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#f59e0b',
                              boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
                            }}
                          />
                          #3
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: 'rgba(255, 255, 255, 0.35)',
                            paddingLeft: '11px',
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

                  {/* VIP Tier Badge (Vault Style) */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.rank}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.3)',
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
