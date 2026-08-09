'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Flame } from 'lucide-react';
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
    image: '/images/game-roulette-new.png',
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const filteredGames = GAMES.filter((g) => {
    if (activeCategory === 'all') return true;
    return g.category === activeCategory;
  });

  return (
    <section style={{ marginBottom: '60px' }}>
      {/* Header & Category Tabs */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#D4AF37',
              fontSize: '0.8rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              marginBottom: '6px',
            }}
          >
            <Flame size={16} /> CASINO ORIGINALS
          </div>
          <h2
            style={{
              fontSize: isMobile ? '1.8rem' : '2.4rem',
              fontWeight: 1000,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            INTERAKTIVE SPIELHALLEN
          </h2>
        </div>

        {/* Category Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            maxWidth: '100%',
            paddingBottom: '4px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategory(cat.id);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: isActive
                    ? 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#000' : 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
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

      {/* Game Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, idx) => {
            const isHovered = hoveredGame === game.id;
            return (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredGame(game.id);
                }}
                onMouseLeave={() => setHoveredGame(null)}
                style={{ position: 'relative' }}
              >
                <Link href={game.path} style={{ textDecoration: 'none', outline: 'none' }}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      position: 'relative',
                      borderRadius: '20px',
                      background:
                        'linear-gradient(145deg, rgba(24, 24, 32, 0.78) 0%, rgba(12, 12, 18, 0.88) 100%)',
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${isHovered ? game.accentColor : 'rgba(255, 255, 255, 0.12)'}`,
                      overflow: 'hidden',
                      padding: '20px',
                      boxShadow: isHovered
                        ? `inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 20px 50px -10px ${game.accentColor}40, 0 0 30px ${game.accentColor}20`
                        : 'inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 15px 35px rgba(0, 0, 0, 0.6)',
                      transition: 'border 0.3s ease, box-shadow 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      minHeight: '340px',
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
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${game.accentColor}25 0%, transparent 70%)`,
                        filter: 'blur(40px)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Top Card Badges */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: game.accentColor,
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {game.badge}
                      </span>

                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        <span style={{ color: '#00E701' }}>PROVABLY FAIR</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Max {game.maxPayout}</span>
                      </div>
                    </div>

                    {/* Card Center Artwork Showcase */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '160px',
                        margin: '12px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <motion.div
                        animate={
                          isHovered
                            ? { scale: 1.1, rotate: [0, -2, 2, 0] }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{ duration: 0.4 }}
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
                          sizes="300px"
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
                              borderRadius: '12px',
                            }}
                          >
                            <div
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${game.accentColor} 0%, #000 150%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 30px ${game.accentColor}`,
                              }}
                            >
                              <Play
                                size={24}
                                fill="#000"
                                color="#000"
                                style={{ marginLeft: '3px' }}
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
                          fontSize: '1.2rem',
                          fontWeight: 1000,
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                          marginBottom: '4px',
                        }}
                      >
                        {game.name}
                      </div>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0,
                          lineHeight: 1.35,
                        }}
                      >
                        {game.description}
                      </p>
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
