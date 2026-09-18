'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export type KineticVariant = 'impact' | 'smooth' | 'croupier' | 'verdict';
export type KineticColorScheme = 'gold' | 'emerald' | 'ruby' | 'obsidian' | 'blue' | 'custom';

export interface KineticTextRevealProps {
  text: string;
  subtitle?: string;
  triggerKey?: string | number;
  variant?: KineticVariant;
  skewAngle?: number;
  colorScheme?: KineticColorScheme;
  customColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  className?: string;
  style?: React.CSSProperties;
  isMobile?: boolean;
}

const COLOR_MAP: Record<KineticColorScheme, { text: string; bgGradient: string; shadow: string; border: string }> = {
  gold: {
    text: '#FFFDF0',
    bgGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5D77F 40%, #D4AF37 80%, #AA771C 100%)',
    shadow: '0 0 35px rgba(212, 175, 55, 0.65), 0 4px 15px rgba(0, 0, 0, 0.9)',
    border: 'rgba(212, 175, 55, 0.5)',
  },
  emerald: {
    text: '#FFFFFF',
    bgGradient: 'linear-gradient(135deg, #A7F3D0 0%, #10B981 50%, #047857 100%)',
    shadow: '0 0 35px rgba(16, 185, 129, 0.7), 0 4px 15px rgba(0, 0, 0, 0.9)',
    border: 'rgba(16, 185, 129, 0.5)',
  },
  ruby: {
    text: '#FFFFFF',
    bgGradient: 'linear-gradient(135deg, #FECACA 0%, #EF4444 50%, #B91C1C 100%)',
    shadow: '0 0 40px rgba(239, 68, 68, 0.8), 0 4px 15px rgba(0, 0, 0, 0.9)',
    border: 'rgba(239, 68, 68, 0.6)',
  },
  obsidian: {
    text: '#F1F5F9',
    bgGradient: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 50%, #334155 100%)',
    shadow: '0 0 25px rgba(0, 0, 0, 0.85), 0 4px 15px rgba(0, 0, 0, 0.9)',
    border: 'rgba(148, 163, 184, 0.3)',
  },
  blue: {
    text: '#FFFFFF',
    bgGradient: 'linear-gradient(135deg, #BFDBFE 0%, #3B82F6 50%, #1D4ED8 100%)',
    shadow: '0 0 30px rgba(59, 130, 246, 0.65), 0 4px 15px rgba(0, 0, 0, 0.9)',
    border: 'rgba(59, 130, 246, 0.5)',
  },
  custom: {
    text: 'inherit',
    bgGradient: 'inherit',
    shadow: 'none',
    border: 'transparent',
  },
};

export function KineticTextReveal({
  text,
  subtitle,
  triggerKey,
  variant = 'impact',
  skewAngle,
  colorScheme = 'gold',
  customColor,
  fontSize,
  fontFamily = "var(--font-heading, 'Cinzel', serif)",
  fontWeight = 900,
  letterSpacing = '0.04em',
  className = '',
  style = {},
  isMobile = false,
}: KineticTextRevealProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const scheme = COLOR_MAP[colorScheme];
  const effectiveSkew = skewAngle !== undefined ? skewAngle : isMobile ? 8 : 14;

  const springConfig =
    variant === 'impact'
      ? { stiffness: 500, damping: 18, mass: 0.8 }
      : variant === 'verdict'
        ? { stiffness: 380, damping: 20, mass: 0.9 }
        : variant === 'croupier'
          ? { stiffness: 260, damping: 24, mass: 1.0 }
          : { stiffness: 180, damping: 26, mass: 1.0 };

  const parsedFontSize =
    fontSize !== undefined
      ? typeof fontSize === 'number'
        ? `${fontSize}px`
        : fontSize
      : isMobile
        ? 'clamp(1.5rem, 5vw, 2.2rem)'
        : 'clamp(2rem, 3.8vw, 3.2rem)';

  // Reduced motion: render clean static label
  if (prefersReducedMotion) {
    return (
      <div
        className={`kinetic-text-reveal-container ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          ...style,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: parsedFontSize,
            fontWeight,
            letterSpacing,
            color: customColor || scheme.text,
            background: customColor ? undefined : scheme.bgGradient,
            WebkitBackgroundClip: customColor ? undefined : 'text',
            WebkitTextFillColor: customColor ? undefined : 'transparent',
            textShadow: customColor ? scheme.shadow : undefined,
            filter: customColor ? undefined : `drop-shadow(${scheme.shadow})`,
            lineHeight: 1.1,
          }}
        >
          {text}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255, 255, 255, 0.65)',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  const activeKey = triggerKey !== undefined ? triggerKey : text;

  return (
    <div
      className={`kinetic-text-reveal-container relative inline-flex flex-col items-center justify-center select-none ${className}`}
      aria-live="assertive"
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...style,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'relative',
            display: 'inline-block',
            lineHeight: 1.1,
            overflow: 'visible',
          }}
        >
          {/* Top Slice: slidet von links mit negativem Skew */}
          <motion.div
            initial={{
              x: isMobile ? -35 : -60,
              skewX: -effectiveSkew,
              opacity: 0,
            }}
            animate={{
              x: 0,
              skewX: 0,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              ...springConfig,
            }}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 55%, 0 45%)',
              WebkitClipPath: 'polygon(0 0, 100% 0, 100% 55%, 0 45%)',
              fontFamily,
              fontSize: parsedFontSize,
              fontWeight,
              letterSpacing,
              color: customColor || scheme.text,
              background: customColor ? undefined : scheme.bgGradient,
              WebkitBackgroundClip: customColor ? undefined : 'text',
              WebkitTextFillColor: customColor ? undefined : 'transparent',
              filter: customColor ? undefined : `drop-shadow(${scheme.shadow})`,
              willChange: 'transform, opacity',
            }}
          >
            {text}
          </motion.div>

          {/* Bottom Slice: slidet von rechts mit positivem Skew */}
          <motion.div
            initial={{
              x: isMobile ? 35 : 60,
              skewX: effectiveSkew,
              opacity: 0,
            }}
            animate={{
              x: 0,
              skewX: 0,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              ...springConfig,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 45%, 100% 55%, 100% 100%, 0 100%)',
              WebkitClipPath: 'polygon(0 45%, 100% 55%, 100% 100%, 0 100%)',
              fontFamily,
              fontSize: parsedFontSize,
              fontWeight,
              letterSpacing,
              color: customColor || scheme.text,
              background: customColor ? undefined : scheme.bgGradient,
              WebkitBackgroundClip: customColor ? undefined : 'text',
              WebkitTextFillColor: customColor ? undefined : 'transparent',
              filter: customColor ? undefined : `drop-shadow(${scheme.shadow})`,
              willChange: 'transform, opacity',
            }}
          >
            {text}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Subtitle / Calling Label */}
      {subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '4px',
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </motion.div>
      )}
    </div>
  );
}

export default KineticTextReveal;
