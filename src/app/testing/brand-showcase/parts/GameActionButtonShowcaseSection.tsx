import React from 'react';
import { GameActionButton } from '@/components/casino/controls/GameActionButton';
import { ComponentSectionHeader } from './ComponentSectionHeader';
import { richtlinienListStyle } from './shared';

interface GameActionButtonShowcaseSectionProps {
  betAmount: number;
  isBetProcessing: boolean;
  onSimulateBet: () => void;
}

export function GameActionButtonShowcaseSection({
  betAmount,
  isBetProcessing,
  onSimulateBet,
}: GameActionButtonShowcaseSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ComponentSectionHeader
        kicker="Initiative 7.3 · Bestätigter Standard"
        title="<GameActionButton /> — Unified Primary CTA Button"
        kickerColor="#34d399"
        badge="✅ Gewinner: Option 1-b1 High-Contrast Solid Gold"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Live Mockup GameActionButton */}
        <div
          style={{
            background: '#0b0e14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#94a3b8',
                fontFamily: 'var(--font-mono)',
              }}
            >
              PRIMARY CTA BUTTON (56PX HEIGHT · WCAG AAA 14:1)
            </span>
          </div>

          <GameActionButton
            label="PLACE BET"
            betAmount={betAmount}
            loading={isBetProcessing}
            onClick={onSimulateBet}
          />
        </div>

        {/* Contract Description 7.3 */}
        <div
          style={{
            background: '#0b0e14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#e5c158', fontSize: '0.85rem' }}>
            7.3 Design-Richtlinien:
          </div>
          <ul style={richtlinienListStyle}>
            <li>Feste Höhe von 56px (`h-14`) für optimale Touch-Bedienung auf Smartphones.</li>
            <li>
              Satter Obsidian-Dark Untergrund (`#141108`) mit 1.5px Champagne Gold Rahmen
              (`#e5c158`) ohne blasse Transparenzen.
            </li>
            <li>Framer Motion Spring-Hover & Tap Scaling.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
