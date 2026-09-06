import React from 'react';
import { AutoBetDrawer, AutoBetConfig } from '@/components/casino/controls/AutoBetDrawer';
import { ComponentSectionHeader } from './ComponentSectionHeader';

interface AutoBetDrawerShowcaseSectionProps {
  autoConfig: AutoBetConfig;
  onAutoConfigChange: (config: AutoBetConfig) => void;
  isAutoRunning: boolean;
  onStartAuto: () => void;
  onStopAuto: () => void;
}

export function AutoBetDrawerShowcaseSection({
  autoConfig,
  onAutoConfigChange,
  isAutoRunning,
  onStartAuto,
  onStopAuto,
}: AutoBetDrawerShowcaseSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ComponentSectionHeader
        kicker="Initiative 7.5 · Bestätigter Standard"
        title="<AutoBetDrawer /> — Auto-Wett Konfiguration"
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
        <div style={{ maxWidth: '440px' }}>
          <AutoBetDrawer
            config={autoConfig}
            onChange={onAutoConfigChange}
            isAutoRunning={isAutoRunning}
            onStartAuto={onStartAuto}
            onStopAuto={onStopAuto}
          />
        </div>
      </div>
    </section>
  );
}
