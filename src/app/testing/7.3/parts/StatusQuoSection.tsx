import React from 'react';
import { Info } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

interface StatusQuoGameCard {
  game: string;
  chipStyle: React.CSSProperties;
  chipLabel: string;
  buttonStyle: React.CSSProperties;
  buttonLabel: string;
  flaw: string;
}

const gameCards: StatusQuoGameCard[] = [
  {
    game: 'Game: /games/crash',
    chipStyle: { padding: '2px 8px', background: '#1e293b', color: '#cbd5e1', borderRadius: '4px' },
    chipLabel: 'Height: 48px',
    buttonStyle: {
      height: '48px',
      background: '#eab308',
      color: '#000',
      fontWeight: 700,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    buttonLabel: 'BET (BET IN PROGRESS)',
    flaw: '⚠️ Mängel: Geringe Touch-Höhe (48px), kein Sound-Feedback beim Wetten.',
  },
  {
    game: 'Game: /games/dice',
    chipStyle: {
      padding: '2px 8px',
      background: '#0b0e14',
      color: '#cbd5e1',
      borderRadius: '4px',
      border: '1px solid #1a2234',
    },
    chipLabel: 'Height: 52px',
    buttonStyle: {
      height: '52px',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d4af37 100%)',
      color: '#000',
      fontWeight: 800,
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
    },
    buttonLabel: 'ROLL DICE ($10.00)',
    flaw: '⚠️ Mängel: Keine Framer Motion Spring-Animation beim Klicken.',
  },
  {
    game: 'Game: /games/slots',
    chipStyle: {
      padding: '2px 8px',
      background: '#0b0e14',
      color: '#cbd5e1',
      borderRadius: '4px',
      border: '1px solid #1a2234',
    },
    chipLabel: 'Height: 56px',
    buttonStyle: {
      height: '56px',
      background: '#10b981',
      color: '#fff',
      fontWeight: 900,
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
    },
    buttonLabel: 'SPIN SLOTS',
    flaw: '⚠️ Mängel: Grüne Farbabweichung entspricht nicht dem Obsidian/Gold System.',
  },
];

const cardContainerStyle = {
  background: '#0b0e14',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
} as const;

const cardMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#94a3b8',
  fontFamily: 'var(--font-mono)',
} as const;

const cardFlawStyle = {
  fontSize: '0.75rem',
  color: '#fb7185',
  background: 'rgba(15,23,42,0.6)',
  padding: '10px',
  borderRadius: '8px',
} as const;

export function StatusQuoSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={sectionHeadingStyle}>
          <Info size={22} style={{ color: '#94a3b8' }} />
          1. Status Quo — Ist-Zustand im Bestand (Crash vs. Dice vs. Slots)
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Bestehende Primary Buttons weisen abweichende Höhen (`48px` vs `56px`), uneinheitliche
          Schriftgrößen und fehlendes Sound-Feedback auf.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {gameCards.map((card) => (
          <div key={card.game} style={cardContainerStyle}>
            <div style={cardMetaStyle}>
              <span>{card.game}</span>
              <span style={card.chipStyle}>{card.chipLabel}</span>
            </div>
            <button style={card.buttonStyle}>{card.buttonLabel}</button>
            <div style={cardFlawStyle}>{card.flaw}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
