'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Code2,
  BookOpen,
  ArrowLeft,
  Volume2,
  VolumeX,
  DollarSign,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';
import { BetInputGroup } from '@/components/casino/controls/BetInputGroup';
import { GameActionButton } from '@/components/casino/controls/GameActionButton';
import { VibeSlider } from '@/components/casino/controls/VibeSlider';
import { AutoBetDrawer, AutoBetConfig } from '@/components/casino/controls/AutoBetDrawer';
import { GameStatsPanel } from '@/components/casino/controls/GameStatsPanel';
import { soundManager } from '@/lib/casino/sound-manager';

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
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#0b0f19',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: '#121826',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#cbd5e1',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} style={{ color: '#d4af37' }} /> Back to Casino Lobby
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              Casino Royale Central Design System Hub
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/testing/7.1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#e5c158',
                textDecoration: 'none',
              }}
            >
              Initiative 7.1 Evaluierung
            </Link>

            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: '#121826',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#e2e8f0',
                cursor: 'pointer',
              }}
            >
              {isSoundMuted ? (
                <>
                  <VolumeX size={16} style={{ color: '#f43f5e' }} /> Sound Muted
                </>
              ) : (
                <>
                  <Volume2 size={16} style={{ color: '#10b981' }} /> Sound Active
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Hero Header Section */}
        <header
          style={{
            background: '#0b0f19',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#e5c158',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  borderRadius: '9999px',
                }}
              >
                <Sparkles size={14} /> Living Brand Design System Hub
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  background: '#121826',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                }}
              >
                URL: http://localhost:3015/testing/brand-showcase
              </span>
            </div>

            <span
              style={{
                padding: '4px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '9999px',
              }}
            >
              🟢 Single Source of Truth for Humans & LLMs
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '12px 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              letterSpacing: '-0.02em',
            }}
          >
            <BookOpen size={36} style={{ color: '#d4af37' }} />
            Casino Royale Brand Showcase & Component Hub
          </h1>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '1rem',
              maxWidth: '850px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Zentrale Dokumentation und lebendige Komponenten-Galerie zur{' '}
            <strong style={{ color: '#e5c158' }}>
              vollständigen visuellen & technischen Vereinheitlichung
            </strong>
            . Alle hier geführten Steuerungselemente sind offiziell bestätigt, produktionsbereit und
            bilden den unumstößlichen Standard für alle Entwickler und LLM-Konversationen.
          </p>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#64748b',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              Geltender Plan:{' '}
              <strong style={{ color: '#f1f5f9' }}>
                07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md
              </strong>
            </div>
            <div>
              Design Standard:{' '}
              <strong style={{ color: '#e5c158' }}>Muted Champagne Gold VIP (2026 Ready)</strong>
            </div>
          </div>
        </header>

        {/* LLM & DEVELOPER GOVERNANCE RULE BOX */}
        <section
          style={{
            background:
              'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(11, 15, 24, 0.95) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#e5c158',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            <ShieldCheck size={20} /> LLM & DEVELOPER GOVERNANCE DIRECTIVE:
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
            Vor jedem Bau neuer Spiele oder Refactoring bestehender Control-Panels (Crash, Dice,
            Slots, Roulette, Blackjack)
            <strong> MÜSSEN</strong> die in dieser Showcase vordefinierten Komponenten importiert
            und konsumiert werden. Kein LLM und kein Entwickler darf ad-hoc Inline-Buttons,
            abweichende Sliders oder benutzerdefinierte Tab-Hintergründe erstellen.
          </p>
        </section>

        {/* COMPONENT CATEGORY 7.1: BETMODE TABS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Initiative 7.1 · Bestätigter Standard
                </span>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '4px 0 0 0',
                  }}
                >
                  &lt;BetModeTabs /&gt; — Standard Mode Switcher
                </h2>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              >
                ✅ Gewinner: Variante A2 (Muted Champagne Gold)
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Interactive Live Component Card */}
            <div
              style={{
                background: '#0b0f18',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#e5c158',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  LIVE INTERAKTIVES ELEMENT
                </span>
                <span
                  style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}
                >
                  Sound: Enabled
                </span>
              </div>

              {/* Live Render of Actual Production Component */}
              <div
                style={{
                  padding: '20px',
                  background: '#06080e',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <BetModeTabs
                  mode={betMode}
                  onModeChange={(m) => setBetMode(m)}
                  soundEnabled={!isSoundMuted}
                />
              </div>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#94a3b8',
                }}
              >
                Aktiver Modus State:{' '}
                <strong style={{ color: '#e5c158', textTransform: 'uppercase' }}>{betMode}</strong>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                  lineHeight: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ fontWeight: 800, color: '#34d399' }}>
                  Spezifikation & Eigenschaften:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>Messerscharfe 1px Randfassung (`rgba(212, 175, 55, 0.2)`)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>Framer Motion 12 Spring-Physics (`stiffness: 500, damping: 32`)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>
                    Acoustic Klick Feedback via &apos;soundManager.play(&apos;click&apos;)&apos;
                  </span>
                </div>
              </div>
            </div>

            {/* Code & Integration Guide Card */}
            <div
              style={{
                background: '#0b0f18',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Code2 size={16} /> Import & Code Usage
                </span>
                <button
                  onClick={() =>
                    handleCopyCode(
                      `import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';\n\n<BetModeTabs mode={mode} onModeChange={(m) => setMode(m)} />`,
                      '7.1',
                    )
                  }
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: '#121826',
                    color: '#e5c158',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copiedSection === '7.1' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSection === '7.1' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div
                style={{
                  background: '#07090e',
                  padding: '16px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  <code>{`import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';

// Usage inside game control panel:
const [mode, setMode] = useState<'manual' | 'auto'>('manual');

<BetModeTabs 
  mode={mode} 
  onModeChange={(nextMode) => setMode(nextMode)} 
/>`}</code>
                </pre>
              </div>

              <div
                style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}
              >
                Dateipfad:{' '}
                <span style={{ color: '#e5c158' }}>
                  src/components/casino/controls/BetModeTabs.tsx
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* COMPONENT CATEGORY 7.2: BET INPUT GROUP */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Initiative 7.2 · Bestätigter Standard
                </span>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '4px 0 0 0',
                  }}
                >
                  &lt;BetInputGroup /&gt; — Universelles Wetteingabefeld
                </h2>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              >
                ✅ Gewinner: Stacked Preset Bar Single Box
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Live Mockup BetInputGroup */}
            <div
              style={{
                background: '#0b0f18',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  BET AMOUNT INPUT + PRESETS (1/2, 2X, MAX)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                  }}
                >
                  <span>BET AMOUNT</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    Balance: ${userBalance.toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#07090e',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                  }}
                >
                  <DollarSign size={18} style={{ color: '#e5c158', marginLeft: '6px' }} />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      padding: '10px 8px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setBetAmount(Math.max(0.1, betAmount / 2))}
                      style={{
                        padding: '6px 10px',
                        background: '#131a26',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        color: '#cbd5e1',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      1/2
                    </button>
                    <button
                      onClick={() => setBetAmount(Math.min(userBalance, betAmount * 2))}
                      style={{
                        padding: '6px 10px',
                        background: '#131a26',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        color: '#cbd5e1',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      2x
                    </button>
                    <button
                      onClick={() => setBetAmount(userBalance)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '6px',
                        color: '#e5c158',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Description 7.2 */}
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
                7.2 Design-Richtlinien:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '16px',
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
                <li>Left-aligned Currency-Symbol (`$`) in edlem Champagne Gold.</li>
                <li>Monospace-Eingabefeld zur Vermeidung von Layout-Sprüngen.</li>
                <li>
                  Quick-Action Presets halbieren, verdoppeln oder setzen den Maximalbetrag mit
                  automatischem Balance-Check.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* COMPONENT CATEGORY 7.3: GAME ACTION BUTTON */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Initiative 7.3 · Bestätigter Standard
                </span>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '4px 0 0 0',
                  }}
                >
                  &lt;GameActionButton /&gt; — Unified Primary CTA Button
                </h2>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              >
                ✅ Gewinner: Option 1-b1 High-Contrast Solid Gold
              </span>
            </div>
          </div>

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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
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
                onClick={handleSimulateBet}
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
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '16px',
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
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

        {/* COMPONENT CATEGORY 7.4: VIBE SLIDER */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Initiative 7.4 · Bestätigter Standard
                </span>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '4px 0 0 0',
                  }}
                >
                  &lt;VibeSlider /&gt; — Universal Brand Slider
                </h2>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              >
                ✅ Gewinner: Option 1-b1 Obsidian Gold Dual-Stat
              </span>
            </div>
          </div>

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
              <VibeSlider value={sliderChance} onChange={setSliderChance} />
            </div>
          </div>
        </section>

        {/* COMPONENT CATEGORY 7.5: AUTO BET DRAWER */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Initiative 7.5 · Bestätigter Standard
                </span>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '4px 0 0 0',
                  }}
                >
                  &lt;AutoBetDrawer /&gt; — Auto-Wett Konfiguration
                </h2>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              >
                ✅ Standardisiert
              </span>
            </div>
          </div>

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
                onChange={setAutoConfig}
                isAutoRunning={isAutoRunning}
                onStartAuto={() => setIsAutoRunning(true)}
                onStopAuto={() => setIsAutoRunning(false)}
              />
            </div>
          </div>
        </section>

        {/* COMPONENT CATEGORY 7.6: GAME STATS PANEL */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Initiative 7.6 · Bestätigter Standard
                </span>
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '4px 0 0 0',
                  }}
                >
                  &lt;GameStatsPanel /&gt; — Session Statistiken
                </h2>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              >
                ✅ Standardisiert
              </span>
            </div>
          </div>

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

        {/* COMPONENT CATEGORY 7.4: VIBE SLIDER */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: '#e5c158',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Initiative 7.4 · Vorschau Standard
            </span>
            <h2
              style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}
            >
              &lt;VibeSlider /&gt; — Brand Range & Dice Slider
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Live Mockup VibeSlider */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  DICE ROLL SLIDER (VALUE: {sliderValue})
                </span>
              </div>

              {/* Slider Track Representation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    position: 'relative',
                    height: '14px',
                    borderRadius: '9999px',
                    background: `linear-gradient(90deg, #f43f5e ${sliderValue}%, #10b981 ${sliderValue}%)`,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${sliderValue}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: '#131a26',
                      border: '2px solid #d4af37',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Contract Description 7.4 */}
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
                7.4 Design-Richtlinien:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '16px',
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
                <li>
                  Dual-Gradient Track (Rot für Verlustbereich, Smaragd-Grün für Gewinnbereich).
                </li>
                <li>
                  Glassmorphic Metallic-Handle (`#131a26`) mit messerscharfer Gold-Umrandung
                  (`#d4af37`).
                </li>
                <li>Sanftes Dragging und Haptik-Feedback beim Ziehen.</li>
              </ul>
            </div>
          </div>
        </section>

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
