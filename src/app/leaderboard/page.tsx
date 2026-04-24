'use client';

import React from 'react';
import { Trophy, Medal, User, Star, TrendingUp, Zap } from 'lucide-react';
import PlayerProfileModal from '@/components/casino/PlayerProfileModal';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export default function LeaderboardPage() {
  const { isMobile } = useCasinoStore();
  const [loading, setLoading] = React.useState(true);
  const [selectedPlayer, setSelectedPlayer] = React.useState<any>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const players = [
    { rank: 1, user: 'VibeKing', wagered: '$1,240,000', wins: 1420, profit: '+$240k', level: 92, rankName: 'Diamond' },
    { rank: 2, user: 'JanP', wagered: '$980,000', wins: 850, profit: '+$120k', level: 85, rankName: 'Platinum' },
    { rank: 3, user: 'CryptoWhale', wagered: '$750,000', wins: 120, profit: '-$40k', level: 74, rankName: 'Platinum' },
    { rank: 4, user: 'HighRoller', wagered: '$500,000', wins: 300, profit: '+$15k', level: 52, rankName: 'Gold' },
    { rank: 5, user: 'LuckBox', wagered: '$250,000', wins: 450, profit: '+$80k', level: 41, rankName: 'Gold' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '48px', padding: '0 var(--container-padding)' }}>
      <header className="glass" style={{ 
        padding: isMobile ? '60px 24px' : '80px 60px', 
        borderRadius: '32px', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid hsla(0,0%,100%,0.05)',
        marginTop: isMobile ? '10px' : '20px'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/leaderboard-hero.png" 
            alt="Leaderboard Hero" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.4 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsl(var(--bg-color)) 100%), linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)'
              : 'radial-gradient(circle, transparent 0%, hsl(var(--bg-color)) 100%)' 
          }} />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: isMobile ? '64px' : '80px', height: isMobile ? '64px' : '80px', borderRadius: '24px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', marginBottom: '24px', border: '1px solid hsla(var(--primary), 0.2)' }}>
            <Trophy size={isMobile ? 32 : 40} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: isMobile ? '3rem' : '5rem', lineHeight: 1, marginBottom: '16px', fontFamily: "'Outfit', sans-serif", fontWeight: 900, letterSpacing: '-0.04em' }}>HALL OF FAME</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: isMobile ? '1.1rem' : '1.4rem', maxWidth: '650px', margin: '0 auto', fontWeight: 500 }}>
            Behold the legends of the ecosystem. The top performers by wager, profit, and pure dedication.
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '32px' }}>
        {[
          { label: 'WEEKLY VOLUME', value: '$8.42M', icon: TrendingUp, color: 'hsl(var(--primary))' },
          { label: 'TOP MULTIPLIER', value: '4,204x', icon: Zap, color: 'hsl(var(--accent))' },
          { label: 'ACTIVE LEGENDS', value: '142', icon: Star, color: 'hsl(var(--warning))' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card" style={{ textAlign: 'center', padding: isMobile ? '24px' : '40px' }}>
              <div style={{ color: stat.color, marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <Icon size={isMobile ? 24 : 32} />
              </div>
              <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="responsive-table-container" style={{ border: '1px solid hsla(0,0%,100%,0.05)', background: 'hsla(0,0%,100%,0.02)', borderRadius: '24px' }}>
        <table className="responsive-table">
          <thead>
            <tr>
              <th style={{ padding: isMobile ? '16px' : '24px' }}>RANK</th>
              <th>PLAYER</th>
              <th>LEVEL / RANK</th>
              <th>WAGERED</th>
              <th style={{ textAlign: 'right', paddingRight: isMobile ? '16px' : '24px' }}>PROFIT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ padding: isMobile ? '16px' : '24px' }}><div className="skeleton" style={{ width: '40px', height: '40px' }} /></td>
                  <td><div className="skeleton" style={{ width: '150px', height: '20px' }} /></td>
                  <td><div className="skeleton" style={{ width: '100px', height: '20px' }} /></td>
                  <td><div className="skeleton" style={{ width: '80px', height: '20px' }} /></td>
                  <td style={{ paddingRight: isMobile ? '16px' : '24px' }}><div className="skeleton" style={{ width: '80px', height: '20px', marginLeft: 'auto' }} /></td>
                </tr>
              ))
            ) : (
              players.map((p) => (
                <tr 
                  key={p.rank} 
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onClick={() => setSelectedPlayer(p)}
                  onMouseEnter={(e) => !isMobile && (e.currentTarget.style.background = 'hsla(0,0%,100%,0.03)')}
                  onMouseLeave={(e) => !isMobile && (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: isMobile ? '16px' : '24px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsla(0,0%,100%,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: isMobile ? '0.95rem' : '1.1rem' }}>{p.user}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'hsl(var(--primary))', color: 'black', padding: '1px 4px', borderRadius: '4px' }}>Lvl {p.level}</span>
                      {!isMobile && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>{p.rankName}</span>}
                    </div>
                  </td>
                  <td className="mono" style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '1rem' }}>{p.wagered}</td>
                  <td className="mono" style={{ 
                    textAlign: 'right', 
                    paddingRight: isMobile ? '16px' : '24px', 
                    fontWeight: 900, 
                    fontSize: isMobile ? '0.95rem' : '1.1rem',
                    color: p.profit.startsWith('+') ? 'hsl(var(--success))' : 'hsl(var(--error))' 
                  }}>
                    {p.profit}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {selectedPlayer && (
        <PlayerProfileModal 
          isOpen={!!selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          username={selectedPlayer.user}
          level={selectedPlayer.level}
          rank={selectedPlayer.rankName}
        />
      )}
    </div>
  );
}
