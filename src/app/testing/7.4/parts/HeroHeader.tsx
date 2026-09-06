import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';

export function HeroHeader() {
  return (
    <header
      style={{
        background: '#0b0f19',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span
          style={{
            padding: '4px 12px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#e5c158',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            borderRadius: '9999px',
          }}
        >
          <Sparkles size={14} /> Phase 1 · Initiative 7.4 (&lt;VibeSlider /&gt; Colorway Refinement)
        </span>
      </div>

      <h1
        style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          color: '#ffffff',
          margin: '12px 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <Sliders size={34} style={{ color: '#d4af37' }} />
        Initiative 7.4: VibeSlider Colorway Variations
      </h1>

      <p
        style={{
          color: '#94a3b8',
          fontSize: '1rem',
          maxWidth: '850px',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Vergleich von 3 Farbwelten basierend auf dem Dual-Stat Header Standard (Option 1-b):{' '}
        <strong style={{ color: '#e5c158' }}>Option 1-b1 (Obsidian Gold VIP)</strong>,{' '}
        <strong style={{ color: '#34d399' }}>Option 1-b (Baseline Emerald)</strong> und{' '}
        <strong style={{ color: '#38bdf8' }}>Option 1-b2 (Platinum Ice)</strong>.
      </p>
    </header>
  );
}
