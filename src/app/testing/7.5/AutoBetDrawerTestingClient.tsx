'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { GameActionButton } from '@/components/casino/controls/GameActionButton';

export interface AutoBetConfig {
  numberOfBets: number;
  onWinIncrease: number;
  onLossIncrease: number;
  stopProfit: number;
  stopLoss: number;
}

export default function AutoBetDrawerTestingClient() {
  const [configOpt1a, setConfigOpt1a] = useState<AutoBetConfig>({
    numberOfBets: 10,
    onWinIncrease: 0,
    onLossIncrease: 100,
    stopProfit: 50,
    stopLoss: 20,
  });

  const [configOpt1, setConfigOpt1] = useState<AutoBetConfig>({
    numberOfBets: 10,
    onWinIncrease: 0,
    onLossIncrease: 100,
    stopProfit: 50,
    stopLoss: 20,
  });

  const [configOpt1b] = useState<AutoBetConfig>({
    numberOfBets: 10,
    onWinIncrease: 0,
    onLossIncrease: 100,
    stopProfit: 50,
    stopLoss: 20,
  });

  const [isAutoRunningOpt1a, setIsAutoRunningOpt1a] = useState(false);
  const [isAutoRunningOpt1, setIsAutoRunningOpt1] = useState(false);
  const [isAutoRunningOpt1b, setIsAutoRunningOpt1b] = useState(false);

  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [previewDevice] = useState<'desktop' | 'mobile'>('desktop');

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

        {/* Hero Header */}
        <header
          style={{
            background: '#0b0f19',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span
              style={{
                padding: '4px 12px',
                background: 'rgba(212, 175, 55, 0.12)',
                color: '#e5c158',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Sparkles size={14} /> Full Functionality Layout Comparison
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Initiative 7.5: &lt;AutoBetDrawer /&gt; Complete Controls Comparison
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '12px 0 0 0' }}>
            Alle 3 Varianten bieten nun den identischen vollen Funktionsumfang (Wettanzahl, Bei
            Gewinn, Bei Verlust, Stop Profit, Stop Loss).
          </p>
        </header>

        {/* SECTION 2: DREI REFINED OPTIONS WITH FULL CONTROLS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            <Flame size={22} style={{ color: '#d4af37' }} /> Drei Layout-Varianten mit vollem
            Menü-Funktionsumfang
          </h2>

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
            {/* OPTION 1-A: OBSIDIAN GOLD VIP MUTED DRAWER (NEU & EMPFOHLEN ★) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  color: '#e5c158',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                ★ EMPFOHLEN: Option 1-a (Muted VIP Clean Drawer)
              </div>
              <div
                style={{
                  background: '#090d15',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
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
                      textTransform: 'uppercase',
                    }}
                  >
                    AUTO-WETT KONFIGURATION
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: '#121826',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: '#94a3b8',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                    }}
                  >
                    {isAutoRunningOpt1a ? 'RUNNING' : 'STANDBY'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                  >
                    ANZAHL DER WETTEN
                  </label>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}
                  >
                    {[
                      { label: '∞', val: 0 },
                      { label: '10', val: 10 },
                      { label: '50', val: 50 },
                      { label: '100', val: 100 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => setConfigOpt1a({ ...configOpt1a, numberOfBets: preset.val })}
                        style={{
                          padding: '8px 0',
                          background:
                            configOpt1a.numberOfBets === preset.val
                              ? 'rgba(212, 175, 55, 0.18)'
                              : '#0b0f18',
                          border:
                            configOpt1a.numberOfBets === preset.val
                              ? '1px solid rgba(212, 175, 55, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          color: configOpt1a.numberOfBets === preset.val ? '#e5c158' : '#cbd5e1',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label === '∞' ? (
                          <InfinityIcon size={14} style={{ margin: '0 auto' }} />
                        ) : (
                          preset.label
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      BEI GEWINN (+%)
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#0b0f18',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <input
                        type="number"
                        value={configOpt1a.onWinIncrease}
                        onChange={(e) =>
                          setConfigOpt1a({
                            ...configOpt1a,
                            onWinIncrease: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      BEI VERLUST (+%)
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#0b0f18',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <input
                        type="number"
                        value={configOpt1a.onLossIncrease}
                        onChange={(e) =>
                          setConfigOpt1a({
                            ...configOpt1a,
                            onLossIncrease: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      STOP-GEWINN ($)
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#0b0f18',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <input
                        type="number"
                        value={configOpt1a.stopProfit}
                        onChange={(e) =>
                          setConfigOpt1a({
                            ...configOpt1a,
                            stopProfit: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      STOP-VERLUST ($)
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#0b0f18',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <input
                        type="number"
                        value={configOpt1a.stopLoss}
                        onChange={(e) =>
                          setConfigOpt1a({
                            ...configOpt1a,
                            stopLoss: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <GameActionButton
                  label={isAutoRunningOpt1a ? 'STOP AUTO BET' : 'START AUTO BET'}
                  onClick={() => setIsAutoRunningOpt1a(!isAutoRunningOpt1a)}
                />
              </div>
            </div>

            {/* OPTION 1: COLORED BADGES WITH FULL CONTROLS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  background: '#121826',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                Option 1: Baseline (Farbelemente & Volle Werte)
              </div>
              <div
                style={{
                  background: '#090d15',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '20px',
                  padding: '20px',
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
                      color: '#e5c158',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    AUTO-WETT KONFIGURATION
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                    }}
                  >
                    STANDBY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                  >
                    ANZAHL DER WETTEN
                  </label>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}
                  >
                    {[
                      { label: '∞', val: 0 },
                      { label: '10', val: 10 },
                      { label: '50', val: 50 },
                      { label: '100', val: 100 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => setConfigOpt1({ ...configOpt1, numberOfBets: preset.val })}
                        style={{
                          padding: '8px 0',
                          background:
                            configOpt1.numberOfBets === preset.val
                              ? 'rgba(212, 175, 55, 0.2)'
                              : '#0b0f18',
                          border:
                            configOpt1.numberOfBets === preset.val
                              ? '1px solid rgba(212, 175, 55, 0.6)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          color: configOpt1.numberOfBets === preset.val ? '#e5c158' : '#cbd5e1',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label === '∞' ? (
                          <InfinityIcon size={14} style={{ margin: '0 auto' }} />
                        ) : (
                          preset.label
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: '#34d399',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      BEI GEWINN (+%)
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#0b0f18',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <input
                        type="number"
                        value={configOpt1.onWinIncrease}
                        onChange={(e) =>
                          setConfigOpt1({
                            ...configOpt1,
                            onWinIncrease: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: '#f87171',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      BEI VERLUST (+%)
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        background: '#0b0f18',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <input
                        type="number"
                        value={configOpt1.onLossIncrease}
                        onChange={(e) =>
                          setConfigOpt1({
                            ...configOpt1,
                            onLossIncrease: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <GameActionButton
                  label={isAutoRunningOpt1 ? 'STOP AUTO BET' : 'START AUTO BET'}
                  onClick={() => setIsAutoRunningOpt1(!isAutoRunningOpt1)}
                />
              </div>
            </div>

            {/* OPTION 1-B: COMPACT FULL CONTROLS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  background: '#121826',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                Option 1-b: Compact (Volle Menüwerte)
              </div>
              <div
                style={{
                  background: '#090d15',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    COMPACT AUTO MODE
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#e5c158',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {configOpt1b.numberOfBets} BETS
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div
                    style={{
                      padding: '8px',
                      background: '#0b0f18',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      color: '#cbd5e1',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    WIN: +{configOpt1b.onWinIncrease}%
                  </div>
                  <div
                    style={{
                      padding: '8px',
                      background: '#0b0f18',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      color: '#cbd5e1',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    LOSS: +{configOpt1b.onLossIncrease}%
                  </div>
                </div>

                <GameActionButton
                  label={isAutoRunningOpt1b ? 'STOP AUTO BET' : 'START AUTO BET'}
                  onClick={() => setIsAutoRunningOpt1b(!isAutoRunningOpt1b)}
                />
              </div>
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
          }}
        >
          Casino Royale VIP Design System 2026 · Initiative 7.5 AutoBetDrawer Refinement
        </footer>
      </div>
    </div>
  );
}
