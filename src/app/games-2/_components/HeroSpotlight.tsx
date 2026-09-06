'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';
import { ShieldCheck, Star } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import type { GameMeta } from '@/app/games/_components/config';

// ──── F — Hero-Kachel-Spotlight (motion.dev: Gestures + Loops + layoutId) ────
// Crash lebt hier als pulsierendes Zentrum im Hero: Glow-Tween-Loop hinter der
// Karte (2 Keyframes → bewusst Tween, niemals Spring), blinkender LIVE-Chip,
// Multiplier-Window-Fortschrittsloop. Der Medienrahmen trägt layoutId=
// "g2-media-crash" — Quick-View fliegt von hier auf und kehrt hierher zurück.

const SPOTLIGHT_SPRING = { stiffness: 320, damping: 24 } as const;

export function HeroSpotlight({ game, onOpen }: { game: GameMeta; onOpen: () => void }) {
  const [imgError, setImgError] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltEnabled = !prefersReducedMotion;

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [2.6, -2.6]), SPOTLIGHT_SPRING);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-2.6, 2.6]), SPOTLIGHT_SPRING);
  const glareX = useTransform(pointerX, [-0.5, 0.5], ['80%', '20%']);
  const glareY = useTransform(pointerY, [-0.5, 0.5], ['85%', '15%']);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 215, 0, 0.16) 0%, transparent 62%)`;

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!tiltEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const loopTransition = (
    duration: number,
  ): { duration: number; ease: 'easeInOut'; repeat: number } => ({
    duration,
    ease: 'easeInOut',
    repeat: Infinity,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.gentle, delay: 0.15 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '210px',
        display: 'flex',
      }}
    >
      {/* Puls-Glow hinter der Karte (Tween-Loop — 3 Keyframes dürfen nie springen) */}
      <motion.div
        aria-hidden
        animate={
          prefersReducedMotion ? undefined : { scale: [1, 1.04, 1], opacity: [0.5, 0.95, 0.5] }
        }
        transition={prefersReducedMotion ? undefined : loopTransition(2.6)}
        style={{
          position: 'absolute',
          inset: '-16px',
          borderRadius: '30px',
          background:
            'radial-gradient(65% 65% at 50% 45%, rgba(212, 175, 55, 0.24), transparent 72%)',
          filter: 'blur(8px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <motion.article
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: tiltEnabled ? rotateX : 0,
          rotateY: tiltEnabled ? rotateY : 0,
          transformPerspective: tiltEnabled ? 1100 : undefined,
          position: 'relative',
          zIndex: 1,
          width: '100%',
          flex: 1,
        }}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${game.name} im Quick-View öffnen`}
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '14px 14px 12px',
            borderRadius: '20px',
            background:
              'linear-gradient(150deg, rgba(26, 22, 14, 0.92) 0%, rgba(11, 13, 18, 0.96) 100%)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(212, 175, 55, 0.32)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.07), 0 22px 48px rgba(0, 0, 0, 0.55)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible')) {
              event.currentTarget.style.outline = '2px solid #D4AF37';
              event.currentTarget.style.outlineOffset = '2px';
            }
          }}
          onBlur={(event) => {
            event.currentTarget.style.outline = 'none';
          }}
        >
          {tiltEnabled && (
            <motion.div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                pointerEvents: 'none',
                background: glareBackground,
              }}
            />
          )}

          {/* Medienrahmen = Shared Element zurück zum Spotlight nach Dialog-Schließung */}
          <motion.div
            layoutId={prefersReducedMotion ? undefined : `g2-media-${game.id}`}
            style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: '110px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#09090b',
            }}
          >
            {imgError ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${game.accentColor}26, #000)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <game.icon size={36} color={game.accentColor} />
              </div>
            ) : (
              <Image
                src={game.preview}
                alt={`${game.name} Vorschau`}
                fill
                sizes="340px"
                loading="eager"
                onError={() => setImgError(true)}
                style={{ objectFit: 'cover' }}
              />
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(6, 8, 12, 0.8) 0%, transparent 50%)',
                zIndex: 2,
              }}
            />

            {/* LIVE-Chip mit blinkendem Punkt (Opacity-Tween-Loop) */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                fontSize: '0.56rem',
                fontWeight: 900,
                letterSpacing: '0.14em',
                color: '#ffffff',
              }}
            >
              <motion.span
                aria-hidden
                animate={prefersReducedMotion ? undefined : { opacity: [1, 0.25, 1] }}
                transition={prefersReducedMotion ? undefined : loopTransition(1.3)}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '999px',
                  background: '#FF0055',
                  display: 'inline-block',
                }}
              />
              LIVE
            </div>
          </motion.div>

          {/* Meta-Zeile: Name + Rating */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 950,
                letterSpacing: '-0.01em',
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {game.name}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Star size={12} fill="#D4AF37" color="#D4AF37" />
              {game.rating}
            </span>
          </div>

          {/* Multiplier-Window-Fortschrittsloop + Reward/RTP */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  justifyContent: 'space-between',
                  fontSize: '0.52rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: 'rgba(255, 255, 255, 0.38)',
                }}
              >
                MULTIPLIER WINDOW
                <span style={{ color: '#D4AF37', fontFamily: 'var(--font-mono), monospace' }}>
                  {game.reward}
                </span>
              </span>
              <span
                aria-hidden
                style={{
                  height: '2px',
                  borderRadius: '999px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  display: 'block',
                  overflow: 'hidden',
                }}
              >
                {/* Linear loop (2 Keyframes → Tween; Endwert erreicht, dann Neustart) */}
                <motion.span
                  animate={prefersReducedMotion ? undefined : { scaleX: [0, 1] }}
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : { duration: 3.4, ease: 'linear', repeat: Infinity }
                  }
                  style={{
                    display: 'block',
                    height: '100%',
                    transformOrigin: '0% 50%',
                    background: 'linear-gradient(90deg, #FFD700, #D4AF37)',
                    borderRadius: '999px',
                  }}
                />
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <span
                aria-hidden
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.55rem',
                  fontWeight: 900,
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: 'rgba(5, 8, 10, 0.7)',
                  borderRadius: '999px',
                  padding: '3px 8px',
                }}
              >
                <ShieldCheck size={10} color="#10b981" />
                99.0% RTP
              </span>
              <span
                style={{
                  fontSize: '0.56rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.45)',
                }}
              >
                QUICK VIEW →
              </span>
            </div>
          </div>
        </button>
      </motion.article>
    </motion.div>
  );
}
