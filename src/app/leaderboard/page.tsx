'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Clock, 
  ChevronRight, 
  Star, 
  Zap, 
  Users, 
  ShieldCheck,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import Image from 'next/image';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { isMobile, rank: myRankName, level: myLevel } = useCasinoStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600 * 24 * 3 + 42 * 60 + 12); // 3d 42m 12s

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const leaders = [
    { rank: 1, user: 'VibeCoder', points: '1,240,502', prize: '$2,500', trend: 'up', level: 124, tier: 'Diamond' },
    { rank: 2, user: 'HighRoller', points: '982,110', prize: '$1,200', trend: 'stable', level: 98, tier: 'Platinum' },
    { rank: 3, user: 'CryptoKing', points: '854,000', prize: '$800', trend: 'down', level: 85, tier: 'Gold' },
    { rank: 4, user: 'LuckyLady', points: '720,100', prize: '$500', trend: 'up', level: 72, tier: 'Gold' },
    { rank: 5, user: 'NeonSniper', points: '680,400', prize: '$300', trend: 'up', level: 68, tier: 'Silver' },
    { rank: 6, user: 'SarahSlot', points: '540,200', prize: '$200', trend: 'down', level: 54, tier: 'Silver' },
    { rank: 7, user: 'Bochmann88', points: '420,100', prize: '$150', trend: 'stable', level: 42, tier: 'Bronze' },
    { rank: 8, user: 'GamerX', points: '310,500', prize: '$100', trend: 'up', level: 31, tier: 'Bronze' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px 120px' }}>
      
      {/* Race Header */}
      <header style={{ 
        marginTop: '20px',
        padding: isMobile ? '40px 20px' : '60px 48px',
        borderRadius: '40px',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
        border: '1px solid hsla(var(--primary), 0.2)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', color: 'hsl(var(--primary))', fontSize: '0.85rem', fontWeight: 900, marginBottom: '24px' }}>
            <Trophy size={16} /> MONTHLY $10,000 WAGER RACE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 950, lineHeight: 1, fontFamily: "'Outfit', sans-serif", marginBottom: '32px' }}>
            THE GLOBAL <br />
            <span className="text-gradient">LEADERBOARD.</span>
          </h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 950, color: '#fff' }}>{formatTime(timeLeft)}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.1em' }}>ENDS IN</div>
            </div>
            <div style={{ width: '1px', height: '60px', background: 'hsla(0,0%,100%,0.1)', display: isMobile ? 'none' : 'block' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'hsl(var(--primary))' }}>$10,000</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.1em' }}>TOTAL PRIZE POOL</div>
            </div>
          </div>
        </div>
        
        {/* Background Icons */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', opacity: 0.05, transform: 'rotate(-15deg)' }}><Crown size={160} /></div>
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', opacity: 0.05, transform: 'rotate(15deg)' }}><Star size={160} /></div>
      </header>

      {/* Top 3 Podium */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '24px', alignItems: 'flex-end', maxWidth: '1000px', margin: '0 auto 40px', width: '100%' }}>
          {/* Rank 2 */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', textAlign: 'center', height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #c0c0c0', margin: '0 auto 16px', position: 'relative' }}>
              <img src={leaders[1].user === 'HighRoller' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=High' : ''} alt="2" style={{ borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#c0c0c0', color: 'black', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
            </div>
            <h4 style={{ fontWeight: 900 }}>{leaders[1].user}</h4>
            <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'hsl(var(--primary))', marginTop: '8px' }}>{leaders[1].prize}</div>
          </div>
          {/* Rank 1 */}
          <div className="glass-card" style={{ padding: '40px', borderRadius: '40px', textAlign: 'center', height: '340px', border: '2px solid hsl(var(--primary))', position: 'relative', boxShadow: '0 20px 50px hsla(var(--primary), 0.2)' }}>
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', color: 'hsl(var(--primary))' }}><Crown size={48} /></div>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #ffd700', margin: '0 auto 20px', position: 'relative' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vibe" alt="1" style={{ borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#ffd700', color: 'black', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 950 }}>{leaders[0].user}</h3>
            <div style={{ fontSize: '1.75rem', fontWeight: 950, color: 'hsl(var(--primary))', marginTop: '12px' }}>{leaders[0].prize}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-dim))', marginTop: '4px' }}>CURRENT LEADER</div>
          </div>
          {/* Rank 3 */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', textAlign: 'center', height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px solid #cd7f32', margin: '0 auto 16px', position: 'relative' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=King" alt="3" style={{ borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#cd7f32', color: 'black', width: '24px', height: '24px', borderRadius: '50%', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            </div>
            <h4 style={{ fontWeight: 900 }}>{leaders[2].user}</h4>
            <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'hsl(var(--primary))', marginTop: '8px' }}>{leaders[2].prize}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: isMobile ? '100%' : '400px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-dim))' }} size={20} />
          <input 
            placeholder="Search player name..." 
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '48px', borderRadius: '16px', height: '52px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'hsla(var(--success), 0.1)', borderRadius: '16px', border: '1px solid hsla(var(--success), 0.2)' }}>
          <div className="dot dot-success animate-pulse" />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--success))' }}>RANKINGS UPDATE IN REAL-TIME</span>
        </div>
      </div>

      {/* Main Rankings Table */}
      <div className="glass-card" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid hsla(0,0%,100%,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'hsla(0,0%,100%,0.02)', borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>RANK</th>
                <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>USER</th>
                <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>WAGERED</th>
                <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>PRIZE</th>
                <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((p) => (
                <tr key={p.rank} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }} className="hover:bg-white/5 transition-colors">
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 950, fontSize: '1.2rem', width: '24px', color: p.rank <= 3 ? 'hsl(var(--primary))' : 'inherit' }}>{p.rank}</span>
                      {p.trend === 'up' && <TrendingUp size={14} color="hsl(var(--success))" />}
                      {p.trend === 'down' && <TrendingDown size={14} color="hsl(var(--error))" />}
                    </div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', background: 'hsla(0,0%,100%,0.05)' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user}`} alt="avatar" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '1rem' }}>{p.user}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>{p.tier} TIER</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px', fontWeight: 800, fontSize: '1.1rem' }}>${p.points}</td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem', color: 'hsl(var(--success))' }}>{p.prize}</div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>
                      LVL {p.level}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky My Rank Bar */}
      <div style={{ 
        position: 'fixed', 
        bottom: '24px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: 'calc(100% - 48px)', 
        maxWidth: '1200px', 
        height: '80px', 
        background: 'hsl(var(--bg-color))', 
        borderRadius: '24px', 
        border: '2px solid hsl(var(--primary))', 
        zIndex: 500,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>YOUR RANK</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>#4,124</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'hsla(0,0%,100%,0.1)' }} />
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>WAGER NEEDED FOR #100</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>$1,420.50</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {!isMobile && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>EARN POINTS BY PLAYING ANY GAME</span>}
          <Link href="/games" className="btn btn-primary" style={{ padding: '0 24px', height: '48px', borderRadius: '12px', fontWeight: 900 }}>
            JOIN THE RACE
          </Link>
        </div>
      </div>

    </div>
  );
}
