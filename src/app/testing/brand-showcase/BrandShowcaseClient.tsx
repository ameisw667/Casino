'use client';

import React, { useState } from 'react';
import { AutoBetConfig } from '@/components/casino/controls/AutoBetDrawer';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxNavbar } from './parts/SandboxNavbar';
import { HeroHeader } from './parts/HeroHeader';
import { GovernanceSection } from './parts/GovernanceSection';
import { BetModeTabsShowcaseSection } from './parts/BetModeTabsShowcaseSection';
import { BetInputGroupShowcaseSection } from './parts/BetInputGroupShowcaseSection';
import { GameActionButtonShowcaseSection } from './parts/GameActionButtonShowcaseSection';
import { VibeSliderShowcaseSection } from './parts/VibeSliderShowcaseSection';
import { AutoBetDrawerShowcaseSection } from './parts/AutoBetDrawerShowcaseSection';
import { GameStatsPanelShowcaseSection } from './parts/GameStatsPanelShowcaseSection';
import { VibeSliderPreviewSection } from './parts/VibeSliderPreviewSection';

export default function BrandShowcaseClient() {
  // Live State for Approved BetModeTabs (7.1)
  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual');

  // Live State for VibeSlider (7.4)
  const [sliderChance, setSliderChance] = useState<number>(50);

  // Live State for AutoBetDrawer (7.5)
  const [autoConfig, setAutoConfig] = useState<AutoBetConfig>({
    numberOfBets: 10,
    onWinIncrease: 0,
    onLossIncrease: 100,
    stopProfit: 50,
    stopLoss: 20,
  });
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  // Live State for BetInputGroup Preview (7.2)
  const [betAmount, setBetAmount] = useState<number>(10.0);
  const userBalance = 1000.0;

  // Live State for GameActionButton Preview (7.3)
  const [isBetProcessing, setIsBetProcessing] = useState(false);

  // Live State for VibeSlider Preview (7.4)
  const [sliderValue, setSliderValue] = useState<number>(50);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Copy Code Feedback
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyCode = (code: string, sectionId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSimulateBet = () => {
    setIsBetProcessing(true);
    if (!isSoundMuted) soundManager.play('bet');
    setTimeout(() => {
      setIsBetProcessing(false);
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
        {/* Navigation Bar */}
        <SandboxNavbar
          isSoundMuted={isSoundMuted}
          onToggleSound={() => setIsSoundMuted(!isSoundMuted)}
        />

        {/* Hero Header Section */}
        <HeroHeader />

        {/* LLM & DEVELOPER GOVERNANCE RULE BOX */}
        <GovernanceSection />

        {/* COMPONENT CATEGORY 7.1: BETMODE TABS */}
        <BetModeTabsShowcaseSection
          betMode={betMode}
          onBetModeChange={setBetMode}
          isSoundMuted={isSoundMuted}
          copiedSection={copiedSection}
          onCopyCode={handleCopyCode}
        />

        {/* COMPONENT CATEGORY 7.2: BET INPUT GROUP */}
        <BetInputGroupShowcaseSection
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          userBalance={userBalance}
        />

        {/* COMPONENT CATEGORY 7.3: GAME ACTION BUTTON */}
        <GameActionButtonShowcaseSection
          betAmount={betAmount}
          isBetProcessing={isBetProcessing}
          onSimulateBet={handleSimulateBet}
        />

        {/* COMPONENT CATEGORY 7.4: VIBE SLIDER */}
        <VibeSliderShowcaseSection
          sliderChance={sliderChance}
          onSliderChanceChange={setSliderChance}
        />

        {/* COMPONENT CATEGORY 7.5: AUTO BET DRAWER */}
        <AutoBetDrawerShowcaseSection
          autoConfig={autoConfig}
          onAutoConfigChange={setAutoConfig}
          isAutoRunning={isAutoRunning}
          onStartAuto={() => setIsAutoRunning(true)}
          onStopAuto={() => setIsAutoRunning(false)}
        />

        {/* COMPONENT CATEGORY 7.6: GAME STATS PANEL */}
        <GameStatsPanelShowcaseSection />

        {/* COMPONENT CATEGORY 7.4: VIBE SLIDER */}
        <VibeSliderPreviewSection sliderValue={sliderValue} onSliderValueChange={setSliderValue} />

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
          Casino Royale Living Brand Design System Hub · Approved 2026 Component Specifications
        </footer>
      </div>
    </div>
  );
}
