'use client';

import React from 'react';
import { Target, CheckCircle2, Zap, Trophy } from 'lucide-react';
import { useCasinoStore, Challenge } from '@/store/useCasinoStore';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengesModal({ isOpen, onClose }: ChallengesModalProps) {
  const { challenges, claimChallenge } = useCasinoStore();

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 2500, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="glass animate-slide-up" style={{ 
        width: '550px', 
        padding: '40px', 
        borderRadius: '32px', 
        border: '1px solid hsla(var(--primary), 0.3)',
        boxShadow: '0 0 100px hsla(var(--primary), 0.1)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '16px' }}>
            <Target size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>DAILY MISSIONS</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Complete these tasks to earn extra balance!</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {challenges.map((challenge) => {
            const isComplete = challenge.current >= challenge.target;
            const progress = (challenge.current / challenge.target) * 100;

            return (
              <div key={challenge.id} className="glass-card" style={{ 
                padding: '24px', 
                border: challenge.isClaimed ? '1px solid hsla(var(--success), 0.2)' : '1px solid hsla(0,0%,100%,0.05)',
                opacity: challenge.isClaimed ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{challenge.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{challenge.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--primary))', fontWeight: 800 }}>
                    <Zap size={14} fill="currentColor" /> ${challenge.reward}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: isComplete ? 'hsl(var(--success))' : 'hsl(var(--text-muted))' }}>
                      {isComplete ? 'Ready to claim!' : `${challenge.current.toLocaleString()} / ${challenge.target.toLocaleString()}`}
                    </span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
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
                    style={{ width: '100%', height: '44px', borderRadius: '12px', fontSize: '0.9rem' }}
                  >
                    {isComplete ? 'CLAIM REWARD' : 'IN PROGRESS'}
                  </button>
                )}
                {challenge.isClaimed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'hsl(var(--success))', fontWeight: 700 }}>
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
