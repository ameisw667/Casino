'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Eye, EyeOff, ShieldCheck, Sliders } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProvablyFair?: () => void;
  inline?: boolean;
}

export default function SettingsPopover({
  isOpen,
  onOpenProvablyFair,
  inline: _inline = true,
}: SettingsPopoverProps) {
  const soundEnabled = useCasinoStore((s) => s.soundEnabled ?? true);
  const soundVolume = useCasinoStore((s) => s.soundVolume ?? 0.5);
  const hideBalance = useCasinoStore((s) => s.hideBalance ?? false);
  const updateSettings = useCasinoStore((s) => s.updateSettings);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.98 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          style={{
            overflow: 'hidden',
            width: '100%',
            marginTop: '4px',
            marginBottom: '8px',
          }}
        >
          <div
            className="glass"
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'hsla(var(--bg-color), 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid hsla(var(--primary), 0.25)',
              boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: '1px solid hsla(0, 0%, 100%, 0.06)',
                paddingBottom: '6px',
              }}
            >
              <Sliders size={14} color="hsl(var(--primary))" />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: 'hsl(var(--primary))',
                }}
              >
                QUICK SETTINGS
              </span>
            </div>

            {onOpenProvablyFair && (
              <button
                type="button"
                onClick={onOpenProvablyFair}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
              >
                <ShieldCheck size={14} color="hsl(var(--primary))" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Seed-Verifikation</span>
              </button>
            )}

            {/* Sound Toggle Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {soundEnabled ? (
                  <Volume2 size={14} color="hsl(var(--primary))" />
                ) : (
                  <VolumeX size={14} color="hsl(var(--text-muted))" />
                )}
                <span
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}
                >
                  Sound Effects
                </span>
              </div>

              <button
                onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
                aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
                style={{
                  width: '36px',
                  height: '18px',
                  borderRadius: '9px',
                  background: soundEnabled ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.12)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: soundEnabled ? '20px' : '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: soundEnabled ? '#000' : '#fff',
                    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>

            {/* Volume Slider Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                opacity: soundEnabled ? 1 : 0.45,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: 'hsl(var(--text-muted))',
                    letterSpacing: '0.05em',
                  }}
                >
                  VOLUME
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: 'hsl(var(--primary))',
                  }}
                >
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
                  height: '4px',
                  borderRadius: '2px',
                  appearance: 'none',
                  background: `linear-gradient(to right, hsl(var(--primary)) ${soundVolume * 100}%, hsla(0, 0%, 100%, 0.1) ${soundVolume * 100}%)`,
                  outline: 'none',
                  cursor: soundEnabled ? 'pointer' : 'not-allowed',
                }}
              />
            </div>

            {/* Hide Balance Toggle Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid hsla(0, 0%, 100%, 0.06)',
                paddingTop: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {hideBalance ? (
                  <EyeOff size={14} color="hsl(var(--primary))" />
                ) : (
                  <Eye size={14} color="hsl(var(--text-muted))" />
                )}
                <span
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}
                >
                  Hide Balance
                </span>
              </div>

              <button
                onClick={() => updateSettings({ hideBalance: !hideBalance })}
                aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                style={{
                  width: '36px',
                  height: '18px',
                  borderRadius: '9px',
                  background: hideBalance ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.12)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: hideBalance ? '20px' : '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: hideBalance ? '#000' : '#fff',
                    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
