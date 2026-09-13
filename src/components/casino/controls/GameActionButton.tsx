'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * Standardized Casino Royale GameActionButton Component.
 * Luxury Componentry Enhancement: Felt Texture & Image Ripple Refraction (Touchpoint 15).
 *
 * Features:
 * - Deep dark solid obsidian background (#141108) with tactile Monte-Carlo felt micro-weave
 * - Physical hydrodynamic refraction ripple that originates at click/tap coordinate
 * - Sharp 1.5px champagne gold border (#e5c158) with specular reflection
 * - Ultra-bright champagne gold monospace text (#fef08a) with WCAG AAA 14:1 contrast
 * - 56px touch target height (h-14)
 * - Zero wallet latency: executes onClick synchronously without blocking
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
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const addRipple = useCallback((clientX: number, clientY: number) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const newRipple: Ripple = { id: Date.now() + Math.random(), x, y };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 450);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    addRipple(e.clientX, e.clientY);

    if (soundEnabled) {
      soundManager.play('bet');
    }
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (!disabled && !loading && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        addRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
  };

  const displayText = loading
    ? 'Processing...'
    : betAmount !== undefined && betAmount > 0
      ? `${label} ($${betAmount.toFixed(2)})`
      : label;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label={label}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={className}
      style={{
        position: 'relative',
        height: '56px',
        width: '100%',
        background: loading
          ? 'linear-gradient(180deg, #18140c 0%, #0e0c08 100%)'
          : 'linear-gradient(180deg, #18140a 0%, #100d06 100%)',
        border: '1.5px solid #e5c158',
        borderRadius: '14px',
        color: '#fef08a',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '1.05rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: loading
          ? 'none'
          : '0 6px 20px rgba(0, 0, 0, 0.7), 0 0 16px rgba(212, 175, 55, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: disabled ? 0.5 : 1,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Felt Micro-Texture Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.14,
          pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.2) 0%, transparent 80%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(212,175,55,0.08) 2px, rgba(212,175,55,0.08) 4px)
          `,
        }}
      />

      {/* Top Specular Felt Rim Highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(254, 240, 138, 0.6), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Optical Image Ripple Waves */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 0.85,
              scale: 0,
            }}
            animate={{
              width: 420,
              height: 420,
              x: ripple.x - 210,
              y: ripple.y - 210,
              opacity: 0,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.42,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(212, 175, 55, 0.25) 40%, rgba(212, 175, 55, 0.05) 70%, transparent 100%)',
              boxShadow: '0 0 24px rgba(212, 175, 55, 0.6), inset 0 0 16px rgba(254, 240, 138, 0.5)',
              zIndex: 1,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Button Content Label (Ensures AAA Text stays crisp above felt & ripple) */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
        }}
      >
        {displayText}
      </span>
    </motion.button>
  );
}

export default GameActionButton;
