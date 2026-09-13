'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import { Rank } from '@/lib/casino/vip-config';

export interface OrbitCardStackProps {
  ranks: Rank[];
  currentRankName: string;
  userLevel: number;
  selectedIndex: number;
  onSelectRank: (index: number) => void;
  isMobile?: boolean;
}

interface TierAesthetic {
  gradient: string;
  borderColor: string;
  accentColor: string;
  glowColor: string;
  textColor: string;
  chipColor: string;
}

const TIER_THEMES: Record<string, TierAesthetic> = {
  Bronze: {
    gradient: 'linear-gradient(135deg, #1C120C 0%, #3D2619 50%, #160D07 100%)',
    borderColor: 'rgba(205, 127, 50, 0.45)',
    accentColor: '#CD7F32',
    glowColor: 'rgba(205, 127, 50, 0.25)',
    textColor: '#F5D3B3',
    chipColor: '#B87333',
  },
  Silver: {
    gradient: 'linear-gradient(135deg, #18191B 0%, #32353A 50%, #141517 100%)',
    borderColor: 'rgba(192, 192, 192, 0.45)',
    accentColor: '#E0E0E0',
    glowColor: 'rgba(220, 220, 220, 0.25)',
    textColor: '#FFFFFF',
    chipColor: '#A8A8A8',
  },
  Gold: {
    gradient: 'linear-gradient(135deg, #1F1706 0%, #453610 50%, #171203 100%)',
    borderColor: 'rgba(212, 175, 55, 0.65)',
    accentColor: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.35)',
    textColor: '#FFF3B3',
    chipColor: '#D4AF37',
  },
  Platinum: {
    gradient: 'linear-gradient(135deg, #161B1E 0%, #2B3840 50%, #0F1316 100%)',
    borderColor: 'rgba(229, 228, 226, 0.55)',
    accentColor: '#E5E4E2',
    glowColor: 'rgba(229, 228, 226, 0.3)',
    textColor: '#F0F4F8',
    chipColor: '#CFD8DC',
  },
  Diamond: {
    gradient: 'linear-gradient(135deg, #090B10 0%, #152233 50%, #05080E 100%)',
    borderColor: 'rgba(185, 242, 255, 0.65)',
    accentColor: '#B9F2FF',
    glowColor: 'rgba(185, 242, 255, 0.4)',
    textColor: '#E1F8FF',
    chipColor: '#80DEEA',
  },
};

export function OrbitCardStack({
  ranks,
  currentRankName,
  userLevel,
  selectedIndex,
  onSelectRank,
  isMobile = false,
}: OrbitCardStackProps) {
  const handlePrev = useCallback(() => {
    onSelectRank(Math.max(0, selectedIndex - 1));
  }, [selectedIndex, onSelectRank]);

  const handleNext = useCallback(() => {
    onSelectRank(Math.min(ranks.length - 1, selectedIndex + 1));
  }, [selectedIndex, ranks.length, onSelectRank]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      {/* 3D Orbit Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '200px' : '230px',
          perspective: 1200,
          perspectiveOrigin: '50% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <AnimatePresence initial={false}>
          {ranks.map((r, idx) => {
            const diff = idx - selectedIndex;
            if (Math.abs(diff) > 2) return null;

            const theme = TIER_THEMES[r.name] || TIER_THEMES.Gold;
            const isSelected = diff === 0;
            const isCurrent = r.name === currentRankName;
            const isUnlocked = userLevel >= r.minLevel;

            // Geometry calculations
            const xOffset = diff * (isMobile ? 120 : 155);
            const zOffset = -Math.abs(diff) * (isMobile ? 70 : 95);
            const rotY = diff * -16;
            const scale = isSelected ? 1.04 : 0.88 - Math.abs(diff) * 0.05;
            const blurAmount = Math.abs(diff) * 2;
            const brightness = isSelected ? 1 : 0.65 - Math.abs(diff) * 0.15;
            const zIndex = 100 - Math.abs(diff) * 10;

            return (
              <motion.div
                key={r.name}
                onClick={() => onSelectRank(idx)}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  rotateY: rotY,
                  scale,
                  opacity: 1,
                  filter: 'blur(' + blurAmount + 'px) brightness(' + brightness + ')',
                }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 26,
                }}
                style={{
                  position: 'absolute',
                  width: isMobile ? '260px' : '310px',
                  height: isMobile ? '160px' : '185px',
                  borderRadius: '16px',
                  background: theme.gradient,
                  border: '1.5px solid ' + (isSelected ? theme.borderColor : 'rgba(255,255,255,0.1)'),
                  boxShadow: isSelected
                    ? '0 16px 36px 0 ' + theme.glowColor + ', inset 0 1px 1px 0 rgba(255,255,255,0.25)'
                    : '0 8px 20px 0 rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  zIndex,
                  transformStyle: 'preserve-3d',
                  padding: isMobile ? '14px 16px' : '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                {/* Metallic Shimmer Reflection */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-60%',
                    left: '-20%',
                    width: '140%',
                    height: '140%',
                    background:
                      'linear-gradient(125deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Card Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={isMobile ? 15 : 18} color={theme.chipColor} />
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        letterSpacing: '0.14em',
                        color: theme.accentColor,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      VIP ROYALE
                    </span>
                  </div>

                  {isCurrent && (
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.45)',
                        color: '#D4AF37',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={11} />
                      CURRENT
                    </span>
                  )}
                </div>

                {/* Card Body / Tier Title */}
                <div style={{ position: 'relative', zIndex: 1, margin: 'auto 0' }}>
                  <div
                    style={{
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      fontWeight: 900,
                      color: theme.textColor,
                      letterSpacing: '-0.02em',
                      fontFamily: 'var(--font-inter), sans-serif',
                      textShadow: '0 2px 10px ' + theme.glowColor,
                    }}
                  >
                    {r.name.toUpperCase()} TIER
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'rgba(255, 255, 255, 0.65)',
                      fontWeight: 600,
                      marginTop: '2px',
                    }}
                  >
                    Required Level {r.minLevel}+
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 1,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} color={theme.accentColor} />
                    <span
                      style={{
                        fontSize: isMobile ? '0.9rem' : '1.05rem',
                        fontWeight: 900,
                        color: theme.accentColor,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      {(r.rakeback * 100).toFixed(1)}%
                    </span>
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.08em',
                        marginLeft: '2px',
                      }}
                    >
                      RAKEBACK
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: isUnlocked ? '#38EF7D' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Orbit Controls / Arrows & Dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '10px',
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={selectedIndex === 0}
          aria-label="Previous VIP Tier"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: selectedIndex === 0 ? 'rgba(255,255,255,0.2)' : '#D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: selectedIndex === 0 ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Orbit Dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {ranks.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectRank(i)}
              aria-label={'Select tier ' + (i + 1)}
              style={{
                width: i === selectedIndex ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === selectedIndex ? '#D4AF37' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={selectedIndex === ranks.length - 1}
          aria-label="Next VIP Tier"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: selectedIndex === ranks.length - 1 ? 'rgba(255,255,255,0.2)' : '#D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: selectedIndex === ranks.length - 1 ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
