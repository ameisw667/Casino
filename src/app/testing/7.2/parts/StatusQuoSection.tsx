import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

const cardContainerStyle = {
  background: '#0b0e14',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
} as const;

const flawNoteStyle = {
  fontSize: '0.75rem',
  color: '#fb7185',
  background: 'rgba(15, 23, 42, 0.6)',
  padding: '10px',
  borderRadius: '8px',
  lineHeight: 1.5,
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
} as const;

const betAmountLabelStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#94a3b8',
} as const;

interface BetValueControlProps {
  value: number;
  onValueChange: (value: number) => void;
}

function CrashStatusCard({ value, onValueChange }: BetValueControlProps) {
  return (
    <div style={cardContainerStyle}>
      <div style={cardMetaRowStyle}>
        <span style={cardGameLabelStyle}>Game: /games/crash</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            background: '#1e293b',
            color: '#cbd5e1',
            borderRadius: '4px',
          }}
        >
          Slate Container
        </span>
      </div>

      <div
        style={{
          padding: '16px',
          background: '#1e293b',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={betAmountLabelStyle}>BET AMOUNT</div>
        <div
          style={{
            display: 'flex',
            background: '#0f172a',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <input
            type="number"
            value={value}
            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px',
              outline: 'none',
              fontWeight: 700,
            }}
          />
          <button
            onClick={() => onValueChange(value / 2)}
            style={{
              padding: '4px 8px',
              background: '#334155',
              border: 'none',
              color: '#fff',
              borderRadius: '4px',
              marginRight: '4px',
              cursor: 'pointer',
            }}
          >
            1/2
          </button>
          <button
            onClick={() => onValueChange(value * 2)}
            style={{
              padding: '4px 8px',
              background: '#334155',
              border: 'none',
              color: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            2x
          </button>
        </div>
      </div>

      <div style={flawNoteStyle}>
        ⚠️ <strong>Mängel:</strong> Kein MAX-Button, ungerundetes `/ 2` führt zu `0.6250000001`
        Float-Fehlern, Slate-Blau Hintergrund.
      </div>
    </div>
  );
}

function DiceStatusCard({
  value,
  onValueChange,
  balance,
}: BetValueControlProps & { balance: number }) {
  return (
    <div style={cardContainerStyle}>
      <div style={cardMetaRowStyle}>
        <span style={cardGameLabelStyle}>Game: /games/dice</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            background: '#0b0e14',
            color: '#cbd5e1',
            borderRadius: '4px',
            border: '1px solid #1a2234',
          }}
        >
          Dark Container
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
          gap: '10px',
        }}
      >
        <div style={betAmountLabelStyle}>BET AMOUNT</div>
        <div
          style={{
            display: 'flex',
            background: '#0b0e14',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid #1a2234',
          }}
        >
          <input
            type="number"
            value={value}
            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              color: '#fbbf24',
              padding: '8px',
              outline: 'none',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            onClick={() => onValueChange(value / 2)}
            style={{
              padding: '4px 8px',
              background: '#1a2234',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '4px',
              marginRight: '4px',
              cursor: 'pointer',
            }}
          >
            1/2
          </button>
          <button
            onClick={() => onValueChange(value * 2)}
            style={{
              padding: '4px 8px',
              background: '#1a2234',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '4px',
              marginRight: '4px',
              cursor: 'pointer',
            }}
          >
            2x
          </button>
          <button
            onClick={() => onValueChange(balance)}
            style={{
              padding: '4px 8px',
              background: 'rgba(245,158,11,0.2)',
              border: 'none',
              color: '#fbbf24',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            MAX
          </button>
        </div>
      </div>

      <div style={flawNoteStyle}>
        ⚠️ <strong>Mängel:</strong> Abweichende Rahmenfarbe zu Crash, keine
        Haptik-/Sound-Rückmeldung beim Klicken.
      </div>
    </div>
  );
}

function BlackjackStatusCard({ value, onValueChange }: BetValueControlProps) {
  return (
    <div style={cardContainerStyle}>
      <div style={cardMetaRowStyle}>
        <span style={cardGameLabelStyle}>Game: /games/blackjack</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            background: '#0b0e14',
            color: '#cbd5e1',
            borderRadius: '4px',
            border: '1px solid #1a2234',
          }}
        >
          Chip Picker
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
          gap: '10px',
        }}
      >
        <div style={betAmountLabelStyle}>CHIP BET AMOUNT</div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {[1, 5, 25, 100].map((chip) => (
            <button
              key={chip}
              onClick={() => onValueChange(chip)}
              style={{
                padding: '6px 10px',
                background: value === chip ? '#d4af37' : '#1a2234',
                color: value === chip ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              ${chip}
            </button>
          ))}
        </div>
      </div>

      <div style={flawNoteStyle}>
        ⚠️ <strong>Mängel:</strong> Chips-Bedienung unterscheidet sich komplett von Crash & Dice
        Wetteingaben.
      </div>
    </div>
  );
}

interface StatusQuoSectionProps {
  crashBet: number;
  onCrashBetChange: (bet: number) => void;
  diceBet: number;
  onDiceBetChange: (bet: number) => void;
  blackjackBet: number;
  onBlackjackBetChange: (bet: number) => void;
  balance: number;
}

export function StatusQuoSection({
  crashBet,
  onCrashBetChange,
  diceBet,
  onDiceBetChange,
  blackjackBet,
  onBlackjackBetChange,
  balance,
}: StatusQuoSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={sectionHeadingStyle}>
          <SlidersHorizontal size={22} style={{ color: '#94a3b8' }} />
          1. Status Quo — Ist-Zustand im Bestand (Crash vs. Dice vs. Blackjack)
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Aktuelle Wetteingabefelder zeigen starke Abweichungen bei Schriftarten, Rahmenfarben,
          Button-Reihenfolge und Nachkommastellen.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <CrashStatusCard value={crashBet} onValueChange={onCrashBetChange} />
        <DiceStatusCard value={diceBet} onValueChange={onDiceBetChange} balance={balance} />
        <BlackjackStatusCard value={blackjackBet} onValueChange={onBlackjackBetChange} />
      </div>
    </section>
  );
}
