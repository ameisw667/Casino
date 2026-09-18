'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';

export interface LiveWinsFlippingSwapProps {
  word: string;
  secondaryWord?: string;
  highlight?: boolean;
  colorScheme?: 'gold' | 'emerald' | 'platinum';
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LiveWinsFlippingSwap = memo(function LiveWinsFlippingSwap({
  word,
  secondaryWord,
  highlight = false,
  colorScheme = 'gold',
  fontSize = '0.85rem',
  className = '',
  style = {},
}: LiveWinsFlippingSwapProps) {
  const prefersReduced = useReducedMotion();
  const isReduced = Boolean(prefersReduced);

  const colors = {
    gold: {
      text: '#FFDF70',
      bg: 'rgba(212, 175, 55, 0.12)',
      border: 'rgba(212, 175, 55, 0.35)',
      glow: 'rgba(212, 175, 55, 0.45)',
    },
    emerald: {
      text: '#34D399',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      glow: 'rgba(16, 185, 129, 0.45)',
    },
    platinum: {
      text: '#FFFFFF',
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.2)',
      glow: 'rgba(255, 255, 255, 0.25)',
    },
  }[colorScheme];

  if (isReduced) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize,
          fontWeight: 900,
          color: colors.text,
          ...style,
        }}
      >
        <span>{word}</span>
        {secondaryWord && (
          <span style={{ opacity: 0.65, fontSize: '0.85em' }}>{secondaryWord}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        perspective: '600px',
        ...style,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={word}
          initial={{
            rotateX: 90,
            opacity: 0,
            y: 8,
            scale: 0.95,
          }}
          animate={{
            rotateX: 0,
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            rotateX: -90,
            opacity: 0,
            y: -8,
            scale: 0.95,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 28,
            mass: 0.2,
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 8px',
            borderRadius: '6px',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            boxShadow: highlight
              ? `0 0 16px ${colors.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
              : `0 0 8px ${colors.glow}`,
            transformStyle: 'preserve-3d',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize,
            fontWeight: 900,
            color: colors.text,
            letterSpacing: '-0.02em',
          }}
        >
          {highlight && (
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', color: colors.text }}
            >
              {colorScheme === 'gold' ? <Sparkles size={12} /> : <Flame size={12} />}
            </motion.span>
          )}

          <span>{word}</span>

          {secondaryWord && (
            <span
              style={{
                fontSize: '0.8em',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.65)',
                marginLeft: '2px',
              }}
            >
              {secondaryWord}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
