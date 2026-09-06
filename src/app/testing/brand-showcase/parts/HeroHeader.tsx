import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

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
            <Sparkles size={14} /> Living Brand Design System Hub
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
            URL: http://localhost:3015/testing/brand-showcase
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
          🟢 Single Source of Truth for Humans & LLMs
        </span>
      </div>

      <h1
        style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#ffffff',
          margin: '12px 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          letterSpacing: '-0.02em',
        }}
      >
        <BookOpen size={36} style={{ color: '#d4af37' }} />
        Casino Royale Brand Showcase & Component Hub
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
        Zentrale Dokumentation und lebendige Komponenten-Galerie zur{' '}
        <strong style={{ color: '#e5c158' }}>
          vollständigen visuellen & technischen Vereinheitlichung
        </strong>
        . Alle hier geführten Steuerungselemente sind offiziell bestätigt, produktionsbereit und
        bilden den unumstößlichen Standard für alle Entwickler und LLM-Konversationen.
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
          <strong style={{ color: '#f1f5f9' }}>07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md</strong>
        </div>
        <div>
          Design Standard:{' '}
          <strong style={{ color: '#e5c158' }}>Muted Champagne Gold VIP (2026 Ready)</strong>
        </div>
      </div>
    </header>
  );
}
