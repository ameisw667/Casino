'use client';

import React from 'react';
import { useCasinoStore, RANKS } from '@/store/useCasinoStore';
import { Star, Shield, Crown, Zap } from 'lucide-react';

interface LevelProgressProps {
  isMobile?: boolean;
}

export default function LevelProgress({ isMobile }: LevelProgressProps) {
  const { level, xp, rank } = useCasinoStore();
  
  // XP Calculation logic matches the store
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
  const xpInCurrentLevel = xp - currentLevelBaseXp;
  const xpRequiredForNextLevel = nextLevelXp - currentLevelBaseXp;
  
  const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  
  const currentRank = RANKS.find(r => r.name === rank) || RANKS[0];

  return (
    <div 
      className="glass-card hover-lift" 
      style={{ 
        padding: isMobile ? '6px 12px' : '8px 20px', 
        borderRadius: 'var(--radius-lg)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        border: `1px solid hsla(var(--primary), 0.2)`,
        background: 'hsla(var(--bg-color), 0.4)',
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{ 
          width: isMobile ? '32px' : '40px', 
          height: isMobile ? '32px' : '40px', 
          borderRadius: '12px', 
          background: `linear-gradient(135deg, ${currentRank.color}44, ${currentRank.color}11)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${currentRank.color}44`,
          color: currentRank.color,
          boxShadow: `0 0 15px ${currentRank.color}22`
        }}>
          {level >= 100 ? <Crown size={20} /> : level >= 50 ? <Shield size={20} /> : <Zap size={20} />}
        </div>
        <div style={{ 
          position: 'absolute', 
          top: -4, 
          right: -4, 
          width: '16px', 
          height: '16px', 
          borderRadius: '50%', 
          background: 'hsl(var(--primary))', 
          color: 'white', 
          fontSize: '0.6rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 900,
          boxShadow: '0 0 10px hsla(var(--primary), 0.5)'
        }}>
          {level}
        </div>
      </div>

      {!isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: currentRank.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {rank}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
              {Math.floor(progress)}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: 'hsla(0, 0%, 100%, 0.05)', 
            borderRadius: '100px', 
            overflow: 'hidden', 
            position: 'relative',
            border: '1px solid hsla(0, 0%, 100%, 0.03)'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              background: `linear-gradient(90deg, ${currentRank.color}, hsl(var(--primary)))`, 
              borderRadius: '100px', 
              transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: `0 0 10px ${currentRank.color}44`
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
