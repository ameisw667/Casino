'use client';

import { motion } from 'framer-motion';

interface GuideVoiceBannerProps {
  onStop: () => void;
}

export function GuideVoiceBanner({ onStop }: GuideVoiceBannerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'rgba(239, 68, 68, 0.12)',
        borderTop: '1px solid rgba(239, 68, 68, 0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 600 }}>
          Mikrofon aktiv — Höre zu… (Sprich deine Frage)
        </span>
      </div>
      <button
        type="button"
        onClick={onStop}
        style={{
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '3px 8px',
          fontSize: '0.68rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Aufnahme beenden
      </button>
    </div>
  );
}
