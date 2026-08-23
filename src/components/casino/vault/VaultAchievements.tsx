'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronRight, Lock, Trophy, X } from 'lucide-react';
import type { Achievement } from '@/lib/casino/achievements-config';
import { getAchievementPresentation } from '@/lib/casino/achievement-presentation';
import { card } from './vault-card';

interface VaultAchievementsProps {
  achievements: Achievement[];
  isMobile: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
  compact: boolean;
}

function AchievementCard({ achievement, compact }: AchievementCardProps) {
  const presentation = getAchievementPresentation(achievement);
  const progressPercent =
    presentation.showProgress && achievement.total > 0
      ? Math.min(100, Math.max(0, (achievement.progress / achievement.total) * 100))
      : 0;

  return (
    <div
      style={{
        padding: compact ? '16px 12px' : '18px 14px',
        background: achievement.unlocked ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
        borderRadius: compact ? '12px' : '14px',
        border: `1px solid ${achievement.unlocked ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)'}`,
        textAlign: 'center',
        position: 'relative',
        opacity: presentation.isMystery ? 0.72 : compact && !achievement.unlocked ? 0.6 : 1,
      }}
    >
      <div
        style={{
          fontSize: compact ? '1.5rem' : '1.8rem',
          marginBottom: compact ? '6px' : '8px',
          filter:
            achievement.unlocked || presentation.isMystery
              ? 'none'
              : 'grayscale(1) brightness(0.4)',
        }}
      >
        {presentation.icon.startsWith('/') ? (
          <Image
            src={presentation.icon}
            alt={presentation.title}
            width={compact ? 40 : 44}
            height={compact ? 40 : 44}
            style={{ objectFit: 'contain', margin: '0 auto' }}
          />
        ) : (
          presentation.icon
        )}
      </div>
      <div
        style={{
          fontSize: compact ? '0.65rem' : '0.75rem',
          fontWeight: 800,
          color: achievement.unlocked ? '#fff' : 'rgba(255,255,255,0.6)',
          letterSpacing: presentation.isMystery ? '0.06em' : undefined,
        }}
      >
        {presentation.title}
      </div>
      <div
        style={{
          fontSize: compact ? '0.55rem' : '0.6rem',
          fontWeight: 500,
          color: achievement.unlocked ? '#D4AF37' : 'rgba(255,255,255,0.35)',
          marginTop: compact ? '3px' : '4px',
          lineHeight: compact ? '1.2' : '1.3',
        }}
      >
        {presentation.description}
      </div>
      {presentation.showProgress && (
        <>
          <div
            style={{
              marginTop: compact ? '8px' : '10px',
              height: compact ? '3px' : '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '2px',
                width: `${progressPercent}%`,
                background: '#D4AF37',
                transition: 'width 0.5s',
              }}
            />
          </div>
          <div
            style={{
              marginTop: '5px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: compact ? '0.55rem' : '0.6rem',
              fontWeight: 700,
              color: 'rgba(212,175,55,0.8)',
            }}
          >
            {achievement.progress.toLocaleString()} / {achievement.total.toLocaleString()}
          </div>
        </>
      )}
      {!achievement.unlocked && (
        <Lock
          size={compact ? 9 : 10}
          style={{
            position: 'absolute',
            top: compact ? 8 : 10,
            right: compact ? 8 : 10,
            opacity: 0.3,
            color: 'white',
          }}
        />
      )}
      {achievement.unlocked && (
        <CheckCircle2
          size={compact ? 11 : 12}
          style={{
            position: 'absolute',
            top: compact ? 8 : 10,
            right: compact ? 8 : 10,
            color: '#D4AF37',
          }}
        />
      )}
    </div>
  );
}

export function VaultAchievements({ achievements, isMobile }: VaultAchievementsProps) {
  const [showAllAchievementsModal, setShowAllAchievementsModal] = useState(false);

  return (
    <>
      <div style={{ ...card({ padding: isMobile ? '24px 16px' : '28px' }) }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={16} color="#D4AF37" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>ACHIEVEMENTS</span>
          </div>
          <button
            onClick={() => setShowAllAchievementsModal(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'rgba(212,175,55,0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            ALL <ChevronRight size={11} />
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {achievements.slice(0, 6).map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} compact />
          ))}
        </div>
      </div>

      {showAllAchievementsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAllAchievementsModal(false)}
        >
          <div
            style={{
              ...card({
                padding: isMobile ? '24px 16px' : '32px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '85vh',
              }),
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={20} color="#D4AF37" />
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  ALL ACHIEVEMENTS
                </span>
              </div>
              <button
                onClick={() => setShowAllAchievementsModal(false)}
                aria-label="Close achievements"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} compact={false} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
