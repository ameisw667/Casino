'use client';

import React from 'react';
import { KineticTextReveal } from '@/components/casino/typography/KineticTextReveal';
import { BlackjackLiquidBackdrop } from './BlackjackLiquidBackdrop';

export type FeltTheme = 'emerald' | 'obsidian' | 'burgundy';

interface ClassicCasinoTableFeltProps {
  theme?: FeltTheme;
  children: React.ReactNode;
  shoeNode?: React.ReactNode;
}

export function ClassicCasinoTableFelt({
  theme = 'emerald',
  children,
  shoeNode,
}: ClassicCasinoTableFeltProps) {
  // Theme-specific color gradients and text accents
  const feltStyles = {
    emerald: {
      // Klassisches Monte-Carlo Smaragdgrün
      bg: 'radial-gradient(ellipse at 50% 25%, #0F3826 0%, #0A291B 50%, #05180F 100%)',
      lightCone:
        'radial-gradient(circle at 50% 20%, rgba(255, 240, 180, 0.14) 0%, rgba(15, 56, 38, 0.05) 55%, transparent 80%)',
      feltBorder: '2px solid rgba(212, 175, 55, 0.55)',
      leatherRail: '#14120E',
      railBorder: '#2E2214',
      arcStroke: 'rgba(212, 175, 55, 0.35)',
      textGold: '#E5C158',
      textMuted: 'rgba(229, 193, 88, 0.6)',
      glow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(15, 56, 38, 0.3)',
    },
    obsidian: {
      // Edler purer Obsidian-Samt (Null Blaustich, tiefschwarz)
      bg: 'radial-gradient(ellipse at 50% 25%, #16181D 0%, #0F1014 50%, #08080A 100%)',
      lightCone: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
      feltBorder: '2px solid rgba(212, 175, 55, 0.5)',
      leatherRail: '#111111',
      railBorder: '#262626',
      arcStroke: 'rgba(212, 175, 55, 0.3)',
      textGold: '#D4AF37',
      textMuted: 'rgba(212, 175, 55, 0.55)',
      glow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 70px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.12)',
    },
    burgundy: {
      // Baden-Baden / Historisches Karminrot
      bg: 'radial-gradient(ellipse at 50% 25%, #3D0D14 0%, #29080D 50%, #170407 100%)',
      lightCone:
        'radial-gradient(circle at 50% 20%, rgba(255, 235, 190, 0.13) 0%, transparent 70%)',
      feltBorder: '2px solid rgba(212, 175, 55, 0.5)',
      leatherRail: '#170E0F',
      railBorder: '#30181A',
      arcStroke: 'rgba(212, 175, 55, 0.35)',
      textGold: '#E5C158',
      textMuted: 'rgba(229, 193, 88, 0.6)',
      glow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(61, 13, 20, 0.3)',
    },
  }[theme];

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        borderRadius: '28px',
        background: feltStyles.leatherRail,
        border: `3px solid ${feltStyles.railBorder}`,
        boxShadow:
          '0 30px 70px rgba(0, 0, 0, 0.98), inset 0 3px 6px rgba(255, 255, 255, 0.08), inset 0 -4px 8px rgba(0, 0, 0, 0.8)',
        padding: '12px', // Padded Leather Rail Rim
        boxSizing: 'border-box',
      }}
    >
      {/* Der eigentliche Tischfilz (Horseshoe Arch Layout) */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          borderRadius: '20px',
          background: feltStyles.bg,
          border: feltStyles.feltBorder,
          boxShadow: feltStyles.glow,
          minHeight: '520px',
          padding: '24px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* 0. WebGL Liquid Ambient Backdrop (Monte Carlo Fluid Velvet & Gold Veins) */}
        <BlackjackLiquidBackdrop theme={theme} opacity={0.5} />

        {/* 1. Feine gewebte Woll-Textur des Casino-Filzes */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.006) 0px, rgba(255, 255, 255, 0.006) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.03) 0px, rgba(0, 0, 0, 0.03) 2px, transparent 2px, transparent 4px)',
            pointerEvents: 'none',
          }}
        />

        {/* 2. Authentischer warmer Deckenlampen-Lichtkegel (Warm Brass Lamp Focus) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: feltStyles.lightCone,
            pointerEvents: 'none',
          }}
        />

        {/* 3. Klassischer gedruckter Casino-Filzbogen (Echter Blackjack-Halbkreisbogen) */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 520"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {/* Äußerer Versicherungslinien-Bogen */}
          <path
            d="M 120 180 Q 500 370 880 180"
            fill="none"
            stroke={feltStyles.arcStroke}
            strokeWidth="1.8"
            strokeDasharray="4 2"
          />
          {/* Innerer Doppel-Bogen */}
          <path
            d="M 170 195 Q 500 350 830 195"
            fill="none"
            stroke={feltStyles.arcStroke}
            strokeWidth="1.2"
          />

          {/* Textdruck entlang des Bogens (Klassisches Monte-Carlo Layout) */}
          <path id="insurance-curve" d="M 230 225 Q 500 345 770 225" fill="none" />
          <text fill={feltStyles.textMuted} fontSize="12" fontWeight="700" letterSpacing="4">
            <textPath href="#insurance-curve" startOffset="50%" textAnchor="middle">
              INSURANCE PAYS 2 TO 1
            </textPath>
          </text>
        </svg>

        {/* 4. Kopfbereich: Gedruckte Tischregeln & Kartenschlitten */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Linker Ausgleichsbereich */}
          <div style={{ flex: 1 }} />

          {/* Mittiger, gedruckter Tisch-Schriftzug (Kinetic Gold Leaf Filz-Druck) */}
          <div
            style={{
              textAlign: 'center',
              userSelect: 'none',
              padding: '0 12px',
            }}
          >
            <KineticTextReveal
              text="BLACKJACK PAYS 3 TO 2"
              subtitle="DEALER MUST STAND ON 17 AND DRAW TO 16"
              variant="verdict"
              colorScheme="gold"
              skewAngle={14}
              fontSize="0.92rem"
              fontFamily="serif, var(--font-mono, monospace)"
              letterSpacing="3px"
            />
          </div>

          {/* Rechter Bereich: 3D-Kartenschlitten (Shoe) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{shoeNode}</div>
        </div>

        {/* 5. Tisch-Inhalt (Dealer-Hand & Spieler-Hände) */}
        <div
          style={{
            width: '100%',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
