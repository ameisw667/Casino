import React from 'react';
import { Sparkles, DollarSign } from 'lucide-react';

export function HeroHeader() {
  return (
    <header
      style={{
        background: '#0b0f19',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
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
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#e5c158',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: '9999px',
            }}
          >
            <Sparkles size={14} /> Phase 1 · Initiative 7.2 (&lt;BetInputGroup /&gt; Header Harmony)
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
            URL: http://localhost:3015/testing/7.2
          </span>
        </div>

        <span
          style={{
            padding: '4px 14px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '9999px',
          }}
        >
          🟢 VIP Header Optimization (Option 2-b vs 2-c)
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
          letterSpacing: '-0.02em',
        }}
      >
        <DollarSign size={34} style={{ color: '#d4af37' }} />
        Initiative 7.2: BetInputGroup Header Layout Perfection
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
        Beseitigung der redundanten Dollarzeichen und visuellen Header-Mängel. Vergleich von 3
        Entwicklungsstufen: <strong style={{ color: '#94a3b8' }}>Option 1-b (Baseline Text)</strong>
        , <strong style={{ color: '#e5c158' }}>Option 2-b (VIP Clean Header)</strong> und der{' '}
        <strong style={{ color: '#34d399' }}>
          Option 2-c (Seamless Floating Label Integrated)
        </strong>
        .
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
          Geltender Plan:{' '}
          <strong style={{ color: '#f1f5f9' }}>
            07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md (§7.2)
          </strong>
        </div>
        <div>
          Zuständige Agenten:{' '}
          <strong style={{ color: '#e5c158' }}>Design-Guardian & Logic-Architect</strong>
        </div>
      </div>
    </header>
  );
}
