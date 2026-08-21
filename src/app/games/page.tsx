'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  RotateCcw,
  CircleDollarSign,
  Zap,
  Spade,
  ShieldCheck,
  Star,
  Flame,
  Play,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { soundManager } from '@/lib/casino/sound-manager';

type GameId = 'crash' | 'dice' | 'roulette' | 'slots' | 'blackjack';

interface GameMeta {
  id: GameId;
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  desc: string;
  path: string;
  color: string;
  accentColor: string;
  reward: string;
  rating: string;
  category: 'HOT' | 'NEW' | 'JACKPOT';
  tags: ('ORIGINALS' | 'TABLE' | 'SLOTS' | 'HIGH ROLLER')[];
  studio: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  preview: string;
}

const GAMES: readonly GameMeta[] = [
  {
    id: 'crash',
    name: 'Crash',
    icon: TrendingUp,
    desc: 'Rising multiplier — cash out before it crashes.',
    path: '/games/crash',
    color: '#D4AF37',
    accentColor: '#D4AF37',
    reward: '$500.00',
    rating: '4.9',
    category: 'HOT',
    tags: ['ORIGINALS', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Medium',
    preview: '/images/games/crash-preview.png',
  },
  {
    id: 'dice',
    name: 'Dice',
    icon: RotateCcw,
    desc: 'Custom odds. Predict the roll, multiply winnings.',
    path: '/games/dice',
    color: '#00F0FF',
    accentColor: '#00F0FF',
    reward: '$250.00',
    rating: '4.7',
    category: 'NEW',
    tags: ['ORIGINALS'],
    studio: 'VIBE PRIME',
    difficulty: 'Easy',
    preview: '/images/games/dice-preview.png',
  },
  {
    id: 'roulette',
    name: 'Roulette',
    icon: CircleDollarSign,
    desc: 'Classic casino. High-stakes payouts, 0–36.',
    path: '/games/roulette',
    color: '#FF0055',
    accentColor: '#FF0055',
    reward: '$1,000.00',
    rating: '4.8',
    category: 'HOT',
    tags: ['ORIGINALS', 'TABLE', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Hard',
    preview: '/images/games/roulette-preview.png',
  },
  {
    id: 'slots',
    name: 'Slots',
    icon: Zap,
    desc: 'Infinite reels. Legendary jackpots waiting.',
    path: '/games/slots',
    color: '#FFE600',
    accentColor: '#FFE600',
    reward: '$5,000.00',
    rating: '4.9',
    category: 'JACKPOT',
    tags: ['ORIGINALS', 'SLOTS'],
    studio: 'VIBE PRIME',
    difficulty: 'Easy',
    preview: '/images/games/slots-preview.png',
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    icon: Spade,
    desc: 'Beat the dealer to 21. Hit, Stand, Double & Split.',
    path: '/games/blackjack',
    color: '#00E676',
    accentColor: '#00E676',
    reward: '$10,000.00',
    rating: '4.8',
    category: 'HOT',
    tags: ['ORIGINALS', 'TABLE', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Medium',
    preview: '/images/blackjack/blackjack-bg.png',
  },
] as const;

const CATEGORIES = ['ALL', 'ORIGINALS', 'TABLE', 'SLOTS', 'HIGH ROLLER'] as const;
type CategoryType = (typeof CATEGORIES)[number];

const MIN_STAKE = '$0.10';

export default function GamesPage() {
  const router = useRouter();
  const { isMobile, bets } = useCasinoStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');

  // Keyboard quick-launch: keys 1–5 open the corresponding game.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < GAMES.length) {
        router.push(GAMES[idx].path);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const totalBets = bets.length;

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'ALL') return GAMES;
    return GAMES.filter((g) => g.tags.includes(selectedCategory as unknown as GameMeta['tags'][number]));
  }, [selectedCategory]);

  return (
    <div
      style={{
        maxWidth: '1400px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: isMobile ? '16px 16px 80px' : '12px 24px 32px',
      }}
    >
      {/* Monolith Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          padding: isMobile ? '14px 16px' : '18px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          background:
            'linear-gradient(145deg, rgba(24, 24, 32, 0.75) 0%, rgba(12, 12, 18, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#D4AF37',
                fontSize: '0.58rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Flame size={12} /> PROVABLY FAIR · 5 ORIGINALS
            </span>
          </div>
          <h1
            style={{
              fontSize: isMobile ? '1.4rem' : '1.75rem',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            GAME CATALOG
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Stat label="MIN STAKE" value={MIN_STAKE} highlight />
          <Stat label="YOUR ROUNDS" value={String(totalBets)} />
          {!isMobile && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <ShieldCheck size={12} />
              <span>INSTANT PAYOUT</span>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter Tabs (Frosted Glass Pills) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
          <Layers size={14} color="#D4AF37" />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
            Filter:
          </span>
        </div>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                border: isActive
                  ? '1px solid #D4AF37'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.06) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: isActive ? '0 0 16px rgba(212, 175, 55, 0.22)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Live social-proof ribbon */}
      <LiveWinRibbon />

      {/* 3D-Tilt & Specular Sheen Games Grid with Hover Preview Animation */}
      <motion.div
        layout
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: isMobile ? '12px' : '16px',
          alignItems: 'stretch',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, index) => (
            <ElevatedGameCard key={game.id} game={game} index={index} isMobile={isMobile} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ──── Interactive 3D-Tilt Card with Option-2 Motion Shader Preview ────
function ElevatedGameCard({
  game,
  index,
  isMobile,
}: {
  game: GameMeta;
  index: number;
  isMobile: boolean;
}) {
  const Icon = game.icon;
  const [imgError, setImgError] = useState(false);
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

    const rX = ((y - centerY) / centerY) * -3.5;
    const rY = ((x - centerX) / centerX) * 3.5;

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.2,
    });
  };

  const handleMouseEnter = () => {
    soundManager.playHover();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        perspective: 1000,
        height: '100%',
      }}
    >
      <Link
        href={game.path}
        aria-label={`Play ${game.name}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%', outline: 'none' }}
      >
        <motion.article
          whileTap={{ scale: 0.96 }}
          animate={{
            rotateX: isHovered && !isMobile ? rotateX : 0,
            rotateY: isHovered && !isMobile ? rotateY : 0,
            scale: isHovered && !isMobile ? 1.02 : 1,
            y: isHovered && !isMobile ? -4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '14px',
            borderRadius: '20px',
            background:
              'linear-gradient(145deg, rgba(24, 24, 32, 0.8) 0%, rgba(12, 12, 18, 0.9) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.12)'}`,
            boxShadow: isHovered
              ? 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 12px 28px rgba(0, 0, 0, 0.55), 0 0 12px rgba(212, 175, 55, 0.2)'
              : 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 12px 28px rgba(0, 0, 0, 0.55)',
            height: '100%',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Dynamic Specular Sheen Glare */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 60%)`,
              transition: 'opacity 0.2s ease',
              borderRadius: '20px',
              zIndex: 5,
            }}
          />

          {/* Preview image & Option-1 Transluzente Glas-Pille */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: '14px',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#09090b',
            }}
          >
            {imgError ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${game.color}33, #000)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ opacity: 0.5, color: game.color }}>
                  <Icon size={32} />
                </div>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    color: 'hsla(0,0%,100%,0.3)',
                    letterSpacing: '0.1em',
                  }}
                >
                  PREVIEW
                </span>
              </div>
            ) : (
              <Image
                src={game.preview}
                alt={`${game.name} preview`}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                loading={index <= 2 ? 'eager' : 'lazy'}
                onError={() => setImgError(true)}
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            )}

            {/* VIP Hover-Overlay mit Live-Auszahlungsquote & Schnellstart */}
            <AnimatePresence>
              {isHovered && !isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(12, 14, 20, 0.45) 0%, rgba(8, 10, 14, 0.95) 100%)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    gap: '10px',
                    zIndex: 10,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        letterSpacing: '0.04em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={11} color="#10b981" />
                      99.0% RTP • FAIR
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 950,
                        color: '#D4AF37',
                        fontFamily: 'var(--font-mono, monospace)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      MAX. $10,000 PAYOUT
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                      color: '#000',
                      fontWeight: 950,
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <Play size={12} fill="#000" />
                    <span>JETZT SPIELEN</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 45%)',
                zIndex: 2,
              }}
            />

            {/* Floating Top-Left Icon Badge */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: game.accentColor,
                border: `1px solid ${game.accentColor}60`,
                boxShadow: `0 0 12px ${game.accentColor}35`,
                zIndex: 3,
              }}
            >
              <Icon size={16} color={game.accentColor} />
            </div>
          </div>

          {/* Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '20px',
            }}
          >
            <span
              style={{
                fontSize: '0.58rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: 'hsl(var(--text-dim))',
              }}
            >
              {game.studio}
            </span>
            {game.category === 'HOT' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.58rem',
                  fontWeight: 950,
                  color: '#ff5a5a',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: '#ff5a5a',
                  }}
                  className="animate-ping"
                />
                HOT
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 950,
                  color: 'hsl(var(--primary))',
                }}
              >
                {game.category}
              </span>
            )}
          </div>

          {/* Title + rating */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '6px',
            }}
          >
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 950,
                margin: 0,
                fontFamily: 'var(--font-inter), sans-serif',
                lineHeight: 1,
                color: isHovered ? game.accentColor : '#ffffff',
                transition: 'color 0.2s ease',
              }}
            >
              {game.name}
            </h3>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              <Star size={12} fill="#D4AF37" color="#D4AF37" />
              {game.rating}
            </span>
          </div>

          <p
            style={{
              fontSize: '0.74rem',
              lineHeight: 1.4,
              color: 'hsl(var(--text-muted))',
              margin: 0,
              minHeight: '2em',
            }}
          >
            {game.desc}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: '12px',
              background: 'hsla(0,0%,100%,0.02)',
              border: '1px solid hsla(0,0%,100%,0.05)',
            }}
          >
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>
              TOP PAYOUT
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 950,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {game.reward}
            </span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '12px',
              fontWeight: 950,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: `0 8px 20px ${game.accentColor}33`,
              border: 'none',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            <Play size={14} fill="currentColor" />
            PLAY {game.name.toUpperCase()}
          </motion.button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              color: 'hsl(var(--text-dim))',
              fontSize: '0.6rem',
              fontWeight: 800,
            }}
          >
            <kbd
              style={{
                padding: '1px 6px',
                borderRadius: '5px',
                border: '1px solid hsla(0,0%,100%,0.12)',
                background: 'hsla(0,0%,100%,0.03)',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {index + 1}
            </kbd>
            to launch
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

// ──── Option-1 Refined Game Hover Preview Micro-Pill ────
function GameHoverPreview({ gameId, accentColor }: { gameId: GameId; accentColor: string }) {
  if (gameId === 'crash') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ y: [2, -4, 2], rotate: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#D4AF37', display: 'flex', alignItems: 'center' }}
        >
          <TrendingUp size={16} />
        </motion.div>
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.82rem',
            fontWeight: 900,
            color: '#D4AF37',
            letterSpacing: '0.04em',
          }}
        >
          5.42x
        </motion.span>
      </div>
    );
  }

  if (gameId === 'dice') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ color: '#00F0FF', display: 'flex', alignItems: 'center' }}
        >
          <RotateCcw size={16} />
        </motion.div>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.82rem',
            fontWeight: 900,
            color: '#00F0FF',
            letterSpacing: '0.04em',
          }}
        >
          ROLL 98.4
        </span>
      </div>
    );
  }

  if (gameId === 'roulette') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          style={{ color: '#FF0055', display: 'flex', alignItems: 'center' }}
        >
          <CircleDollarSign size={16} />
        </motion.div>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.82rem',
            fontWeight: 900,
            color: '#FF0055',
            letterSpacing: '0.04em',
          }}
        >
          RED 36
        </span>
      </div>
    );
  }

  if (gameId === 'slots') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ color: '#FFE600', display: 'flex', alignItems: 'center' }}
        >
          <Zap size={16} />
        </motion.div>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.82rem',
            fontWeight: 900,
            color: '#FFE600',
            letterSpacing: '0.08em',
          }}
        >
          7 - 7 - 7
        </span>
      </div>
    );
  }

  if (gameId === 'blackjack') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#00E676', display: 'flex', alignItems: 'center' }}
        >
          <Spade size={16} />
        </motion.div>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.82rem',
            fontWeight: 900,
            color: '#00E676',
            letterSpacing: '0.04em',
          }}
        >
          21 BLACKJACK
        </span>
      </div>
    );
  }

  return <Sparkles size={16} color={accentColor} />;
}

// ──── Live Social Proof Ribbon ────
function LiveWinRibbon() {
  const { allBets } = useCasinoStore();

  const recentWins = React.useMemo(() => {
    const wins = [...allBets]
      .filter((b) => b.isWin && b.multiplier && b.payout > 0)
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 15);

    if (wins.length >= 5) return wins;

    const fallback = [
      {
        id: 'f1',
        user: 'SarahSlot',
        game: 'SLOTS',
        amount: 18,
        multiplier: 2.26,
        payout: 40.66,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f2',
        user: 'CryptoKing',
        game: 'CRASH',
        amount: 21,
        multiplier: 4.2,
        payout: 88.2,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f3',
        user: 'VibeCoder',
        game: 'ROULETTE',
        amount: 45,
        multiplier: 2.46,
        payout: 110.92,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f4',
        user: 'NeonSniper',
        game: 'DICE',
        amount: 12,
        multiplier: 3.1,
        payout: 37.2,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f5',
        user: 'HighRoller',
        game: 'BLACKJACK',
        amount: 100,
        multiplier: 2.5,
        payout: 250,
        time: 'fallback',
        isWin: true,
      },
    ];
    return [...wins, ...fallback].slice(0, 15);
  }, [allBets]);

  if (recentWins.length === 0) return null;

  const items = [...recentWins, ...recentWins];

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        background:
          'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 240, 255, 0.05) 100%)',
        padding: '10px 0',
      }}
      className="live-ribbon"
    >
      <div
        style={{
          display: 'flex',
          gap: '32px',
          width: 'max-content',
          animation: 'ribbonScroll 40s linear infinite',
        }}
      >
        {items.map((bet, idx) => (
          <div
            key={`${bet.id}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'hsl(var(--text-muted))',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            <span style={{ color: 'hsl(var(--success))' }}>{bet.user}</span>
            <span>won</span>
            <span style={{ color: '#fff', fontFamily: 'var(--font-mono), monospace' }}>
              ${bet.payout.toFixed(2)}
            </span>
            <span>@</span>
            <span
              style={{ color: '#D4AF37', fontFamily: 'var(--font-mono), monospace' }}
            >
              {bet.multiplier.toFixed(2)}x
            </span>
            <span>in</span>
            <span style={{ color: '#fff', textTransform: 'capitalize' }}>
              {bet.game.toLowerCase()}
            </span>
            <Clock size={12} color="hsl(var(--text-dim))" />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ribbonScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .live-ribbon:hover > div {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .live-ribbon > div { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        lineHeight: 1.1,
      }}
    >
      <span
        style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '3px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 900,
          color: highlight ? '#D4AF37' : '#ffffff',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </span>
    </div>
  );
}
