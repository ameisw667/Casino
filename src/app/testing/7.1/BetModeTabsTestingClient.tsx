'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Zap,
  Play,
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  ShieldCheck,
  Layers,
  Volume2,
  VolumeX,
  ExternalLink,
  Flame,
  ArrowLeft,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export default function BetModeTabsTestingClient() {
  // Status Quo interactive states
  const [selectedTabCrash, setSelectedTabCrash] = useState<'manual' | 'auto'>('manual');
  const [selectedTabDice, setSelectedTabDice] = useState<'manual' | 'auto'>('manual');

  // Interactive Precision Minimal Sub-Variants
  // Variante A1: Classic Gold Accent
  const [varA1Mode, setVarA1Mode] = useState<'manual' | 'auto'>('manual');
  // Variante A2: Subtle Muted Champagne Gold (Reduced Color Intensity)
  const [varA2Mode, setVarA2Mode] = useState<'manual' | 'auto'>('manual');

  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport mode state (Desktop vs Mobile Frame preview)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Code export tab state
  const [activeTabCode, setActiveTabCode] = useState<'varA1' | 'varA2'>('varA2');

  // Handlers with Sound Triggers
  const handleTabChangeVarA1 = (mode: 'manual' | 'auto') => {
    setVarA1Mode(mode);
    if (!isSoundMuted) {
      soundManager.play('click');
    }
  };

  const handleTabChangeVarA2 = (mode: 'manual' | 'auto') => {
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
            <Link
              href="/testing/brand-showcase"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#34d399',
                textDecoration: 'none',
              }}
            >
              Central Brand Showcase Hub →
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Viewport Device Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#070a10',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                onClick={() => setPreviewDevice('desktop')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border:
                    previewDevice === 'desktop' ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                  background:
                    previewDevice === 'desktop' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: previewDevice === 'desktop' ? '#e5c158' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <Monitor size={14} /> Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: previewDevice === 'mobile' ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                  background:
                    previewDevice === 'mobile' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: previewDevice === 'mobile' ? '#e5c158' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <Smartphone size={14} /> Mobile (375px)
              </button>
            </div>

            {/* Sound Mute Toggle */}
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
            border: '1px solid rgba(212, 175, 55, 0.18)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#e5c158',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  borderRadius: '9999px',
                }}
              >
                <Sparkles size={14} /> Phase 1 · Initiative 7.1 (Muted Precision Edition)
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
                URL: http://localhost:3015/testing/7.1
              </span>
            </div>

            <span
              style={{
                padding: '4px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '9999px',
              }}
            >
              🟢 Subtle Muted Gold Refinement
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '12px 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            <Layers size={32} style={{ color: '#d4af37' }} />
            Obsidian Gold Precision Minimal Evaluation
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
            Vergleich zweier{' '}
            <strong style={{ color: '#e5c158' }}>Obsidian Gold Precision Minimal</strong> Nuancen.
            Direkte Gegenüberstellung der Standard-Goldfassung mit einer{' '}
            <strong style={{ color: '#e5c158' }}>
              reduzierten, dezenten Champagne-Gold Variante (A2)
            </strong>{' '}
            für maximalen Sehkomfort ohne grelle Intensität.
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
              Zuständige Agenten:{' '}
              <strong style={{ color: '#f1f5f9' }}>Design-Guardian & UI-Animator</strong>
            </div>
            <div>
              Design Standard:{' '}
              <strong style={{ color: '#e5c158' }}>Muted Champagne Gold VIP (2026)</strong>
            </div>
          </div>
        </header>

        {/* Section 1: STATUS QUO */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
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
              <Sliders size={22} style={{ color: '#94a3b8' }} />
              1. Status Quo — Ist-Zustand im Bestand (Crash vs. Dice)
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Vergleich der bestehenden Steuerungselemente aus Crash & Dice.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Crash Status Quo Card */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    textTransform: 'uppercase',
                  }}
                >
                  Game: /games/crash
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Container: #1e293b (Slate)
                </span>
              </div>

              <div
                style={{
                  padding: '16px',
                  background: '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                  }}
                >
                  <span>⚡ CONTROL</span>
                  <Info size={16} style={{ color: '#64748b' }} />
                </div>
                {/* Crash Actual Tabs Markup Clone */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    background: '#0f172a',
                    padding: '4px',
                    borderRadius: '8px',
                  }}
                >
                  <button
                    onClick={() => setSelectedTabCrash('manual')}
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedTabCrash === 'manual' ? '#334155' : 'transparent',
                      color: selectedTabCrash === 'manual' ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setSelectedTabCrash('auto')}
                    style={{
                      padding: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedTabCrash === 'auto' ? '#334155' : 'transparent',
                      color: selectedTabCrash === 'auto' ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ color: '#fb7185', fontWeight: 800 }}>⚠️ Mängel im Crash-Bestand:</div>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
                  <li>Bläuliches `#1e293b` entspricht nicht Obsidian-Dark (`#0b0e14`)</li>
                  <li>Keine Framer Motion Spring-Animation (Layout-Starrheit)</li>
                  <li>Aktiver Tab hebt sich nur schwach vom Slate-Hintergrund ab</li>
                </ul>
              </div>
            </div>

            {/* Dice Status Quo Card */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    textTransform: 'uppercase',
                  }}
                >
                  Game: /games/dice
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    background: '#0b0e14',
                    color: '#cbd5e1',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid #1a2234',
                  }}
                >
                  Container: #0b0e14 (Dark)
                </span>
              </div>

              <div
                style={{
                  padding: '16px',
                  background: '#0b0e14',
                  borderRadius: '12px',
                  border: '1px solid #1a2234',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Dice Actual Tabs Markup Clone */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    background: '#0b0e14',
                    padding: '4px',
                    borderRadius: '8px',
                    border: '1px solid #1a2234',
                  }}
                >
                  <button
                    onClick={() => setSelectedTabDice('manual')}
                    style={{
                      padding: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background:
                        selectedTabDice === 'manual' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                      border:
                        selectedTabDice === 'manual' ? '1px solid rgba(245, 158, 11, 0.3)' : 'none',
                      color: selectedTabDice === 'manual' ? '#fbbf24' : '#94a3b8',
                    }}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setSelectedTabDice('auto')}
                    style={{
                      padding: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background:
                        selectedTabDice === 'auto' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                      border:
                        selectedTabDice === 'auto' ? '1px solid rgba(245, 158, 11, 0.3)' : 'none',
                      color: selectedTabDice === 'auto' ? '#fbbf24' : '#94a3b8',
                    }}
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ color: '#fb7185', fontWeight: 800 }}>⚠️ Mängel im Dice-Bestand:</div>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
                  <li>Inkonsistente Rahmen und Schriftgrößen im Vergleich zu Crash</li>
                  <li>Keine flüssige Schiebe-Animation beim Wechsel zwischen Tabs</li>
                  <li>Keine visuelle Rückmeldung über aktiven Auto-Bet Status</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

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
            {/* VARIANTE A1 CARD (STANDARD INTENSIVE GOLD) */}
            <div
              style={{
                background: '#0d111a',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
                boxShadow:
                  '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: '6px 16px',
                  background: '#d4af37',
                  color: '#05070b',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottomLeftRadius: '14px',
                }}
              >
                Variante A1: Standard Gold Accent
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    <Flame size={20} style={{ color: '#f59e0b' }} />
                    A1 — Standard Gold Edge
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Ursprüngliche Variante mit deutlicher Goldkante (`1px solid #d4af37`) und klarem
                    Gold-Text.
                  </p>
                </div>

                {/* LIVE DEMO VARIANTE A1 */}
                <div
                  style={{
                    padding: '20px',
                    background: '#07090e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#94a3b8',
                    }}
                  >
                    <span>PROTOTYP A1:</span>
                    <span style={{ color: '#d4af37', fontWeight: 700 }}>Klick auf die Tabs!</span>
                  </div>

                  {/* Component Render A1 */}
                  <div
                    style={{
                      position: 'relative',
                      background: '#0d131f',
                      padding: '4px',
                      borderRadius: '14px',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px',
                    }}
                  >
                    {/* Manual Button */}
                    <button
                      onClick={() => handleTabChangeVarA1('manual')}
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: '12px 0',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        background: 'transparent',
                        color: varA1Mode === 'manual' ? '#f59e0b' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {varA1Mode === 'manual' && (
                        <motion.div
                          layoutId="activeTabPillVarA1"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#161d2a',
                            border: '1px solid #d4af37',
                            borderRadius: '10px',
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        />
                      )}
                      <Play
                        size={14}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          color: varA1Mode === 'manual' ? '#f59e0b' : '#64748b',
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
                    </button>

                    {/* Auto Button */}
                    <button
                      onClick={() => handleTabChangeVarA1('auto')}
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: '12px 0',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        background: 'transparent',
                        color: varA1Mode === 'auto' ? '#f59e0b' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {varA1Mode === 'auto' && (
                        <motion.div
                          layoutId="activeTabPillVarA1"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#161d2a',
                            border: '1px solid #d4af37',
                            borderRadius: '10px',
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        />
                      )}
                      <Zap
                        size={14}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          color: varA1Mode === 'auto' ? '#f59e0b' : '#64748b',
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
                    </button>
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#94a3b8',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    Aktiver Modus:{' '}
                    <strong style={{ color: '#f59e0b', textTransform: 'uppercase' }}>
                      {varA1Mode}
                    </strong>
                  </div>
                </div>

                {/* Highlights List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: '#d4af37',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Eigenschaften A1:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      color: '#cbd5e1',
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }}
                    />
                    <span>
                      <strong>Prägnante Goldkante:</strong> `1px solid #d4af37` Rand um aktiven
                      Button.
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      color: '#cbd5e1',
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }}
                    />
                    <span>
                      <strong>Hoher Kontrast:</strong> Goldener Text hebt sich stark ab.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* VARIANTE A2 CARD (DEZENTE MUTED CHAMPAGNE GOLD - EMPFOHLEN) */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(212, 175, 55, 0.16)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
                boxShadow:
                  '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: '6px 16px',
                  background: 'rgba(212, 175, 55, 0.18)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#e5c158',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottomLeftRadius: '14px',
                }}
              >
                ★ Empfohlen: Variante A2 (Muted Champagne)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    <Sparkles size={20} style={{ color: '#e5c158' }} />
                    A2 — Subtle Muted Champagne Gold
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Angenehm reduzierte Farbintensität: Samtige Champagne-Gold Kante (`1px solid
                    rgba(212, 175, 55, 0.4)`), meidet grelles Gelb für ein edles matte VIP-Finish.
                  </p>
                </div>

                {/* LIVE DEMO VARIANTE A2 */}
                <div
                  style={{
                    padding: '20px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#94a3b8',
                    }}
                  >
                    <span>PROTOTYP A2 (REDUZIERTE INTENSITÄT):</span>
                    <span style={{ color: '#e5c158', fontWeight: 700 }}>Klick auf die Tabs!</span>
                  </div>

                  {/* Component Render A2 */}
                  <div
                    style={{
                      position: 'relative',
                      background: '#0b0f18',
                      padding: '4px',
                      borderRadius: '14px',
                      border: '1px solid rgba(212, 175, 55, 0.15)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px',
                    }}
                  >
                    {/* Manual Button */}
                    <button
                      onClick={() => handleTabChangeVarA2('manual')}
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: '12px 0',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        background: 'transparent',
                        color: varA2Mode === 'manual' ? '#e5c158' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {varA2Mode === 'manual' && (
                        <motion.div
                          layoutId="activeTabPillVarA2"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#131a26',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            borderRadius: '10px',
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        />
                      )}
                      <Play
                        size={14}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          color: varA2Mode === 'manual' ? '#e5c158' : '#475569',
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
                    </button>

                    {/* Auto Button */}
                    <button
                      onClick={() => handleTabChangeVarA2('auto')}
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: '12px 0',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        background: 'transparent',
                        color: varA2Mode === 'auto' ? '#e5c158' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {varA2Mode === 'auto' && (
                        <motion.div
                          layoutId="activeTabPillVarA2"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#131a26',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            borderRadius: '10px',
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        />
                      )}
                      <Zap
                        size={14}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          color: varA2Mode === 'auto' ? '#e5c158' : '#475569',
                        }}
                      />
                      <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
                    </button>
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#94a3b8',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    Aktiver Modus:{' '}
                    <strong style={{ color: '#e5c158', textTransform: 'uppercase' }}>
                      {varA2Mode}
                    </strong>
                  </div>
                </div>

                {/* Highlights List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: '#e5c158',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Highlights Variante A2 (Muted Gold):
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      color: '#cbd5e1',
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }}
                    />
                    <span>
                      <strong>Dezente Randfassung (`rgba(212, 175, 55, 0.16)`):</strong> Keinerlei
                      knallige oder aufdringliche Goldrahmen.
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      color: '#cbd5e1',
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }}
                    />
                    <span>
                      <strong>Eleganter Champagne-Farbton (`#e5c158`):</strong> Angenehm warm und
                      edel ohne knalliges Gelb.
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      color: '#cbd5e1',
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }}
                    />
                    <span>
                      <strong>Maximaler Sehkomfort:</strong> Ruhiges, mattes Obsidian-Inlay fügt
                      sich perfekt ins Gesamtdesign ein.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: BEWERTUNGSMATRIX */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              <ShieldCheck size={22} style={{ color: '#d4af37' }} />
              3. Bewertungsmatrix der Präzisions-Nuancen
            </h2>
          </div>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#0b0e14',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#121826',
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <th style={{ padding: '16px' }}>Kriterium</th>
                  <th style={{ padding: '16px', color: '#94a3b8' }}>Status Quo (Alt)</th>
                  <th style={{ padding: '16px', color: '#d4af37' }}>Variante A1 (Standard Gold)</th>
                  <th style={{ padding: '16px', color: '#e5c158' }}>
                    Variante A2 (Muted Champagne) ★
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: '#e2e8f0' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Farbingensität / Sehkomfort
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Kalt (Slate Blau)</td>
                  <td style={{ padding: '16px', color: '#fbbf24', fontWeight: 700 }}>
                    Stark / Prägnant
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Optimal Dezent & Edel
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Messerscharfe Gold-Kanten
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Nein</td>
                  <td style={{ padding: '16px', color: '#d4af37', fontWeight: 800 }}>
                    Ja (`1px solid #d4af37`)
                  </td>
                  <td style={{ padding: '16px', color: '#e5c158', fontWeight: 800 }}>
                    Ja (`1px solid rgba(212,175,55,0.4)`)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Integration ins Gesamt-Theme
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Abweichend</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>Gut (Grob)</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Perfekt Harmonisch
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Sound Integration
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Nein</td>
                  <td style={{ padding: '16px', color: '#d4af37', fontWeight: 800 }}>
                    Ja (&apos;soundManager.play(&apos;click&apos;)&apos;)
                  </td>
                  <td style={{ padding: '16px', color: '#e5c158', fontWeight: 800 }}>
                    Ja (&apos;soundManager.play(&apos;click&apos;)&apos;)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>Empfehlung</td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Veraltet</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>Gut für CTA-Buttons</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Empfohlen für Controls
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: PRODUCTION CODE EXPORT */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              <ExternalLink size={22} style={{ color: '#d4af37' }} />
              4. Produktions-Code Contract Export
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Bereitgestellter React/TypeScript Code zur direkten Übernahme in{' '}
              <code style={{ color: '#d4af37', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                src/components/casino/controls/BetModeTabs.tsx
              </code>
            </p>
          </div>

          <div
            style={{
              background: '#0a0e17',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#121826',
                padding: '12px 16px 0 16px',
                gap: '8px',
              }}
            >
              <button
                onClick={() => setActiveTabCode('varA1')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTabCode === 'varA1' ? '#0a0e17' : 'transparent',
                  color: activeTabCode === 'varA1' ? '#d4af37' : '#94a3b8',
                  borderTop:
                    activeTabCode === 'varA1' ? '2px solid #d4af37' : '2px solid transparent',
                }}
              >
                Variante A1 (Standard Gold)
              </button>
              <button
                onClick={() => setActiveTabCode('varA2')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTabCode === 'varA2' ? '#0a0e17' : 'transparent',
                  color: activeTabCode === 'varA2' ? '#e5c158' : '#94a3b8',
                  borderTop:
                    activeTabCode === 'varA2' ? '2px solid #e5c158' : '2px solid transparent',
                }}
              >
                Variante A2 (Muted Champagne - Empfohlen) ★
              </button>
            </div>

            <div
              style={{
                padding: '24px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                overflowX: 'auto',
                color: '#cbd5e1',
                background: '#07090e',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                <code>
                  {activeTabCode === 'varA1'
                    ? `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface BetModeTabsProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  disabled?: boolean;
}

export function BetModeTabs({ mode, onModeChange, disabled }: BetModeTabsProps) {
  const handleSelect = (nextMode: 'manual' | 'auto') => {
    if (disabled || nextMode === mode) return;
    soundManager.play('click');
    onModeChange(nextMode);
  };

  return (
    <div style={{
      position: 'relative',
      background: '#0d131f',
      padding: '4px',
      borderRadius: '14px',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px'
    }}>
      <button
        onClick={() => handleSelect('manual')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'manual' ? '#f59e0b' : '#94a3b8', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'manual' && (
          <motion.div
            layoutId="activeTabPill"
            style={{
              position: 'absolute', inset: 0,
              background: '#161d2a',
              border: '1px solid #d4af37', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Play size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'manual' ? '#f59e0b' : '#64748b' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
      </button>

      <button
        onClick={() => handleSelect('auto')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'auto' ? '#f59e0b' : '#94a3b8', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'auto' && (
          <motion.div
            layoutId="activeTabPill"
            style={{
              position: 'absolute', inset: 0,
              background: '#161d2a',
              border: '1px solid #d4af37', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Zap size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'auto' ? '#f59e0b' : '#64748b' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
      </button>
    </div>
  );
}`
                    : `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface BetModeTabsMutedProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  disabled?: boolean;
}

export function BetModeTabsMuted({ mode, onModeChange, disabled }: BetModeTabsMutedProps) {
  const handleSelect = (nextMode: 'manual' | 'auto') => {
    if (disabled || nextMode === mode) return;
    soundManager.play('click');
    onModeChange(nextMode);
  };

  return (
    <div style={{
      position: 'relative',
      background: '#0b0f18',
      padding: '4px',
      borderRadius: '14px',
      border: '1px solid rgba(212, 175, 55, 0.15)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px'
    }}>
      <button
        onClick={() => handleSelect('manual')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'manual' ? '#e5c158' : '#64748b', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'manual' && (
          <motion.div
            layoutId="activeTabPillMuted"
            style={{
              position: 'absolute', inset: 0,
              background: '#131a26',
              border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Play size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'manual' ? '#e5c158' : '#475569' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
      </button>

      <button
        onClick={() => handleSelect('auto')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'auto' ? '#e5c158' : '#64748b', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'auto' && (
          <motion.div
            layoutId="activeTabPillMuted"
            style={{
              position: 'absolute', inset: 0,
              background: '#131a26',
              border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Zap size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'auto' ? '#e5c158' : '#475569' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
      </button>
    </div>
  );
}`}
                </code>
              </pre>
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
          Casino Royale VIP Design System 2026 · Initiative 7.1 BetModeTabs Muted Precision
          Evaluation
        </footer>
      </div>
    </div>
  );
}
