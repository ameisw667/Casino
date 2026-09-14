'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';
import { soundManager } from '@/lib/casino/sound-manager';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';

export interface VaultKineticDrumProps {
  formatted: string;
  isMobile?: boolean;
  className?: string;
}

const SPRING_PHYSICS = {
  stiffness: 350,
  damping: 24,
  mass: 0.8,
};

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Single 3D Cylindrical Digit Drum (10-sided regular prism).
 * Facet angles: 36 deg apart (360 / 10).
 * Radius R = facetHeight / (2 * tan(18 deg)) ≈ facetHeight * 1.5388
 */
interface CylinderDrumProps {
  targetDigit: number;
  drumHeight: number;
  drumWidth: number;
  radius: number;
  delayIndex: number;
  globalTilt: number;
  isMobile: boolean;
}

const CylinderDrum = memo(function CylinderDrum({
  targetDigit,
  drumHeight,
  drumWidth,
  radius,
  delayIndex,
  globalTilt,
  isMobile,
}: CylinderDrumProps) {
  const prefersReduced = useReducedMotion();
  const currentAngleRef = useRef<number>(-targetDigit * 36);
  const targetAngleMotion = useMotionValue(-targetDigit * 36);
  const smoothAngle = useSpring(targetAngleMotion, SPRING_PHYSICS);

  useEffect(() => {
    if (prefersReduced) {
      targetAngleMotion.set(-targetDigit * 36);
      currentAngleRef.current = -targetDigit * 36;
      return;
    }

    const prevAngle = currentAngleRef.current;
    const currentDigit = ((Math.round(-prevAngle / 36) % 10) + 10) % 10;
    let diff = targetDigit - currentDigit;
    if (diff < 0) {
      // Numbers in a jackpot tick upwards: roll forward over 9 -> 0
      diff += 10;
    }
    const nextAngle = prevAngle - diff * 36;
    currentAngleRef.current = nextAngle;

    const timer = setTimeout(
      () => {
        targetAngleMotion.set(nextAngle);
      },
      (delayIndex % 4) * 20,
    );

    return () => clearTimeout(timer);
  }, [targetDigit, delayIndex, prefersReduced, targetAngleMotion]);

  // Combined rotation: digit rotation + interactive global tilt
  const combinedAngle = useMotionValue(-targetDigit * 36);

  useEffect(() => {
    const unsub = smoothAngle.on('change', (v) => {
      combinedAngle.set(v + globalTilt);
    });
    return unsub;
  }, [smoothAngle, globalTilt, combinedAngle]);

  useEffect(() => {
    combinedAngle.set(smoothAngle.get() + globalTilt);
  }, [globalTilt, smoothAngle, combinedAngle]);

  return (
    <div
      style={{
        position: 'relative',
        width: `${drumWidth}px`,
        height: `${drumHeight}px`,
        perspective: '600px',
        perspectiveOrigin: '50% 50%',
        margin: isMobile ? '0 1px' : '0 2px',
        userSelect: 'none',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX: combinedAngle,
        }}
      >
        {DIGITS.map((num) => {
          const facetAngle = num * 36;
          return (
            <div
              key={num}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: `${drumHeight}px`,
                width: `${drumWidth}px`,
                transform: `rotateX(${facetAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                ...bentoTypography.dynamicNumber,
                fontWeight: 950,
                fontSize: `${drumHeight * 0.72}px`,
                lineHeight: 1,
                textAlign: 'center',
                background:
                  'linear-gradient(180deg, #FFFFFF 0%, #F5E08C 35%, #D4AF37 75%, #A37910 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.45))',
              }}
            >
              {num}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
});

/**
 * Precision Bezel Static Segment (for currency '$' and separators ',', '.')
 */
function StaticChar({
  char,
  drumHeight,
  isMobile,
}: {
  char: string;
  drumHeight: number;
  isMobile: boolean;
}) {
  const isCurrency = char === '$';
  const isSeparator = char === ',' || char === '.';

  if (isCurrency) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFE885',
          fontSize: `${drumHeight * 0.68}px`,
          fontWeight: 950,
          marginRight: isMobile ? '3px' : '6px',
          filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.65))',
          letterSpacing: '0.02em',
          userSelect: 'none',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        $
      </div>
    );
  }

  if (isSeparator) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F5E08C',
          fontWeight: 950,
          margin: isMobile ? '0 1px' : '0 2px',
          fontSize: char === ',' ? `${drumHeight * 0.78}px` : `${drumHeight * 0.88}px`,
          filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))',
          userSelect: 'none',
          fontFamily: 'var(--font-mono, monospace)',
          verticalAlign: char === '.' ? 'baseline' : 'middle',
        }}
      >
        {char}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-block',
        margin: '0 2px',
        opacity: 0.6,
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {char}
    </div>
  );
}

/**
 * High-End 3D Vault Kinetic Drum.
 * Features:
 * - 10-faced cylindrical polygon geometry with CSS preserve-3d and translateZ.
 * - Dynamic sheen edges at top and bottom of cylinder curvature.
 * - Mechanical Odometer slit vignette creating authentic dark roll-in/roll-out.
 * - Interactive vertical touch-drag, mouse wheel, and scroll reactivity with Framer Motion Springs (damping: 24, stiffness: 350).
 */
export const VaultKineticDrum = memo(function VaultKineticDrum({
  formatted,
  isMobile = false,
  className = '',
}: VaultKineticDrumProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [globalTilt, setGlobalTilt] = useState(0);
  const isInteracting = useRef(false);
  const startY = useRef(0);

  // Dimensions based on viewport
  const drumHeight = isMobile ? 36 : 48;
  const drumWidth = isMobile ? 16 : 22;
  // Radius R = height / (2 * tan(18deg))
  const radius = Math.round(drumHeight / (2 * Math.tan((18 * Math.PI) / 180)));

  // Haptic snap-back spring for interactive tilt
  const tiltSpring = useSpring(0, SPRING_PHYSICS);

  useEffect(() => {
    const unsub = tiltSpring.on('change', (v) => {
      setGlobalTilt(v);
    });
    return unsub;
  }, [tiltSpring]);

  // Pointer drag handling for haptic drum spinning
  const handlePointerDown = (e: React.PointerEvent) => {
    isInteracting.current = true;
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting.current) return;
    const deltaY = e.clientY - startY.current;
    // Map drag pixels to degrees of drum tilt (clamped to max ±36deg)
    const tiltDeg = Math.max(-36, Math.min(36, deltaY * 0.8));
    tiltSpring.set(tiltDeg);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer was lost
    }
    // Snap back to 0 with spring physics
    tiltSpring.set(0);
    soundManager.play('spin');
  };

  // Wheel handling for desktop mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const impulse = e.deltaY > 0 ? -18 : 18;
    tiltSpring.set(impulse);
    setTimeout(() => {
      tiltSpring.set(0);
    }, 120);
  };

  const chars = formatted.split('');

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '8px 12px' : '12px 24px',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #18202B 0%, #0E131C 35%, #080A10 70%, #05060A 100%)',
        border: '1px solid rgba(212, 175, 55, 0.42)',
        boxShadow:
          'inset 0 2px 8px rgba(0, 0, 0, 0.95), inset 0 -1px 3px rgba(255, 255, 255, 0.12), 0 12px 40px rgba(0, 0, 0, 0.8), 0 0 32px rgba(212, 175, 55, 0.18)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        cursor: 'grab',
        touchAction: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Precision Chamfer / Vault Side Flanges */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background:
            'linear-gradient(90deg, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.05) 100%)',
          zIndex: 6,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background:
            'linear-gradient(270deg, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.05) 100%)',
          zIndex: 6,
        }}
      />

      {/* Top Metallic Sheen Edge (Glanzkante oben an der Trommelkrümmung) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '24%',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Bottom Vault Sheen Edge (Glanzkante unten) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20%',
          background: 'linear-gradient(0deg, rgba(212, 175, 55, 0.14) 0%, transparent 100%)',
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* 3D Cylindrical Odometer Vignette: Roll out of darkness at top and into darkness at bottom */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 7, 12, 0.95) 0%, rgba(5, 7, 12, 0.3) 24%, transparent 38%, transparent 62%, rgba(5, 7, 12, 0.3) 76%, rgba(5, 7, 12, 0.95) 100%)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Dynamic 24k Gold Reflection Sweep */}
      <motion.div
        aria-hidden
        animate={{
          x: ['-160%', '260%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 4.8,
          ease: 'easeInOut',
          repeatDelay: 2.2,
        }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '32%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Drum Array Chassis */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          transformStyle: 'preserve-3d',
        }}
      >
        {chars.map((ch, idx) => {
          const isNumeric = /\d/.test(ch);
          if (!isNumeric) {
            return (
              <StaticChar
                key={`static-${idx}-${ch}`}
                char={ch}
                drumHeight={drumHeight}
                isMobile={isMobile}
              />
            );
          }
          return (
            <CylinderDrum
              key={`drum-${idx}`}
              targetDigit={parseInt(ch, 10)}
              drumHeight={drumHeight}
              drumWidth={drumWidth}
              radius={radius}
              delayIndex={chars.length - 1 - idx}
              globalTilt={globalTilt}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </div>
  );
});

/**
 * 3D Cylindrical Metric Station for Platform Stats Ticker.
 */
export interface KineticStatStationProps {
  label: string;
  value: string;
  isMobile: boolean;
  isLast?: boolean;
}

export const KineticStatStation = memo(function KineticStatStation({
  label,
  value,
  isMobile,
  isLast = false,
}: KineticStatStationProps) {
  const [tilt, setTilt] = useState(0);
  const tiltSpring = useSpring(0, SPRING_PHYSICS);

  useEffect(() => {
    const unsub = tiltSpring.on('change', (v) => setTilt(v));
    return unsub;
  }, [tiltSpring]);

  const handlePointerDown = () => {
    tiltSpring.set(16);
    soundManager.play('chip');
  };

  const handlePointerUp = () => {
    tiltSpring.set(0);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '8px 10px' : '10px 18px',
        borderRight: !isLast && !isMobile ? '1px solid rgba(212, 175, 55, 0.16)' : 'none',
        perspective: '600px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Eyebrow Label with Gold Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '6px',
          color: 'rgba(255, 255, 255, 0.68)',
          fontSize: '0.62rem',
          fontWeight: 900,
          letterSpacing: '0.09em',
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
            boxShadow: '0 0 6px rgba(212, 175, 55, 0.8)',
          }}
        />
        <span>{label}</span>
      </div>

      {/* 3D Cylindrical Station Chassis with Sheen */}
      <motion.div
        style={{
          position: 'relative',
          padding: isMobile ? '6px 12px' : '8px 18px',
          borderRadius: '10px',
          background:
            'linear-gradient(180deg, rgba(24, 32, 43, 0.6) 0%, rgba(11, 14, 20, 0.8) 50%, rgba(6, 8, 13, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.6)',
          transformStyle: 'preserve-3d',
          rotateX: tilt,
          overflow: 'hidden',
        }}
      >
        {/* Curvature Sheen */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '35%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '28%',
            background: 'linear-gradient(0deg, rgba(7, 9, 15, 0.8) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Value text with 3D depth and tabular numbers */}
        <div
          style={{
            ...bentoTypography.dynamicNumber,
            fontSize: isMobile ? '1.05rem' : 'clamp(1.15rem, 1.8vw, 1.55rem)',
            fontWeight: 1000,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.8), 0 0 12px rgba(212, 175, 55, 0.3)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {value}
        </div>
      </motion.div>
    </div>
  );
});
