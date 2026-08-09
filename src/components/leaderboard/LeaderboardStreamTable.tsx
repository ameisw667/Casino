'use client';
import React from 'react';
import { Crown, Trophy } from 'lucide-react';

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

export function LeaderboardStreamTable({ loading, rows }: LeaderboardStreamTableProps) {
  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '42px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.03)',
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
              RANK
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              PLAYER
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              TIER
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              TOTAL WAGERED
            </th>
            <th
              style={{
                padding: '12px 16px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              BIGGEST WIN
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isTop3 = i < 3;
            return (
              <tr
                key={r.username + i}
                style={{
                  borderBottom: '1px solid var(--stealth-border, #1e2638)',
                  background: isTop3 ? 'rgba(203, 213, 225, 0.02)' : 'transparent',
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: 800 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {i === 0 && <Crown size={14} color="var(--stealth-accent, #cbd5e1)" />}
                    {i === 1 && <Trophy size={14} color="var(--stealth-emerald, #00e676)" />}
                    {i === 2 && <Trophy size={14} color="hsl(var(--text-muted))" />}
                    <span>#{i + 1}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {r.username}
                </td>
                <td style={{ padding: '12px 16px', color: 'hsl(var(--text-dim))' }}>
                  LVL {r.level} • {r.rank}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontWeight: 800,
                    color: 'var(--stealth-accent, #cbd5e1)',
                  }}
                >
                  ${r.total_wagered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontWeight: 800,
                    color: 'var(--stealth-emerald, #00e676)',
                  }}
                >
                  ${r.biggest_win.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
