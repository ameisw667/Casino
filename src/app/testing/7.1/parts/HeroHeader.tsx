import React from 'react';
import { Sparkles, Layers } from 'lucide-react';

export function HeroHeader() {
  return (
    <header
      style={{
        background: '#0b0f19',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#e5c158',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: '9999px',
            }}
          >
            <Sparkles size={14} /> Phase 1 · Initiative 7.1 (Muted Precision Edition)
          </span>
          <span
            style={{
              padding: '4px 12px',
              background: '#121826',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              borderRadius: '9999px',
            }}
          >
            URL: http://localhost:3015/testing/7.1
          </span>
        </div>

        <span
          style={{
            padding: '4px 14px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '9999px',
          }}
        >
          🟢 Subtle Muted Gold Refinement
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
          gap: '12px',
          letterSpacing: '-0.02em',
        }}
      >
        <Layers size={32} style={{ color: '#d4af37' }} />
        Obsidian Gold Precision Minimal Evaluation
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
        Vergleich zweier{' '}
        <strong style={{ color: '#e5c158' }}>Obsidian Gold Precision Minimal</strong> Nuancen.
        Direkte Gegenüberstellung der Standard-Goldfassung mit einer{' '}
        <strong style={{ color: '#e5c158' }}>
          reduzierten, dezenten Champagne-Gold Variante (A2)
        </strong>{' '}
        für maximalen Sehkomfort ohne grelle Intensität.
      </p>

      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          Zuständige Agenten:{' '}
          <strong style={{ color: '#f1f5f9' }}>Design-Guardian & UI-Animator</strong>
        </div>
        <div>
          Design Standard:{' '}
          <strong style={{ color: '#e5c158' }}>Muted Champagne Gold VIP (2026)</strong>
        </div>
      </div>
    </header>
  );
}
