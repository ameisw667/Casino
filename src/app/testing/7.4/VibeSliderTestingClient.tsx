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
  ShieldCheck,
  Smartphone,
  Monitor,
  Flame,
  Sliders,
  Info,
} from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export default function VibeSliderTestingClient() {
  // Slider Value States (Integer percents, no useless decimals)
  const [opt1aValue, setOpt1aValue] = useState<number>(50);
  const [opt1bValue, setOpt1bValue] = useState<number>(50);
  const [statusValue, setStatusValue] = useState<number>(50);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport Device Toggle State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Copy Code Feedback State
  const [activeCodeTab, setActiveCodeTab] = useState<'opt1a' | 'opt1b'>('opt1a');

  // Handlers with audio tick
  const handleOpt1aChange = (val: number) => {
    if (val !== opt1aValue && !isSoundMuted && Math.abs(val - opt1aValue) >= 2) {
      soundManager.play('chip');
    }
    setOpt1aValue(val);
  };

  const handleOpt1bChange = (val: number) => {
    if (val !== opt1bValue && !isSoundMuted && Math.abs(val - opt1bValue) >= 2) {
      soundManager.play('chip');
    }
    setOpt1bValue(val);
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
              7.1 ModeTabs
            </Link>
            <Link
              href="/testing/7.2"
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
              7.2 BetInput
            </Link>
            <Link
              href="/testing/7.3"
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
              7.3 ActionBtn
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
                <Sparkles size={14} /> Phase 1 · Initiative 7.4 (&lt;VibeSlider /&gt; Refinement)
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
                URL: http://localhost:3015/testing/7.4
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
              🟢 Prozent-Typografie & Milestone-Refinement
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
            <Sliders size={34} style={{ color: '#d4af37' }} />
            Initiative 7.4: VibeSlider Percentage & Milestone Refinement
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
            Entfernung unnötiger Nachkommastellen (`50%` statt `50.00%`) und prominente Gestaltung
            der Prozentzahlen. Vergleich von{' '}
            <strong style={{ color: '#e5c158' }}>Option 1-a (Floating Precision Badge)</strong> mit{' '}
            <strong style={{ color: '#34d399' }}>Option 1-b (Integrated Dual-Stat Header)</strong>.
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
                07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md (§7.4)
              </strong>
            </div>
            <div>
              Zuständige Agenten:{' '}
              <strong style={{ color: '#e5c158' }}>Design-Guardian & UI-Animator</strong>
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
              <Info size={22} style={{ color: '#94a3b8' }} />
              1. Status Quo — Ist-Zustand im Bestand (Dice Range Slider)
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Bestehende Slider nutzen ungestylte HTML-Range Inputs ohne Haptik, präzisen
              Gold-Füllstand oder Audio-Ticks.
            </p>
          </div>

          <div
            style={{
              background: '#0b0e14',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#94a3b8',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>Game: /games/dice (Range Control)</span>
              <span>Aktueller Wert: {statusValue}%</span>
            </div>

            <input
              type="range"
              min="1"
              max="98"
              value={statusValue}
              onChange={(e) => setStatusValue(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />

            <div
              style={{
                fontSize: '0.75rem',
                color: '#fb7185',
                background: 'rgba(15,23,42,0.6)',
                padding: '10px',
                borderRadius: '8px',
              }}
            >
              ⚠️ Mängel: Browser-Standard Range-Track, kein Sound-Feedback beim Ziehen,
              unvollkommene Prozentanzeige.
            </div>
          </div>
        </section>

        {/* SECTION 2: ZWEI REFINEMENT OPTIONS (1-A VS 1-B) */}
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
              2. Zwei veredelte Prozent-Optionen basierend auf Option 1
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Beseitigung aller `.00` Nachkommastellen und prominente Hervorhebung der
              Prozentmeilensteine (`1%`, `25%`, `50%`, `75%`, `98%`).
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))',
              maxWidth: previewDevice === 'mobile' ? '420px' : '100%',
              margin: previewDevice === 'mobile' ? '0 auto' : '0',
              gap: '32px',
            }}
          >
            {/* OPTION 1-A: FLOATING PRECISION BADGE SLIDER (NEU ★) */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '24px',
                padding: '24px',
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
                  padding: '6px 14px',
                  background:
                    'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.15) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  color: '#e5c158',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottomLeftRadius: '14px',
                }}
              >
                ★ EMPFOHLEN: Option 1-a (Floating Precision Badge)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    <Flame size={18} style={{ color: '#e5c158' }} />
                    Option 1-a: Floating Precision Badge Slider
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Prominentes Champagne Gold Floating Badge direkt über dem Reglerknauf (`50%`).
                    Saubere, stufenweise hervorgehobene Meilenstein-Prozentangaben unten.
                  </p>
                </div>

                {/* Live Demo Option 1-a */}
                <div
                  style={{
                    padding: '28px 20px 20px 20px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {/* Floating Badge Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      GEWINNCHANCE
                    </span>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: '#e5c158',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {opt1aValue}%
                    </span>
                  </div>

                  {/* Custom Track Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {/* Background Track */}
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        background: '#0b0f18',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '9999px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Active Fill Track */}
                      <div
                        style={{
                          width: `${opt1aValue}%`,
                          height: '100%',
                          background: '#e5c158',
                          borderRadius: '9999px',
                          transition: 'width 0.05s ease',
                        }}
                      />
                    </div>

                    {/* Range Input Trigger Overlay */}
                    <input
                      type="range"
                      min="1"
                      max="98"
                      value={opt1aValue}
                      onChange={(e) => handleOpt1aChange(parseInt(e.target.value))}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    />

                    {/* Custom Metallic Thumb Handle */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(${opt1aValue}% - 14px)`,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#141108',
                        border: '2px solid #e5c158',
                        boxShadow: '0 0 14px rgba(229, 193, 88, 0.5)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#e5c158',
                        }}
                      />
                    </div>
                  </div>

                  {/* Prominent Milestone Ticks */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      textAlign: 'center',
                      gap: '4px',
                    }}
                  >
                    {[1, 25, 50, 75, 98].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleOpt1aChange(pct)}
                        style={{
                          padding: '6px 0',
                          background: opt1aValue === pct ? 'rgba(212, 175, 55, 0.18)' : '#0b0f18',
                          border:
                            opt1aValue === pct
                              ? '1px solid rgba(212, 175, 55, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          color: opt1aValue === pct ? '#e5c158' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
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
                    Highlights Option 1-a (Empfohlen):
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Reine Ganzzahlen (`50%`) ohne unnötige Nachkommastellen</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>
                      Interaktive Milestone-Buttons unten für schnelle Wahl (25%, 50%, 75%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION 1-B: INTEGRATED DUAL-STAT HEADER SLIDER */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
                boxShadow:
                  '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    <Flame size={18} style={{ color: '#34d399' }} />
                    Option 1-b: Integrated Dual-Stat Header Slider
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Integrierter Dual-Stat Header: Zeigt zeitgleich **Gewinnchance ({opt1bValue}%)**
                    und errechneten **Multiplier ({(98 / opt1bValue).toFixed(2)}×)** in einer
                    strukturierten VIP-Karte.
                  </p>
                </div>

                {/* Live Demo Option 1-b */}
                <div
                  style={{
                    padding: '20px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Dual Stat Panel Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#0b0f18',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '10px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: '#94a3b8',
                          fontFamily: 'var(--font-mono)',
                          display: 'block',
                        }}
                      >
                        CHANCE
                      </span>
                      <strong
                        style={{
                          fontSize: '1.1rem',
                          color: '#e5c158',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {opt1bValue}%
                      </strong>
                    </div>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#0b0f18',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '10px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: '#94a3b8',
                          fontFamily: 'var(--font-mono)',
                          display: 'block',
                        }}
                      >
                        MULTIPLIER
                      </span>
                      <strong
                        style={{
                          fontSize: '1.1rem',
                          color: '#34d399',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {(98 / opt1bValue).toFixed(2)}×
                      </strong>
                    </div>
                  </div>

                  {/* Custom Track Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        background: '#0b0f18',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '9999px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${opt1bValue}%`,
                          height: '100%',
                          background: '#34d399',
                          borderRadius: '9999px',
                          transition: 'width 0.05s ease',
                        }}
                      />
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="98"
                      value={opt1bValue}
                      onChange={(e) => handleOpt1bChange(parseInt(e.target.value))}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(${opt1bValue}% - 14px)`,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#071610',
                        border: '2px solid #34d399',
                        boxShadow: '0 0 14px rgba(52, 211, 153, 0.5)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#34d399',
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestone Ticks */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      textAlign: 'center',
                      gap: '4px',
                    }}
                  >
                    {[1, 25, 50, 75, 98].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleOpt1bChange(pct)}
                        style={{
                          padding: '6px 0',
                          background: opt1bValue === pct ? 'rgba(16, 185, 129, 0.18)' : '#0b0f18',
                          border:
                            opt1bValue === pct
                              ? '1px solid rgba(16, 185, 129, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          color: opt1bValue === pct ? '#34d399' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
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
              3. Bewertungsmatrix der Prozent-Refinements
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
                  <th style={{ padding: '16px', color: '#e5c158' }}>
                    Option 1-a (Floating Precision Badge) ★
                  </th>
                  <th style={{ padding: '16px', color: '#34d399' }}>
                    Option 1-b (Dual-Stat Header)
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: '#e2e8f0' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Ganzzahl-Darstellung (ohne .00)
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Sauber (z.B. 50%)
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Sauber (z.B. 50%)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Milestone-Button Prominenz
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Sehr Prominent & Interaktiv
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Sehr Prominent & Interaktiv
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Harmonie mit Brand Showcase (7.1–7.3)
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    100% Identisch (Champagne Gold)
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    100% Identisch (Emerald Dual)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Empfohlener Einsatzbereich
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Haupt-Slider für Dice & Gewinnchancen
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>High-Roll Dual Stat Mode</td>
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
                onClick={() => setActiveCodeTab('opt1a')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeCodeTab === 'opt1a' ? '#0a0e17' : 'transparent',
                  color: activeCodeTab === 'opt1a' ? '#e5c158' : '#94a3b8',
                  borderTop:
                    activeCodeTab === 'opt1a' ? '2px solid #e5c158' : '2px solid transparent',
                }}
              >
                Option 1-a (Floating Precision Badge - Empfohlen) ★
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
                  {`'use client';
import React from 'react';
import { soundManager } from '@/lib/casino/sound-manager';

interface VibeSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function VibeSlider({ value, min = 1, max = 98, step = 1, onChange, disabled }: VibeSliderProps) {
  const handleChange = (newVal: number) => {
    if (disabled) return;
    if (Math.abs(newVal - value) >= 2) {
      soundManager.play('chip');
    }
    onChange(newVal);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>GEWINNCHANCE</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#e5c158', fontFamily: 'var(--font-mono)' }}>{value}%</span>
      </div>

      {/* Slider Track */}
      <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', height: '10px', background: '#0b0f18', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ width: \`\${((value - min) / (max - min)) * 100}%\`, height: '100%', background: '#e5c158', borderRadius: '9999px' }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value} disabled={disabled}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
        />
      </div>

      {/* Milestone Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center', gap: '4px' }}>
        {[1, 25, 50, 75, 98].map((pct) => (
          <button key={pct} onClick={() => handleChange(pct)} style={{ padding: '6px 0', background: value === pct ? 'rgba(212, 175, 55, 0.18)' : '#0b0f18', border: value === pct ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', color: value === pct ? '#e5c158' : '#94a3b8', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
            {pct}%
          </button>
        ))}
      </div>
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
          Casino Royale VIP Design System 2026 · Initiative 7.4 VibeSlider Evaluation
        </footer>
      </div>
    </div>
  );
}
