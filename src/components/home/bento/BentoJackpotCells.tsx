'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Gem } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';
import { RollingJackpotDisplay } from '../ProgressiveJackpotSection';
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.16 }}
      style={{
        gridColumn: 'span 2',
        gridRow: 'span 1',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        background:
          'linear-gradient(120deg, rgba(20, 18, 10, 0.9) 0%, rgba(11, 14, 20, 0.85) 55%, rgba(24, 18, 8, 0.9) 100%)',
        minHeight: isMobile ? '150px' : '170px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '16px 12px' : '22px 24px',
        gap: '8px',
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
          fontSize: isMobile ? 'clamp(1.6rem, 7vw, 2.4rem)' : 'clamp(2.4rem, 3.5vw, 3.4rem)',
          fontWeight: 1000,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5E08C 35%, #D4AF37 70%, #997517 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 28px rgba(212, 175, 55, 0.35))',
        }}
      >
        {jackpotFormatted !== '—' ? (
          <RollingJackpotDisplay formatted={jackpotFormatted} />
        ) : (
          <motion.span
            animate={prefersReducedMotion ? undefined : { opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ letterSpacing: '0.02em' }}
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
 * Platform trust stats: the second row of the jackpot band, sitting directly
 * beside the lower half of the 2x2 Live-Stream cell — no bento hole.
 */
export function PlatformStatsCell({ isMobile }: { isMobile: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.22 }}
      style={{
        gridColumn: 'span 2',
        gridRow: 'span 1',
        borderRadius: '16px',
        background: 'rgba(11, 14, 20, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
        gap: isMobile ? '10px 0' : '0',
        padding: isMobile ? '12px 4px' : '14px 0',
        minHeight: '84px',
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
              padding: '4px 6px',
              borderRight:
                i < PLATFORM_STATS.length - 1 && !isMobile
                  ? '1px solid rgba(255, 255, 255, 0.07)'
                  : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '3px',
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: '0.58rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <span>{stat.label}</span>
            </div>
            <div
              style={{
                ...bentoTypography.dynamicNumber,
                // Fluid: hält z.B. "$14,280,450+" auch am unteren Desktop-Range
                // (~1024px) ellipsenfrei, statt erst ab 1200px zu truncieren.
                fontSize: isMobile ? '0.82rem' : 'clamp(0.62rem, -0.33rem + 1.5vw, 1.02rem)',
                fontWeight: 1000,
                color: '#fff',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
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
