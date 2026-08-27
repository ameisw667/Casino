'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, ChevronRight, Layers, Flame, Gamepad2, Rocket, RotateCcw } from 'lucide-react';
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
  { id: 'all', label: 'ALLE SPIELE', icon: Layers },
  { id: 'originals', label: 'ORIGINALS', icon: Rocket },
  { id: 'top_games', label: 'TOP SPIELE', icon: Flame },
  { id: 'table', label: 'TISCHSPIELE', icon: Gamepad2 },
];

export const InteractiveArcadeGrid: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
        padding: isMobile ? '0 12px 28px' : '0 24px 36px',
      }}
    >
      {/* Quick-Launch "Zuletzt Gespielt" Bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: isMobile ? '12px' : '16px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          borderRadius: '14px',
          background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(20, 22, 30, 0.8) 50%, rgba(12, 14, 20, 0.9) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: isMobile ? '8px' : '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px' }}>
          <div
            style={{
              width: isMobile ? '24px' : '28px',
              height: isMobile ? '24px' : '28px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
              flexShrink: 0,
            }}
          >
            <RotateCcw size={isMobile ? 12 : 14} />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '0.58rem' : '0.62rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ZULETZT GESPIELT
            </div>
            <div style={{ fontSize: isMobile ? '0.74rem' : '0.82rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
              CRASH ROCKET <span style={{ color: '#D4AF37', fontSize: isMobile ? '0.66rem' : '0.72rem', fontWeight: 800 }}>• 2.50x</span>
            </div>
          </div>
        </div>

        <Link href="/games/crash" style={{ textDecoration: 'none' }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
              border: 'none',
              color: '#000',
              fontWeight: 950,
              fontSize: isMobile ? '0.66rem' : '0.72rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
            }}
          >
            <Play size={10} fill="#000" />
            <span>FORTSETZEN</span>
            <ChevronRight size={11} />
          </motion.button>
        </Link>
      </motion.div>

      {/* Grid Header with Category Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '12px',
          marginBottom: isMobile ? '12px' : '18px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#D4AF37',
              fontSize: isMobile ? '0.68rem' : '0.72rem',
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
              fontSize: isMobile ? '1.25rem' : '1.75rem',
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
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat.id);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: isMobile ? '5px 10px' : '7px 14px',
                  borderRadius: '10px',
                  border: isActive
                    ? '1px solid #D4AF37'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive
                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.75)',
                  fontSize: isMobile ? '0.66rem' : '0.74rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 0 16px rgba(212, 175, 55, 0.35)' : 'none',
                }}
              >
                <Icon size={isMobile ? 11 : 13} />
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Game Cards Grid (2 Columns on Mobile, 5 Columns on Desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))',
          gap: isMobile ? '10px' : '16px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, idx) => {
            const isSpan2 = isMobile && filteredGames.length % 2 === 1 && idx === filteredGames.length - 1;
            return (
              <ArcadeGameCard
                key={game.id}
                game={game}
                idx={idx}
                isMobile={isMobile}
                isFeatured={game.id === 'crash'}
                isSpan2={isSpan2}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

function ArcadeGameCard({
  game,
  idx,
  isMobile,
  isFeatured = false,
  isSpan2 = false,
}: {
  game: GameItem;
  idx: number;
  isMobile: boolean;
  isFeatured?: boolean;
  isSpan2?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -6;
    const rY = ((x - centerX) / centerX) * 6;
    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseEnter = () => {
    soundManager.playHover();
    setIsHovered(true);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--lobby-hover-accent', game.accentColor);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty('--lobby-hover-accent');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, delay: idx * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        perspective: 1000,
        gridColumn: isSpan2 ? '1 / -1' : 'auto',
      }}
    >
      {/* 3D Stage Spotlight Aura for Featured Game */}
      {isFeatured && (
        <div
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '24px',
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.1) 55%, transparent 75%)',
            filter: 'blur(14px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <Link href={game.path} style={{ textDecoration: 'none', outline: 'none', display: 'block', height: '100%' }}>
        <motion.div
          whileTap={{ scale: 0.96 }}
          animate={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            scale: isHovered ? 1.03 : 1,
            y: isHovered ? -6 : 0,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{
            position: 'relative',
            borderRadius: '18px',
            background:
              'linear-gradient(145deg, rgba(24, 24, 32, 0.78) 0%, rgba(12, 12, 18, 0.88) 100%)',
            backdropFilter: 'blur(16px)',
            border: isHovered
              ? `1.5px solid ${game.accentColor}`
              : isFeatured
                ? '1.5px solid rgba(212, 175, 55, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            padding: isMobile ? '10px 10px 8px' : '16px 14px',
            boxShadow: isHovered
              ? `inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 16px 40px -8px ${game.accentColor}35, 0 0 25px ${game.accentColor}20`
              : isFeatured
                ? 'inset 0 1px 2px rgba(212, 175, 55, 0.35), 0 14px 34px rgba(212, 175, 55, 0.2), 0 8px 24px rgba(0, 0, 0, 0.6)'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 12px 28px rgba(0, 0, 0, 0.55)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: isMobile ? 'auto' : '305px',
            justifyContent: 'space-between',
            textDecoration: 'none',
            transformStyle: 'preserve-3d',
            zIndex: 1,
          }}
        >
          {/* Dynamic Light Sheen Reflex */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '18px',
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`,
              opacity: glare.opacity,
              transition: 'opacity 0.25s ease',
              mixBlendMode: 'overlay',
              zIndex: 15,
            }}
          />

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
              gap: isMobile ? '4px' : '6px',
              zIndex: 2,
              minWidth: 0,
            }}
          >
            {isFeatured ? (
              <span
                style={{
                  fontSize: isMobile ? '0.52rem' : '0.58rem',
                  fontWeight: 950,
                  color: '#FFD700',
                  background:
                    'linear-gradient(135deg, rgba(212, 175, 55, 0.28) 0%, rgba(212, 175, 55, 0.12) 100%)',
                  padding: isMobile ? '1px 5px' : '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(212, 175, 55, 0.55)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                MEISTGESPIELT
              </span>
            ) : (
              <span
                style={{
                  padding: isMobile ? '1px 5px' : '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: game.accentColor,
                  fontSize: isMobile ? '0.54rem' : '0.62rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {game.badge}
              </span>
            )}

            <div
              style={{
                fontSize: isMobile ? '0.56rem' : '0.66rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.65)',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {isMobile ? game.maxPayout : `Max ${game.maxPayout}`}
            </div>
          </div>

          {/* Card Center Artwork */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: isMobile ? '95px' : '135px',
              margin: isMobile ? '6px 0 6px' : '10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{
                scale: isHovered ? 1.04 : 1,
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
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
                sizes={isMobile ? '160px' : '280px'}
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
          </div>

          {/* Card Bottom Meta */}
          <div style={{ zIndex: 2 }}>
            <div
              style={{
                fontSize: isMobile ? '0.82rem' : '0.96rem',
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
                display: isMobile ? 'none' : '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                marginBottom: '4px',
              }}
            >
              {game.description}
            </div>

            {/* Launch Trigger Button */}
            <div
              style={{
                marginTop: '4px',
                paddingTop: isHovered ? '0' : '6px',
                borderTop: isHovered ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <motion.div
                animate={{
                  background: isHovered
                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA8010 100%)'
                    : 'transparent',
                  color: isHovered ? '#000000' : game.accentColor,
                  boxShadow: isHovered ? '0 4px 18px rgba(212, 175, 55, 0.45)' : 'none',
                }}
                transition={{ duration: 0.18 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isHovered ? 'center' : 'space-between',
                  gap: '5px',
                  height: isHovered ? '32px' : '22px',
                  borderRadius: '8px',
                  fontWeight: 950,
                  fontSize: isMobile ? '0.62rem' : '0.68rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: isHovered ? '0 12px' : '0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isHovered && <Play size={10} fill="#000" color="#000" />}
                  <span>{isHovered ? 'JETZT SPIELEN' : 'SPIELEN'}</span>
                </div>
                <ChevronRight
                  size={12}
                  color={isHovered ? '#000000' : game.accentColor}
                  style={{
                    transform: isHovered ? 'translateX(2px)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
