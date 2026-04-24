'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, RotateCcw, CircleDollarSign, Trophy, Users, ShieldCheck, Zap, ArrowRight, Play, ExternalLink } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function Home() {
  const { shareWinToChat, friends } = useCasinoStore();
  const [liveStats, setLiveStats] = useState({ wagered: 124802119.50, players: 142042 });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        wagered: prev.wagered + (Math.random() * 50),
        players: prev.players + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const featuredGames = [
    { 
      id: 'crash', 
      name: 'CRASH', 
      image: '/images/game-crash-new.png', 
      path: '/games/crash', 
      color: 'hsl(var(--primary))', 
      players: 142,
      description: 'Predict the rocket crash and multiply your wager.'
    },
    { 
      id: 'dice', 
      name: 'DICE', 
      image: '/images/game-dice-new.png', 
      path: '/games/dice', 
      color: 'hsl(var(--secondary))', 
      players: 85,
      description: 'Classic crypto dice with provable fairness.'
    },
    { 
      id: 'roulette', 
      name: 'ROULETTE', 
      image: '/images/game-roulette-new.png', 
      path: '/games/roulette', 
      color: 'hsl(var(--accent))', 
      players: 42,
      description: 'High-stakes European roulette reinvented.'
    },
  ];

  const recentWins = [
    { user: 'VibeCoder', game: 'Crash', amount: '0.42 BTC', multiplier: '12.5x', time: '2m ago' },
    { user: 'CryptoKing', game: 'Dice', amount: '1.20 ETH', multiplier: '2.0x', time: '5m ago' },
    { user: 'HighRoller123', game: 'Roulette', amount: '500 SOL', multiplier: '36x', time: '8m ago' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px', padding: '0 20px' }}>
      
      
      <section style={{ 
        position: 'relative', 
        borderRadius: '32px', 
        overflow: 'hidden', 
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        marginTop: '20px'
      }}>
        {/* Background Image with Overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/hero-banner-new.png" 
            alt="Hero Banner" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.6 }}
            priority
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to right, hsl(var(--bg-color)) 0%, hsla(var(--bg-color), 0.8) 50%, transparent 100%)' 
          }} />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 40%)' 
          }} />
        </div>

        <div style={{ padding: '0 60px', maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'hsla(var(--primary), 0.15)', backdropFilter: 'blur(10px)', borderRadius: 'var(--radius-full)', color: 'hsl(var(--primary))', fontSize: '0.85rem', fontWeight: 800, marginBottom: '32px', border: '1px solid hsla(var(--primary), 0.3)' }}>
            <Zap size={16} fill="currentColor" /> NEW: 2.0 ENGINE DEPLOYED
          </div>
          
          <h1 className="text-gradient" style={{ 
            fontSize: 'clamp(3.5rem, 10vw, 6.5rem)', 
            lineHeight: 0.95, 
            marginBottom: '28px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.04em'
          }}>
            THE NEW ERA <br /> OF GAMING.
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'hsl(var(--text-muted))', maxWidth: '550px', marginBottom: '48px', lineHeight: 1.6 }}>
            Experience the world's most transparent gaming ecosystem. Powered by deep-learning security and the fastest crypto rails in existence.
          </p>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="btn btn-primary" style={{ height: '64px', padding: '0 40px', fontSize: '1.1rem', borderRadius: '16px' }}>
              <Play size={20} fill="currentColor" /> START PLAYING
            </button>
            <Link href="/design-system" className="btn btn-secondary" style={{ height: '64px', padding: '0 40px', fontSize: '1.1rem', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
              VIEW STATS
            </Link>
          </div>
        </div>
      </section>

      {/* Live Wins Ticker */}
      <section className="glass" style={{ borderRadius: '20px', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap', fontWeight: 700, color: 'hsl(var(--primary))' }}>
          <Trophy size={20} /> RECENT VICTORIES
        </div>
        <div style={{ display: 'flex', gap: '60px', flex: 1, overflow: 'hidden' }}>
          {recentWins.map((win, i) => {
            const isFriend = friends.includes(win.user);
            return (
              <div 
                key={i} 
                onClick={() => shareWinToChat(parseFloat(win.amount), parseFloat(win.multiplier), win.game)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  whiteSpace: 'nowrap', 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s',
                  background: isFriend ? 'hsla(var(--primary), 0.1)' : 'transparent',
                  padding: isFriend ? '4px 12px' : '0',
                  borderRadius: '12px',
                  border: isFriend ? '1px solid hsla(var(--primary), 0.2)' : 'none'
                }}
                className="hover:scale-105"
              >
                <span style={{ 
                  color: isFriend ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', 
                  fontSize: '0.9rem',
                  fontWeight: isFriend ? 800 : 400 
                }}>
                  {win.user} {isFriend && '👤'}
                </span>
                <span style={{ fontWeight: 800 }}>{win.amount}</span>
                <span style={{ background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>{win.multiplier}</span>
              </div>
            );
          })}
        </div>
        <Link href="/leaderboard" style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Leaderboard <ExternalLink size={14} />
        </Link>
      </section>

      {/* Featured Games Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.02em' }}>PROVABLY FAIR</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem' }}>Pure mathematical excitement with guaranteed transparency.</p>
          </div>
          <Link href="/games" className="btn btn-ghost" style={{ gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
            VIEW ALL GAMES <ArrowRight size={20} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>
          {featuredGames.map((game) => (
            <Link key={game.id} href={game.path} className="glass-card" style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px',
              border: '1px solid hsla(0, 0%, 100%, 0.05)'
            }}>
              {/* Game Image Header */}
              <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                <Image 
                  src={game.image} 
                  alt={game.name} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to top, hsla(var(--bg-color), 1) 0%, transparent 60%)' 
                }} />
                
                <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
                  <span className="dot dot-success animate-pulse"></span>
                  {game.players} ACTIVE
                </div>
              </div>

              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: game.color }}>{game.name}</h3>
                  <p style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>{game.description}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'hsla(0, 0%, 100%, 0.05)' }} />
                  <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', background: 'hsla(var(--primary), 0.05)', borderColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
                    PLAY NOW
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Winners / Social Proof Section */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🏆 WEEKLY TOP WINNERS</h3>
            <Link href="/leaderboard" style={{ color: 'hsl(var(--primary))', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 700 }}>FULL BOARD</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { rank: 1, user: 'VibeLord99', win: '4.20 BTC', color: '#FFD700' },
              { rank: 2, user: 'NeonSniper', win: '124 ETH', color: '#C0C0C0' },
              { rank: 3, user: 'CryptoGhost', win: '890 SOL', color: '#CD7F32' },
            ].map((winner, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', borderRadius: '16px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.03)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: winner.color + '22', color: winner.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                  {winner.rank}
                </div>
                <div style={{ flex: 1, fontWeight: 700 }}>{winner.user}</div>
                <div style={{ fontWeight: 900, color: 'hsl(var(--primary))' }}>{winner.win}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '40px', opacity: 0.1 }}>
            <ShieldCheck size={120} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>PROVABLY FAIR SYSTEM</h3>
          <p style={{ color: 'hsl(var(--text-muted))', lineHeight: 1.6, marginBottom: '32px' }}>
            Our open-source verification system ensures that every single outcome is mathematically generated and verifiable by you. No house manipulation, ever.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/games/crash?verify=true" className="btn btn-secondary" style={{ borderRadius: '12px' }}>VERIFY A BET</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ borderRadius: '12px' }}>READ WHITEPAPER</a>
          </div>
        </div>
      </section>

      {/* Weekly Promotions Banner */}
      <section className="glass" style={{ 
        borderRadius: '32px', 
        minHeight: '350px', 
        display: 'flex', 
        alignItems: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid hsla(var(--primary), 0.2)'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/promotion-banner.png" 
            alt="Promotions" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.7 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to right, hsla(var(--bg-color), 1) 0%, hsla(var(--bg-color), 0.4) 100%)' 
          }} />
        </div>
        
        <div style={{ padding: '60px', maxWidth: '600px' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsl(var(--primary))', color: 'black', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '20px' }}>LIMITED TIME</div>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>WEEKLY <br /> REWARD DROP</h2>
          <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '32px', opacity: 0.9 }}>
            Wager $500 or more this week to enter the $10,000 Grand Prize draw. Every bet counts towards your entry!
          </p>
          <button className="btn btn-primary" style={{ height: '56px', padding: '0 32px', borderRadius: '12px' }}>
            LEARN MORE
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '80px' }}>
        {[
          { label: 'TOTAL WAGERED', value: `$${(liveStats.wagered / 1000000).toFixed(1)}M+`, icon: <Zap />, color: 'var(--primary)' },
          { label: 'CRYPTO VERIFIED', value: '100% FAIR', icon: <ShieldCheck />, color: 'var(--success)' },
          { label: 'ACTIVE PLAYERS', value: liveStats.players.toLocaleString(), icon: <Users />, color: 'var(--secondary)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '40px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '20px', 
              background: `hsla(${stat.color}, 0.1)`, 
              color: `hsl(${stat.color})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid hsla(${stat.color}, 0.2)`
            }}>
              {React.cloneElement(stat.icon as React.ReactElement, { size: 32 })}
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.1em', marginTop: '4px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
