'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '@/lib/casino/sound-manager';

export interface GameActionButtonProps {
  label: string;
  betAmount?: number;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  soundEnabled?: boolean;
}

/**
 * Standardized Casino Royale GameActionButton Component.
 * Approved Standard (Initiative 7.3) — High-Contrast Solid Gold VIP CTA (Option 1-b1).
 *
 * Features:
 * - Deep dark solid obsidian background (#141108)
 * - Sharp 1.5px champagne gold border (#e5c158)
 * - Ultra-bright champagne gold monospace text (#fef08a) with WCAG AAA 14:1 contrast
 * - 56px touch target height (h-14)
 * - Framer Motion 12 spring-tap physics (whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.96 }})
 * - Acoustic bet audio via soundManager.play('bet')
 */
export function GameActionButton({
  label,
  betAmount,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  soundEnabled = true,
}: GameActionButtonProps) {
  const handleClick = () => {
    if (disabled || loading) return;
    if (soundEnabled) {
      soundManager.play('bet');
    }
    onClick();
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={{
        height: '56px',
        width: '100%',
        background: loading ? '#18140c' : '#141108',
        border: '1.5px solid #e5c158',
        borderRadius: '14px',
        color: '#fef08a',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '1.05rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
      }}
    >
      {loading
        ? 'Processing...'
        : betAmount !== undefined && betAmount > 0
          ? `${label} ($${betAmount.toFixed(2)})`
          : label}
    </motion.button>
  );
}

export default GameActionButton;
