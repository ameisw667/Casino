'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, MotionValue } from 'framer-motion';
import { Rocket, Compass, Shield, Zap, Sparkles } from 'lucide-react';

import { TestingV3FeatureShowcase } from './TestingV3FeatureShowcase';

interface TestingV3MorphCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  isFlipped?: boolean;
  scrollProgress: number;
}

interface VipGameCardData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  multiplier: string;
  image: string;
  pool: string;
  players: string;
  cta: string;
  href: string;
  accentColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const VIP_GAMES: VipGameCardData[] = [
  {
    id: 'crash',
    title: 'CRASH ARENA',
    subtitle: 'LIVE MULTIPLAYER',
    badge: 'HIGH ROLLER',
    multiplier: '28.42x',
    image: '/images/testing-v3/card-back-crash.png',
    pool: 'POOL: 48,250 USDT',
    players: '142 PLAYERS',
    cta: 'JETZT LIVE BEITRETEN',
    href: '/games/crash',
    accentColor: '#10B981',
    Icon: Rocket,
  },
  {
    id: 'roulette',
    title: 'QUANTUM ROULETTE',
    subtitle: 'EUROPEAN ZERO',
    badge: 'HOT TABLE',
    multiplier: '36.00x',
    image: '/images/testing-v3/card-back-roulette.png',
    pool: 'LAST: 7 · 29 · 14 · 0',
    players: 'TABLE: 120,000 USDT',
    cta: 'TISCH BEITRETEN',
    href: '/games/roulette',
    accentColor: '#EF4444',
    Icon: Compass,
  },
  {
    id: 'blackjack',
    title: 'NEON BLACKJACK',
    subtitle: 'VIP FELT 3:2',
    badge: 'DEALER STANDS 17',
    multiplier: '3:2 PAYOUT',
    image: '/images/testing-v3/card-back-blackjack.png',
    pool: 'WIN STREAK: 5x',
    players: 'SIDE BETS 21+3',
    cta: 'PLATZ NEHMEN',
    href: '/games/blackjack',
    accentColor: '#F59E0B',
    Icon: Shield,
  },
  {
    id: 'slots',
    title: 'CYBER SLOTS',
    subtitle: 'MEGAWAYS 117,649',
    badge: 'SCATTER BONUS',
    multiplier: '5,000x MAX',
    image: '/images/testing-v3/card-back-slots.png',
    pool: 'JACKPOT: 248,500 USDT',
    players: 'HOT RTP: 98.4%',
    cta: 'REELS DREHEN',
    href: '/games/slots',
    accentColor: '#D4AF37',
    Icon: Zap,
  },
];

