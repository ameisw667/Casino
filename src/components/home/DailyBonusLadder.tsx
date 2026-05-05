'use client';
import React from 'react';
import { TrendingUp, Lock } from 'lucide-react';
import Image from 'next/image';
interface DailyBonusLadderProps {
  isMobile: boolean;
  startOnboarding: () => void;
  ladderSteps: any[]; /* eslint-disable-line @typescript-eslint/no-explicit-any */
}
export const DailyBonusLadder: React.FC<DailyBonusLadderProps> = ({ 
  isMobile = false, 
  startOnboarding, 
  ladderSteps = [
    { day: 1, amount: 0.10, tier: 'Bronze' },
    { day: 2, amount: 0.25, tier: 'Bronze' },
    { day: 3, amount: 0.50, tier: 'Silver' },
    { day: 4, amount: 1.00, tier: 'Silver' },
    { day: 5, amount: 2.50, tier: 'Gold' },
    { day: 6, amount: 5.00, tier: 'Gold' },
    { day: 7, amount: 10.00, tier: 'Diamond' }
  ] 
}) => {
  return (
    <section style={{ padding: '40px 0' }}>
      <div className="glass" style={{ 
        padding: isMobile ? '24px' : '40px', 
        borderRadius: '40px', 
        border: '1px solid hsla(var(--primary), 0.3)',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '24px', right: '40px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>STREAK PROTECTION</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>LOCKED</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={18} color="hsl(var(--text-dim))" />
          </div>
        </div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', fontFamily: "'Outfit', sans-serif" }}>
            <TrendingUp size={32} color="hsl(var(--primary))" /> DAILY BONUS LADDER
          </h3>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1rem', marginTop: '8px' }}>Claim your free daily coins. Reach Day 10 for the <span style={{ color: 'hsl(var(--primary))', fontWeight: 800 }}>Diamond Jackpot</span>.</p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: '16px', 
          overflowX: 'auto', 
          paddingBottom: '24px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {ladderSteps.map((s, i) => {
            const isCurrent = i === 0;
            const isCompleted = false;
            const color = s.tier === 'Diamond' ? '#b9f2ff' : s.tier === 'Gold' ? '#ffd700' : s.tier === 'Silver' ? '#c0c0c0' : '#cd7f32';
            
            return (
              <div key={i} style={{ 
                minWidth: '120px', 
                height: '160px', 
                borderRadius: '24px', 
                background: isCurrent ? color : isCompleted ? `${color}22` : 'hsla(0,0%,100%,0.02)',
                border: `2px solid ${isCurrent ? '#fff' : isCompleted ? `${color}44` : 'hsla(0,0%,100%,0.05)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                position: 'relative',
                boxShadow: isCurrent ? `0 0 30px ${color}44` : 'none',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} className={isCurrent ? "animate-pulse" : ""}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: isCurrent ? 'black' : 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>DAY {s.day}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 950, color: isCurrent ? 'black' : '#fff' }}>${s.amount.toFixed(2)}</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: isCurrent ? 'rgba(0,0,0,0.5)' : color, textTransform: 'uppercase' }}>{s.tier}</div>
                
                {isCurrent && <div style={{ position: 'absolute', bottom: '-12px', background: '#fff', color: 'black', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>CLAIMABLE</div>}
              </div>
            );
          })}
        </div>
        
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          background: 'hsla(0,0%,100%,0.03)', 
          borderRadius: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '40px',
          border: '1px solid hsla(0,0%,100%,0.05)',
          position: 'relative'
        }}>
          {!isMobile && (
            <div style={{ width: '120px', height: '120px', position: 'relative' }}>
              <Image src="/images/daily-lootbox-3d.png" alt="Daily Lootbox" fill style={{ objectFit: 'contain' }} className="animate-float" />
            </div>
          )}
          <button 
            onClick={startOnboarding}
            className="btn btn-primary" 
            style={{ padding: '0 48px', height: '60px', borderRadius: '14px', fontWeight: 900, fontSize: '1.1rem', position: 'relative', zIndex: 1 }}
          >
            CLAIM DAY 1 BONUS ($0.10)
          </button>
        </div>
      </div>
    </section>
  );
};