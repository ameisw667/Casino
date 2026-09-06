'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { springs } from '@/lib/design/motion-tokens';

// ──── Zahlen-Rollup (motion.dev: Motion Value als Kind-Element) ────
// Der gefederte Motion Value wird direkt als Textkind gerendert — die DOM-
// Textnode aktualisiert sich pro Frame OHNE React-Re-Render.
export function RollUpNumber({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const counter = useMotionValue(0);
  const rolled = useSpring(counter, springs.counterRoll);
  const text = useTransform(rolled, (v) => Math.round(v).toString());

  useEffect(() => {
    counter.set(value);
  }, [counter, value]);

  if (prefersReducedMotion) {
    return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>;
  }

  return (
    <motion.span
      style={{
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {text}
    </motion.span>
  );
}
