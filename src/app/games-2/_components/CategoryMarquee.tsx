'use client';

import React, { useEffect, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

// ──── D — Kinetic Marquee-Band (motion.dev: Motion Values + useAnimationFrame) ────
// Antrieb über useAnimationFrame auf einer Motion Value (px/s → x), nicht über
// CSS-Keyframes: Die Laufgeschwindigkeit selbst ist ein Spring — Hover senkt
// sie sichtbar weich auf 0 (Deceleration statt hartem Stopp), Verlassen
// beschleunigt zurück. Wrap via x % -halfWidth (Content doppelt gerendert).

const TERMS = [
  'Transitions & Springs',
  'Gestures & Drag',
  'Scroll-Automation',
  'Layout-Animationen',
  'Exit-Animationen',
  'Motion Values',
  'Independent Transforms',
  'Reduced Motion',
  'Variants & Stagger',
  'Integration',
] as const;

const BASE_SPEED_PX_PER_S = 28;
const SPEED_SPRING = { stiffness: 90, damping: 18, mass: 1 } as const;

const TERM_STYLE: React.CSSProperties = {
  padding: '0 18px',
  fontSize: '0.6rem',
  fontWeight: 900,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(212, 175, 55, 0.78)',
  fontFamily: 'var(--font-mono), monospace',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '18px',
};

const SEPARATOR_STYLE: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.18)',
  fontWeight: 400,
};

export function CategoryMarquee() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const halfWidth = useRef(0);
  const x = useMotionValue(0);
  const speed = useSpring(BASE_SPEED_PX_PER_S, SPEED_SPRING);

  useEffect(() => {
    const measure = () => {
      // Beide Kopien sind identisch — die Hälfte der Track-Breite ist ein Loop.
      halfWidth.current = trackRef.current ? trackRef.current.scrollWidth / 2 : 0;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || halfWidth.current === 0) return;
    const next = x.get() - speed.get() * (delta / 1000);
    x.set(next <= -halfWidth.current ? next + halfWidth.current : next);
  });

  const hold = () => speed.set(0);
  const release = () => speed.set(BASE_SPEED_PX_PER_S);

  return (
    <div
      aria-hidden
      onPointerEnter={prefersReducedMotion ? undefined : hold}
      onPointerLeave={prefersReducedMotion ? undefined : release}
      style={{
        overflow: 'hidden',
        flexShrink: 0,
        borderTop: '1px solid rgba(212, 175, 55, 0.12)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)',
        cursor: 'default',
      }}
    >
      <motion.div ref={trackRef} style={{ x, display: 'flex', width: 'max-content' }}>
        {[0, 1].map((copy) => (
          <div key={copy} style={{ display: 'flex', flexShrink: 0, padding: '9px 0' }}>
            {TERMS.map((term) => (
              <span key={`${copy}-${term}`} style={TERM_STYLE}>
                {term}
                <span style={SEPARATOR_STYLE}>·</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
