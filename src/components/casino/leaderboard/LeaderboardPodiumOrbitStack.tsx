'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown, Trophy, Medal, Sparkles } from 'lucide-react';
import { resolvePlayerAvatar } from '@/lib/casino/player-avatar';
import type { LeaderRow } from '@/components/leaderboard/LeaderboardStreamTable';

export interface LeaderboardPodiumOrbitStackProps {
  topThree: LeaderRow[];
  isMobile?: boolean;
}

interface PodiumTierMeta {
  rank: number;
  label: string;
  badge: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
  accentText: string;
  icon: typeof Trophy;
  baseRotateY: number;
  baseY: number;
  baseScale: number;
  zIndex: number;
}

const PODIUM_CONFIG: Record<number, PodiumTierMeta> = {
  1: {
    rank: 1,
    label: 'Platz 1 · Champion',
    badge: 'CHAMPION',
    gradient: 'linear-gradient(145deg, rgba(35, 28, 12, 0.95) 0%, rgba(18, 14, 6, 0.98) 100%)',
    borderColor: 'rgba(212, 175, 55, 0.75)',
    glowColor: 'rgba(212, 175, 55, 0.35)',
    accentColor: '#D4AF37',
    accentText: '#FFF3B3',
    icon: Crown,
    baseRotateY: 0,
    baseY: -16,
    baseScale: 1.05,
    zIndex: 10,
  },
  2: {
    rank: 2,
    label: 'Platz 2 · Platinum',
    badge: 'PLATINUM',
    gradient: 'linear-gradient(145deg, rgba(28, 32, 38, 0.92) 0%, rgba(14, 16, 20, 0.96) 100%)',
    borderColor: 'rgba(229, 228, 226, 0.55)',
    glowColor: 'rgba(229, 228, 226, 0.25)',
    accentColor: '#E5E4E2',
    accentText: '#FFFFFF',
    icon: Trophy,
    baseRotateY: 8,
    baseY: 0,
    baseScale: 0.98,
    zIndex: 5,
  },
  3: {
    rank: 3,
    label: 'Platz 3 · Bronze',
    badge: 'BRONZE',
    gradient: 'linear-gradient(145deg, rgba(32, 20, 14, 0.92) 0%, rgba(16, 10, 7, 0.96) 100%)',
    borderColor: 'rgba(205, 127, 50, 0.5)',
    glowColor: 'rgba(205, 127, 50, 0.22)',
    accentColor: '#CD7F32',
    accentText: '#F5D3B3',
    icon: Medal,
    baseRotateY: -8,
    baseY: 0,
    baseScale: 0.98,
    zIndex: 4,
  },
};

export function LeaderboardPodiumOrbitStack({
  topThree,
  isMobile = false,
}: LeaderboardPodiumOrbitStackProps) {
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const prefersReduced = useReducedMotion();
  const isReduced = Boolean(prefersReduced);

  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  // Desktop visual order: Rank 2 (left), Rank 1 (center), Rank 3 (right)
  const slots = [
    { player: second, rank: 2 },
    { player: first, rank: 1 },
    { player: third, rank: 3 },
  ];

  return (
    <div
      style={{
        perspective: isReduced || isMobile ? 'none' : '1200px',
        width: '100%',
        margin: '8px 0 24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1.08fr 1fr',
          gap: isMobile ? '12px' : '20px',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          position: 'relative',
        }}
      >
        {slots.map(({ player, rank }) => {
          if (!player) return null;
          const meta = PODIUM_CONFIG[rank];
          const isSelected = selectedRank === rank;
          const avatar = resolvePlayerAvatar(player.username);
          const Icon = meta.icon;

          return (
            <motion.div
              key={rank}
              onClick={() => setSelectedRank(rank)}
              initial={isReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: isMobile ? 0 : isSelected ? meta.baseY - 8 : meta.baseY,
                scale: isMobile ? 1 : isSelected ? meta.baseScale * 1.02 : meta.baseScale,
                rotateY: isReduced || isMobile ? 0 : isSelected ? 0 : meta.baseRotateY,
              }}
              whileHover={
                isReduced || isMobile
                  ? undefined
                  : {
                      scale: meta.baseScale * 1.04,
                      y: meta.baseY - 12,
                      rotateY: 0,
                    }
              }
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 24,
                mass: 0.15,
              }}
              style={{
                position: 'relative',
                borderRadius: '18px',
                background: meta.gradient,
                border: `1.5px solid ${isSelected ? meta.accentColor : meta.borderColor}`,
                boxShadow: isSelected
                  ? `0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px ${meta.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                  : `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 16px ${meta.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
                padding: isMobile ? '16px' : rank === 1 ? '24px 26px' : '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                zIndex: isSelected ? 20 : meta.zIndex,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Metallic Card Top Shimmer Strip */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '15%',
                  right: '15%',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent 0%, ${meta.accentColor} 50%, transparent 100%)`,
                  opacity: isSelected ? 1 : 0.6,
                }}
              />

              {/* Header: Rank Chip & Trophy */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: `1px solid ${meta.borderColor}`,
                    color: meta.accentColor,
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.06em',
                  }}
                >
                  <Icon size={14} style={{ color: meta.accentColor }} />
                  {meta.label}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#8A8A8A',
                  }}
                >
                  <Sparkles size={12} style={{ color: meta.accentColor }} />
                  LVL {player.level ?? 1}
                </div>
              </div>

              {/* Avatar & User Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: rank === 1 ? '56px' : '48px',
                    height: rank === 1 ? '56px' : '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${meta.accentColor}`,
                    boxShadow: `0 0 16px ${meta.glowColor}`,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={avatar.src}
                    alt={player.username}
                    fill
                    sizes="(max-width: 768px) 48px, 56px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: rank === 1 ? '1.15rem' : '1rem',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {player.username}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: meta.accentColor,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {player.rank || meta.badge}
                  </div>
                </div>
              </div>

              {/* Wagered Amount Highlight (Haute Horlogerie Monospace) */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#737373',
                  }}
                >
                  Wagered
                </span>
                <span
                  style={{
                    fontSize: rank === 1 ? '1.25rem' : '1.1rem',
                    fontFamily: 'var(--font-mono), monospace',
                    fontWeight: 900,
                    color: meta.accentText,
                    textShadow: `0 0 12px ${meta.glowColor}`,
                  }}
                >
                  ${player.total_wagered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
