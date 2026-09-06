'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxNavbar } from './parts/SandboxNavbar';
import { HeroHeader } from './parts/HeroHeader';
import { StatusQuoSection } from './parts/StatusQuoSection';
import { GameActionButtonOptionBaseline } from './parts/GameActionButtonOptionBaseline';
import { GameActionButtonOptionSolidGold } from './parts/GameActionButtonOptionSolidGold';
import { GameActionButtonOptionInvertedMetallic } from './parts/GameActionButtonOptionInvertedMetallic';
import { BewertungsmatrixSection } from './parts/BewertungsmatrixSection';
import { CodeExportSection, type CodeExportTab } from './parts/CodeExportSection';
import { sectionHeadingStyle, type PreviewDevice } from './parts/shared';

export default function GameActionButtonTestingClient() {
  const betAmount = 10.0;

  // Interactive Simulation States
  const [opt1bLoading, setOpt1bLoading] = useState(false);
  const [opt1b1Loading, setOpt1b1Loading] = useState(false);
  const [opt1b2Loading, setOpt1b2Loading] = useState(false);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport Device Toggle State
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  // Copy Code Feedback State
  const [activeCodeTab, setActiveCodeTab] = useState<CodeExportTab>('opt1b1');

  // Simulators
  const handleSimulateOpt1b = () => {
    setOpt1bLoading(true);
    if (!isSoundMuted) soundManager.play('bet');
    setTimeout(() => {
      setOpt1bLoading(false);
      if (!isSoundMuted) soundManager.play('win');
    }, 1200);
  };

  const handleSimulateOpt1b1 = () => {
    setOpt1b1Loading(true);
    if (!isSoundMuted) soundManager.play('bet');
    setTimeout(() => {
      setOpt1b1Loading(false);
      if (!isSoundMuted) soundManager.play('win');
    }, 1200);
  };

  const handleSimulateOpt1b2 = () => {
    setOpt1b2Loading(true);
    if (!isSoundMuted) soundManager.play('bet');
    setTimeout(() => {
      setOpt1b2Loading(false);
      if (!isSoundMuted) soundManager.play('win');
    }, 1200);
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

        <StatusQuoSection />

        {/* SECTION 2: HIGH CONTRAST VARIANTS (1-B VS 1-B1 VS 1-B2) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <h2 style={sectionHeadingStyle}>
              <Sparkles size={22} style={{ color: '#d4af37' }} />
              2. High-Contrast Refinements basierend auf Option 1-b
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Beseitigung aller blassen Transparenzen.{' '}
              <strong>Option 1-b1 liefert das stärkste Kontrastverhältnis (WCAG AAA)</strong>.
            </p>
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
            {/* OPTION 1-B: BASELINE MUTED CHAMPAGNE */}
            <GameActionButtonOptionBaseline
              loading={opt1bLoading}
              onSimulate={handleSimulateOpt1b}
              betAmount={betAmount}
            />
            {/* OPTION 1-B1: HIGH-CONTRAST SOLID GOLD (NEU & EMPFOHLEN ★) */}
            <GameActionButtonOptionSolidGold
              loading={opt1b1Loading}
              onSimulate={handleSimulateOpt1b1}
              betAmount={betAmount}
            />
            {/* OPTION 1-B2: METALLIC INVERTED VIP CTA */}
            <GameActionButtonOptionInvertedMetallic
              loading={opt1b2Loading}
              onSimulate={handleSimulateOpt1b2}
              betAmount={betAmount}
            />
          </div>
        </section>

        <BewertungsmatrixSection />

        <CodeExportSection activeCodeTab={activeCodeTab} onSelectCodeTab={setActiveCodeTab} />

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            fontFamily: 'var(--font-mono)',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          Casino Royale VIP Design System 2026 · Initiative 7.3 GameActionButton High-Contrast
          Precision
        </footer>
      </div>
    </div>
  );
}
