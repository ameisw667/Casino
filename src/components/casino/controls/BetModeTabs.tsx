'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Repeat, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export interface BetModeTabsProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  disabled?: boolean;
  className?: string;
  soundEnabled?: boolean;
}

/**
 * Casino Royale BetModeTabs with 3D Flipping Word Swap (Componentry #36 / Plan 58).
 *
 * Features:
 * - Solid obsidian dark background (#0B0F18)
 * - Muted champagne gold border (rgba(212, 175, 55, 0.25))
 * - Framer Motion 12 spring-physics sliding background pill with gold rim radiance
 * - 3D Flipping Word Swap: text and icon tumble in with perspective depth (rotateX)
 * - Tactile click haptics and sound integration
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
      data-testid="bet-mode-tabs"
      className={className}
      style={{
        position: 'relative',
        background: '#0B0F18',
        padding: '5px',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        boxSizing: 'border-box',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.8)',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        perspective: '600px',
      }}
    >
      {/* Manual Mode Tab */}
      <motion.button
        type="button"
        role="tab"
        aria-selected={mode === 'manual'}
        disabled={disabled}
        onClick={() => handleSelect('manual')}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '11px 0',
          fontSize: '0.78rem',
          fontWeight: 800,
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: 'none',
          background: 'transparent',
          color: mode === 'manual' ? '#F5D77F' : '#64748B',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          userSelect: 'none',
        }}
      >
        {mode === 'manual' && (
          <motion.div
            layoutId="activeModeTabPillFlipping"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #182232 0%, #111722 100%)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '12px',
              boxShadow:
                '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 14px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255, 235, 170, 0.4)',
              zIndex: 1,
            }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          />
        )}

        {/* 3D Flipping Word Swap Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            perspective: '500px',
            transformStyle: 'preserve-3d',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`manual-${mode === 'manual' ? 'active' : 'inactive'}`}
              initial={{
                rotateX: mode === 'manual' ? -80 : 0,
                opacity: 0.4,
                y: mode === 'manual' ? 4 : 0,
              }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={{ rotateX: 80, opacity: 0, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <Play
                size={14}
                style={{
                  color: mode === 'manual' ? '#F5D77F' : '#475569',
                  filter:
                    mode === 'manual' ? 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))' : 'none',
                  transition: 'color 0.2s ease',
                }}
              />
              <span
                style={{
                  color: mode === 'manual' ? '#FFFFFF' : '#64748B',
                  textShadow: mode === 'manual' ? '0 1px 8px rgba(212, 175, 55, 0.4)' : 'none',
                }}
              >
                Manual
              </span>
              {mode === 'manual' && <Sparkles size={11} className="text-[#D4AF37] opacity-80" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Auto Mode Tab */}
      <motion.button
        type="button"
        role="tab"
        aria-selected={mode === 'auto'}
        disabled={disabled}
        onClick={() => handleSelect('auto')}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '11px 0',
          fontSize: '0.78rem',
          fontWeight: 800,
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          border: 'none',
          background: 'transparent',
          color: mode === 'auto' ? '#F5D77F' : '#64748B',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          userSelect: 'none',
        }}
      >
        {mode === 'auto' && (
          <motion.div
            layoutId="activeModeTabPillFlipping"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #182232 0%, #111722 100%)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '12px',
              boxShadow:
                '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 14px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255, 235, 170, 0.4)',
              zIndex: 1,
            }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          />
        )}

        {/* 3D Flipping Word Swap Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            perspective: '500px',
            transformStyle: 'preserve-3d',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`auto-${mode === 'auto' ? 'active' : 'inactive'}`}
              initial={{
                rotateX: mode === 'auto' ? -80 : 0,
                opacity: 0.4,
                y: mode === 'auto' ? 4 : 0,
              }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={{ rotateX: 80, opacity: 0, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <Repeat
                size={14}
                style={{
                  color: mode === 'auto' ? '#F5D77F' : '#475569',
                  filter: mode === 'auto' ? 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))' : 'none',
                  transition: 'color 0.2s ease',
                }}
              />
              <span
                style={{
                  color: mode === 'auto' ? '#FFFFFF' : '#64748B',
                  textShadow: mode === 'auto' ? '0 1px 8px rgba(212, 175, 55, 0.4)' : 'none',
                }}
              >
                Auto Pilot
              </span>
              {mode === 'auto' && <Sparkles size={11} className="text-[#D4AF37] opacity-80" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}

export default BetModeTabs;
