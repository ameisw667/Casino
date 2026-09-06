'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import { MagneticCta } from './MagneticCta';
import type { GameMeta } from '@/app/games/_components/config';

// ──── Quick-View (motion.dev: Layout-Animation / layoutId Shared Element) ────
// Der Medienrahmen mit layoutId="g2-media-{id}" fliegt beim Öffnen von der
// Bento-Grid-Position in diesen Dialog und beim Schließen zurück ins Grid.
export function QuickViewPanel({ game, onClose }: { game: GameMeta; onClose: () => void }) {
  const [imgError, setImgError] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const Icon = game.icon;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      role="presentation"
      key="g2-quickview-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(4, 5, 8, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={`${game.name} Quick-View`}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={springs.standard}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(520px, 100%)',
          padding: '18px 18px 22px',
          borderRadius: '24px',
          background:
            'linear-gradient(160deg, rgba(24, 26, 34, 0.96) 0%, rgba(11, 13, 18, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          boxShadow: '0 40px 90px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.07)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Quick-View schließen"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 4,
            width: '34px',
            height: '34px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            background: 'rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: 'rgba(255, 255, 255, 0.75)',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <motion.div
          layoutId={prefersReducedMotion ? undefined : `g2-media-${game.id}`}
          transition={springs.standard}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '16px',
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
              <Icon size={44} color={game.accentColor} />
            </div>
          ) : (
            <Image
              src={game.preview}
              alt={`${game.name} Vorschau`}
              fill
              sizes="(max-width: 600px) 100vw, 520px"
              style={{ objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          )}
        </motion.div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              fontWeight: 950,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            {game.name}
          </h2>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: game.accentColor,
              border: `1px solid ${game.accentColor}55`,
              borderRadius: '6px',
              padding: '3px 8px',
            }}
          >
            <Icon size={11} color={game.accentColor} />
            {game.category}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            marginTop: '12px',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          {game.desc}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '0.55rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'rgba(255, 255, 255, 0.35)',
              }}
            >
              PRO RUNDE
            </span>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 950,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {game.reward}
            </span>
          </div>

          <MagneticCta>
            <a
              href={`/games/${game.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                color: '#0B0E14',
                fontSize: '0.78rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textDecoration: 'none',
                boxShadow: '0 10px 26px rgba(212, 175, 55, 0.28)',
              }}
            >
              RUNDE STARTEN
            </a>
          </MagneticCta>
        </div>
      </motion.section>
    </motion.div>
  );
}

// ──── Wrapper für AnimatePresence-Exit: Panel nur rendern, wenn Spiel gesetzt ────
export function QuickViewLayer({ game, onClose }: { game: GameMeta | null; onClose: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {game && <QuickViewPanel key={game.id} game={game} onClose={onClose} />}
    </AnimatePresence>
  );
}
