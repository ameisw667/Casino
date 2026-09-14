'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export interface KineticStatsCounterProps {
  value: string;
  color?: string;
  glowColor?: string;
  fontSize?: string;
  loading?: boolean;
  isMobile?: boolean;
}

interface CharSlotProps {
  char: string;
  index: number;
  color: string;
  glowColor: string;
  isReduced: boolean;
}

function CharSlot({ char, index, color, glowColor, isReduced }: CharSlotProps) {
  const isDigit = /^[0-9]$/.test(char);
  const isCurrency = char === '$';
  const isSign = char === '+' || char === '-';
  const isSeparator = char === ',' || char === '.';

  if (!isDigit) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: isSeparator ? '0.32em' : isCurrency || isSign ? 'auto' : undefined,
          textAlign: 'center',
          color: color,
          opacity: isCurrency || isSign ? 0.9 : isSeparator ? 0.8 : 0.9,
          filter: glowColor ? `drop-shadow(0 0 6px ${glowColor})` : undefined,
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        {char}
      </span>
    );
  }

  if (isReduced) {
    return (
      <span
        style={{
          display: 'inline-block',
          color: color,
          filter: glowColor ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
          lineHeight: 1,
        }}
      >
        {char}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        height: '1.15em',
        width: '0.6em',
        overflow: 'hidden',
        verticalAlign: 'top',
        lineHeight: 1,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{
            y: '60%',
            opacity: 0.2,
            filter: 'blur(2px)',
          }}
          animate={{
            y: '0%',
            opacity: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            y: '-60%',
            opacity: 0,
            filter: 'blur(2px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 28,
            mass: 0.2,
            delay: index * 0.02,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: color,
            filter: glowColor ? `drop-shadow(0 0 10px ${glowColor})` : undefined,
            userSelect: 'none',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            lineHeight: 1,
          }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export const KineticStatsCounter = memo(function KineticStatsCounter({
  value,
  color = '#FFFFFF',
  glowColor,
  fontSize,
  loading = false,
  isMobile = false,
}: KineticStatsCounterProps) {
  const prefersReduced = useReducedMotion();
  const isReduced = Boolean(prefersReduced);

  if (loading || value === '…' || value === '...') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          height: '1.25em',
          padding: '2px 0',
        }}
        aria-label="Lade Statistik..."
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.85, 1.15, 0.85],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: color || '#D4AF37',
              boxShadow: glowColor ? `0 0 8px ${glowColor}` : '0 0 6px rgba(212, 175, 55, 0.5)',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
    );
  }

  const resolvedGlow =
    glowColor ??
    (color === '#D4AF37'
      ? 'rgba(212, 175, 55, 0.45)'
      : color === '#10b981'
        ? 'rgba(16, 185, 129, 0.45)'
        : color === '#ef4444'
          ? 'rgba(239, 68, 68, 0.45)'
          : 'rgba(255, 255, 255, 0.2)');

  const chars = Array.from(value);

  return (
    <div
      aria-label={value}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: fontSize ?? (isMobile ? '1.15rem' : '1.35rem'),
        fontWeight: 900,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {chars.map((char, index) => (
        <CharSlot
          key={`${index}-${char}`}
          char={char}
          index={index}
          color={color}
          glowColor={resolvedGlow}
          isReduced={isReduced}
        />
      ))}
    </div>
  );
});
