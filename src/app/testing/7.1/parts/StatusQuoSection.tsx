import React from 'react';
import { Sliders, Info } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

export type BetMode = 'manual' | 'auto';

const cardContainerStyle = {
  background: '#0b0e14',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
} as const;

const cardMetaRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const;

const cardGameLabelStyle = {
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#94a3b8',
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase',
} as const;

const flawNoteStyle = {
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono)',
  background: 'rgba(15, 23, 42, 0.6)',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
} as const;

function CrashStatusCard({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: BetMode;
  onSelectTab: (mode: BetMode) => void;
}) {
  return (
    <div style={cardContainerStyle}>
      <div style={cardMetaRowStyle}>
        <span style={cardGameLabelStyle}>Game: /games/crash</span>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            background: '#1e293b',
            color: '#cbd5e1',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Container: #1e293b (Slate)
        </span>
      </div>

      <div
        style={{
          padding: '16px',
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#94a3b8',
          }}
        >
          <span>⚡ CONTROL</span>
          <Info size={16} style={{ color: '#64748b' }} />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: '#0f172a',
            padding: '4px',
            borderRadius: '8px',
          }}
        >
          <button
            onClick={() => onSelectTab('manual')}
            style={{
              padding: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: selectedTab === 'manual' ? '#334155' : 'transparent',
              color: selectedTab === 'manual' ? '#ffffff' : '#94a3b8',
            }}
          >
            Manual
          </button>
          <button
            onClick={() => onSelectTab('auto')}
            style={{
              padding: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: selectedTab === 'auto' ? '#334155' : 'transparent',
              color: selectedTab === 'auto' ? '#ffffff' : '#94a3b8',
            }}
          >
            Auto
          </button>
        </div>
      </div>

      <div style={flawNoteStyle}>
        <div style={{ color: '#fb7185', fontWeight: 800 }}>⚠️ Mängel im Crash-Bestand:</div>
        <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
          <li>Bläuliches `#1e293b` entspricht nicht Obsidian-Dark (`#0b0e14`)</li>
          <li>Keine Framer Motion Spring-Animation (Layout-Starrheit)</li>
          <li>Aktiver Tab hebt sich nur schwach vom Slate-Hintergrund ab</li>
        </ul>
      </div>
    </div>
  );
}

function DiceStatusCard({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: BetMode;
  onSelectTab: (mode: BetMode) => void;
}) {
  return (
    <div style={cardContainerStyle}>
      <div style={cardMetaRowStyle}>
        <span style={cardGameLabelStyle}>Game: /games/dice</span>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            background: '#0b0e14',
            color: '#cbd5e1',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            border: '1px solid #1a2234',
          }}
        >
          Container: #0b0e14 (Dark)
        </span>
      </div>

      <div
        style={{
          padding: '16px',
          background: '#0b0e14',
          borderRadius: '12px',
          border: '1px solid #1a2234',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: '#0b0e14',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #1a2234',
          }}
        >
          <button
            onClick={() => onSelectTab('manual')}
            style={{
              padding: '8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '6px',
              cursor: 'pointer',
              background: selectedTab === 'manual' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              border: selectedTab === 'manual' ? '1px solid rgba(245, 158, 11, 0.3)' : 'none',
              color: selectedTab === 'manual' ? '#fbbf24' : '#94a3b8',
            }}
          >
            Manual
          </button>
          <button
            onClick={() => onSelectTab('auto')}
            style={{
              padding: '8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '6px',
              cursor: 'pointer',
              background: selectedTab === 'auto' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              border: selectedTab === 'auto' ? '1px solid rgba(245, 158, 11, 0.3)' : 'none',
              color: selectedTab === 'auto' ? '#fbbf24' : '#94a3b8',
            }}
          >
            Auto
          </button>
        </div>
      </div>

      <div style={flawNoteStyle}>
        <div style={{ color: '#fb7185', fontWeight: 800 }}>⚠️ Mängel im Dice-Bestand:</div>
        <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
          <li>Inkonsistente Rahmen und Schriftgrößen im Vergleich zu Crash</li>
          <li>Keine flüssige Schiebe-Animation beim Wechsel zwischen Tabs</li>
          <li>Keine visuelle Rückmeldung über aktiven Auto-Bet Status</li>
        </ul>
      </div>
    </div>
  );
}

interface StatusQuoSectionProps {
  crashTab: BetMode;
  onCrashTabChange: (mode: BetMode) => void;
  diceTab: BetMode;
  onDiceTabChange: (mode: BetMode) => void;
}

export function StatusQuoSection({
  crashTab,
  onCrashTabChange,
  diceTab,
  onDiceTabChange,
}: StatusQuoSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={sectionHeadingStyle}>
          <Sliders size={22} style={{ color: '#94a3b8' }} />
          1. Status Quo — Ist-Zustand im Bestand (Crash vs. Dice)
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Vergleich der bestehenden Steuerungselemente aus Crash & Dice.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <CrashStatusCard selectedTab={crashTab} onSelectTab={onCrashTabChange} />
        <DiceStatusCard selectedTab={diceTab} onSelectTab={onDiceTabChange} />
      </div>
    </section>
  );
}
