'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
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
  const [opt1bValue, setOpt1bValue] = useState<number>(50);
  const [opt1b1Value, setOpt1b1Value] = useState<number>(50);
  const [opt1b2Value, setOpt1b2Value] = useState<number>(50);
  const [statusValue, setStatusValue] = useState<number>(50);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport Device Toggle State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

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
        {/* Navigation Bar */}
        <nav
          className="qa-route-nav"
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
                <VolumeX size={16} style={{ color: '#f43f5e' }} />
              ) : (
                <Volume2 size={16} style={{ color: '#10b981' }} />
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
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span
              style={{
                padding: '4px 12px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#e5c158',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                borderRadius: '9999px',
              }}
            >
              <Sparkles size={14} /> Phase 1 · Initiative 7.4 (&lt;VibeSlider /&gt; Colorway
              Refinement)
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
            }}
          >
            <Sliders size={34} style={{ color: '#d4af37' }} />
            Initiative 7.4: VibeSlider Colorway Variations
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
            Vergleich von 3 Farbwelten basierend auf dem Dual-Stat Header Standard (Option 1-b):{' '}
            <strong style={{ color: '#e5c158' }}>Option 1-b1 (Obsidian Gold VIP)</strong>,{' '}
            <strong style={{ color: '#34d399' }}>Option 1-b (Baseline Emerald)</strong> und{' '}
            <strong style={{ color: '#38bdf8' }}>Option 1-b2 (Platinum Ice)</strong>.
          </p>
        </header>

        {/* SECTION 1: STATUS QUO ANALYSE */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <Info size={22} style={{ color: '#94a3b8' }} /> 1. Status Quo — Ist-Zustand im Bestand
          </h2>
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
          </div>
        </section>

        {/* SECTION 2: DREI COLORWAY VARIANTEN (1-B VS 1-B1 VS 1-B2) */}
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
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
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
                  borderBottomLeftRadius: '14px',
                }}
              >
                ★ EMPFOHLEN: Option 1-b1 (Obsidian Gold)
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
                    <Flame size={18} style={{ color: '#e5c158' }} /> Option 1-b1: Obsidian Gold VIP
                    Dual-Stat
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    100% harmonisiert mit dem Champagne Gold Marken-System (`#e5c158`).
                  </p>
                </div>

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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#0b0f18',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
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
                        {opt1b1Value}%
                      </strong>
                    </div>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#0b0f18',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
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
                          color: '#fef08a',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {(98 / opt1b1Value).toFixed(2)}×
                      </strong>
                    </div>
                  </div>

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
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${opt1b1Value}%`,
                          height: '100%',
                          background: '#e5c158',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="98"
                      value={opt1b1Value}
                      onChange={(e) => handleOpt1b1Change(parseInt(e.target.value))}
                      style={{
                        position: 'absolute',
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
                        left: `calc(${opt1b1Value}% - 14px)`,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#141108',
                        border: '2px solid #e5c158',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
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
                        onClick={() => handleOpt1b1Change(pct)}
                        style={{
                          padding: '6px 0',
                          background: opt1b1Value === pct ? 'rgba(212, 175, 55, 0.2)' : '#0b0f18',
                          border:
                            opt1b1Value === pct
                              ? '1px solid rgba(212, 175, 55, 0.6)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          color: opt1b1Value === pct ? '#e5c158' : '#94a3b8',
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

            {/* OPTION 1-B: BASELINE EMERALD DUAL-STAT */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Option 1-b: Baseline Emerald Dual-Stat
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Bisherige Smaragdgrün-Variante (`#34d399`).
                  </p>
                </div>

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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        CHANCE
                      </span>
                      <strong
                        style={{
                          fontSize: '1.1rem',
                          color: '#34d399',
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
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${opt1bValue}%`,
                          height: '100%',
                          background: '#34d399',
                          borderRadius: '9999px',
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
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION 1-B2: PLATINUM ICE DUAL-STAT */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Option 1-b2: Platinum Ice Dual-Stat
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Kühles Platin-Eisblau Colorway (`#38bdf8`).
                  </p>
                </div>

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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#0b0f18',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
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
                          color: '#38bdf8',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {opt1b2Value}%
                      </strong>
                    </div>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#0b0f18',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
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
                          color: '#38bdf8',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {(98 / opt1b2Value).toFixed(2)}×
                      </strong>
                    </div>
                  </div>

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
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${opt1b2Value}%`,
                          height: '100%',
                          background: '#38bdf8',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="98"
                      value={opt1b2Value}
                      onChange={(e) => handleOpt1b2Change(parseInt(e.target.value))}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    />
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
              <ShieldCheck size={22} style={{ color: '#d4af37' }} /> 3. Bewertungsmatrix der
              Colorway Varianten
            </h2>
          </div>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#0b0e14',
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
                    Option 1-b1 (Obsidian Gold) ★
                  </th>
                  <th style={{ padding: '16px', color: '#34d399' }}>
                    Option 1-b (Baseline Emerald)
                  </th>
                  <th style={{ padding: '16px', color: '#38bdf8' }}>Option 1-b2 (Platinum Ice)</th>
                </tr>
              </thead>
              <tbody style={{ color: '#e2e8f0' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Harmonie mit Brand System (7.1–7.3)
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    100% Perfekt (Gold VIP)
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>Mäßig (Grüne Abweichung)</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>Mäßig (Blaue Abweichung)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

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
