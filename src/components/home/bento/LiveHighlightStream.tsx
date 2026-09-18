'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  useReducedMotion,
} from 'framer-motion';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HighrollerWinDetailModal, type HighrollerWinItem } from '../HighrollerWinDetailModal';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';
import { LiveWinsFlippingSwap } from './LiveWinsFlippingSwap';

const ROTATION_INTERVAL_MS = 4500;

interface StreamEntry {
  id: string;
  user: string;
  amount: number;
  game: string;
  mult: string;
  type: HighrollerWinItem['type'];
  time: string;
}

const STREAM_ENTRIES: StreamEntry[] = [
  {
    id: '1',
    user: 'Satoshi_X',
    amount: 4250.0,
    game: 'Crash Rocket',
    mult: '14.20x',
    type: 'hot',
    time: 'gerade eben',
  },
  {
    id: '2',
    user: 'WhaleWatcher',
    amount: 8900.0,
    game: 'Neon Slots',
    mult: '89.00x',
    type: 'whale',
    time: 'vor 1m',
  },
  {
    id: '3',
    user: 'CryptoKing',
    amount: 12500.0,
    game: 'VIP Blackjack',
    mult: '2.50x',
    type: 'vip',
    time: 'vor 2m',
  },
  {
    id: '4',
    user: 'LuckyStrike',
    amount: 3400.0,
    game: 'Ultimate Dice',
    mult: '34.00x',
    type: 'hot',
    time: 'vor 3m',
  },
  {
    id: '5',
    user: 'AuraMaster',
    amount: 18200.0,
    game: 'Royale Roulette',
    mult: '36.00x',
    type: 'jackpot',
    time: 'vor 4m',
  },
];

const TYPE_META: Record<HighrollerWinItem['type'], { color: string; badge: string }> = {
  jackpot: { color: bentoColors.gold, badge: 'JACKPOT' },
  whale: { color: bentoColors.goldLight, badge: 'WHALE' },
  vip: { color: bentoColors.emerald, badge: 'VIP' },
  hot: { color: bentoColors.gold, badge: 'HEISS' },
};

