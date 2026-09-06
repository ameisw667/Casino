'use client';

import { motion } from 'framer-motion';
import { GuideVoiceVisualizer } from '@/components/social/casino-guide/GuideVoiceVisualizer';

interface GuideVoiceBannerProps {
  onStop: () => void;
}

export function GuideVoiceBanner({ onStop }: GuideVoiceBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background:
          'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(239, 68, 68, 0.18) 100%), rgba(11, 14, 20, 0.85)',
        borderTop: '1px solid rgba(212, 175, 55, 0.35)',
        gap: '12px',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {/* Real-time Web Audio FFT Waveform */}
        <GuideVoiceVisualizer isActive barCount={8} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
          <span
            style={{
              fontSize: '0.74rem',
              color: '#F4D068',
              fontWeight: 700,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Höre zu… Sprich deine Frage
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              color: 'hsl(var(--text-muted))',
              fontFamily: 'var(--font-mono), monospace',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Echtzeit-Pegelmessung aktiv
          </span>
        </div>
      </div>

      <motion.button
        type="button"
        className="relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:outline-none"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onStop}
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '7px',
          padding: '6px 12px',
          fontSize: '0.70rem',
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
          transition: 'box-shadow 0.15s ease',
        }}
      >
        Aufnahme beenden
      </motion.button>
    </motion.div>
  );
}
