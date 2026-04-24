'use client';

import React from 'react';
import { Gift, Star, Zap, CheckCircle2 } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardAmount: number | null;
  streak: number;
}

export default function DailyRewardModal({ isOpen, onClose, rewardAmount, streak }: DailyRewardModalProps) {
  const { isMobile } = useCasinoStore();
  
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 5000, 
      display: 'flex', 
      alignItems: isMobile ? 'flex-end' : 'center', 
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      padding: isMobile ? '0' : '20px'
    }}>
      <div className="glass animate-slide-up" style={{ 
        width: isMobile ? '100%' : 'min(95vw, 450px)', 
        padding: isMobile ? '40px 24px' : 'clamp(24px, 5vw, 48px)', 
        borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
        textAlign: 'center',
        border: '1px solid hsla(var(--primary), 0.3)',
        boxShadow: '0 0 100px hsla(var(--primary), 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'hsla(var(--primary), 0.2)', filter: 'blur(50px)', borderRadius: '50%' }} />
        
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '24px', 
          background: 'hsla(var(--primary), 0.1)', 
          color: 'hsl(var(--primary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Gift size={40} />
        </div>

        <h2 style={{ fontSize: 'clamp(1.5rem, 8vw, 2.5rem)', fontWeight: 900, marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>DAILY BONUS</h2>
        <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '32px' }}>Welcome back! Here is your daily login reward.</p>

        <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', border: '1px solid hsla(var(--success), 0.2)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--success))', textTransform: 'uppercase', marginBottom: '8px' }}>You Received</div>
          <div style={{ fontSize: 'clamp(2rem, 10vw, 3rem)', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Zap size={24} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
            ${rewardAmount || 0}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{streak} Days</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Current Streak</div>
          </div>
          <div style={{ width: '1px', background: 'hsla(0,0%,100%,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>+15% XP</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Streak Multiplier</div>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', borderRadius: '16px' }}>
          COLLECT REWARD
        </button>
      </div>
    </div>
  );
}