export function TestingV3MorphCard({
  cardRef,
  rotateX,
  rotateY,
  isFlipped: _isFlipped,
  scrollProgress,
}: TestingV3MorphCardProps) {
  const router = useRouter();
  // Card dimensions tailored for majestic 3D presence
  const cardWidth = 320;
  const cardHeight = 445;

  // Werbevideo Scrollytelling Phases:
  // 0.00 - 0.50: Pure Frameless Ace Floating & Singularity Portal Entry
  // 0.50 - 0.58: 180° Morphing Flip into Back Face
  // 0.58 - 0.82: Phase I — 4 VIP Games Deck (Crash -> Roulette -> Blackjack -> Slots)
  // 0.82 - 1.00: Phase II — Feature Showcase (Spiral 3D Stage & Tägliches Turnier)
  const isBackFace = scrollProgress >= 0.54;
  const isFeaturePhase = scrollProgress >= 0.82;

  // VIP Games Deck progression (0.58 to 0.82)
  const deckProgress = Math.max(0, Math.min(1, (scrollProgress - 0.58) / 0.24));
  const activeFloat = deckProgress * 3; // 0.0 to 3.0 (4 games)

  // Feature Showcase progression (0.82 to 1.00)
  const featureProgress = Math.max(0, Math.min(1, (scrollProgress - 0.82) / 0.18));

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transformStyle: 'preserve-3d',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      {/* 3D Morph Container */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {/* =========================================================================
            FRONT FACE: 3D Quantum Ace of Spades (REIN FREIGESTELLT, ZERO BOX / ZERO KASTEN)
            Das A-Artwork schwebt organisch ohne eckigen Kasten oder Umrandung.
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: !isBackFace ? 'flex' : 'none',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          {/* Organisch freigestellte Quantum Ace Playing Card mit natürlichem 3D-Lichtschweif */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              filter:
                'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 45px rgba(212, 175, 55, 0.45))',
              transition: 'transform 0.3s ease',
            }}
          >
            <Image
              src="/images/testing-v3/layer-3-quantum-ace.png"
              alt="Quantum Ace of Spades"
              fill
              sizes="360px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        {/* =========================================================================
            BACK FACE: 3D Multi-Card Deck & Feature Showcase Carousel
            Zero bleed-through: strictly display: none while viewing front face
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: isBackFace ? 'block' : 'none',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Phase II: Spiral 3D Hall of Fame & Tägliches Turnier (Scroll >= 0.82) */}
          {isFeaturePhase ? (
            <TestingV3FeatureShowcase phaseProgress={featureProgress} />
          ) : (
            /* Phase I: 4 VIP Games Kinetisches 3D-Deck (Scroll 0.58 -> 0.82) */
            VIP_GAMES.map((game, i) => {
              const diff = i - activeFloat;
              // Clean spotlight calculation:
              // The active focal card is the one closest to activeFloat
              const isFocal = Math.abs(diff) < 0.5;
              // Visible range: previous card exiting (diff between -1.2 and 0) or next card peeking behind (diff between 0 and 1.5)
              const isVisible = diff >= -1.2 && diff <= 2.0;

              if (!isVisible) {
                return null;
              }

              // Compute 3D kinetic translation, scale, rotation, and explicit zIndex
              let x = 0;
              let y = 0;
              let z = 0;
              let rotZ = 0;
              let scale = 1.0;
              let opacity = 1.0;
              let zIndex = 10;
              let pointerEvents: 'auto' | 'none' = 'none';

              if (diff < -0.05) {
                // Card has completed spotlight and peels off upward and out to the side
                const exit = Math.min(1.2, -diff);
                const isEven = i % 2 === 0;
                x = isEven ? exit * 180 : -exit * 180;
                y = -exit * 30;
                z = exit * 50;
                rotZ = isEven ? exit * 15 : -exit * 15;
                scale = 1 - exit * 0.05;
                opacity = Math.max(0, 1 - exit * 1.5);
                // As it leaves, it shouldn't obscure the newly focal card
                zIndex = Math.max(1, Math.round(5 - exit * 4));
                pointerEvents = 'none';
              } else if (diff > 0.05) {
                // Card is waiting in the stacked deck behind (lower zIndex & pushed lower)
                const depth = Math.min(2, diff);
                const isEven = i % 2 === 0;
                x = 0;
                y = depth * 14;
                z = -depth * 40;
                rotZ = (isEven ? 2.5 : -2.5) * depth;
                scale = 1 - depth * 0.04;
                opacity = Math.max(0, 1 - depth * 0.35);
                zIndex = Math.max(1, 8 - Math.round(depth * 3));
                pointerEvents = 'none';
              } else {
                // Front and center in spotlight
                x = 0;
                y = 0;
                z = 0;
                rotZ = 0;
                scale = 1.0;
                opacity = 1.0;
                zIndex = 20;
                pointerEvents = 'auto';
              }

              return (
                <div
                  key={game.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    backgroundColor: '#0B0E14',
                    background: '#0B0E14',
                    border: isFocal
                      ? `2px solid ${game.accentColor}`
                      : '1.5px solid rgba(212, 175, 55, 0.45)',
                    boxShadow: `
                    0 30px 60px -10px rgba(0, 0, 0, 0.98),
                    0 0 45px ${isFocal ? game.accentColor + '55' : 'rgba(212, 175, 55, 0.25)'}
                  `,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px',
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rotZ}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    pointerEvents,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    willChange: 'transform, opacity',
                  }}
                >
                  {/* Inner Card Content: Only visible when card is focal or nearly focal (diff <= 0.45) */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: isFocal ? 1 : Math.max(0, 1 - Math.abs(diff) * 2),
                      visibility: Math.abs(diff) < 0.6 ? 'visible' : 'hidden',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    {/* Micro Deck Progress Indicator (4 Segments) */}
                    <div style={{ display: 'flex', gap: '4px', width: '100%', zIndex: 2 }}>
                      {VIP_GAMES.map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          style={{
                            flex: 1,
                            height: '2.5px',
                            borderRadius: '9999px',
                            background:
                              Math.abs(dotIdx - activeFloat) < 0.5
                                ? game.accentColor
                                : 'rgba(255, 255, 255, 0.15)',
                            transition: 'background 0.2s ease',
                          }}
                        />
                      ))}
                    </div>

                    {/* Top Status Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 2,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: `${game.accentColor}22`,
                            border: `1px solid ${game.accentColor}66`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: game.accentColor,
                          }}
                        >
                          <game.Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              color: '#FFF',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {game.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.62rem',
                              color: game.accentColor,
                              fontFamily: 'var(--font-mono, monospace)',
                              fontWeight: 700,
                            }}
                          >
                            {game.subtitle}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: game.accentColor,
                          textShadow: `0 0 12px ${game.accentColor}88`,
                        }}
                      >
                        {game.multiplier}
                      </div>
                    </div>

                    {/* Central Artwork Preview */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '190px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: `radial-gradient(circle at center, ${game.accentColor}18 0%, transparent 70%)`,
                      }}
                    >
                      <Image
                        src={game.image}
                        alt={game.title}
                        fill
                        sizes="280px"
                        style={{ objectFit: 'cover' }}
                      />
                      {/* Live Badge Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(8px)',
                          border: `1px solid ${game.accentColor}66`,
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.65rem',
                          color: game.accentColor,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles className="h-3 w-3" />
                        {game.badge}
                      </div>
                    </div>

                    {/* Bottom Interactive Launch Bar */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        <span>{game.pool}</span>
                        <span style={{ color: '#FFDF73' }}>{game.players}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(game.href);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                          border: 'none',
                          color: '#0B0E14',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 900,
                          fontSize: '0.85rem',
                          letterSpacing: '0.08em',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                        {game.cta}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
