'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxNavbar } from './parts/SandboxNavbar';
import { HeroHeader } from './parts/HeroHeader';
import { StatusQuoSection, type BetMode } from './parts/StatusQuoSection';
import { BetModeTabsOptionStandardGold } from './parts/BetModeTabsOptionStandardGold';
import { BetModeTabsOptionMutedChampagne } from './parts/BetModeTabsOptionMutedChampagne';
import { BewertungsmatrixSection } from './parts/BewertungsmatrixSection';
import { CodeExportSection } from './parts/CodeExportSection';
import { type CodeExportTab, type PreviewDevice } from './parts/shared';

export default function BetModeTabsTestingClient() {
  const [selectedTabCrash, setSelectedTabCrash] = useState<BetMode>('manual');
  const [selectedTabDice, setSelectedTabDice] = useState<BetMode>('manual');

  const [varA1Mode, setVarA1Mode] = useState<BetMode>('manual');
  const [varA2Mode, setVarA2Mode] = useState<BetMode>('manual');

  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [activeTabCode, setActiveTabCode] = useState<CodeExportTab>('varA2');

  const handleTabChangeVarA1 = (mode: BetMode) => {
    setVarA1Mode(mode);
    if (!isSoundMuted) {
      soundManager.play('click');
    }
  };

  const handleTabChangeVarA2 = (mode: BetMode) => {
    setVarA2Mode(mode);
    if (!isSoundMuted) {
      soundManager.play('click');
    }
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

        <StatusQuoSection
          crashTab={selectedTabCrash}
          onCrashTabChange={setSelectedTabCrash}
          diceTab={selectedTabDice}
          onDiceTabChange={setSelectedTabDice}
        />

        {/* Section 2: OBSIDIAN GOLD PRECISION MINIMAL NUANCEN */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: 0,
              }}
            >
              <Sparkles size={22} style={{ color: '#d4af37' }} />
              2. Obsidian Gold Precision Minimal — Intensitäts-Vergleich
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Direkter Vergleich zwischen der ursprünglichen Standard-Fassung (A1) und der{' '}
              <strong style={{ color: '#e5c158' }}>
                neuen, dezent reduzierten Champagne-Gold Variante (A2)
              </strong>
              .
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
              maxWidth: previewDevice === 'mobile' ? '420px' : '100%',
              margin: previewDevice === 'mobile' ? '0 auto' : '0',
              gap: '32px',
            }}
          >
            <BetModeTabsOptionStandardGold mode={varA1Mode} onSelectMode={handleTabChangeVarA1} />
            <BetModeTabsOptionMutedChampagne mode={varA2Mode} onSelectMode={handleTabChangeVarA2} />
          </div>
        </section>

        <BewertungsmatrixSection />

        <CodeExportSection activeCodeTab={activeTabCode} onSelectCodeTab={setActiveTabCode} />

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
          Casino Royale VIP Design System 2026 · Initiative 7.1 BetModeTabs Muted Precision
          Evaluation
        </footer>
      </div>
    </div>
  );
}
