'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface BentoAnimatedGlowProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
  variant?: 'gold' | 'emerald' | 'bronze';
}

/**
 * BentoAnimatedGlow — Componentry #37 / Plan 59
 *
 * Provides a dynamic, organic hardware-accelerated animated gradient aura
 * behind Bento cards, eliminating flat box-shadows and adding living edge brilliance.
 */
export function BentoAnimatedGlow({
  className = '',
  intensity = 'medium',
  variant = 'gold',
}: BentoAnimatedGlowProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const opacityMap = {
    subtle: 0.25,
    medium: 0.45,
    high: 0.65,
  };

  const baseOpacity = opacityMap[intensity];

  const paletteMap = {
    gold: {
      primary: 'rgba(212, 175, 55, 0.45)',
      secondary: 'rgba(255, 235, 170, 0.3)',
      accent: 'rgba(170, 119, 28, 0.2)',
      borderGlow: 'rgba(212, 175, 55, 0.4)',
    },
    emerald: {
      primary: 'rgba(16, 185, 129, 0.45)',
      secondary: 'rgba(52, 211, 153, 0.3)',
      accent: 'rgba(5, 150, 105, 0.2)',
      borderGlow: 'rgba(16, 185, 129, 0.4)',
    },
    bronze: {
      primary: 'rgba(180, 83, 9, 0.45)',
      secondary: 'rgba(217, 119, 6, 0.3)',
      accent: 'rgba(146, 64, 14, 0.2)',
      borderGlow: 'rgba(217, 119, 6, 0.4)',
    },
  };

  const colors = paletteMap[variant];

  if (prefersReducedMotion) {
    return (
      <div
        data-testid="bento-animated-glow"
        className={`pointer-events-none absolute -inset-1 rounded-[24px] ${className}`}
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${colors.primary} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          opacity: baseOpacity,
          zIndex: 0,
        }}
      />
    );
  }

  return (
    <div
      data-testid="bento-animated-glow"
      className={`pointer-events-none absolute -inset-[2px] overflow-visible rounded-[20px] ${className}`}
      style={{
        zIndex: 0,
        transform: 'translateZ(0)',
      }}
    >
      {/* 1. Orbiting Radial Perlin Noise Aurora */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '0% 0%'],
          opacity: [baseOpacity * 0.8, baseOpacity * 1.2, baseOpacity * 0.9, baseOpacity * 0.8],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: '-20px',
          background: `radial-gradient(circle at 20% 30%, ${colors.primary} 0%, transparent 40%),
                       radial-gradient(circle at 80% 70%, ${colors.secondary} 0%, transparent 45%),
                       radial-gradient(circle at 50% 50%, ${colors.accent} 0%, transparent 60%)`,
          backgroundSize: '150% 150%',
          filter: 'blur(24px)',
          transform: 'translateZ(0)',
        }}
      />

      {/* 2. Living Edge Conic Rim Light */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: 'inherit',
          background: `conic-gradient(from 0deg, transparent 0deg, ${colors.borderGlow} 60deg, transparent 120deg, ${colors.primary} 240deg, transparent 300deg)`,
          opacity: baseOpacity * 0.75,
          filter: 'blur(4px)',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}

export default BentoAnimatedGlow;
