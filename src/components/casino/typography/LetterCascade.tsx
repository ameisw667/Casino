'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export interface LetterCascadeProps {
  value: string | number;
  direction?: 'ltr' | 'rtl';
  staggerDelay?: number;
  stiffness?: number;
  damping?: number;
  fontSize?: string | number;
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  colorScheme?: 'gold' | 'silver' | 'emerald' | 'white';
  customColor?: string;
  className?: string;
  style?: React.CSSProperties;
  isMobile?: boolean;
}

const PALETTES = {
  gold: {
    bg: 'linear-gradient(180deg, #FFFFFF 0%, #F5E7A1 35%, #D4AF37 75%, #8C6B1B 100%)',
    shadow: '0 2px 10px rgba(212, 175, 55, 0.45)',
    border: 'rgba(212, 175, 55, 0.3)',
  },
  silver: {
    bg: 'linear-gradient(180deg, #FFFFFF 0%, #E5E4E2 50%, #94A3B8 100%)',
    shadow: '0 2px 10px rgba(229, 228, 226, 0.4)',
    border: 'rgba(229, 228, 226, 0.3)',
  },
  emerald: {
    bg: 'linear-gradient(180deg, #ECFDF5 0%, #34D399 45%, #059669 100%)',
    shadow: '0 2px 10px rgba(16, 185, 129, 0.45)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  white: {
    bg: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 50%, #CBD5E1 100%)',
    shadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
};

export function LetterCascade({
  value,
  direction = 'ltr',
  staggerDelay = 0.025,
  stiffness = 340,
  damping = 22,
  fontSize,
  fontFamily = "var(--font-mono, 'Geist Mono', monospace)",
  fontWeight = 900,
  letterSpacing = '0.02em',
  colorScheme = 'gold',
  customColor,
  className = '',
  style = {},
  isMobile = false,
}: LetterCascadeProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const str = String(value);
  const chars = str.split('');
  const palette = PALETTES[colorScheme];

  const parsedFontSize =
    fontSize !== undefined
      ? typeof fontSize === 'number'
        ? `${fontSize}px`
        : fontSize
      : isMobile
        ? '1.25rem'
        : '1.75rem';

  // Reduced motion: static tabular text
  if (prefersReducedMotion) {
    return (
      <span
        className={`letter-cascade-container inline-flex items-center ${className}`}
        style={{
          fontFamily,
          fontSize: parsedFontSize,
          fontWeight,
          letterSpacing,
          fontVariantNumeric: 'tabular-nums',
          color: customColor || '#D4AF37',
          background: customColor ? undefined : palette.bg,
          WebkitBackgroundClip: customColor ? undefined : 'text',
          WebkitTextFillColor: customColor ? undefined : 'transparent',
          filter: customColor ? undefined : `drop-shadow(${palette.shadow})`,
          ...style,
        }}
      >
        {str}
      </span>
    );
  }

  const length = chars.length;

  return (
    <span
      className={`letter-cascade-container inline-flex items-center select-none ${className}`}
      aria-label={str}
      role="text"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontVariantNumeric: 'tabular-nums',
        fontFamily,
        fontSize: parsedFontSize,
        fontWeight,
        letterSpacing,
        lineHeight: 1.15,
        ...style,
      }}
    >
      {chars.map((char, index) => {
        // Stagger calculation: if rtl, highest index has 0 delay
        const order = direction === 'rtl' ? length - 1 - index : index;
        const delay = order * staggerDelay;

        // Spaces
        if (char === ' ') {
          return (
            <span
              key={`space-${index}`}
              style={{ display: 'inline-block', width: '0.3em' }}
            >
              &nbsp;
            </span>
          );
        }

        return (
          <span
            key={`col-${index}`}
            style={{
              display: 'inline-block',
              position: 'relative',
              overflow: 'hidden',
              verticalAlign: 'middle',
              height: '1.2em',
              lineHeight: '1.2em',
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${index}-${char}`}
                initial={{
                  y: '-100%',
                  opacity: 0,
                  rotateX: -35,
                  scale: 0.92,
                }}
                animate={{
                  y: '0%',
                  opacity: 1,
                  rotateX: 0,
                  scale: 1,
                }}
                exit={{
                  y: '100%',
                  opacity: 0,
                  rotateX: 35,
                  scale: 0.92,
                }}
                transition={{
                  type: 'spring',
                  stiffness,
                  damping,
                  delay,
                }}
                style={{
                  display: 'inline-block',
                  background: customColor ? undefined : palette.bg,
                  WebkitBackgroundClip: customColor ? undefined : 'text',
                  WebkitTextFillColor: customColor ? undefined : 'transparent',
                  color: customColor || '#D4AF37',
                  filter: customColor ? undefined : `drop-shadow(${palette.shadow})`,
                  willChange: 'transform, opacity',
                  transformOrigin: '50% 50%',
                  backfaceVisibility: 'hidden',
                }}
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

export default LetterCascade;
