'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, RotateCcw, CircleDollarSign, Trophy, Users, ShieldCheck, Zap, ArrowRight, Play, ExternalLink, Rocket } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function Home() {
  const { shareWinToChat, friends, isMobile } = useCasinoStore();
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
    { 
      id: 'slots', 
      name: 'SLOTS', 
      image: '/images/game-slots-new.png', 
      path: '/games/slots', 
      color: 'hsl(var(--primary))', 
      players: 64,
      description: 'Infinite reels, legendary jackpots. Spin to win big.'
    },
  ];

  const recentWins = [
    { user: 'VibeCoder', game: 'Crash', amount: '0.42 BTC', multiplier: '12.5x', time: '2m ago' },
    { user: 'CryptoKing', game: 'Dice', amount: '1.20 ETH', multiplier: '2.0x', time: '5m ago' },
    { user: 'HighRoller123', game: 'Roulette', amount: '500 SOL', multiplier: '36x', time: '8m ago' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 8vw, 80px)', padding: '0 var(--container-padding)' }}>
      
      
      <section style={{ 
        position: 'relative', 
        borderRadius: isMobile ? '24px' : '32px', 
        overflow: 'hidden', 
        minHeight: isMobile ? 'auto' : 'clamp(400px, 70vh, 600px)',
        display: 'flex',
        alignItems: 'center',
        marginTop: isMobile ? '10px' : '20px',
        padding: isMobile ? '60px 0' : '0'
      }}>
        {/* Background Image with Overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/hero-banner-v3.png" 
            alt="Hero Banner" 
            fill 
            style={{ 
              objectFit: 'cover', 
              opacity: isMobile ? 0.6 : 0.8,
              objectPosition: isMobile ? 'center' : 'right center'
            }}
            priority
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsl(var(--bg-color)) 100%), linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)'
              : 'linear-gradient(to right, hsl(var(--bg-color)) 0%, hsla(var(--bg-color), 0.8) 50%, transparent 100%)' 
          }} />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 40%)' 
          }} />
        </div>

        <div style={{ padding: 'clamp(24px, 5vw, 60px)', maxWidth: '800px', position: 'relative', zIndex: 1, textAlign: isMobile ? 'center' : 'left', width: '100%' }}>
          <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'hsla(var(--primary), 0.15)', backdropFilter: 'blur(10px)', borderRadius: 'var(--radius-full)', color: 'hsl(var(--primary))', fontSize: '0.75rem', fontWeight: 800, marginBottom: '24px', border: '1px solid hsla(var(--primary), 0.3)' }}>
            <Zap size={14} fill="currentColor" /> NEW: 2.0 ENGINE DEPLOYED
          </div>
          
          <h1 className="text-gradient" style={{ 
            fontSize: 'clamp(2.5rem, 10vw, 6rem)', 
            lineHeight: isMobile ? 1 : 0.95, 
            marginBottom: '20px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.04em'
          }}>
            THE NEW ERA <br className="desktop-only" /> OF GAMING.
          </h1>
          
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'hsl(var(--text-muted))', maxWidth: isMobile ? '100%' : '550px', marginBottom: '32px', lineHeight: 1.6, margin: isMobile ? '0 auto 32px' : '0 0 32px' }}>
            Experience the world's most transparent gaming ecosystem. Powered by deep-learning security and the fastest crypto rails in existence.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <button className="btn btn-primary" style={{ height: isMobile ? '56px' : '64px', padding: '0 40px', fontSize: '1.1rem', borderRadius: '16px', width: isMobile ? '100%' : 'auto' }}>
              <Play size={20} fill="currentColor" /> START PLAYING
            </button>
            <button className="btn btn-secondary" style={{ 
              height: isMobile ? '56px' : '64px', 
              padding: '0 32px', 
              fontSize: '1.1rem', 
              borderRadius: '16px',
              border: '1px solid hsla(var(--primary), 0.3)',
              color: 'hsl(var(--primary))',
              backdropFilter: 'blur(10px)',
              width: isMobile ? '100%' : 'auto'
            }}>
              DAILY REWARD <RotateCcw size={20} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>

        {/* Floating VIP Badge */}
        <div className="desktop-only animate-float" style={{ 
          position: 'absolute', 
          right: '60px', 
          bottom: '60px',
          padding: '24px',
          background: 'hsla(var(--bg-color), 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid hsla(var(--primary), 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          zIndex: 2
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
          }}>
            <Trophy size={32} color="black" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--primary))', letterSpacing: '0.1em' }}>VIP STATUS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>DIAMOND RANK</div>
          </div>
        </div>
      </section>

      {/* Live Wins Ticker */}
      <section className="glass" style={{ borderRadius: '20px', padding: 'clamp(12px, 3vw, 20px) var(--container-padding)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontWeight: 700, color: 'hsl(var(--primary))', fontSize: '0.85rem' }}>
          <Trophy size={16} /> <span className="desktop-only">RECENT VICTORIES</span>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(20px, 5vw, 40px)', flex: 1, overflow: 'hidden' }}>
          {recentWins.map((win, i) => {
            const isFriend = friends.includes(win.user);
            return (
              <div 
                key={i} 
                onClick={() => shareWinToChat(parseFloat(win.amount), parseFloat(win.multiplier), win.game)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
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
                  fontSize: '0.8rem',
                  fontWeight: isFriend ? 800 : 400 
                }}>
                  {win.user}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{win.amount}</span>
                <span style={{ background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', padding: '1px 6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{win.multiplier}</span>
              </div>
            );
          })}
        </div>
        {!isMobile && (
          <Link href="/leaderboard" style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Leaderboard</span> <ExternalLink size={14} />
          </Link>
        )}
      </section>

      {/* Featured Games Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.02em' }}>PROVABLY FAIR</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>Pure mathematical excitement with guaranteed transparency.</p>
          </div>
          <Link href="/games" className="btn btn-ghost" style={{ gap: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
            VIEW ALL <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '24px' }}>
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

          {/* Coming Soon Teaser Card (Placeholder for future games) */}
          <div className="glass-card" style={{ 
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px dashed hsla(var(--primary), 0.2)',
            opacity: 0.8,
            cursor: 'not-allowed'
          }}>
            <div style={{ position: 'relative', width: '100%', height: '240px', background: 'hsla(var(--primary), 0.02)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket size={64} className="animate-bounce" style={{ color: 'hsl(var(--primary))', opacity: 0.2 }} />
              </div>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, hsla(var(--bg-color), 1) 0%, transparent 60%)' 
              }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>
                COMING SOON
              </div>
            </div>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'hsl(var(--text-muted))' }}>PLINKO</h3>
                <p style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Watch the balls fall, win legendary prizes. Arriving soon.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ flex: 1, height: '1px', background: 'hsla(0, 0%, 100%, 0.05)' }} />
                <div className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                  NOTIFY ME
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Winners / Social Proof Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '24px' }}>
        <div className="glass" style={{ padding: isMobile ? '24px' : '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800 }}>🏆 WEEKLY TOP WINNERS</h3>
            <Link href="/leaderboard" style={{ color: 'hsl(var(--primary))', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}>FULL BOARD</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { rank: 1, user: 'VibeLord99', win: '4.20 BTC', color: '#FFD700' },
              { rank: 2, user: 'NeonSniper', win: '124 ETH', color: '#C0C0C0' },
              { rank: 3, user: 'CryptoGhost', win: '890 SOL', color: '#CD7F32' },
            ].map((winner, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '16px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.03)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: winner.color + '22', color: winner.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                  {winner.rank}
                </div>
                <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>{winner.user}</div>
                <div style={{ fontWeight: 900, color: 'hsl(var(--primary))', fontSize: '0.9rem' }}>{winner.win}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: isMobile ? '32px 24px' : '40px', borderRadius: '32px', border: '1px solid hsla(0,0%,100%,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
            <Image 
              src="/images/fairness-hero.png" 
              alt="Fairness Background" 
              fill 
              style={{ objectFit: 'cover', opacity: 0.15, filter: 'grayscale(1) brightness(0.5)' }}
            />
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: isMobile ? '24px' : '40px', opacity: 0.1 }}>
            <ShieldCheck size={isMobile ? 80 : 120} color="hsl(var(--primary))" />
          </div>
          <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, marginBottom: '12px' }}>PROVABLY FAIR SYSTEM</h3>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px', position: 'relative', zIndex: 1 }}>
            Our open-source verification system ensures that every single outcome is mathematically generated and verifiable by you. No house manipulation, ever.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Link href="/games/crash?verify=true" className="btn btn-secondary" style={{ borderRadius: '12px', flex: isMobile ? 1 : 'none' }}>VERIFY A BET</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ borderRadius: '12px', flex: isMobile ? 1 : 'none' }}>WHITEPAPER</a>
          </div>
        </div>
      </section>

      {/* Weekly Promotions Banner */}
      <section className="glass" style={{ 
        borderRadius: '32px', 
        minHeight: isMobile ? 'auto' : 'clamp(300px, 40vh, 350px)', 
        display: 'flex', 
        alignItems: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid hsla(var(--primary), 0.2)',
        padding: isMobile ? '40px 0' : '0'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/rewards-visual.png" 
            alt="Promotions" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.8 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsla(var(--bg-color), 1) 100%), linear-gradient(to top, hsla(var(--bg-color), 1) 0%, transparent 100%)'
              : 'linear-gradient(to right, hsla(var(--bg-color), 1) 0%, hsla(var(--bg-color), 0.2) 100%)' 
          }} />
        </div>
        
        <div style={{ padding: 'clamp(24px, 6vw, 60px)', maxWidth: '600px', position: 'relative', zIndex: 1, textAlign: isMobile ? 'center' : 'left', width: '100%' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsl(var(--primary))', color: 'black', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '20px' }}>LIMITED TIME</div>
          <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, lineHeight: 1, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>WEEKLY <br /> REWARD DROP</h2>
          <p style={{ color: '#fff', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '32px', opacity: 0.9 }}>
            Wager $500 or more this week to enter the $10,000 Grand Prize draw. Every bet counts towards your entry!
          </p>
          <button className="btn btn-primary" style={{ height: '56px', padding: '0 32px', borderRadius: '12px', fontSize: '1.1rem', width: isMobile ? '100%' : 'auto' }}>
            ENTER DRAW NOW
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginBottom: '80px' }}>
        {[
          { label: 'TOTAL WAGERED', value: `$${(liveStats.wagered / 1000000).toFixed(1)}M+`, icon: Zap, color: 'var(--primary)' },
          { label: 'CRYPTO VERIFIED', value: '100% FAIR', icon: ShieldCheck, color: 'var(--success)' },
          { label: 'ACTIVE PLAYERS', value: liveStats.players.toLocaleString(), icon: Users, color: 'var(--secondary)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: isMobile ? '24px' : 'clamp(20px, 5vw, 40px)' }}>
              <div style={{ 
                width: isMobile ? '48px' : '64px', 
                height: isMobile ? '48px' : '64px', 
                borderRadius: isMobile ? '12px' : '20px', 
                background: `hsla(${stat.color}, 0.1)`, 
                color: `hsl(${stat.color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid hsla(${stat.color}, 0.2)`,
                flexShrink: 0
              }}>
                <Icon size={isMobile ? 24 : 32} />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '1.5rem' : 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.1em', marginTop: '4px' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
