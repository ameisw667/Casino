'use client';
import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { OrbitCardStack } from '@/components/casino/vip/OrbitCardStack';

interface RankBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RankBenefitsModal({ isOpen, onClose }: RankBenefitsModalProps) {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const level = useCasinoStore((s) => s.level);
  const xp = useCasinoStore((s) => s.xp);
  const rank = useCasinoStore((s) => s.rank);
  const ranks = useCasinoStore((s) => s.ranks);

  const currentRankIndex = Math.max(0, ranks.findIndex((r) => r.name === rank));
  const [selectedTierIndex, setSelectedTierIndex] = useState(
    currentRankIndex >= 0 ? currentRankIndex : 0,
  );
  const selectedRank = ranks[selectedTierIndex] || ranks[0];
  const nextRank = ranks[currentRankIndex + 1];

  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '20px',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
        }}
      />

      <div
        className="glass animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: isMobile ? '32px 32px 0 0' : '32px',
          maxHeight: isMobile ? '90vh' : 'auto',
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid hsla(0,0%,100%,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? '24px' : '32px',
            background: 'hsla(0,0%,100%,0.02)',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '14px',
                background: 'hsla(var(--primary), 0.1)',
                color: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image src="/images/2026-09-06_icon-trophy-record-quantum-gold_v001.png" alt="Rank-Vorteile" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} aria-hidden />
            </div>
            <div>
              <h2
                style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              >
                VIP PROGRESS
              </h2>
              <div
                style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}
              >
                Your journey to the top
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }}>
            <X size={24} />
          </button>
        </div>
        <div
          style={{
            padding: isMobile ? '24px' : '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '24px' : '32px',
          }}
        >
          {/* Current Status */}
          <div
            className="glass-card"
            style={{
              padding: isMobile ? '24px' : '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              border: '1px solid hsla(var(--primary), 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: isMobile ? 80 : 120,
                  height: isMobile ? 80 : 120,
                  backgroundColor: 'hsl(var(--primary))',
                  WebkitMask: 'url(/images/2026-09-06_icon-star-level-quantum-gold_v001.webp) center / contain no-repeat',
                  mask: 'url(/images/2026-09-06_icon-star-level-quantum-gold_v001.webp) center / contain no-repeat',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: 'hsl(var(--primary))',
                    letterSpacing: '0.1em',
                    marginBottom: '4px',
                  }}
                >
                  CURRENT STATUS
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '2rem' : '2.5rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-inter), sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {rank.toUpperCase()}
                </div>
                <div
                  style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}
                >
                  Level {level}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900 }}>
                  {Math.round(progress)}%
                </div>
                <div
                  style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}
                >
                  TO NEXT RANK
                </div>
              </div>
            </div>
            <div
              style={{
                width: '100%',
                height: '10px',
                background: 'hsla(0,0%,100%,0.05)',
                borderRadius: '5px',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', damping: 18, stiffness: 120 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                  borderRadius: '5px',
                  boxShadow: '0 0 20px hsla(var(--primary), 0.5)',
                }}
              />
            </div>
            {nextRank && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'hsl(var(--text-dim))',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Info size={14} />
                Reach level {nextRank.minLevel} for <strong>{nextRank.name}</strong>.
              </div>
            )}
          </div>
          {/* VIP 3D Orbiting Cards Stack */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: 'hsl(var(--text-muted))',
                letterSpacing: '0.1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>VIP CLUB TIERS</span>
              <span style={{ fontSize: '0.7rem', color: '#D4AF37', fontWeight: 800 }}>
                {selectedRank.name.toUpperCase()} PRIVILEGES
              </span>
            </div>

            <OrbitCardStack
              ranks={ranks}
              currentRankName={rank}
              userLevel={level}
              selectedIndex={selectedTierIndex}
              onSelectRank={setSelectedTierIndex}
              isMobile={isMobile}
            />

            {/* Selected Tier Perks Card with Luxury Obsidian & Gold Glass */}
            <div
              className="glass-card"
              style={{
                marginTop: '8px',
                padding: isMobile ? '16px 18px' : '20px 24px',
                borderRadius: '20px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                background: 'rgba(15, 18, 26, 0.75)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: selectedRank.color,
                      boxShadow: '0 0 8px ' + selectedRank.color,
                    }}
                  />
                  <h4
                    style={{
                      margin: 0,
                      fontSize: isMobile ? '1rem' : '1.15rem',
                      fontWeight: 900,
                      color: '#FFF',
                    }}
                  >
                    {selectedRank.name} Privileges
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background:
                      level >= selectedRank.minLevel
                        ? 'rgba(56, 239, 125, 0.15)'
                        : 'rgba(255, 255, 255, 0.08)',
                    color:
                      level >= selectedRank.minLevel
                        ? '#38EF7D'
                        : 'rgba(255, 255, 255, 0.45)',
                    border:
                      '1px solid ' +
                      (level >= selectedRank.minLevel
                        ? 'rgba(56, 239, 125, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)'),
                  }}
                >
                  {level >= selectedRank.minLevel
                    ? 'TIER UNLOCKED'
                    : 'LEVEL ' + selectedRank.minLevel + ' REQUIRED'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedRank.perks.map((perk, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: isMobile ? '0.82rem' : '0.9rem',
                      color: 'hsl(var(--text-dim))',
                    }}
                  >
                    <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>✦</span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
        <div
          style={{
            padding: isMobile ? '24px' : '32px',
            background: 'hsla(0,0%,100%,0.02)',
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center',
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '1.1rem' }}
          >
            BACK TO CASINO
          </button>
        </div>
      </div>
    </div>
  );
}
