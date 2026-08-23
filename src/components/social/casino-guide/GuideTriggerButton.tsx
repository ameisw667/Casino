'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GuideTriggerButtonProps {
  isOpen: boolean;
  panelBottom: string;
  onOpen: () => void;
}

export function GuideTriggerButton({ isOpen, panelBottom, onOpen }: GuideTriggerButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label="Open Royale Guide"
      animate={{
        scale: [1, 1.022, 1],
        boxShadow: [
          '0 8px 24px rgba(0, 0, 0, 0.55), 0 0 10px hsla(45, 85%, 55%, 0.12), inset 0 1px 0 hsla(45, 100%, 75%, 0.25)',
          '0 10px 28px rgba(0, 0, 0, 0.65), 0 0 16px hsla(45, 85%, 55%, 0.2), inset 0 1px 0 hsla(45, 100%, 75%, 0.35)',
          '0 8px 24px rgba(0, 0, 0, 0.55), 0 0 10px hsla(45, 85%, 55%, 0.12), inset 0 1px 0 hsla(45, 100%, 75%, 0.25)',
        ],
      }}
      transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      whileHover={{
        scale: 1.04,
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 18px hsla(45, 85%, 55%, 0.28)',
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpen}
      style={{
        position: 'fixed',
        right: '24px',
        bottom: panelBottom,
        zIndex: 46,
        display: isOpen ? 'none' : 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        border: '1px solid hsla(var(--primary), 0.38)',
        borderRadius: '999px',
        padding: '12px 18px',
        background: 'hsla(var(--bg-color), 0.92)',
        backdropFilter: 'blur(16px)',
        color: 'hsl(var(--text-main))',
        cursor: 'pointer',
        fontSize: '0.74rem',
        fontWeight: 800,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}
    >
      <Sparkles size={16} color="hsl(var(--primary))" aria-hidden />
      <span>Royale Guide</span>
      <span
        style={{
          fontSize: '0.62rem',
          lineHeight: 1,
          padding: '3px 6px',
          borderRadius: '6px',
          background: 'hsla(var(--primary), 0.18)',
          border: '1px solid hsla(var(--primary), 0.35)',
          color: 'hsl(var(--primary))',
          fontWeight: 900,
          letterSpacing: '0.04em',
        }}
      >
        AI
      </span>
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 8px #10b981',
        }}
        aria-hidden
      />
    </motion.button>
  );
}