export function LiveHighlightStream({ isMobile = false }: { isMobile?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedWin, setSelectedWin] = useState<HighrollerWinItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = STREAM_ENTRIES.length;

  const rawStep = useMotionValue(0);
  const smoothStep = useSpring(rawStep, {
    stiffness: 280,
    damping: 26,
    mass: 0.8,
  });

  const scrollToIndex = useCallback(
    (targetIndex: number) => {
      try {
        soundManager.playClick();
      } catch {}
      animate(rawStep, targetIndex, {
        type: 'spring',
        stiffness: 300,
        damping: 26,
        mass: 0.7,
      });
      const normalized = ((targetIndex % total) + total) % total;
      setActiveIdx(normalized);
    },
    [rawStep, total],
  );

  const prev = useCallback(() => {
    scrollToIndex(Math.round(rawStep.get()) - 1);
  }, [rawStep, scrollToIndex]);

  const next = useCallback(() => {
    scrollToIndex(Math.round(rawStep.get()) + 1);
  }, [rawStep, scrollToIndex]);

  // Auto-advance
  useEffect(() => {
    if (prefersReducedMotion || isPaused || selectedWin) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      next();
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPaused, selectedWin, next]);

  // Wheel handling inside 3D stage
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let accumulated = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulated += e.deltaY;
      if (Math.abs(accumulated) > 40) {
        if (accumulated > 0) next();
        else prev();
        accumulated = 0;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [next, prev]);

  return (
    <>
      <GlassSurface
        radius="lg"
        elevation={2}
        withTopSheen
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: isMobile ? '280px' : '300px',
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <motion.span
                animate={prefersReducedMotion ? undefined : { opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: bentoColors.emerald,
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.9)',
                  flexShrink: 0,
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: bentoColors.gold,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  Live Auszahlungen
                </span>
                <span
                  style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.45)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  3D SPIRAL STAGE
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.22)',
                  color: bentoColors.emerald,
                  fontSize: '0.6rem',
                  fontWeight: 900,
                }}
              >
                <span style={bentoTypography.dynamicNumber}>99.2% RTP</span>
              </div>

              {/* 3D Helix Step Controls */}
              <button
                type="button"
                onClick={prev}
                aria-label="Vorherige Auszahlung"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Nächste Auszahlung"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>

          {/* 3D Helix Stage Container */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              perspective: '900px',
              perspectiveOrigin: '50% 50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '170px',
              overflow: 'hidden',
            }}
          >
            {STREAM_ENTRIES.map((entry, index) => (
              <Payout3dCard
                key={entry.id}
                entry={entry}
                index={index}
                total={total}
                smoothStep={smoothStep}
                isActive={activeIdx === index}
                onSelect={() => {
                  if (activeIdx === index) {
                    setSelectedWin(entry);
                  } else {
                    scrollToIndex(index);
                  }
                }}
              />
            ))}
          </div>

          {/* Bottom Progress & Trust Seals */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.62rem',
              color: 'rgba(255, 255, 255, 0.55)',
              zIndex: 10,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} color="#10B981" />
              Instant Payouts Active
            </span>
            <span style={{ color: bentoColors.gold, fontWeight: 800 }}>100% Provably Fair</span>
          </div>

          {/* Rotation progress bar */}
          {!prefersReducedMotion && !isPaused && (
            <motion.div
              key={`progress-${activeIdx}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: '2px',
                background:
                  'linear-gradient(90deg, rgba(16, 185, 129, 0) 0%, rgba(16, 185, 129, 1) 100%)',
              }}
            />
          )}
        </div>
      </GlassSurface>

      {/* Außerhalb von GlassSurface: Detail-Modal */}
      <HighrollerWinDetailModal win={selectedWin} onClose={() => setSelectedWin(null)} />
    </>
  );
}

function Payout3dCard({
  entry,
  index,
  total,
  smoothStep,
  isActive,
  onSelect,
}: {
  entry: StreamEntry;
  index: number;
  total: number;
  smoothStep: ReturnType<typeof useSpring>;
  isActive: boolean;
  onSelect: () => void;
}) {
  const meta = TYPE_META[entry.type];

  // 3D Trigonometry along vertical spiral axis
  const transform = useTransform(smoothStep, (step) => {
    let dist = index - step;
    while (dist < -total / 2) dist += total;
    while (dist > total / 2) dist -= total;

    // Y translation: active card is centered (0), others spread vertically
    const y = dist * 48;
    // Z depth: active card at 0px, distant cards pushed back into depth
    const z = -Math.abs(dist) * 75;
    // Slight X arc for spiral curvature
    const x = Math.sin(dist * 0.8) * 18;
    // RotateX along curve
    const rotateX = -dist * 14;

    return `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg)`;
  });

  const opacity = useTransform(smoothStep, (step) => {
    let dist = index - step;
    while (dist < -total / 2) dist += total;
    while (dist > total / 2) dist -= total;
    const absDist = Math.abs(dist);
    if (absDist > 2.0) return 0;
    return Math.max(0, 1 - absDist * 0.45);
  });

  const scale = useTransform(smoothStep, (step) => {
    let dist = index - step;
    while (dist < -total / 2) dist += total;
    while (dist > total / 2) dist -= total;
    return Math.max(0.78, 1 - Math.abs(dist) * 0.12);
  });

  return (
    <motion.div
      onClick={onSelect}
      style={{
        position: 'absolute',
        width: '92%',
        maxWidth: '380px',
        transform,
        opacity,
        scale,
        borderRadius: '14px',
        background: isActive
          ? 'linear-gradient(135deg, rgba(24, 28, 40, 0.95) 0%, rgba(11, 14, 20, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(16, 20, 28, 0.8) 0%, rgba(10, 12, 18, 0.85) 100%)',
        border: isActive
          ? '1px solid rgba(212, 175, 55, 0.45)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isActive
          ? '0 12px 32px rgba(0, 0, 0, 0.75), 0 0 16px rgba(212, 175, 55, 0.2)'
          : '0 4px 14px rgba(0, 0, 0, 0.4)',
        padding: '10px 14px',
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: isActive ? 5 : 2,
        transition: 'border 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Top row: badge, user & time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '1px 6px',
              borderRadius: '5px',
              background: `${meta.color}18`,
              border: `1px solid ${meta.color}44`,
              color: meta.color,
              fontSize: '0.54rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
            }}
          >
            {meta.badge}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            {entry.user}
          </span>
        </div>
        <span style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.45)' }}>{entry.time}</span>
      </div>

      {/* Main row: Payout & Multiplier */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span
          style={{
            ...bentoTypography.dynamicNumber,
            fontSize: isActive ? '1.35rem' : '1.1rem',
            fontWeight: 900,
            color: bentoColors.emerald,
            letterSpacing: '-0.02em',
            textShadow: isActive ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
            transition: 'font-size 0.2s ease',
          }}
        >
          +${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LiveWinsFlippingSwap
            word={entry.mult}
            secondaryWord={entry.game}
            highlight={parseFloat(entry.mult) >= 30}
            colorScheme={parseFloat(entry.mult) >= 30 ? 'gold' : 'emerald'}
          />
        </div>
      </div>
    </motion.div>
  );
}
