'use client';

import { motion, useReducedMotion } from 'framer-motion';

// ──── Dekorative Drift-Orbs (motion.dev: Tween-Loops, Keyframes > 2 → Tween) ────
// Ohne Seiten-Scroll gibt es keine Scroll-Kopplung mehr: Die Orbs treiben in
// endlosen Tween-Loops — rein dekorativ, compositor-freundlich (nur transform).
// Achtung: Loops mit mehr als 2 Keyframes dürfen niemals spring-transiieren
// (Motion-Invariant), daher bewusst Tween mit easeInOut.
const DRIFT_DURATION_S = 14;

export function ParallaxOrbs() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, 34, 0], x: [0, 18, 0] }}
        transition={{ duration: DRIFT_DURATION_S, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '60px',
          left: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -26, 0], x: [0, -14, 0] }}
        transition={{
          duration: DRIFT_DURATION_S * 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{
          position: 'absolute',
          bottom: '-60px',
          right: '-100px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)',
          filter: 'blur(32px)',
        }}
      />
    </div>
  );
}
