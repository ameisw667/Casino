'use client';

import React from 'react';
import { Gamepad2, TrendingUp, CircleDollarSign, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function GamesPage() {
  const { isMobile } = useCasinoStore();
  const games = [
    { id: 'crash', name: 'Crash', icon: TrendingUp, desc: 'Watch the multiplier grow and cash out before it crashes.', path: '/games/crash', color: 'hsl(var(--primary))' },
    { id: 'dice', name: 'Dice', icon: RotateCcw, desc: 'Predict the roll and multiply your winnings.', path: '/games/dice', color: 'hsl(var(--secondary))' },
    { id: 'roulette', name: 'Roulette', icon: CircleDollarSign, desc: 'Classic casino experience with high-stakes payouts.', path: '/games/roulette', color: 'hsl(var(--accent))' },
    { id: 'slots', name: 'Slots', icon: Zap, desc: 'Infinite reels and legendary jackpots.', path: '/games/slots', color: 'hsl(var(--primary))' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '40px', padding: '0 var(--container-padding)' }}>
      <header style={{ 
        position: 'relative', 
        height: isMobile ? 'auto' : '350px', 
        minHeight: isMobile ? '200px' : '350px',
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: isMobile ? '40px 24px' : '60px',
        border: '1px solid hsla(0,0%,100%,0.05)',
        marginTop: isMobile ? '10px' : '20px'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/hero-banner-new.png" 
            alt="Games Hero" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.4 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsl(var(--bg-color)) 100%), linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)'
              : 'linear-gradient(to right, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        <h1 className="text-gradient" style={{ 
          fontSize: isMobile ? '3rem' : '4.5rem', 
          fontWeight: 900, 
          lineHeight: 1, 
          fontFamily: "'Outfit', sans-serif",
          textAlign: isMobile ? 'center' : 'left'
        }}>
          THE <br /> COLLECTION
        </h1>
        <p style={{ 
          color: 'hsl(var(--text-muted))', 
          fontSize: isMobile ? '1rem' : '1.25rem', 
          maxWidth: isMobile ? '100%' : '500px', 
          marginTop: '12px',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          Explore our suite of provably fair, high-fidelity gaming experiences.
        </p>
      </header>

      <div className="grid-cols-auto">
        {games.map((game) => (
          <Link key={game.id} href={game.path} className="glass-card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            textAlign: 'center',
            padding: isMobile ? '24px' : '32px'
          }}>
            <div style={{ 
              width: isMobile ? '64px' : '80px', 
              height: isMobile ? '64px' : '80px', 
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: game.color,
              border: `1px solid ${game.color}33`
            }}>
              <game.icon size={isMobile ? 28 : 32} />
            </div>
            <div>
              <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '8px' }}>{game.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{game.desc}</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', height: isMobile ? '48px' : '56px' }}>
              Play {game.name}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
