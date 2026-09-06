import React from 'react';
import { GameStatsPanel } from '@/components/casino/controls/GameStatsPanel';
import { ComponentSectionHeader } from './ComponentSectionHeader';

export function GameStatsPanelShowcaseSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ComponentSectionHeader
        kicker="Initiative 7.6 · Bestätigter Standard"
        title="<GameStatsPanel /> — Session Statistiken"
        kickerColor="#34d399"
        badge="✅ Standardisiert"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        <GameStatsPanel totalWagered={450.0} netProfit={124.5} betsCount={32} winRate={58} />
      </div>
    </section>
  );
}
