'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

type GameId = 'crash' | 'dice' | 'roulette' | 'slots' | 'blackjack';

interface GameMeta {
  id: GameId;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  desc: string;
  path: string;
  color: string;
  reward: string;
  rating: string;
  category: 'HOT' | 'NEW' | 'JACKPOT';
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
    color: 'hsl(var(--primary))',
    reward: '$500.00',
    rating: '4.9',
    category: 'HOT',
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
    color: 'hsl(var(--secondary))',
    reward: '$250.00',
    rating: '4.7',
    category: 'NEW',
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
    color: 'hsl(var(--accent))',
    reward: '$1,000.00',
    rating: '4.8',
    category: 'HOT',
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
    color: 'hsl(var(--primary))',
    reward: '$5,000.00',
    rating: '4.9',
    category: 'JACKPOT',
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
    color: 'hsl(var(--secondary))',
    reward: '$10,000.00',
    rating: '4.8',
    category: 'HOT',
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Medium',
    preview: '/images/blackjack/blackjack-bg.png',
  },
] as const;

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 26, mass: 0.8 };
const MIN_STAKE = '$0.10';

export default function GamesPage() {
  const router = useRouter();
  const { isMobile, bets } = useCasinoStore();

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

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: isMobile ? '16px 16px 80px' : '12px 24px 24px',
      }}
    >
      {/* Slim header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          padding: '14px 20px',
          borderRadius: '20px',
          border: '1px solid hsla(var(--primary), 0.18)',
          background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.6), hsla(var(--primary), 0.05))',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'hsl(var(--primary))',
              fontSize: '0.7rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
            }}
          >
            <Flame size={14} className="animate-pulse" /> PROVABLY FAIR · 5 ORIGINALS
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 2.2vw, 2.1rem)',
              fontWeight: 950,
              lineHeight: 1.05,
              fontFamily: "'Outfit', sans-serif",
              margin: 0,
            }}
          >
            GAMES
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Stat label="MIN STAKE" value={MIN_STAKE} />
          <Stat label="YOUR ROUNDS" value={String(totalBets)} />
          {!isMobile && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '12px',
                background: 'hsla(var(--success), 0.1)',
                color: 'hsl(var(--success))',
                fontSize: '0.7rem',
                fontWeight: 900,
              }}
            >
              <ShieldCheck size={14} /> INSTANT PAYOUT
            </div>
          )}
        </div>
      </header>

      {/* Live social-proof ribbon */}
      <LiveWinRibbon />

      {/* 5 identical game cards in a single row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(5, minmax(0, 1fr))',
          gap: isMobile ? '12px' : '14px',
          alignItems: 'stretch',
        }}
      >
        {GAMES.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game, index }: { game: GameMeta; index: number }) {
  const Icon = game.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      style={{ borderRadius: '22px', height: '100%' }}
    >
      <Link
        href={game.path}
        aria-label={`Play ${game.name}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      >
        <article
          className="glass-card group"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '14px',
            borderRadius: '22px',
            border: '1px solid hsla(0,0%,100%,0.06)',
            height: '100%',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Preview image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: '14px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src={game.preview}
              alt={`${game.name} preview`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              loading={index <= 2 ? 'eager' : 'lazy'}
              style={{
                objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
              }}
              className="game-preview-img"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: game.color,
                border: `1px solid ${game.color}44`,
              }}
            >
              <Icon size={16} />
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
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1,
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
                color: 'hsl(45, 100%, 50%)',
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              }}
            >
              <Star size={12} fill="currentColor" />
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
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>TOP PAYOUT</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 950,
                color: 'hsl(var(--primary))',
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
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
              boxShadow: `0 8px 20px ${game.color}33`,
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
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {index + 1}
            </kbd>
            to launch
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function LiveWinRibbon() {
  const { allBets } = useCasinoStore();

  // Stable fallback stream, no Math.random during render.
  const recentWins = React.useMemo(() => {
    const wins = [...allBets]
      .filter((b) => b.isWin && b.multiplier && b.payout > 0)
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 15);

    if (wins.length >= 5) return wins;

    const fallback = [
      { id: 'f1', user: 'SarahSlot', game: 'SLOTS', amount: 18, multiplier: 2.26, payout: 40.66, time: 'fallback', isWin: true },
      { id: 'f2', user: 'CryptoKing', game: 'CRASH', amount: 21, multiplier: 4.2, payout: 88.2, time: 'fallback', isWin: true },
      { id: 'f3', user: 'VibeCoder', game: 'ROULETTE', amount: 45, multiplier: 2.46, payout: 110.92, time: 'fallback', isWin: true },
      { id: 'f4', user: 'NeonSniper', game: 'DICE', amount: 12, multiplier: 3.1, payout: 37.2, time: 'fallback', isWin: true },
      { id: 'f5', user: 'HighRoller', game: 'BLACKJACK', amount: 100, multiplier: 2.5, payout: 250, time: 'fallback', isWin: true },
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
        border: '1px solid hsla(var(--primary), 0.15)',
        background: 'linear-gradient(90deg, hsla(var(--primary), 0.08), hsla(var(--secondary), 0.05))',
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
            <span style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>${bet.payout.toFixed(2)}</span>
            <span>@</span>
            <span style={{ color: 'hsl(var(--primary))', fontFamily: "'JetBrains Mono', monospace" }}>{bet.multiplier.toFixed(2)}x</span>
            <span>in</span>
            <span style={{ color: '#fff', textTransform: 'capitalize' }}>{bet.game.toLowerCase()}</span>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
      <span style={{ fontSize: '0.58rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 950,
          color: '#fff',
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}
