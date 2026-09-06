'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxNavbar } from './parts/SandboxNavbar';
import { HeroHeader } from './parts/HeroHeader';
import { StatusQuoSection } from './parts/StatusQuoSection';
import { VibeSliderOptionGoldVip } from './parts/VibeSliderOptionGoldVip';
import { VibeSliderOptionEmerald } from './parts/VibeSliderOptionEmerald';
import { VibeSliderOptionPlatinumIce } from './parts/VibeSliderOptionPlatinumIce';
import { BewertungsmatrixSection } from './parts/BewertungsmatrixSection';
import { sectionHeadingStyle, type PreviewDevice } from './parts/shared';

export default function VibeSliderTestingClient() {
  // Slider Value States (Integer percents, no useless decimals)
  const [opt1bValue, setOpt1bValue] = useState<number>(50);
  const [opt1b1Value, setOpt1b1Value] = useState<number>(50);
  const [opt1b2Value, setOpt1b2Value] = useState<number>(50);
  const [statusValue, setStatusValue] = useState<number>(50);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport Device Toggle State
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  // Handlers with audio tick
  const handleOpt1bChange = (val: number) => {
    if (val !== opt1bValue && !isSoundMuted && Math.abs(val - opt1bValue) >= 2) {
      soundManager.play('chip');
    }
    setOpt1bValue(val);
  };

  const handleOpt1b1Change = (val: number) => {
    if (val !== opt1b1Value && !isSoundMuted && Math.abs(val - opt1b1Value) >= 2) {
      soundManager.play('chip');
    }
    setOpt1b1Value(val);
  };

  const handleOpt1b2Change = (val: number) => {
    if (val !== opt1b2Value && !isSoundMuted && Math.abs(val - opt1b2Value) >= 2) {
      soundManager.play('click');
    }
    setOpt1b2Value(val);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#05070c',
        color: '#f8fafc',
        padding: '32px 24px',
        fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        <SandboxNavbar
          previewDevice={previewDevice}
          onSelectPreviewDevice={setPreviewDevice}
          isSoundMuted={isSoundMuted}
          onToggleSound={() => setIsSoundMuted(!isSoundMuted)}
        />

        <HeroHeader />

        <StatusQuoSection value={statusValue} onChange={setStatusValue} />

        {/* SECTION 2: DREI COLORWAY VARIANTEN (1-B VS 1-B1 VS 1-B2) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <h2 style={sectionHeadingStyle}>
              <Sparkles size={22} style={{ color: '#d4af37' }} /> 2. Drei Colorway Varianten
              basierend auf Dual-Stat Standard 1-b
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
              maxWidth: previewDevice === 'mobile' ? '420px' : '100%',
              margin: previewDevice === 'mobile' ? '0 auto' : '0',
              gap: '32px',
            }}
          >
            {/* OPTION 1-B1: OBSIDIAN GOLD VIP DUAL-STAT (NEU & EMPFOHLEN ★) */}
            <VibeSliderOptionGoldVip value={opt1b1Value} onChange={handleOpt1b1Change} />
            {/* OPTION 1-B: BASELINE EMERALD DUAL-STAT */}
            <VibeSliderOptionEmerald value={opt1bValue} onChange={handleOpt1bChange} />
            {/* OPTION 1-B2: PLATINUM ICE DUAL-STAT */}
            <VibeSliderOptionPlatinumIce value={opt1b2Value} onChange={handleOpt1b2Change} />
          </div>
        </section>

        <BewertungsmatrixSection />

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Casino Royale VIP Design System 2026 · Initiative 7.4 VibeSlider
        </footer>
      </div>
    </div>
  );
}
