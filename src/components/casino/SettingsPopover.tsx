'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Eye, EyeOff, Sliders } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useModalKeyboard } from '@/hooks/useModalKeyboard';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPopover({ isOpen, onClose }: SettingsPopoverProps) {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const soundEnabled = useCasinoStore((s) => s.soundEnabled ?? true);
  const soundVolume = useCasinoStore((s) => s.soundVolume ?? 0.5);
  const hideBalance = useCasinoStore((s) => s.hideBalance ?? false);
  const updateSettings = useCasinoStore((s) => s.updateSettings);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Universal ESC-key handling
  useModalKeyboard(onClose, isOpen);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Timeout prevents immediate trigger from the open button click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Quick Settings"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'flex-end',
            justifyContent: isMobile ? 'center' : 'flex-start',
            padding: isMobile ? '12px 12px 72px 12px' : '0 0 24px 96px',
          }}
        >
          {/* Subtle click-outside backdrop - fully transparent, zero screen blur */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'auto',
              background: 'transparent',
            }}
          />

          {/* Floating Popover Container */}
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.92, y: isMobile ? 16 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: isMobile ? 16 : 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="glass"
            style={{
              pointerEvents: 'auto',
              width: isMobile ? 'min(92vw, 320px)' : '280px',
              borderRadius: '20px',
              padding: '16px 20px',
              background: 'hsla(var(--bg-color), 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid hsla(var(--primary), 0.25)',
              boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px hsla(0, 0%, 100%, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Popover Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid hsla(0, 0%, 100%, 0.06)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="hsl(var(--primary))" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
                  QUICK SETTINGS
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close settings popover"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--text-muted))',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sound Toggle Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {soundEnabled ? (
                  <Volume2 size={16} color="hsl(var(--primary))" />
                ) : (
                  <VolumeX size={16} color="hsl(var(--text-muted))" />
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
                  Sound Effects
                </span>
              </div>

              <button
                onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
                aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
                style={{
                  width: '42px',
                  height: '22px',
                  borderRadius: '11px',
                  background: soundEnabled ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.12)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: soundEnabled ? '23px' : '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: soundEnabled ? '#000' : '#fff',
                    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>

            {/* Volume Slider Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: soundEnabled ? 1 : 0.45, transition: 'opacity 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>
                  VOLUME
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'hsl(var(--primary))' }}>
                  {soundEnabled ? `${Math.round(soundVolume * 100)}%` : 'MUTED'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                disabled={!soundEnabled}
                value={soundVolume}
                onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  height: '5px',
                  borderRadius: '3px',
                  appearance: 'none',
                  background: `linear-gradient(to right, hsl(var(--primary)) ${soundVolume * 100}%, hsla(0, 0%, 100%, 0.1) ${soundVolume * 100}%)`,
                  outline: 'none',
                  cursor: soundEnabled ? 'pointer' : 'not-allowed',
                }}
              />
            </div>

            {/* Hide Balance Toggle Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid hsla(0, 0%, 100%, 0.06)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {hideBalance ? (
                  <EyeOff size={16} color="hsl(var(--primary))" />
                ) : (
                  <Eye size={16} color="hsl(var(--text-muted))" />
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
                  Hide Balance
                </span>
              </div>

              <button
                onClick={() => updateSettings({ hideBalance: !hideBalance })}
                aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                style={{
                  width: '42px',
                  height: '22px',
                  borderRadius: '11px',
                  background: hideBalance ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.12)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: hideBalance ? '23px' : '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: hideBalance ? '#000' : '#fff',
                    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
