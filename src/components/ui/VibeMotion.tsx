'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

/**
 * VibeMotion - A premium animation wrapper for consistent spring physics.
 * 
 * Uses the Design-Guardian's standard spring settings:
 * - Stiffness: 300
 * - Damping: 30
 * - Mass: 1
 */
interface VibeMotionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'button' | 'card' | 'popup' | 'reveal';
  delay?: number;
}

export const VibeMotion: React.FC<VibeMotionProps> = ({ 
  children, 
  variant, 
  delay = 0,
  ...props 
}) => {
  const springTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
    delay
  };

  const variants = {
    button: {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
    },
    card: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      whileHover: { y: -8, boxShadow: 'var(--neon-glow-primary)' },
    },
    popup: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    },
    reveal: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    }
  };

  const selectedVariant = variant ? variants[variant] : {};

  return (
    <motion.div
      transition={springTransition}
      {...selectedVariant}
      {...props}
    >
      {children}
    </motion.div>
  );
};
