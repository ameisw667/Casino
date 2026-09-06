'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useMotionTemplate } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import { soundManager } from '@/lib/casino/sound-manager';
import { useTiltGlare, type TiltGlareState } from '@/hooks/useTiltGlare';
import { GAMES, type GameItem } from '../InteractiveArcadeGrid';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';

/**
 * Bento arcade cells: one dominant 2x2 hero cell (Crash) plus four compact
 * satellite cells. Hover elevation is shadow/scale only and stays inside the
 * content zone (SOP 04 §5, zone 0-5) — no stacking-context changes.
 */

const heroGame = GAMES.find((game) => game.id === 'crash');
const satelliteGames: GameItem[] = GAMES.filter((game) => game.id !== 'crash');

type GlareOnly = Pick<TiltGlareState, 'glareX' | 'glareY' | 'glareActive'>;

function GlareOverlay({ glareX, glareY, glareActive }: GlareOnly) {
  const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        opacity: glareActive,
        mixBlendMode: 'overlay',
        zIndex: 12,
        background,
      }}
    />
  );
}

export function ArcadeHeroCell({ isMobile }: { isMobile: boolean }) {
  const tilt = useTiltGlare({ maxTilt: 4, disabled: isMobile });
  const prefersReducedMotion = useReducedMotion();
  const game = heroGame;

  if (!game) return null;

  return (
    <motion.div
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={tilt.onPointerEnter}
      onPointerLeave={tilt.onPointerLeave}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.05 }}
      style={{
        position: 'relative',
        gridColumn: 'span 2',
        gridRow: 'span 2',
        perspective: 1000,
        minHeight: isMobile ? '260px' : '320px',
      }}
    >
      <Link
        href={game.path}
        className="focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
        style={{ textDecoration: 'none', display: 'block', height: '100%', outline: 'none' }}
      >
        <motion.div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 40px rgba(212, 175, 55, 0.12)',
            rotateX: tilt.rotateX,
            rotateY: tilt.rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={isMobile ? undefined : { y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={springs.standard}
        >
          {/* Motion-picture loop background (slow Ken-Burns drift) */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: '-4%' }}
          >
            <Image
              src={game.image}
              alt={game.name}
              fill
              unoptimized
              priority
              sizes={isMobile ? '100vw' : '800px'}
              style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
            />
          </motion.div>

          {/* Readability gradient */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(11, 14, 20, 0.25) 0%, rgba(11, 14, 20, 0.25) 55%, rgba(11, 14, 20, 0.92) 100%)',
            }}
          />

          <GlareOverlay glareX={tilt.glareX} glareY={tilt.glareY} glareActive={tilt.glareActive} />

          {/* Cell content */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: isMobile ? '16px' : '22px',
              gap: '8px',
            }}
          >
            <span
              style={{
                alignSelf: 'flex-start',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(212, 175, 55, 0.2)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                color: bentoColors.gold,
                fontSize: '0.6rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {game.badge}
            </span>
            <div
              style={{
                fontSize: isMobile ? '1.55rem' : '2.1rem',
                fontWeight: 1000,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}
            >
              {game.name}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.4,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {game.description}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span
                  style={{
                    ...bentoTypography.dynamicNumber,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: bentoColors.gold,
                    fontSize: '0.72rem',
                    fontWeight: 900,
                  }}
                >
                  Max {game.maxPayout}
                </span>
              </div>
            </div>
          </div>

          {/* Play pill anchored top-right so it never covers the headline */}
          <motion.span
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
              color: '#000',
              fontSize: '0.74rem',
              fontWeight: 950,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 0 18px rgba(212, 175, 55, 0.35)',
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={springs.standard}
          >
            <Play size={11} fill="#000" />
            Spielen
            <ChevronRight size={12} />
          </motion.span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function ArcadeSatelliteCell({
  game,
  idx,
  isMobile,
}: {
  game: GameItem;
  idx: number;
  isMobile: boolean;
}) {
  const tilt = useTiltGlare({ maxTilt: 6, disabled: isMobile });

  // Stale-Cleanup: unmountet eine Zelle waehrend Hover (z.B. via eigenem Link),
  // feuert onPointerLeave nicht mehr und die Accent-Var bleibt am Root haengen.
  useEffect(
    () => () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty('--lobby-hover-accent');
      }
    },
    [],
  );

  return (
    <motion.div
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={(e) => {
        tilt.onPointerEnter();
        if (typeof document !== 'undefined' && !isMobile) {
          document.documentElement.style.setProperty('--lobby-hover-accent', game.accentColor);
          // Plan 28: pulse a gold wave into the ambient background from the card centre
          const rect = e.currentTarget.getBoundingClientRect();
          window.dispatchEvent(
            new CustomEvent('casino:lobby-hover-wave', {
              detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
            }),
          );
        }
        if (!isMobile) soundManager.playHover();
      }}
      onPointerLeave={() => {
        tilt.onPointerLeave();
        if (typeof document !== 'undefined' && !isMobile) {
          document.documentElement.style.removeProperty('--lobby-hover-accent');
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.08 + idx * 0.05 }}
      style={{ position: 'relative', perspective: 1000 }}
    >
      <Link
        href={game.path}
        className="focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
        style={{ textDecoration: 'none', display: 'block', height: '100%', outline: 'none' }}
      >
        <motion.div
          style={{
            position: 'relative',
            height: '100%',
            minHeight: '150px',
            borderRadius: '16px',
            background: 'rgba(11, 14, 20, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            rotateX: tilt.rotateX,
            rotateY: tilt.rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={isMobile ? undefined : { y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={springs.standard}
        >
          {/* Game artwork fills most of the cell (bento background diversity) */}
          <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <Image
              src={game.image}
              alt={game.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 45vw, 340px"
              style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
            />
            <GlareOverlay
              glareX={tilt.glareX}
              glareY={tilt.glareY}
              glareActive={tilt.glareActive}
            />
          </div>

          {/* Compact meta bar */}
          <div
            style={{
              position: 'relative',
              padding: '9px 11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              background: 'rgba(11, 14, 20, 0.82)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: isMobile ? '0.7rem' : '0.78rem',
                  fontWeight: 1000,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {game.name}
              </div>
              <div
                style={{
                  fontSize: '0.56rem',
                  fontWeight: 900,
                  color: game.accentColor,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {game.badge}
              </div>
            </div>
            <span
              style={{
                ...bentoTypography.dynamicNumber,
                fontSize: '0.66rem',
                fontWeight: 900,
                color: bentoColors.gold,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {game.maxPayout}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function BentoArcadeGroup({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ArcadeHeroCell isMobile={isMobile} />
      {satelliteGames.map((game, idx) => (
        <ArcadeSatelliteCell key={game.id} game={game} idx={idx} isMobile={isMobile} />
      ))}
    </>
  );
}
