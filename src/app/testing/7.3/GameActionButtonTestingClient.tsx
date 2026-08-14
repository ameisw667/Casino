'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Play,
  Info,
} from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export default function GameActionButtonTestingClient() {
  const betAmount = 10.0;

  // Interactive Simulation States
  const [opt1bLoading, setOpt1bLoading] = useState(false);
  const [opt1b1Loading, setOpt1b1Loading] = useState(false);
  const [opt1b2Loading, setOpt1b2Loading] = useState(false);

  // Sound State
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Viewport Device Toggle State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Copy Code Feedback State
  const [activeCodeTab, setActiveCodeTab] = useState<'opt1b' | 'opt1b1' | 'opt1b2'>('opt1b1');

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
                <Sparkles size={14} /> Phase 1 · Initiative 7.3 (&lt;GameActionButton /&gt; High
                Contrast)
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
                URL: http://localhost:3015/testing/7.3
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
              🟢 Maximierter High-Contrast VIP-Look
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
            <Play size={34} style={{ color: '#d4af37' }} />
            Initiative 7.3: GameActionButton High-Contrast Precision
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
            Maximierung der Kontrastwerte für den primären CTA-Button. Vergleich von{' '}
            <strong style={{ color: '#94a3b8' }}>Option 1-b (Baseline)</strong> mit der neuen{' '}
            <strong style={{ color: '#e5c158' }}>Option 1-b1 (High-Contrast Solid Gold)</strong> und{' '}
            <strong style={{ color: '#fef08a' }}>Option 1-b2 (Inverted Metallic VIP)</strong>.
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
                07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md (§7.3)
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
              1. Status Quo — Ist-Zustand im Bestand (Crash vs. Dice vs. Slots)
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Bestehende Primary Buttons weisen abweichende Höhen (`48px` vs `56px`), uneinheitliche
              Schriftgrößen und fehlendes Sound-Feedback auf.
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
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '20px',
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
                <span>Game: /games/crash</span>
                <span
                  style={{
                    padding: '2px 8px',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    borderRadius: '4px',
                  }}
                >
                  Height: 48px
                </span>
              </div>
              <button
                style={{
                  height: '48px',
                  background: '#eab308',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                BET (BET IN PROGRESS)
              </button>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#fb7185',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                ⚠️ Mängel: Geringe Touch-Höhe (48px), kein Sound-Feedback beim Wetten.
              </div>
            </div>

            {/* Dice Status Quo */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '20px',
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
                <span>Game: /games/dice</span>
                <span
                  style={{
                    padding: '2px 8px',
                    background: '#0b0e14',
                    color: '#cbd5e1',
                    borderRadius: '4px',
                    border: '1px solid #1a2234',
                  }}
                >
                  Height: 52px
                </span>
              </div>
              <button
                style={{
                  height: '52px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d4af37 100%)',
                  color: '#000',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                ROLL DICE ($10.00)
              </button>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#fb7185',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                ⚠️ Mängel: Keine Framer Motion Spring-Animation beim Klicken.
              </div>
            </div>

            {/* Slots Status Quo */}
            <div
              style={{
                background: '#0b0e14',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '20px',
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
                <span>Game: /games/slots</span>
                <span
                  style={{
                    padding: '2px 8px',
                    background: '#0b0e14',
                    color: '#cbd5e1',
                    borderRadius: '4px',
                    border: '1px solid #1a2234',
                  }}
                >
                  Height: 56px
                </span>
              </div>
              <button
                style={{
                  height: '56px',
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: 900,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                SPIN SLOTS
              </button>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#fb7185',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                ⚠️ Mängel: Grüne Farbabweichung entspricht nicht dem Obsidian/Gold System.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HIGH CONTRAST VARIANTS (1-B VS 1-B1 VS 1-B2) */}
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
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Option 1-b: Baseline Muted Gold
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Bisherige Variante mit transparenter Randkontur.
                  </p>
                </div>

                {/* Live Demo Option 1-b */}
                <div
                  style={{
                    padding: '20px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
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
                    <span>PROTOTYP 1-B:</span>
                    <span>56px Height</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: opt1bLoading ? 1 : 1.02 }}
                    whileTap={{ scale: opt1bLoading ? 1 : 0.96 }}
                    onClick={handleSimulateOpt1b}
                    disabled={opt1bLoading}
                    style={{
                      height: '56px',
                      width: '100%',
                      background: opt1bLoading
                        ? 'rgba(212, 175, 55, 0.15)'
                        : 'rgba(212, 175, 55, 0.18)',
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '14px',
                      color: '#e5c158',
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: opt1bLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {opt1bLoading ? 'Processing...' : `PLACE BET ($${betAmount.toFixed(2)})`}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* OPTION 1-B1: HIGH-CONTRAST SOLID GOLD (NEU & EMPFOHLEN ★) */}
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
                ★ EMPFOHLEN: Option 1-b1 (High Contrast Solid)
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
                    Option 1-b1: High-Contrast Solid Gold CTA
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Satter Obsidian-Dark Untergrund (`#141108`) mit 1.5px Champagne Gold Rahmen
                    (`#e5c158`) und strahlendem Gold-Text (`#fef08a`).
                  </p>
                </div>

                {/* Live Demo Option 1-b1 */}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span>PROTOTYP 1-B1 (HIGH CONTRAST):</span>
                    <span style={{ color: '#fef08a', fontWeight: 700 }}>WCAG AAA (14:1)</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: opt1b1Loading ? 1 : 1.02 }}
                    whileTap={{ scale: opt1b1Loading ? 1 : 0.96 }}
                    onClick={handleSimulateOpt1b1}
                    disabled={opt1b1Loading}
                    style={{
                      height: '56px',
                      width: '100%',
                      background: opt1b1Loading ? '#18140c' : '#141108',
                      border: '1.5px solid #e5c158',
                      borderRadius: '14px',
                      color: '#fef08a',
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: opt1b1Loading ? 'not-allowed' : 'pointer',
                      boxShadow: opt1b1Loading ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.6)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {opt1b1Loading ? 'Processing...' : `PLACE BET ($${betAmount.toFixed(2)})`}
                  </motion.button>
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
                  <div style={{ fontWeight: 800, color: '#fef08a' }}>
                    Highlights Option 1-b1 (Empfohlen):
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Hervorragender Kontrast ohne blasse Transparenzen</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Absolut meilenweit entfernt von billigem Standard-Look</span>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION 1-B2: METALLIC INVERTED VIP CTA */}
            <div
              style={{
                background: '#090d15',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px 0',
                    }}
                  >
                    <Flame size={18} style={{ color: '#34d399' }} />
                    Option 1-b2: Metallic Inverted VIP CTA
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Invertiertes Design: Volldeckende Champagne Gold Oberfläche (`#e5c158`) mit
                    tiefdunklem Obsidian-Text (`#07090e`).
                  </p>
                </div>

                {/* Live Demo Option 1-b2 */}
                <div
                  style={{
                    padding: '20px',
                    background: '#06080e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
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
                    <span>PROTOTYP 1-B2 (INVERTED):</span>
                    <span>56px Height</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: opt1b2Loading ? 1 : 1.02 }}
                    whileTap={{ scale: opt1b2Loading ? 1 : 0.96 }}
                    onClick={handleSimulateOpt1b2}
                    disabled={opt1b2Loading}
                    style={{
                      height: '56px',
                      width: '100%',
                      background: opt1b2Loading ? '#ca9d28' : '#e5c158',
                      border: '1px solid #fef08a',
                      borderRadius: '14px',
                      color: '#07090e',
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: opt1b2Loading ? 'not-allowed' : 'pointer',
                      boxShadow: opt1b2Loading ? 'none' : '0 6px 20px rgba(229, 193, 88, 0.3)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {opt1b2Loading ? 'Processing...' : `PLACE BET ($${betAmount.toFixed(2)})`}
                  </motion.button>
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
              3. Bewertungsmatrix der High-Contrast Optionen
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
                  <th style={{ padding: '16px', color: '#94a3b8' }}>Option 1-b (Baseline)</th>
                  <th style={{ padding: '16px', color: '#fef08a' }}>
                    Option 1-b1 (High-Contrast Solid) ★
                  </th>
                  <th style={{ padding: '16px', color: '#e5c158' }}>
                    Option 1-b2 (Inverted Metallic)
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: '#e2e8f0' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Harmonie mit 7.1 & 7.2 Standards
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>100% Identisch</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    100% Identisch
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    100% Identisch
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Kontrastverhältnis (Lesbarkeit)
                  </td>
                  <td style={{ padding: '16px', color: '#fb7185' }}>Mäßig</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Maximal (WCAG AAA 14:1)
                  </td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Maximal (Stark Invertiert)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    VIP Ästhetik & Haptik
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Etwas Blass</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Strenge VIP Autorität
                  </td>
                  <td style={{ padding: '16px', color: '#e5c158' }}>Sehr Präsent</td>
                </tr>
                <tr>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Empfohlener Einsatzbereich
                  </td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>Veraltet</td>
                  <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                    Haupt-CTA für alle Casino-Spiele
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>
                    Alternative für Inverted Trigger
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
                onClick={() => setActiveCodeTab('opt1b1')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeCodeTab === 'opt1b1' ? '#0a0e17' : 'transparent',
                  color: activeCodeTab === 'opt1b1' ? '#fef08a' : '#94a3b8',
                  borderTop:
                    activeCodeTab === 'opt1b1' ? '2px solid #fef08a' : '2px solid transparent',
                }}
              >
                Option 1-b1 (High-Contrast Solid - Empfohlen) ★
              </button>
              <button
                onClick={() => setActiveCodeTab('opt1b2')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeCodeTab === 'opt1b2' ? '#0a0e17' : 'transparent',
                  color: activeCodeTab === 'opt1b2' ? '#e5c158' : '#94a3b8',
                  borderTop:
                    activeCodeTab === 'opt1b2' ? '2px solid #e5c158' : '2px solid transparent',
                }}
              >
                Option 1-b2 (Inverted Metallic)
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
                  {activeCodeTab === 'opt1b1'
                    ? `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '@/lib/casino/sound-manager';

interface GameActionButtonSolidProps {
  label: string;
  betAmount?: number;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function GameActionButtonSolid({ label, betAmount, loading, disabled, onClick }: GameActionButtonSolidProps) {
  const handleClick = () => {
    if (disabled || loading) return;
    soundManager.play('bet');
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        height: '56px',
        width: '100%',
        background: loading ? '#18140c' : '#141108',
        border: '1.5px solid #e5c158',
        borderRadius: '14px',
        color: '#fef08a',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '1.05rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 4px 20px rgba(229, 193, 88, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {loading ? 'Processing...' : betAmount ? \`\${label} (\\\$\${betAmount.toFixed(2)})\` : label}
    </motion.button>
  );
}`
                    : `// Option 1-b2 Code Contract`}
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
          Casino Royale VIP Design System 2026 · Initiative 7.3 GameActionButton High-Contrast
          Precision
        </footer>
      </div>
    </div>
  );
}
