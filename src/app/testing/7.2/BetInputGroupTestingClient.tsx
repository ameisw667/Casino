'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxNavbar } from './parts/SandboxNavbar';
import { HeroHeader } from './parts/HeroHeader';
import { StatusQuoSection } from './parts/StatusQuoSection';
import { BetInputGroupOptionBaselineText } from './parts/BetInputGroupOptionBaselineText';
import { BetInputGroupOptionCleanSans } from './parts/BetInputGroupOptionCleanSans';
import { BetInputGroupOptionSeamlessBox } from './parts/BetInputGroupOptionSeamlessBox';
import { BewertungsmatrixSection } from './parts/BewertungsmatrixSection';
import { CodeExportSection } from './parts/CodeExportSection';
import {
  SANDBOX_USER_BALANCE,
  SANDBOX_MIN_BET,
  SANDBOX_MAX_BET,
  type CodeExportTab,
  type PreviewDevice,
} from './parts/shared';

export default function BetInputGroupTestingClient() {
  const [statusCrashBet, setStatusCrashBet] = useState<number>(10);
  const [statusDiceBet, setStatusDiceBet] = useState<number>(10);
  const [statusBjBet, setStatusBjBet] = useState<number>(10);

  const [opt1bBet, setOpt1bBet] = useState<number>(10.0);
  const [opt2bBet, setOpt2bBet] = useState<number>(10.0);
  const [opt2cBet, setOpt2cBet] = useState<number>(10.0);

  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeExportTab>('opt2c');

  const round2 = (val: number) => Math.round(val * 100) / 100;

  const clampBet = (val: number) => {
    return Math.min(SANDBOX_MAX_BET, Math.max(SANDBOX_MIN_BET, round2(val)));
  };

  const handleOpt1bSet = (val: number) => {
    setOpt1bBet(clampBet(val));
    if (!isSoundMuted) soundManager.play('chip');
  };

  const handleOpt2bSet = (val: number) => {
    setOpt2bBet(clampBet(val));
    if (!isSoundMuted) soundManager.play('chip');
  };

  const handleOpt2cSet = (val: number) => {
    setOpt2cBet(clampBet(val));
    if (!isSoundMuted) soundManager.play('chip');
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
          crashBet={statusCrashBet}
          onCrashBetChange={setStatusCrashBet}
          diceBet={statusDiceBet}
          onDiceBetChange={setStatusDiceBet}
          blackjackBet={statusBjBet}
          onBlackjackBetChange={setStatusBjBet}
          balance={SANDBOX_USER_BALANCE}
        />

        {/* SECTION 2: HEADER LAYOUT NUANCEN (1-B VS 2-B VS 2-C) */}
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
              2. Stacked Preset Bar Header-Harmonisierung (2-b vs. 2-c)
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Beseitigung aller doppelten Dollarzeichen und unsauberen Textabstände.{' '}
              <strong>Option 2-c bietet ein nahtlos integriertes Single-Box VIP-Design</strong>.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              maxWidth: previewDevice === 'mobile' ? '420px' : '100%',
              margin: previewDevice === 'mobile' ? '0 auto' : '0',
              gap: '24px',
            }}
          >
            <BetInputGroupOptionBaselineText
              bet={opt1bBet}
              onSetBet={handleOpt1bSet}
              balance={SANDBOX_USER_BALANCE}
              minBet={SANDBOX_MIN_BET}
            />
            <BetInputGroupOptionCleanSans
              bet={opt2bBet}
              onSetBet={handleOpt2bSet}
              balance={SANDBOX_USER_BALANCE}
              minBet={SANDBOX_MIN_BET}
            />
            <BetInputGroupOptionSeamlessBox
              bet={opt2cBet}
              onSetBet={handleOpt2cSet}
              balance={SANDBOX_USER_BALANCE}
              minBet={SANDBOX_MIN_BET}
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
          Casino Royale VIP Design System 2026 · Initiative 7.2 BetInputGroup Header Optimization
        </footer>
      </div>
    </div>
  );
}
