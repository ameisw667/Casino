'use client';

import React from 'react';
import { Trophy, Medal, User, Star, TrendingUp, Zap } from 'lucide-react';

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export default function LeaderboardPage() {
  const players = [
    { rank: 1, user: 'VibeKing', wagered: '$1,240,000', wins: 1420, profit: '+$240k', level: 92, rankName: 'Diamond' },
    { rank: 2, user: 'JanP', wagered: '$980,000', wins: 850, profit: '+$120k', level: 85, rankName: 'Platinum' },
    { rank: 3, user: 'CryptoWhale', wagered: '$750,000', wins: 120, profit: '-$40k', level: 74, rankName: 'Platinum' },
    { rank: 4, user: 'HighRoller', wagered: '$500,000', wins: 300, profit: '+$15k', level: 52, rankName: 'Gold' },
    { rank: 5, user: 'LuckBox', wagered: '$250,000', wins: 450, profit: '+$80k', level: 41, rankName: 'Gold' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header className="glass" style={{ padding: '60px', borderRadius: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'hsla(var(--primary), 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />
        
        <Trophy size={64} color="hsl(var(--primary))" style={{ marginBottom: '24px', position: 'relative' }} />
        <h1 className="text-gradient" style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: '16px', fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>HALL OF FAME</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Behold the legends of the ecosystem. The top performers by wager, profit, and pure dedication.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
        {[
          { label: 'WEEKLY VOLUME', value: '$8.42M', icon: <TrendingUp />, color: 'hsl(var(--primary))' },
          { label: 'TOP MULTIPLIER', value: '4,204x', icon: <Zap />, color: 'hsl(var(--accent))' },
          { label: 'ACTIVE LEGENDS', value: '142', icon: <Star />, color: 'hsl(var(--warning))' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: stat.color, marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              {React.cloneElement(stat.icon as React.ReactElement, { size: 32 })}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.1em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="table-container" style={{ border: '1px solid hsla(0,0%,100%,0.05)', background: 'hsla(0,0%,100%,0.02)' }}>
        <table>
          <thead>
            <tr>
              <th style={{ padding: '24px' }}>RANK</th>
              <th>PLAYER</th>
              <th>LEVEL / RANK</th>
              <th>WAGERED</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>PROFIT</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.rank} style={{ transition: 'all 0.2s ease' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: RANK_COLORS[p.rank] ? RANK_COLORS[p.rank] + '22' : 'hsla(0,0%,100%,0.05)',
                    color: RANK_COLORS[p.rank] || 'hsl(var(--text-dim))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    border: RANK_COLORS[p.rank] ? `1px solid ${RANK_COLORS[p.rank]}44` : 'none'
                  }}>
                    {p.rank}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsla(0,0%,100%,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{p.user}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'hsl(var(--primary))', color: 'black', padding: '2px 6px', borderRadius: '4px' }}>Lvl {p.level}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>{p.rankName}</span>
                  </div>
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>{p.wagered}</td>
                <td className="mono" style={{ 
                  textAlign: 'right', 
                  paddingRight: '24px', 
                  fontWeight: 900, 
                  fontSize: '1.1rem',
                  color: p.profit.startsWith('+') ? 'hsl(var(--success))' : 'hsl(var(--error))' 
                }}>
                  {p.profit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
