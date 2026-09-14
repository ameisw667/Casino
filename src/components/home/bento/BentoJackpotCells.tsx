'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Gem, Sparkles, Zap, Flame, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import { soundManager } from '@/lib/casino/sound-manager';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';
import { VaultKineticDrum } from './VaultKineticDrum';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';
import { BentoAnimatedGlow } from './BentoAnimatedGlow';

/**
 * Ornate precision corner rivet (Schweizer Banktresor / High-End Uhren-Optik).
 * 13px circular bolt with metallic gold/steel gradient, micro screw slot and inset shadow.
 */
function VaultCornerRivet({ style }: { style: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #524218 0%, #1e2533 65%, #0d121c 100%)',
        border: '1px solid rgba(212, 175, 55, 0.55)',
        boxShadow:
          'inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.85), 0 2px 5px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {/* Micro screw slot */}
      <div
        style={{
          width: '6px',
          height: '1.5px',
          background: 'rgba(212, 175, 55, 0.8)',
          borderRadius: '1px',
          boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.9)',
        }}
      />
    </div>
  );
}

/**
 * Master-Vault Bezel (Schweizer Banktresor):
 * - Satin-Gold Chamfer & 4 Corner Rivets
 * - Breathing 24k Ambient Aura
 * - Recessed Bevel Cutout for Odometer Digit Drums
 * - "JACKPOT HOT · IMMINENT" Pulsing LED Badge
 */
export function BentoJackpotCell({ isMobile }: { isMobile: boolean }) {
  const { formatted: jackpotFormatted } = useProgressiveJackpot();
  const prefersReducedMotion = useReducedMotion();
  const glowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: glowRef,
    offset: ['start end', 'end start'],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.gentle }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1.5px solid rgba(212, 175, 55, 0.42)',
        boxShadow:
          '0 14px 44px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 0 36px rgba(0, 0, 0, 0.85)',
        background:
          'linear-gradient(135deg, rgba(18, 23, 34, 0.96) 0%, rgba(10, 13, 20, 0.98) 50%, rgba(22, 18, 9, 0.96) 100%)',
        minHeight: isMobile ? '240px' : '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '16px 12px' : '24px 20px',
        gap: isMobile ? '10px' : '14px',
        boxSizing: 'border-box',
      }}
    >
      {/* 4 Corner Rivets (Banktresor-Nieten) */}
      <VaultCornerRivet style={{ top: '10px', left: '10px' }} />
      <VaultCornerRivet style={{ top: '10px', right: '10px' }} />
      <VaultCornerRivet style={{ bottom: '10px', left: '10px' }} />
      <VaultCornerRivet style={{ bottom: '10px', right: '10px' }} />

      {/* Dynamic Ambient Glow (Touchpoint 37 / Componentry #59) */}
      <BentoAnimatedGlow intensity="high" variant="gold" />

      {/* Breathing 24k Ambient Aura coupled to Jackpot presence */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.45, 0.85, 0.45],
                scale: [0.98, 1.02, 0.98],
              }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: '-20%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 72%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Scroll-parallax liquid gold sheen */}
      <motion.div
        ref={glowRef}
        animate={prefersReducedMotion ? undefined : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '-30%',
          background:
            'radial-gradient(ellipse at 35% 55%, rgba(212, 175, 55, 0.14) 0%, rgba(212, 175, 55, 0.03) 50%, transparent 75%)',
          filter: 'blur(26px)',
          y: glowY,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Header Badge */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '4px 14px',
          borderRadius: '9999px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: bentoColors.gold,
          fontSize: '0.62rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Gem size={13} />
        <span>Live Progressive Jackpot</span>
      </div>

      {/* Recessed Mechanical Zählwerk-Cutout (Vault Bevel Cutout) */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '100%',
          padding: isMobile ? '4px 6px' : '6px 12px',
          borderRadius: '20px',
          background: 'linear-gradient(180deg, #06080D 0%, #0C101A 50%, #030407 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.32)',
          boxShadow:
            'inset 0 6px 18px rgba(0, 0, 0, 0.95), inset 0 -3px 8px rgba(255, 255, 255, 0.06), 0 8px 26px rgba(0, 0, 0, 0.7)',
        }}
      >
        {jackpotFormatted !== '—' ? (
          <VaultKineticDrum formatted={jackpotFormatted} isMobile={isMobile} />
        ) : (
          <VaultKineticDrum formatted="$1,489,200.00" isMobile={isMobile} />
        )}
      </div>

      {/* Micro-Callout: JACKPOT HOT · IMMINENT with Pulsing LED */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.28)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Pulsing Green/Gold LED */}
        <span style={{ position: 'relative', display: 'flex', width: '7px', height: '7px' }}>
          <span
            style={{
              position: 'absolute',
              display: 'inline-flex',
              height: '100%',
              width: '100%',
              borderRadius: '50%',
              background: '#10B981',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              borderRadius: '50%',
              height: '7px',
              width: '7px',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }}
          />
        </span>
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 950,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#F5E08C',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          JACKPOT HOT · IMMINENT
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.6rem' }}>|</span>
        <span
          style={{
            fontSize: '0.62rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 700,
          }}
        >
          Treffer bei VIP Jackpot-Kombination
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Platform Trust Stats Data with Holographic Micro-Icons and Specific Sub-Badges.
 */
