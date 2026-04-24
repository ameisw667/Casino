'use client';

import React from 'react';
import { Target, CheckCircle2, Zap, Trophy } from 'lucide-react';
import { useCasinoStore, Challenge } from '@/store/useCasinoStore';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengesModal({ isOpen, onClose }: ChallengesModalProps) {
  const { isMobile, challenges, claimChallenge } = useCasinoStore();

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
        width: isMobile ? '100%' : 'min(95vw, 550px)', 
        padding: isMobile ? '32px 20px' : 'clamp(20px, 5vw, 40px)', 
        borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
        border: '1px solid hsla(var(--primary), 0.3)',
        boxShadow: '0 0 100px hsla(var(--primary), 0.1)',
        position: 'relative',
        maxHeight: isMobile ? '90vh' : '85vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6, fontSize: '20px' }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '10px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '12px' }}>
            <Target size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : 'clamp(1.2rem, 5vw, 1.75rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>DAILY MISSIONS</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>Complete tasks to earn rewards!</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {challenges.map((challenge) => {
            const isComplete = challenge.current >= challenge.target;
            const progress = (challenge.current / challenge.target) * 100;

            return (
              <div key={challenge.id} className="glass-card" style={{ 
                padding: isMobile ? '16px' : '24px', 
                border: challenge.isClaimed ? '1px solid hsla(var(--success), 0.2)' : '1px solid hsla(0,0%,100%,0.05)',
                opacity: challenge.isClaimed ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 800 }}>{challenge.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{challenge.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Zap size={14} fill="currentColor" /> ${challenge.reward}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: isComplete ? 'hsl(var(--success))' : 'hsl(var(--text-muted))' }}>
                      {isComplete ? 'Ready to claim!' : `${challenge.current.toLocaleString()} / ${challenge.target.toLocaleString()}`}
                    </span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      background: isComplete ? 'hsl(var(--success))' : 'hsl(var(--primary))',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {!challenge.isClaimed && (
                  <button 
                    disabled={!isComplete}
                    onClick={() => claimChallenge(challenge.id)}
                    className={isComplete ? "btn btn-primary" : "btn btn-secondary"}
                    style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '0.9rem' }}
                  >
                    {isComplete ? 'CLAIM REWARD' : 'IN PROGRESS'}
                  </button>
                )}
                {challenge.isClaimed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'hsl(var(--success))', fontWeight: 700, height: '48px' }}>
                    <CheckCircle2 size={16} /> CLAIMED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
