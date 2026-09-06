import React from 'react';
import { VibeSlider } from '@/components/casino/controls/VibeSlider';
import { ComponentSectionHeader } from './ComponentSectionHeader';

interface VibeSliderShowcaseSectionProps {
  sliderChance: number;
  onSliderChanceChange: (value: number) => void;
}

export function VibeSliderShowcaseSection({
  sliderChance,
  onSliderChanceChange,
}: VibeSliderShowcaseSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ComponentSectionHeader
        kicker="Initiative 7.4 · Bestätigter Standard"
        title="<VibeSlider /> — Universal Brand Slider"
        kickerColor="#34d399"
        badge="✅ Gewinner: Option 1-b1 Obsidian Gold Dual-Stat"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
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
          <VibeSlider value={sliderChance} onChange={onSliderChanceChange} />
        </div>
      </div>
    </section>
  );
}
