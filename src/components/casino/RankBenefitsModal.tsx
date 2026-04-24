'use client';

import React from 'react';
import { X, Trophy, Star, Zap, Gift, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { useCasinoStore, RANKS } from '@/store/useCasinoStore';

interface RankBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RankBenefitsModal({ isOpen, onClose }: RankBenefitsModalProps) {
  const { isMobile, level, xp, rank } = useCasinoStore();

  if (!isOpen) return null;

  const currentRankIndex = RANKS.findIndex(r => r.name === rank);
  const nextRank = RANKS[currentRankIndex + 1];
  
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 5000, 
      display: 'flex', 
      alignItems: isMobile ? 'flex-end' : 'center', 
      justifyContent: 'center',
      padding: isMobile ? '0' : '20px'
    }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} 
      />
      
      <div className="glass animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
        maxHeight: isMobile ? '90vh' : 'auto',
        overflowY: 'auto', 
        position: 'relative',
        border: '1px solid hsla(0,0%,100%,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: isMobile ? '24px' : '32px', background: 'hsla(0,0%,100%,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '14px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={isMobile ? 20 : 24} />
            </div>
            <div>
              <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>VIP PROGRESS</h2>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Your journey to the top</div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: isMobile ? '24px' : '32px', display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px' }}>
          {/* Current Status */}
          <div className="glass-card" style={{ padding: isMobile ? '24px' : '32px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid hsla(var(--primary), 0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
              <Star size={isMobile ? 80 : 120} fill="hsl(var(--primary))" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--primary))', letterSpacing: '0.1em', marginBottom: '4px' }}>CURRENT STATUS</div>
                <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{rank.toUpperCase()}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>Level {level}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900 }}>{Math.round(progress)}%</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>TO NEXT RANK</div>
              </div>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '5px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))', borderRadius: '5px', boxShadow: '0 0 20px hsla(var(--primary), 0.5)' }} />
            </div>

            {nextRank && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-dim))', position: 'relative', zIndex: 1 }}>
                <Info size={14} />
                Reach level {nextRank.minLevel} for <strong>{nextRank.name}</strong>.
              </div>
            )}
          </div>

          {/* Rank Tiers Grid */}
          <section>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em', marginBottom: '16px' }}>VIP PRIVILEGES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {RANKS.map((r, i) => {
                const isReached = level >= r.minLevel;
                const isCurrent = rank === r.name;
                
                return (
                  <div key={r.name} className="glass" style={{ 
                    padding: isMobile ? '16px' : '20px', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? '12px' : '20px',
                    opacity: isReached ? 1 : 0.4,
                    border: isCurrent ? '2px solid hsl(var(--primary))' : '1px solid var(--glass-border)',
                    background: isCurrent ? 'hsla(var(--primary), 0.03)' : 'transparent'
                  }}>
                    <div style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '10px', background: `${r.color}22`, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                      {r.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 800 }}>{r.name}</h4>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>LVL {r.minLevel}+</span>
                      </div>
                      {!isMobile && (
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                          {r.perks.join(' • ')}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 900, color: isReached ? 'hsl(var(--success))' : 'inherit' }}>
                        {(r.rakeback * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'hsl(var(--text-muted))' }}>RAKEBACK</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div style={{ padding: isMobile ? '24px' : '32px', background: 'hsla(0,0%,100%,0.02)', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '1.1rem' }}>
            BACK TO CASINO
          </button>
        </div>
      </div>
    </div>
  );
}
