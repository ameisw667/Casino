'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Code2,
  ArrowLeft,
  Volume2,
  VolumeX,
  DollarSign,
  ShieldCheck,
  Smartphone,
  Monitor,
  Flame,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export default function BetInputGroupTestingClient() {
  const userBalance = 1000.0;
  const minBet = 0.1;
  const maxBet = 1000.0;

  // Status Quo Interactive States
  const [statusCrashBet, setStatusCrashBet] = useState<number>(10);
  const [statusDiceBet, setStatusDiceBet] = useState<number>(10);
  const [statusBjBet, setStatusBjBet] = useState<number>(10);

  // Stacked Preset Bar Sub-Variants
  // Option 1-b: Baseline Stacked Bar (Plain Header Text)
  const [opt1bBet, setOpt1bBet] = useState<number>(10.0);

  // Option 2-b: VIP Clean Sans Header
  const [opt2bBet, setOpt2bBet] = useState<number>(10.0);

  // Option 2-c: VIP Floating Integrated Label (Single-Box Seamless Layout)
  const [opt2cBet, setOpt2cBet] = useState<number>(10.0);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport Device Toggle State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Copy Code Feedback State
  const [activeCodeTab, setActiveCodeTab] = useState<'opt1b' | 'opt2b' | 'opt2c'>('opt2c');

  // Safe float precision helper
  const round2 = (val: number) => Math.round(val * 100) / 100;

  // Handlers Option 1-b (Baseline Stacked)
  const handleOpt1bSet = (val: number) => {
    const clamped = Math.min(maxBet, Math.max(minBet, round2(val)));
    setOpt1bBet(clamped);
    if (!isSoundMuted) soundManager.play('chip');
  };

  // Handlers Option 2-b (VIP Clean Sans Header)
  const handleOpt2bSet = (val: number) => {
    const clamped = Math.min(maxBet, Math.max(minBet, round2(val)));
    setOpt2bBet(clamped);
    if (!isSoundMuted) soundManager.play('chip');
  };

  // Handlers Option 2-c (VIP Floating Integrated Label)
  const handleOpt2cSet = (val: number) => {
    const clamped = Math.min(maxBet, Math.max(minBet, round2(val)));
    setOpt2cBet(clamped);
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
              href="/testing/7.1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#121826',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#cbd5e1',
                textDecoration: 'none',
              }}
            >
              Initiative 7.1 Gewinner
            </Link>
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
                <Sparkles size={14} /> Phase 1 · Initiative 7.2 (&lt;BetInputGroup /&gt; Header
                Harmony)
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
                URL: http://localhost:3015/testing/7.2
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
              🟢 VIP Header Optimization (Option 2-b vs 2-c)
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
              gap: '14px',
              letterSpacing: '-0.02em',
            }}
          >
            <DollarSign size={34} style={{ color: '#d4af37' }} />
            Initiative 7.2: BetInputGroup Header Layout Perfection
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
            Beseitigung der redundanten Dollarzeichen und visuellen Header-Mängel. Vergleich von 3
            Entwicklungsstufen:{' '}
            <strong style={{ color: '#94a3b8' }}>Option 1-b (Baseline Text)</strong>,{' '}
            <strong style={{ color: '#e5c158' }}>Option 2-b (VIP Clean Header)</strong> und der{' '}
            <strong style={{ color: '#34d399' }}>
              Option 2-c (Seamless Floating Label Integrated)
            </strong>
            .
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
                07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md (§7.2)
              </strong>
            </div>
            <div>
              Zuständige Agenten:{' '}
              <strong style={{ color: '#e5c158' }}>Design-Guardian & Logic-Architect</strong>
            </div>
          </div>
        </header>

        {/* SECTION 1: STATUS QUO ANALYSE */}
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
              <SlidersHorizontal size={22} style={{ color: '#94a3b8' }} />
              1. Status Quo — Ist-Zustand im Bestand (Crash vs. Dice vs. Blackjack)
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Aktuelle Wetteingabefelder zeigen starke Abweichungen bei Schriftarten, Rahmenfarben,
              Button-Reihenfolge und Nachkommastellen.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Crash Status Quo */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px',
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
                  Game: /games/crash
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    borderRadius: '4px',
                  }}
                >
                  Slate Container
                </span>
              </div>

              <div
                style={{
                  padding: '16px',
                  background: '#1e293b',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                  BET AMOUNT
                </div>
                <div
                  style={{
                    display: 'flex',
                    background: '#0f172a',
                    borderRadius: '8px',
                    padding: '4px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <input
                    type="number"
                    value={statusCrashBet}
                    onChange={(e) => setStatusCrashBet(parseFloat(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '8px',
                      outline: 'none',
                      fontWeight: 700,
                    }}
                  />
                  <button
                    onClick={() => setStatusCrashBet(statusCrashBet / 2)}
                    style={{
                      padding: '4px 8px',
                      background: '#334155',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '4px',
                      marginRight: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    1/2
                  </button>
                  <button
                    onClick={() => setStatusCrashBet(statusCrashBet * 2)}
                    style={{
                      padding: '4px 8px',
                      background: '#334155',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    2x
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#fb7185',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '10px',
                  borderRadius: '8px',
                  lineHeight: 1.5,
                }}
              >
                ⚠️ <strong>Mängel:</strong> Kein MAX-Button, ungerundetes `/ 2` führt zu
                `0.6250000001` Float-Fehlern, Slate-Blau Hintergrund.
              </div>
            </div>

            {/* Dice Status Quo */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px',
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
                  Game: /games/dice
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: '#0b0e14',
                    color: '#cbd5e1',
                    borderRadius: '4px',
                    border: '1px solid #1a2234',
                  }}
                >
                  Dark Container
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
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                  BET AMOUNT
                </div>
                <div
                  style={{
                    display: 'flex',
                    background: '#0b0e14',
                    borderRadius: '8px',
                    padding: '4px',
                    border: '1px solid #1a2234',
                  }}
                >
                  <input
                    type="number"
                    value={statusDiceBet}
                    onChange={(e) => setStatusDiceBet(parseFloat(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      color: '#fbbf24',
                      padding: '8px',
                      outline: 'none',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <button
                    onClick={() => setStatusDiceBet(statusDiceBet / 2)}
                    style={{
                      padding: '4px 8px',
                      background: '#1a2234',
                      border: 'none',
                      color: '#94a3b8',
                      borderRadius: '4px',
                      marginRight: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    1/2
                  </button>
                  <button
                    onClick={() => setStatusDiceBet(statusDiceBet * 2)}
                    style={{
                      padding: '4px 8px',
                      background: '#1a2234',
                      border: 'none',
                      color: '#94a3b8',
                      borderRadius: '4px',
                      marginRight: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    2x
                  </button>
                  <button
                    onClick={() => setStatusDiceBet(userBalance)}
                    style={{
                      padding: '4px 8px',
                      background: 'rgba(245,158,11,0.2)',
                      border: 'none',
                      color: '#fbbf24',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#fb7185',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '10px',
                  borderRadius: '8px',
                  lineHeight: 1.5,
                }}
              >
                ⚠️ <strong>Mängel:</strong> Abweichende Rahmenfarbe zu Crash, keine
                Haptik-/Sound-Rückmeldung beim Klicken.
              </div>
            </div>

            {/* Blackjack Status Quo */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px',
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
                  Game: /games/blackjack
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: '#0b0e14',
                    color: '#cbd5e1',
                    borderRadius: '4px',
                    border: '1px solid #1a2234',
                  }}
                >
                  Chip Picker
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
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                  CHIP BET AMOUNT
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                  {[1, 5, 25, 100].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setStatusBjBet(chip)}
                      style={{
                        padding: '6px 10px',
                        background: statusBjBet === chip ? '#d4af37' : '#1a2234',
                        color: statusBjBet === chip ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      ${chip}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#fb7185',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '10px',
                  borderRadius: '8px',
                  lineHeight: 1.5,
                }}
              >
                ⚠️ <strong>Mängel:</strong> Chips-Bedienung unterscheidet sich komplett von Crash &
                Dice Wetteingaben.
              </div>
            </div>
          </div>
        </section>

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
            {/* OPTION 1-B: BASELINE STACKED BAR */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Option 1-b: Baseline Text
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Schlichter Text-Header mit ungerichtetem Abstand.
                  </p>
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span>BET AMOUNT ($)</span>
                    <span>Balance: ${userBalance.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#0b0f18',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '12px',
                      padding: '4px 12px',
                    }}
                  >
                    <DollarSign size={18} style={{ color: '#e5c158', flexShrink: 0 }} />
                    <input
                      type="number"
                      value={opt1bBet}
                      onChange={(e) => handleOpt1bSet(parseFloat(e.target.value) || 0)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        padding: '8px 4px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}
                  >
                    <button
                      onClick={() => handleOpt1bSet(minBet)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      MIN
                    </button>
                    <button
                      onClick={() => handleOpt1bSet(opt1bBet / 2)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ½
                    </button>
                    <button
                      onClick={() => handleOpt1bSet(opt1bBet * 2)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      2×
                    </button>
                    <button
                      onClick={() => handleOpt1bSet(userBalance)}
                      style={{
                        padding: '8px 0',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '8px',
                        color: '#e5c158',
                        fontSize: '0.75rem',
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

            {/* OPTION 2-B: VIP CLEAN SANS HEADER */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Option 2-b: Clean Sans Header
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Klar strukturierter Header ohne doppeltes Dollar-Zeichen.
                  </p>
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Clean Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#e5c158',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      BET AMOUNT
                    </span>

                    <button
                      onClick={() => handleOpt2bSet(userBalance)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        background: '#121826',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      <Wallet size={12} style={{ color: '#e5c158' }} />
                      <span>Bal:</span>
                      <strong style={{ color: '#ffffff' }}>${userBalance.toFixed(2)}</strong>
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#0b0f18',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      padding: '4px 12px',
                    }}
                  >
                    <span
                      style={{
                        color: '#e5c158',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        marginRight: '6px',
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={opt2bBet}
                      onChange={(e) => handleOpt2bSet(parseFloat(e.target.value) || 0)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        padding: '8px 4px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}
                  >
                    <button
                      onClick={() => handleOpt2bSet(minBet)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      MIN
                    </button>
                    <button
                      onClick={() => handleOpt2bSet(opt2bBet / 2)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ½
                    </button>
                    <button
                      onClick={() => handleOpt2bSet(opt2bBet * 2)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      2×
                    </button>
                    <button
                      onClick={() => handleOpt2bSet(userBalance)}
                      style={{
                        padding: '8px 0',
                        background: 'rgba(212, 175, 55, 0.18)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '8px',
                        color: '#e5c158',
                        fontSize: '0.75rem',
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

            {/* OPTION 2-C: VIP SEAMLESS FLOATING LABEL (NEU & EMPFOHLEN ★) */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
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
                  padding: '6px 14px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottomLeftRadius: '14px',
                }}
              >
                ★ GEWINNER FAVORIT: Option 2-c (Seamless Box)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    <Flame size={18} style={{ color: '#34d399' }} />
                    Option 2-c: Seamless Floating Label Box
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Integrierter Single-Box Container: Header-Beschriftung und Guthaben-Badge sind
                    nahtlos im Eingaberahmen eingebettet.
                  </p>
                </div>

                {/* Live Demo Option 2-c */}
                <div
                  style={{
                    padding: '20px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* SEAMLESS SINGLE BOX INPUT */}
                  <div
                    style={{
                      background: '#0b0f18',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Integrated Top Header Row inside Box */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#e5c158',
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        WETTEINSATZ
                      </span>

                      <button
                        onClick={() => handleOpt2cSet(userBalance)}
                        title="Klick für Maximalwette (MAX)"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <Wallet size={12} style={{ color: '#34d399' }} />
                        <span>Guthaben:</span>
                        <strong style={{ color: '#34d399' }}>${userBalance.toFixed(2)}</strong>
                      </button>
                    </div>

                    {/* Main Input Row inside Box */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          color: '#e5c158',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                          marginRight: '6px',
                        }}
                      >
                        $
                      </span>
                      <input
                        type="number"
                        value={opt2cBet}
                        onChange={(e) => handleOpt2cSet(parseFloat(e.target.value) || 0)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          padding: '2px 0',
                          outline: 'none',
                        }}
                      />
                      {opt2cBet > 0 && (
                        <button
                          onClick={() => handleOpt2cSet(10.0)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Bar */}
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}
                  >
                    <button
                      onClick={() => handleOpt2cSet(minBet)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      MIN
                    </button>
                    <button
                      onClick={() => handleOpt2cSet(opt2cBet / 2)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ½
                    </button>
                    <button
                      onClick={() => handleOpt2cSet(opt2cBet * 2)}
                      style={{
                        padding: '8px 0',
                        background: '#131a26',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      2×
                    </button>
                    <button
                      onClick={() => handleOpt2cSet(userBalance)}
                      style={{
                        padding: '8px 0',
                        background: 'rgba(16, 185, 129, 0.16)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '8px',
                        color: '#34d399',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#34d399' }}>
                    Highlights Option 2-c (Seamless):
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Nahtlose Single-Box Integration ohne losen Header-Text</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Integrierter Klick-Trigger für Maximalwette im Guthaben-Text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: BEWERTUNGSMATRIX */}
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
              3. Bewertungsmatrix der Header-Nuancen
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
                  <th style={{ padding: '16px', color: '#94a3b8' }}>Option 1-b (Plain Header)</th>
                  <th style={{ padding: '16px', color: '#e5c158' }}>Option 2-b (Clean Sans)</th>
                  <th style={{ padding: '16px', color: '#34d399' }}>Option 2-c (Seamless Box) ★</th>
                </tr>
              </thead>
              <tbody style={{ color: '#e2e8f0' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Header-Ästhetik & Balance-Integration
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Mäßig</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>Gut (Geführt)</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Perfekt (Single-Box Seamless)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Sehkomfort & Typografie
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Redundant ($ doppelt)</td>
                  <td style={{ padding: '16px', color: '#e5c158' }}>Sauber</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Maximaler VIP Komfort
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Harmonie mit 7.1 &lt;BetModeTabs /&gt;
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>100% Identisch</td>
                  <td style={{ padding: '16px', color: '#e5c158' }}>100% Identisch</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    100% Identisch
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Empfohlener Einsatzbereich
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Veraltet</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>Standard</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Haupt-Standard für alle Spiele
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: CODE EXPORT */}
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
              <Code2 size={22} style={{ color: '#d4af37' }} />
              4. Produktions-Code Export
            </h2>
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
                onClick={() => setActiveCodeTab('opt2c')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeCodeTab === 'opt2c' ? '#0a0e17' : 'transparent',
                  color: activeCodeTab === 'opt2c' ? '#34d399' : '#94a3b8',
                  borderTop:
                    activeCodeTab === 'opt2c' ? '2px solid #34d399' : '2px solid transparent',
                }}
              >
                Option 2-c (Seamless Single Box - Empfohlen) ★
              </button>
              <button
                onClick={() => setActiveCodeTab('opt2b')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeCodeTab === 'opt2b' ? '#0a0e17' : 'transparent',
                  color: activeCodeTab === 'opt2b' ? '#e5c158' : '#94a3b8',
                  borderTop:
                    activeCodeTab === 'opt2b' ? '2px solid #e5c158' : '2px solid transparent',
                }}
              >
                Option 2-b (Clean Sans Header)
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
                  {activeCodeTab === 'opt2c'
                    ? `'use client';
import React from 'react';
import { Wallet, X } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface BetInputGroupSeamlessProps {
  value: number;
  onChange: (value: number) => void;
  balance: number;
  minBet?: number;
  maxBet?: number;
  disabled?: boolean;
}

export function BetInputGroupSeamless({
  value, onChange, balance, minBet = 0.1, maxBet = 1000, disabled
}: BetInputGroupSeamlessProps) {
  const round2 = (val: number) => Math.round(val * 100) / 100;

  const updateVal = (newVal: number) => {
    if (disabled) return;
    const clamped = Math.min(maxBet, Math.max(minBet, round2(newVal)));
    soundManager.play('chip');
    onChange(clamped);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Seamless Integrated Single Box Input */}
      <div style={{
        background: '#0b0f18', border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '14px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {/* Integrated Header Row Inside Container */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#e5c158', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WETTEINSATZ
          </span>

          <button onClick={() => updateVal(balance)} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
            <Wallet size={12} style={{ color: '#34d399' }} />
            <span>Guthaben:</span>
            <strong style={{ color: '#34d399' }}>\\\${balance.toFixed(2)}</strong>
          </button>
        </div>

        {/* Input Row Inside Container */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#e5c158', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.2rem', marginRight: '6px' }}>$</span>
          <input
            type="number"
            value={value}
            disabled={disabled}
            onChange={(e) => updateVal(parseFloat(e.target.value) || 0)}
            style={{
              flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: '#ffffff',
              fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.2rem', padding: '2px 0', outline: 'none'
            }}
          />
          {value > 0 && (
            <button onClick={() => updateVal(10)} disabled={disabled} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '22px', height: '22px', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Preset Bar Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        <button onClick={() => updateVal(minBet)} disabled={disabled} style={{ padding: '8px 0', background: '#131a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>MIN</button>
        <button onClick={() => updateVal(value / 2)} disabled={disabled} style={{ padding: '8px 0', background: '#131a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>½</button>
        <button onClick={() => updateVal(value * 2)} disabled={disabled} style={{ padding: '8px 0', background: '#131a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>2×</button>
        <button onClick={() => updateVal(balance)} disabled={disabled} style={{ padding: '8px 0', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>MAX</button>
      </div>
    </div>
  );
}`
                    : `'use client';
// Option 2-b Code Contract`}
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
          Casino Royale VIP Design System 2026 · Initiative 7.2 BetInputGroup Header Optimization
        </footer>
      </div>
    </div>
  );
}
