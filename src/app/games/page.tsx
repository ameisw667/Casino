'use client';

import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  TrendingUp, 
  CircleDollarSign, 
  RotateCcw, 
  Zap, 
  Trophy, 
  Star, 
  Clock, 
  ChevronRight, 
  ArrowUpRight,
  Flame,
  Search,
  Download,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function GamesPage() {
  const { isMobile, balance } = useCasinoStore();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveHeat, setLiveStats] = useState({ game: 'CRASH', multiplier: '142x', user: 'VibeCoder' });

  useEffect(() => {
    const interval = setInterval(() => {
      const games = ['CRASH', 'DICE', 'ROULETTE', 'SLOTS'];
      const users = ['MaxWin', 'LuckyLady', 'CryptoKing', 'NeonSniper'];
      setLiveStats({
        game: games[Math.floor(Math.random() * games.length)],
        multiplier: (Math.random() * 50 + 10).toFixed(1) + 'x',
        user: users[Math.floor(Math.random() * users.length)]
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const games = [
    { 
      id: 'crash', 
      name: 'Crash', 
      icon: TrendingUp, 
      desc: 'Watch the multiplier grow and cash out before it crashes.', 
      path: '/games/crash', 
      color: 'hsl(var(--primary))',
      reward: '$500.00',
      difficulty: 'Medium',
      rating: 4.9,
      category: 'HOT',
      hourly: '~$45/hr',
      studio: 'ROYALE ORIGINALS',
      recommend: true
    },
    { 
      id: 'dice', 
      name: 'Dice', 
      icon: RotateCcw, 
      desc: 'Predict the roll and multiply your winnings with custom odds.', 
      path: '/games/dice', 
      color: 'hsl(var(--secondary))',
      reward: '$250.00',
      difficulty: 'Easy',
      rating: 4.7,
      category: 'NEW',
      hourly: '~$30/hr',
      studio: 'VIBE PRIME',
      recommend: false
    },
    { 
      id: 'roulette', 
      name: 'Roulette', 
      icon: CircleDollarSign, 
      desc: 'Classic casino experience with high-stakes payouts.', 
      path: '/games/roulette', 
      color: 'hsl(var(--accent))',
      reward: '$1,000.00',
      difficulty: 'Hard',
      rating: 4.8,
      category: 'HOT',
      hourly: '~$80/hr',
      studio: 'ROYALE ORIGINALS',
      recommend: true
    },
    { 
      id: 'slots', 
      name: 'Slots', 
      icon: Zap, 
      desc: 'Infinite reels and legendary jackpots waiting to be hit.', 
      path: '/games/slots', 
      color: 'hsl(var(--primary))',
      reward: '$5,000.00',
      difficulty: 'Easy',
      rating: 4.9,
      category: 'JACKPOT',
      hourly: '~$120/hr',
      studio: 'VIBE PRIME',
      recommend: true
    },
  ];

  const filteredGames = games
    .filter(g => activeTab === 'ALL' || g.category === activeTab)
    .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px 100px' }}>
      
      {/* Header Earning Center */}
      <header style={{ 
        position: 'relative', 
        borderRadius: '32px', 
        overflow: 'hidden', 
        padding: isMobile ? '40px 24px' : '60px 48px',
        border: '1px solid hsla(var(--primary), 0.2)',
        marginTop: '20px',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 900, marginBottom: '24px' }}>
              <Flame size={16} className="animate-pulse" /> CURRENTLY PAYING OUT 115% RTP
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              fontWeight: 950, 
              lineHeight: 1, 
              fontFamily: "'Outfit', sans-serif",
              marginBottom: '20px'
            }}>
              BROWSE ALL <br />
              <span className="text-gradient">OFFERS.</span>
            </h1>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-dim))' }} size={20} />
              <input 
                placeholder="Search games or providers..." 
                className="input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '48px', height: '56px', borderRadius: '16px', fontSize: '1rem' }}
              />
            </div>
          </div>

          {!isMobile && (
            <div className="glass" style={{ padding: '32px', borderRadius: '24px', border: '1px solid hsla(var(--primary), 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))' }}>LIVE FEED</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--success))' }}>ONLINE NOW: 14,204</div>
              </div>
              <div className="animate-fade-in" key={liveHeat.user} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1rem' }}>{liveHeat.user} won {liveHeat.multiplier}</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 800 }}>ON {liveHeat.game} QUEST</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Filter Tabs & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {['ALL', 'HOT', 'NEW', 'JACKPOT'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '10px 20px', 
                borderRadius: '12px', 
                background: activeTab === tab ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.03)',
                color: activeTab === tab ? 'black' : 'white',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>TOTAL PAID OUT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#fff' }}>$14,820,411</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>AVG. PAYOUT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'hsl(var(--success))' }}>$42.50</div>
            </div>
          </div>
        )}
      </div>

      {/* Optimized Game Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', 
        gap: '24px' 
      }}>
        {filteredGames.map((game) => (
          <Link key={game.id} href={game.path} className="glass-card group hover:scale-[1.02] transition-all duration-300" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '32px',
            border: '1px solid hsla(0,0%,100%,0.05)',
            position: 'relative'
          }}>
            {/* Recommend Badge */}
            {game.recommend && (
              <div style={{ position: 'absolute', top: '120px', left: '24px', zIndex: 10, padding: '4px 10px', background: 'hsl(var(--primary))', color: 'black', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 950, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                RECOMMENDED FOR YOU
              </div>
            )}

            <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.1em' }}>{game.studio}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(45, 100%, 50%)' }}>
                <Star size={14} fill="currentColor" /> {game.rating}
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '32px', 
                background: `linear-gradient(135deg, ${game.color}22, ${game.color}05)`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: game.color,
                border: `1px solid ${game.color}33`,
                marginBottom: '20px',
                boxShadow: `0 20px 40px ${game.color}11`,
                position: 'relative'
              }}>
                <game.icon size={56} />
                {game.category === 'HOT' && <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-ping" />}
              </div>
              
              <h3 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>{game.name}</h3>
              <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5, marginBottom: '24px', minHeight: '3em' }}>{game.desc}</p>
              
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>POTENTIAL</div>
                  <div style={{ fontSize: '1rem', fontWeight: 950, color: 'hsl(var(--primary))' }}>{game.reward}</div>
                </div>
                <div style={{ padding: '12px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>EST. EARNINGS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{game.hourly}</div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', height: '64px', borderRadius: '18px', fontWeight: 950, fontSize: '1.2rem', boxShadow: `0 10px 25px ${game.color}33`, position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'relative', zIndex: 2 }}>START EARNING</span>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
              </button>
              
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <ShieldCheck size={14} color="hsl(var(--success))" />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>INSTANT PAYOUT VERIFIED</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
