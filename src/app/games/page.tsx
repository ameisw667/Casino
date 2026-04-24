'use client';

import React from 'react';
import { Gamepad2, TrendingUp, CircleDollarSign, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
  const games = [
    { id: 'crash', name: 'Crash', icon: <TrendingUp size={32} />, desc: 'Watch the multiplier grow and cash out before it crashes.', path: '/games/crash', color: 'hsl(var(--primary))' },
    { id: 'dice', name: 'Dice', icon: <RotateCcw size={32} />, desc: 'Predict the roll and multiply your winnings.', path: '/games/dice', color: 'hsl(var(--secondary))' },
    { id: 'roulette', name: 'Roulette', icon: <CircleDollarSign size={32} />, desc: 'Classic casino experience with high-stakes payouts.', path: '/games/roulette', color: 'hsl(var(--accent))' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>All Games</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Fair, fast, and high-fidelity gambling experiences.</p>
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
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: game.color,
              border: `1px solid ${game.color}33`
            }}>
              {game.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{game.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{game.desc}</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
              Play {game.name}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
