'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export interface BetModeTabsProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  disabled?: boolean;
  className?: string;
  soundEnabled?: boolean;
}

/**
 * Standardized Casino Royale BetModeTabs Component.
 * Approved Standard (Initiative 7.1) — Variante A2: Muted Champagne Gold.
 *
 * Features:
 * - Solid obsidian dark background (#0b0f18)
 * - Muted champagne gold border (rgba(212, 175, 55, 0.2))
 * - Framer Motion 12 spring-physics sliding background pill (#131a26)
 * - Warm champagne gold active typography (#e5c158)
 * - Tactile sound integration via soundManager
 * - Accessible WCAG AA tablist/tab semantics
 */
export function BetModeTabs({
  mode,
  onModeChange,
  disabled = false,
  className = '',
  soundEnabled = true,
}: BetModeTabsProps) {
  const handleSelect = (nextMode: 'manual' | 'auto') => {
    if (disabled || nextMode === mode) return;
    if (soundEnabled) {
      soundManager.play('click');
    }
    onModeChange(nextMode);
  };

  return (
    <div
      role="tablist"
      aria-label="Game Mode Switcher"
      className={className}
      style={{
        position: 'relative',
        background: '#0b0f18',
        padding: '4px',
        borderRadius: '14px',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        boxSizing: 'border-box',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Manual Mode Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'manual'}
        disabled={disabled}
        onClick={() => handleSelect('manual')}
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '10px 0',
          fontSize: '0.75rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono), sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: 'none',
          background: 'transparent',
          color: mode === 'manual' ? '#e5c158' : '#64748b',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'color 0.2s ease',
          outline: 'none',
        }}
      >
        {mode === 'manual' && (
          <motion.div
            layoutId="activeModeTabPillMuted"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#131a26',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '10px',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Play
          size={14}
          style={{
            position: 'relative',
            zIndex: 10,
            color: mode === 'manual' ? '#e5c158' : '#475569',
            transition: 'color 0.2s ease',
          }}
        />
        <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
      </button>

      {/* Auto Mode Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'auto'}
        disabled={disabled}
        onClick={() => handleSelect('auto')}
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '10px 0',
          fontSize: '0.75rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono), sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: 'none',
          background: 'transparent',
          color: mode === 'auto' ? '#e5c158' : '#64748b',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'color 0.2s ease',
          outline: 'none',
        }}
      >
        {mode === 'auto' && (
          <motion.div
            layoutId="activeModeTabPillMuted"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#131a26',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '10px',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Zap
          size={14}
          style={{
            position: 'relative',
            zIndex: 10,
            color: mode === 'auto' ? '#e5c158' : '#475569',
            transition: 'color 0.2s ease',
          }}
        />
        <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
      </button>
    </div>
  );
}

export default BetModeTabs;
