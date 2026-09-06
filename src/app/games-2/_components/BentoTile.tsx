'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ShieldCheck, Star, Maximize2 } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import type { GameMeta } from '@/app/games/_components/config';

// ──── Bento-Tile (motion.dev: Gestures + Independent Transforms + layoutId) ────
// Spacing-Rhythmus: 18px Card-Padding · 12px Medien→Titel · 10px Titel→Meta.
// Der Medienrahmen trägt layoutId="g2-media-{id}" — beim Quick-View-Öffnen
// fließt genau dieser Rahmen in den Dialog (Shared Element).
export function BentoTile({
  game,
  index,
  isFeatured,
  isMobile,
  isFlashing,
  onOpen,
}: {
  game: GameMeta;
  index: number;
  isFeatured: boolean;
  isMobile: boolean;
  isFlashing: boolean;
  onOpen: () => void;
}) {
  const Icon = game.icon;
  const [imgError, setImgError] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const tiltEnabled = !isMobile && !prefersReducedMotion;

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [2.6, -2.6]), {
    stiffness: 320,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-2.6, 2.6]), {
    stiffness: 320,
    damping: 24,
  });
  const glareX = useTransform(pointerX, [-0.5, 0.5], ['80%', '20%']);
  const glareY = useTransform(pointerY, [-0.5, 0.5], ['85%', '15%']);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.13) 0%, transparent 62%)`;

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

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.22 } }}
      transition={{
        ...springs.gentle,
        delay: prefersReducedMotion ? 0 : Math.min(index, 5) * 0.06,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: tiltEnabled ? rotateX : 0,
        rotateY: tiltEnabled ? rotateY : 0,
        transformPerspective: tiltEnabled ? 1100 : undefined,
        position: 'relative',
        width: '100%',
        height: '100%',
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
          padding: '18px 18px 16px',
          borderRadius: '20px',
          background:
            'linear-gradient(150deg, rgba(22, 24, 32, 0.85) 0%, rgba(11, 13, 18, 0.94) 100%)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(212, 175, 55, 0.14)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.06), 0 16px 36px rgba(0, 0, 0, 0.5)',
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

        {/* Medienrahmen = Shared Element in den Quick-View. Die Grid-Kopie bleibt
            gemountet: Framer Motion versteckt sie beim Öffnen automatisch (Crossfade)
            und animiert beim Schließen des Panels zurück in diese Position. */}
        <motion.div
          layoutId={`g2-media-${game.id}`}
          style={{
            position: 'relative',
            width: '100%',
            flex: 1,
            minHeight: isFeatured ? '160px' : '64px',
            borderRadius: '14px',
            overflow: 'hidden',
            flexShrink: 1,
            background: '#09090b',
          }}
        >
          {imgError ? (
            <MediaFallback game={game}>
              <Icon size={isFeatured ? 40 : 28} color={game.accentColor} />
            </MediaFallback>
          ) : (
            <Image
              src={game.preview}
              alt={`${game.name} Vorschau`}
              fill
              sizes={
                isFeatured ? '(max-width: 1023px) 100vw, 50vw' : '(max-width: 1023px) 100vw, 25vw'
              }
              loading={index <= 1 ? 'eager' : 'lazy'}
              onError={() => setImgError(true)}
              style={{ objectFit: 'cover' }}
            />
          )}

          {/* Gold-Ring-Flash bei Keyboard-Quick-Launch */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                aria-hidden
                key="gold-flash"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '2px solid #D4AF37',
                  boxShadow: '0 0 26px rgba(212, 175, 55, 0.6)',
                  zIndex: 6,
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          {isFeatured && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(6, 8, 12, 0.85) 0%, transparent 55%)',
                zIndex: 2,
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: game.accentColor,
              fontSize: '0.58rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
            }}
          >
            <Icon size={12} color={game.accentColor} />
            {game.category}
          </div>
        </motion.div>

        {/* Titelzeile — eigene Zeile mit Mindesthöhe (kein Quetschen) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginTop: '12px',
            minHeight: isFeatured ? '34px' : '26px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: isFeatured
                ? isMobile
                  ? '1.2rem'
                  : '1.45rem'
                : isMobile
                  ? '0.95rem'
                  : '1.02rem',
              fontWeight: 950,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: '#ffffff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {game.name}
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              fontSize: isFeatured ? '0.8rem' : '0.68rem',
              fontWeight: 800,
              color: '#D4AF37',
              fontFamily: 'var(--font-mono), monospace',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Star size={isFeatured ? 13 : 11} fill="#D4AF37" color="#D4AF37" />
            {game.rating}
          </span>
        </div>

        {/* Meta-Zeile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span
            style={{
              fontSize: '0.56rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.38)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Maximize2 size={10} />
            QUICK VIEW
          </span>
          <span
            style={{
              fontSize: isFeatured ? '1rem' : '0.82rem',
              fontWeight: 950,
              color: '#D4AF37',
              fontFamily: 'var(--font-mono), monospace',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {game.reward}
          </span>
        </div>

        {isFeatured && (
          <p
            style={{
              margin: 0,
              marginTop: '10px',
              fontSize: '0.78rem',
              lineHeight: 1.55,
              color: 'rgba(255, 255, 255, 0.5)',
              display: isMobile ? 'none' : 'block',
              overflow: 'hidden',
            }}
          >
            {game.desc}
          </p>
        )}
      </button>

      {/* Provenance-Marker: RTP konstant & klein */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.55rem',
          fontWeight: 900,
          color: '#10b981',
          background: 'rgba(5, 8, 10, 0.7)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '999px',
          padding: '3px 8px',
        }}
      >
        <ShieldCheck size={10} color="#10b981" />
        99.0% RTP
      </span>
    </motion.article>
  );
}

function MediaFallback({ game, children }: { game: GameMeta; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${game.accentColor}26, #000)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
      }}
    >
      {children}
    </div>
  );
}
