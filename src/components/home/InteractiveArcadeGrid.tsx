'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Flame, Sparkles, ChevronRight } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface GameItem {
  id: string;
  name: string;
  category: 'originals' | 'table' | 'top_games';
  path: string;
  image: string;
  maxPayout: string;
  badge: string;
  description: string;
  accentColor: string;
}

const GAMES: GameItem[] = [
  {
    id: 'crash',
    name: 'CRASH ROCKET',
    category: 'originals',
    path: '/games/crash',
    image: '/images/game-crash-new.png',
    maxPayout: '10,000x',
    badge: 'HOT ORIGINALS',
    description: 'Multiplikator steigt in Echtzeit. Cashout vor dem Crash!',
    accentColor: '#FF4500',
  },
  {
    id: 'blackjack',
    name: 'VIP BLACKJACK',
    category: 'table',
    path: '/games/blackjack',
    image: '/images/game-blackjack-new.png',
    maxPayout: '2.5x',
    badge: 'HIGH STAKES',
    description: 'Klassisches 21 mit Dealer. Double Down & Split Strategien.',
    accentColor: '#D4AF37',
  },
  {
    id: 'dice',
    name: 'ULTIMATE DICE',
    category: 'top_games',
    path: '/games/dice',
    image: '/images/game-dice-new.png',
    maxPayout: '990x',
    badge: 'PROVABLY FAIR',
    description: 'Wähle dein Gewinn-Ziel von 1-98%. Instant Roll Engine.',
    accentColor: '#00E701',
  },
  {
    id: 'roulette',
    name: 'ROYALE ROULETTE',
    category: 'table',
    path: '/games/roulette',
    image: '/images/game-roulette-new.png',
    maxPayout: '36x',
    badge: 'CLASSIC',
    description: 'Europäisches Kesselspiel mit Red/Black & Straight-Betting.',
    accentColor: '#9370DB',
  },
  {
    id: 'slots',
    name: 'NEON 777 SLOTS',
    category: 'top_games',
    path: '/games/slots',
    image: '/images/lucky-777-neon-3d.png',
    maxPayout: '5,000x',
    badge: 'JACKPOT',
    description: '5-Reel Cyber Slot mit Scatter, Free Spins & Hold-Win Bonus.',
    accentColor: '#FF007F',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'ALLE SPIELE' },
  { id: 'originals', label: 'ORIGINALS' },
  { id: 'top_games', label: 'TOP SPIELE' },
  { id: 'table', label: 'TISCHSPIELE' },
];

export const InteractiveArcadeGrid: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const filteredGames = GAMES.filter((g) => {
    if (selectedCategory === 'all') return true;
    return g.category === selectedCategory;
  });

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        maxWidth: '1560px',
        margin: '0 auto',
        padding: '0 24px 36px',
      }}
    >
      {/* Grid Header with Category Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#D4AF37',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            <Sparkles size={12} /> INTERAKTIVE SPIELHALLE
          </div>
          <h2
            style={{
              fontSize: isMobile ? '1.3rem' : '1.75rem',
              fontWeight: 1000,
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            CASINO ORIGINALS
          </h2>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            width: isMobile ? '100%' : 'auto',
            paddingBottom: isMobile ? '4px' : '0',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: isActive
                    ? 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#000' : 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 20px rgba(212, 175, 55, 0.3)' : 'none',
                }}
              >
                {cat.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Game Cards Grid (5 Columns on Desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, minmax(0, 1fr))',
          gap: '16px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, idx) => {
            const isHovered = hoveredGame === game.id;
            return (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredGame(game.id);
                  if (typeof document !== 'undefined') {
                    document.documentElement.style.setProperty(
                      '--lobby-hover-accent',
                      game.accentColor,
                    );
                  }
                }}
                onMouseLeave={() => {
                  setHoveredGame(null);
                  if (typeof document !== 'undefined') {
                    document.documentElement.style.removeProperty('--lobby-hover-accent');
                  }
                }}
                style={{ position: 'relative' }}
              >
                <Link href={game.path} style={{ textDecoration: 'none', outline: 'none' }}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      position: 'relative',
                      borderRadius: '18px',
                      background:
                        'linear-gradient(145deg, rgba(24, 24, 32, 0.78) 0%, rgba(12, 12, 18, 0.88) 100%)',
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${isHovered ? game.accentColor : 'rgba(255, 255, 255, 0.1)'}`,
                      overflow: 'hidden',
                      padding: '16px 14px',
                      boxShadow: isHovered
                        ? `inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 16px 40px -8px ${game.accentColor}35, 0 0 25px ${game.accentColor}20`
                        : 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 12px 28px rgba(0, 0, 0, 0.55)',
                      transition: 'border 0.3s ease, box-shadow 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      minHeight: '305px',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Background Subtle Glow */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-20%',
                        width: '180px',
                        height: '180px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${game.accentColor}25 0%, transparent 70%)`,
                        filter: 'blur(35px)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Top Card Badges */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: '5px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: game.accentColor,
                          fontSize: '0.64rem',
                          fontWeight: 900,
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {game.badge}
                      </span>

                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Max {game.maxPayout}
                      </div>
                    </div>

                    {/* Card Center Artwork Showcase */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '135px',
                        margin: '10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <motion.div
                        animate={
                          isHovered
                            ? { scale: 1.08, rotate: [0, -1.5, 1.5, 0] }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{ duration: 0.35 }}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          src={game.image}
                          alt={game.name}
                          fill
                          sizes="280px"
                          style={{ objectFit: 'cover' }}
                        />
                      </motion.div>

                      {/* Hover Overlay Play Icon */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0, 0, 0, 0.4)',
                              backdropFilter: 'blur(4px)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '10px',
                            }}
                          >
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${game.accentColor} 0%, #000 150%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 24px ${game.accentColor}`,
                              }}
                            >
                              <Play
                                size={20}
                                fill="#000"
                                color="#000"
                                style={{ marginLeft: '2px' }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Card Bottom Meta */}
                    <div style={{ zIndex: 2 }}>
                      <div
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 1000,
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                          marginBottom: '2px',
                        }}
                      >
                        {game.name}
                      </div>

                      <div
                        style={{
                          fontSize: '0.66rem',
                          color: 'rgba(255, 255, 255, 0.58)',
                          lineHeight: 1.35,
                          height: '2.7em',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          marginBottom: '8px',
                        }}
                      >
                        {game.description}
                      </div>

                      {/* Launch Trigger Button */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            color: game.accentColor,
                            letterSpacing: '0.04em',
                          }}
                        >
                          SPIELEN
                        </span>
                        <ChevronRight
                          size={14}
                          color={game.accentColor}
                          style={{
                            transform: isHovered ? 'translateX(3px)' : 'none',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};
