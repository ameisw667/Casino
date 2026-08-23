'use client';

import { motion } from 'framer-motion';
import { Bot, Maximize2, Minimize2, X } from 'lucide-react';

interface GuideHeaderProps {
  isExpanded: boolean;
  isMobile: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function GuideHeader({ isExpanded, isMobile, onToggleExpand, onClose }: GuideHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        padding: '14px 16px',
        borderBottom: '1px solid hsla(var(--primary), 0.16)',
        background: 'hsla(var(--primary), 0.04)',
      }}
    >
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'hsla(var(--primary), 0.16)',
          border: '1px solid hsla(var(--primary), 0.4)',
          color: 'hsl(var(--primary))',
          flexShrink: 0,
        }}
      >
        <Bot size={17} aria-hidden />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ fontSize: '0.84rem', letterSpacing: '0.04em' }}>Royale Guide</strong>
          <span
            style={{
              fontSize: '0.6rem',
              lineHeight: 1,
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'hsla(var(--primary), 0.18)',
              border: '1px solid hsla(var(--primary), 0.35)',
              color: 'hsl(var(--primary))',
              fontWeight: 800,
            }}
          >
            AI
          </span>
        </div>
        <span style={{ fontSize: '0.66rem', color: 'hsl(var(--text-muted))' }}>
          {isExpanded ? 'Casino AI Assistant & Knowledge Hub' : 'Casino AI Assistant'}
        </span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Maximize / Minimize Button (Option 3A) */}
        {!isMobile && (
          <motion.button
            type="button"
            aria-label={isExpanded ? 'Verkleinern' : 'Vergrößern'}
            title={isExpanded ? 'Auf Standardgröße verkleinern' : '2-Spalten Großansicht öffnen'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleExpand}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '30px',
              height: '30px',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              background: isExpanded ? 'hsla(var(--primary), 0.18)' : 'hsla(var(--bg-color), 0.46)',
              color: isExpanded ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </motion.button>
        )}

        {/* Close Button */}
        <motion.button
          type="button"
          aria-label="Close Royale Guide"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '30px',
            height: '30px',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            background: 'hsla(var(--bg-color), 0.46)',
            backdropFilter: 'blur(10px)',
            color: 'hsl(var(--text-main))',
            cursor: 'pointer',
          }}
        >
          <X size={15} aria-hidden />
        </motion.button>
      </div>
    </header>
  );
}
