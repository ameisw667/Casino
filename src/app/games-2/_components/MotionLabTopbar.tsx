'use client';

import { motion } from 'framer-motion';

// ──── Topbar der Bare-Sandbox (above-the-fold: kein Scroll-Progress mehr) ────
// Rechts statischer Titel-Indikator statt %SCROLLED — die Seite scrollt nicht.
export function MotionLabTopbar({
  category,
  titleCount,
}: {
  category: string;
  titleCount: number;
}) {
  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      style={{
        position: 'relative',
        zIndex: 40,
        height: '56px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: 'rgba(11, 14, 20, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          aria-hidden
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '2px',
            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
            transform: 'rotate(45deg)',
          }}
        />
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 900,
            letterSpacing: '0.14em',
            color: '#ffffff',
          }}
        >
          MOTION LAB
        </span>
        <span
          style={{
            fontSize: '0.52rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#D4AF37',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '2px 6px',
          }}
        >
          SANDBOX · /games-2
        </span>
      </div>

      <motion.span
        key={`${category}-${titleCount}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        style={{
          fontSize: '0.6rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'var(--font-mono), monospace',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {titleCount} TITEL · {category}
      </motion.span>
    </motion.header>
  );
}
