'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

// ──── Magnetischer CTA (motion.dev: Gestures) ────
// Wie ui/Magnetic, aber mit Motion Values statt useState — der Button folgt
// dem Cursor, ohne dass bei jedem Mousemove ein React-Re-Render entsteht.
export function MagneticCta({ children }: { children: React.ReactNode }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const x = useSpring(rawX, { stiffness: 300, damping: 20, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 300, damping: 20, mass: 0.4 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - (rect.left + rect.width / 2)) * 0.22);
    rawY.set((event.clientY - (rect.top + rect.height / 2)) * 0.35);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
}
