'use client';

import React from 'react';

interface HeroMultiplierEditorialProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  multiplierRef?: React.RefObject<HTMLSpanElement | null>;
  cashoutRef?: React.RefObject<HTMLSpanElement | null>;
  rtpRef?: React.RefObject<HTMLSpanElement | null>;
}

/**
 * HeroMultiplierEditorial: 3D-Highroller-Multiplikator-Stelen (Awwwards-Editorial Style).
 * Füllt das linke Vakuum bei 30%–75% Scroll synchron zum Portal-Roll.
 * Drei transluzente Obsidian-Gold-Stelen mit Glassmorphism und Tabular-Nums:
 * 1. 500x MAX MULTIPLIER
 * 2. 0.00s INSTANT CASHOUT
 * 3. 99.4% PROVABLY FAIR EDGE
 */
export function HeroMultiplierEditorial({
  containerRef,
  multiplierRef,
  cashoutRef,
  rtpRef,
}: HeroMultiplierEditorialProps) {
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '24px',
        transform: 'translateY(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '560px',
        pointerEvents: 'none',
        opacity: 0, // Governed by GSAP
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Chapter Micro-Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: '9999px',
          background: 'rgba(11, 14, 20, 0.88)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)',
          backdropFilter: 'blur(16px)',
          width: 'fit-content',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#00E701',
            boxShadow: '0 0 10px #00E701',
          }}
        />
        <span
          style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 900,
            letterSpacing: '0.14em',
            color: '#F8E7A2',
            textTransform: 'uppercase',
          }}
        >
          CHAPTER 01 · VIP HIGH-ROLLER LEVERAGE
        </span>
      </div>

      {/* Stele 1: Monumental 500x Peak Multiplier */}
      <div
        style={{
          position: 'relative',
          padding: '24px 28px',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(20, 24, 33, 0.88) 0%, rgba(11, 14, 20, 0.94) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(212, 175, 55, 0.15)',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(3.8rem, 6.5vw, 5.6rem)',
            fontFamily: 'Georgia, "Playfair Display", serif',
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5D77F 45%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
          }}
        >
          <span ref={multiplierRef} style={{ fontVariantNumeric: 'tabular-nums' }}>
            500
          </span>
          <span
            style={{
              fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
              color: '#D4AF37',
              WebkitTextFillColor: '#D4AF37',
              fontWeight: 800,
            }}
          >
            ×
          </span>
        </div>

        <div
          style={{
            fontSize: '0.86rem',
            fontWeight: 800,
            letterSpacing: '0.16em',
            color: 'rgba(255, 255, 255, 0.8)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono, monospace)',
            marginTop: '10px',
          }}
        >
          MAX PEAK MULTIPLIER · ZERO MAXIMUM CEILING
        </div>
      </div>

      {/* Stelen 2 & 3: Instant Cashout & Mathematical Edge */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '16px',
        }}
      >
        {/* Stele 2: Lightning Payout */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, rgba(16, 20, 28, 0.88) 0%, rgba(11, 14, 20, 0.94) 100%)',
            border: '1px solid rgba(0, 231, 1, 0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 231, 1, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#00E701',
              textShadow: '0 0 16px rgba(0, 231, 1, 0.45)',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span ref={cashoutRef}>0.00</span>
            <span style={{ fontSize: '1.1rem', marginLeft: '2px' }}>s</span>
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.75)',
              textTransform: 'uppercase',
              marginTop: '6px',
            }}
          >
            Instant Crypto Cashout
          </div>
        </div>

        {/* Stele 3: RTP Mathematical Edge */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, rgba(16, 20, 28, 0.88) 0%, rgba(11, 14, 20, 0.94) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.12)',
          }}
        >
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#F8E7A2',
              textShadow: '0 0 16px rgba(212, 175, 55, 0.45)',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span ref={rtpRef}>99.4</span>
            <span style={{ fontSize: '1.1rem', marginLeft: '2px' }}>%</span>
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.75)',
              textTransform: 'uppercase',
              marginTop: '6px',
            }}
          >
            Provably Fair RTP Edge
          </div>
        </div>
      </div>
    </div>
  );
}
