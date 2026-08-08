'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User, TrendingUp } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export function GlobalLeaderboard() {
  const [timeframe, setTimeframe] = useState<'DAILY' | 'WEEKLY' | 'ALL'>('DAILY');

  // Simulated leaderboard data
  const leaders = [
    { user: 'LuckyWhale', wagered: 145200, profit: 12500, winRate: 48 },
    { user: 'DiceKing', wagered: 98400, profit: -2100, winRate: 42 },
    { user: 'VibeMaster', wagered: 82100, profit: 8400, winRate: 51 },
    { user: 'HighRoller_X', wagered: 65400, profit: 1200, winRate: 45 },
    { user: 'StakePro', wagered: 54200, profit: -4500, winRate: 38 },
  ];

  return (
    <section style={{ margin: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>
            <Trophy size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 950 }}>TOP WAGERED</h2>
            <p style={{ fontSize: '0.75rem', color: '#b1bad3', fontWeight: 700 }}>Real-time competition</p>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
          {['DAILY', 'WEEKLY', 'ALL'].map((t) => (
            <button 
              key={t}
              onClick={() => setTimeframe(t as 'DAILY' | 'WEEKLY' | 'ALL')}
              style={{
                padding: '6px 12px', fontSize: '0.7rem', fontWeight: 900, border: 'none', borderRadius: '8px',
                background: timeframe === t ? 'hsla(0,0%,100%,0.05)' : 'transparent',
                color: timeframe === t ? '#fff' : '#b1bad3', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden', padding: 0 }}>
        <table className="smart-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', color: '#b1bad3', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px' }}>Rank</th>
              <th style={{ padding: '16px' }}>User</th>
              <th style={{ padding: '16px' }}>
                <Tooltip content="Total amount wagered in this timeframe">Wagered</Tooltip>
              </th>
              <th style={{ padding: '16px' }}>
                <Tooltip content="Total profit/loss">Profit</Tooltip>
              </th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, i) => (
              <motion.tr 
                key={leader.user}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ borderBottom: '1px solid hsla(0,0%,100%,0.02)' }}
              >
                <td data-label="Rank" style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {i === 0 ? <Crown size={18} color="#ffd700" /> : 
                     i === 1 ? <Medal size={18} color="#c0c0c0" /> :
                     i === 2 ? <Medal size={18} color="#cd7f32" /> : 
                     <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#556b82', width: '18px', textAlign: 'center' }}>{i + 1}</span>}
                  </div>
                </td>
                <td data-label="User" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={14} />
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', display: 'block' }} title={leader.user}>
                      {leader.user}
                    </span>
                  </div>
                </td>
                <td data-label="Wagered" style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 900 }}>
                  ${leader.wagered.toLocaleString('en-US')}
                </td>
                <td data-label="Profit" style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 900, color: leader.profit >= 0 ? '#00e701' : '#ff4d4d' }}>
                  {leader.profit >= 0 ? '+' : ''}${leader.profit.toLocaleString('en-US')}
                </td>
                <td data-label="Status" style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 900, color: '#00e701', padding: '4px 8px', borderRadius: '6px', background: 'rgba(0, 231, 1, 0.05)' }}>
                    <TrendingUp size={12} />
                    {leader.winRate}% WR
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
