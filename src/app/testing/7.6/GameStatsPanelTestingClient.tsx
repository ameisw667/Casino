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
  Zap,
  Info,
  BarChart3,
} from 'lucide-react';
import { GameStatsPanel } from '@/components/casino/controls/GameStatsPanel';
import { soundManager } from '@/lib/casino/sound-manager';

export default function GameStatsPanelTestingClient() {
  const [totalWagered, setTotalWagered] = useState<number>(450.0);
  const [netProfit, setNetProfit] = useState<number>(124.5);
  const [betsCount, setBetsCount] = useState<number>(32);
  const [winRate, setWinRate] = useState<number>(58);

  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleSimulateBetWin = () => {
    setTotalWagered((prev) => prev + 10);
    setNetProfit((prev) => prev + 19.8);
    setBetsCount((prev) => prev + 1);
    if (!isSoundMuted) soundManager.play('win');
  };

  const handleSimulateBetLoss = () => {
    setTotalWagered((prev) => prev + 10);
    setNetProfit((prev) => prev - 10);
    setBetsCount((prev) => prev + 1);
    if (!isSoundMuted) soundManager.play('click');
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
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              🟡 In Evaluierung (3 Optionen bereit)
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Initiative 7.6: &lt;GameStatsPanel /&gt; 3 Design Optionen
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '12px 0 0 0' }}>
            Drei verschiedene Ansätze für die Session-Statistiken:{' '}
            <strong style={{ color: '#e5c158' }}>Option 1 (Obsidian Gold VIP)</strong>,{' '}
            <strong style={{ color: '#f59e0b' }}>Option 2 (Tactical Matrix)</strong> und{' '}
            <strong style={{ color: '#cbd5e1' }}>Option 3 (VIP Stealth Inline)</strong>.
          </p>
        </header>

        {/* Simulation Triggers */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleSimulateBetWin}
            style={{
              padding: '10px 20px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '10px',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            + Simulation Gewinn ($19.80)
          </button>
          <button
            onClick={handleSimulateBetLoss}
            style={{
              padding: '10px 20px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '10px',
              color: '#f87171',
              fontWeight: 800,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            - Simulation Verlust ($10.00)
          </button>
        </div>

        {/* SECTION 2: DREI NEXT-GEN EMPFEHLUNGEN */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            <Sparkles size={22} style={{ color: '#d4af37' }} /> Drei 2026 Next-Gen Optionen für
            GameStatsPanel
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
            {/* OPTION 1: OBSIDIAN GOLD CONSOLIDATED (BASIERT AUF BRAND SHOWCASE ★) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#e5c158',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                ★ OPTION 1: Obsidian Gold Consolidated (Brand System)
              </div>
              <GameStatsPanel
                totalWagered={totalWagered}
                netProfit={netProfit}
                betsCount={betsCount}
                winRate={winRate}
              />
            </div>

            {/* OPTION 2: CYBERPUNK TACTICAL METRIC MATRIX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  background: '#f59e0b',
                  color: '#05070b',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                OPTION 2: Cyberpunk Tactical Metric Matrix
              </div>
              <div
                style={{
                  background: '#0d111a',
                  border: '2px solid #f59e0b',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#f59e0b',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span>[ MATRIX STATS ]</span>
                  <span>WIN: {winRate}%</span>
                </div>
                <div
                  style={{
                    padding: '10px',
                    background: '#1e293b',
                    borderRadius: '8px',
                    color: netProfit >= 0 ? '#f59e0b' : '#f87171',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                  }}
                >
                  PROFIT: {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* OPTION 3: VIP STEALTH MINIMALIST STAT BAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  background: '#334155',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                OPTION 3: VIP Stealth Minimalist Stat Bar
              </div>
              <div
                style={{
                  background: '#121620',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                }}
              >
                <span>
                  PROFIT:{' '}
                  <strong style={{ color: netProfit >= 0 ? '#34d399' : '#f87171' }}>
                    {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
                  </strong>
                </span>
                <span>
                  WAGERED: <strong>${totalWagered.toFixed(2)}</strong>
                </span>
                <span>
                  BETS: <strong>{betsCount}</strong>
                </span>
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
          Casino Royale VIP Design System 2026 · Initiative 7.6 GameStatsPanel
        </footer>
      </div>
    </div>
  );
}
