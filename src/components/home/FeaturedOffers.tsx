'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, ChevronRight, Clock, Gamepad2 } from 'lucide-react';
interface FeaturedOffersProps {
  featuredGames: any[]; /* eslint-disable-line @typescript-eslint/no-explicit-any */
}
const GameImage: React.FC<{ src: string; alt: string; color: string }> = ({ src, alt, color }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}33, #000)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <Gamepad2 size={48} color={color} style={{ opacity: 0.5 }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsla(0,0%,100%,0.3)', letterSpacing: '0.1em' }}>PREVIEW NOT AVAILABLE</span>
      </div>
    );
  }
  return (
    <Image 
      src={src} 
      alt={alt} 
      fill 
      style={{ objectFit: 'cover' }} 
      onError={() => setError(true)}
    />
  );
};
export const FeaturedOffers: React.FC<FeaturedOffersProps> = ({ featuredGames }) => {
  return (
    <section style={{ padding: 'var(--space-xl) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 950, marginBottom: '8px', letterSpacing: '-0.02em' }}>FEATURED OFFERS</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: 'var(--font-base)' }}>Complete tasks in our games to earn massive rewards.</p>
        </div>
        <Link href="/games" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-lg)', gap: '8px', padding: '12px 24px' }}>
          VIEW ALL OFFERS <ChevronRight size={18} />
        </Link>
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
        {featuredGames.map(game => (
          <Link key={game.id} href={game.path} className="glass-card" style={{ 
            padding: '0', 
            borderRadius: 'var(--radius-xl)', 
            overflow: 'hidden', 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ height: '200px', position: 'relative' }}>
              <GameImage src={game.image} alt={game.name} color={game.color} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)' }} />
              
              <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '6px 14px', background: 'hsl(var(--primary))', color: 'black', borderRadius: 'var(--radius-md)', fontSize: '0.7rem', fontWeight: 950 }}>
                {game.tag}
              </div>
            </div>

            <div style={{ padding: 'clamp(16px, 4vw, 24px)', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '4px' }}>{game.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>
                    <Trophy size={14} /> {game.task}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'hsl(var(--primary))' }}>{game.reward}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>REWARD</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))', textTransform: 'uppercase', marginBottom: '4px' }}>DIFFICULTY</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ 
                        width: '20px', 
                        height: '4px', 
                        borderRadius: '2px', 
                        background: i <= (game.difficulty === 'Beginner' ? 1 : game.difficulty === 'Medium' ? 2 : 3) ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.1)' 
                      }} />
                    ))}
                  </div>
                </div>
                <div className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '12px' }}>
                  EARN NOW
                </div>
              </div>
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '16px', 
                borderTop: '1px solid hsla(0,0%,100%,0.05)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['PayPal', 'BTC', 'Visa'].map(m => (
                    <div key={m} style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>{m}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={10} color="hsl(var(--success))" />
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--success))' }}>INSTANT</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};