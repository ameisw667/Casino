'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Gem } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';
import { KineticNumberRoller } from '@/components/casino/typography/KineticNumberRoller';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';

/**
 * Jackpot bento cell (span 2): liquid-gold typographic moment with rolling
 * digits plus a scroll-coupled parallax glow layer — continuous motion after
 * reveal, compositor-friendly (transform only).
 */

// Showcase-Werte gespiegelt aus ProgressiveJackpotSection (Live-Lobby-Kopie);
// ohne Icons — reine Typo-Stats für den professionellen Look.
const PLATFORM_STATS = [
  { label: 'Gesamt ausgezahlt', value: '$14,280,450+' },
  { label: 'Auszahlungsdauer', value: '1.8 Sekunden' },
  { label: 'Platzierte Wetten', value: '4,892,100+' },
  { label: 'Provably Fair', value: '100%' },
] as const;

export function BentoJackpotCell({ isMobile }: { isMobile: boolean }) {
  const { formatted: jackpotFormatted } = useProgressiveJackpot();
  const prefersReducedMotion = useReducedMotion();
  const glowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: glowRef,
    offset: ['start end', 'end start'],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ['22%', '-22%']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.gentle }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        background:
          'linear-gradient(120deg, rgba(20, 18, 10, 0.9) 0%, rgba(11, 14, 20, 0.85) 55%, rgba(24, 18, 8, 0.9) 100%)',
        minHeight: isMobile ? '240px' : '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '16px 12px' : '24px 20px',
        gap: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Scroll-parallax liquid gold glow with slow breathing pulse */}
      <motion.div
        ref={glowRef}
        animate={prefersReducedMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '-30%',
          background:
            'radial-gradient(ellipse at 35% 55%, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 75%)',
          filter: 'blur(28px)',
          y: glowY,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '4px 13px',
          borderRadius: '9999px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.32)',
          color: bentoColors.gold,
          fontSize: '0.6rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <Gem size={12} />
        <span>Live Progressive Jackpot</span>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          fontSize: isMobile ? 'clamp(1.2rem, 5.2vw, 1.8rem)' : 'clamp(1.6rem, 2.5vw, 2.3rem)',
          fontWeight: 900,
          lineHeight: 1.1,
        }}
      >
        {jackpotFormatted !== '—' ? (
          <KineticNumberRoller formatted={jackpotFormatted} />
        ) : (
          <motion.span
            animate={prefersReducedMotion ? undefined : { opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5E08C 35%, #D4AF37 70%, #997517 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            $ --,---,---.--{' '}
          </motion.span>
        )}
      </div>

      <p
        style={{
          position: 'relative',
          fontSize: '0.74rem',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: 0,
          maxWidth: '480px',
        }}
      >
        Auszahlung erfolgt automatisch bei Treffer aller VIP Jackpot-Kombinationen.
      </p>
    </motion.div>
  );
}

/**
 * Platform trust stats: Frameless directly on the canvas background, spanning
 * full width (1 / -1) without a box container or empty right-hand space.
 */
export function PlatformStatsCell({ isMobile }: { isMobile: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.22 }}
      style={{
        gridColumn: '1 / -1',
        gridRow: 'span 1',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
        gap: isMobile ? '16px 0' : '0',
        padding: isMobile ? '16px 0 20px' : '22px 0 26px',
        margin: '6px 0',
        borderTop: '1px solid rgba(212, 175, 55, 0.14)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.14)',
        width: '100%',
      }}
    >
      {PLATFORM_STATS.map((stat, i) => {
        return (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '6px 12px',
              borderRight:
                i < PLATFORM_STATS.length - 1 && !isMobile
                  ? '1px solid rgba(212, 175, 55, 0.16)'
                  : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '5px',
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.62rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: bentoColors.gold,
                  display: 'inline-block',
                }}
              />
              <span>{stat.label}</span>
            </div>
            <div
              style={{
                ...bentoTypography.dynamicNumber,
                fontSize: isMobile ? '1.05rem' : 'clamp(1.15rem, 1.8vw, 1.55rem)',
                fontWeight: 1000,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              }}
            >
              {stat.value}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