const ENRICHED_PLATFORM_STATS = [
  {
    id: 'payout-volume',
    label: 'Gesamt ausgezahlt',
    value: '$14,280,450+',
    icon: Sparkles,
    iconColor: '#D4AF37',
    badgeText: 'On-Chain Verifiziert',
    glowColor: 'rgba(212, 175, 55, 0.35)',
  },
  {
    id: 'payout-speed',
    label: 'Auszahlungsdauer',
    value: '1.8 Sekunden',
    icon: Zap,
    iconColor: '#10B981',
    badgeText: 'Instant Automated',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'wagers-count',
    label: 'Platzierte Wetten',
    value: '4,892,100+',
    icon: Flame,
    iconColor: '#F59E0B',
    badgeText: '24/7 Globales Netzwerk',
    glowColor: 'rgba(245, 158, 11, 0.35)',
  },
  {
    id: 'provably-fair',
    label: 'Provably Fair',
    value: '100%',
    icon: ShieldCheck,
    iconColor: '#10B981',
    badgeText: 'SHA-256 Validiert',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
] as const;

/**
 * Individual Monolithic Console Station with Holographic Badge & Haptic Spring-Feedback
 */
function MonolithicStatStation({
  stat,
  isMobile,
  isLast,
}: {
  stat: (typeof ENRICHED_PLATFORM_STATS)[number];
  isMobile: boolean;
  isLast: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = stat.icon;

  const handlePointerDown = () => {
    soundManager.play('chip');
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '10px 8px' : '14px 18px',
        borderRight: !isLast && !isMobile ? '1px solid rgba(212, 175, 55, 0.15)' : 'none',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 0.25s ease',
        background: isHovered
          ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)'
          : 'transparent',
      }}
    >
      {/* Header with Holographic Icon & Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '6px',
          color: 'rgba(255, 255, 255, 0.72)',
          fontSize: '0.62rem',
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: `${stat.iconColor}18`,
            border: `1px solid ${stat.iconColor}44`,
            color: stat.iconColor,
            boxShadow: `0 0 8px ${stat.glowColor}`,
          }}
        >
          <IconComponent size={10} strokeWidth={2.5} />
        </div>
        <span>{stat.label}</span>
      </div>

      {/* Metric Value with 3D Monospace / Tabular Font */}
      <div
        style={{
          ...bentoTypography.dynamicNumber,
          fontSize: isMobile ? '1.08rem' : 'clamp(1.22rem, 1.85vw, 1.58rem)',
          fontWeight: 1000,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          textShadow: `0 2px 14px rgba(0, 0, 0, 0.9), 0 0 16px ${stat.glowColor}`,
          transition: 'transform 0.2s ease, text-shadow 0.2s ease',
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
          marginBottom: '4px',
        }}
      >
        {stat.value}
      </div>

      {/* Holographic Verification Sub-Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.54rem',
          fontWeight: 800,
          color: 'rgba(255, 255, 255, 0.55)',
          letterSpacing: '0.04em',
        }}
      >
        {stat.id === 'provably-fair' ? (
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #10B981',
              display: 'inline-block',
            }}
          />
        ) : (
          <CheckCircle2 size={9} style={{ color: stat.iconColor }} />
        )}
        <span>{stat.badgeText}</span>
      </div>
    </div>
  );
}

/**
 * Platform Trust Stats: Monolithische Luxus-Konsole (HUD-Dock)
 * - Cohesive Monolithic Chassis mit 12px Backdrop-Blur & Golden Light Edge (borderTop)
 * - Subtile vertikale Hairline-Trennbalken (rgba(212, 175, 55, 0.15))
 * - Plakative Monospace/Tabular Typografie mit Hologramm-Badges
 */
export function PlatformStatsCell({ isMobile }: { isMobile: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.18 }}
      style={{
        gridColumn: '1 / -1',
        gridRow: 'span 1',
        width: '100%',
        borderRadius: '16px',
        background:
          'linear-gradient(180deg, rgba(17, 22, 33, 0.88) 0%, rgba(9, 12, 19, 0.94) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: '1.5px solid rgba(212, 175, 55, 0.45)', // Satin Gold Light Edge
        boxShadow: '0 12px 36px 0 rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
        padding: isMobile ? '12px 8px' : '16px 14px',
        gap: isMobile ? '10px 0' : '0',
        margin: '6px 0',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Subtle Golden Sub-Surface Mesh Ambient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {ENRICHED_PLATFORM_STATS.map((stat, i) => (
        <MonolithicStatStation
          key={stat.id}
          stat={stat}
          isMobile={isMobile}
          isLast={i === ENRICHED_PLATFORM_STATS.length - 1}
        />
      ))}
    </motion.div>
  );
}
