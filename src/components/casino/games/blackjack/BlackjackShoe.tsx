'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BlackjackShoeProps {
  isDealing?: boolean;
  deckCount?: number;
  cardsRemaining?: number;
  variant?: 'burgundy' | 'navy' | 'obsidian';
}

export function BlackjackShoe({
  isDealing = false,
  deckCount = 6,
  cardsRemaining = 248,
  variant = 'burgundy',
}: BlackjackShoeProps) {
  // Percentage of cards remaining for visual deck thickness
  const fillRatio = Math.max(0.15, Math.min(1, cardsRemaining / (deckCount * 52)));
  const deckThickness = Math.round(fillRatio * 38);

  const cardBackBg =
    variant === 'burgundy'
      ? 'radial-gradient(ellipse at 50% 50%, #8A1515 0%, #630D0D 60%, #3D0606 100%)'
      : variant === 'navy'
      ? 'radial-gradient(ellipse at 50% 50%, #132A52 0%, #0C1A33 60%, #060D1A 100%)'
      : 'radial-gradient(ellipse at 50% 50%, #1E1E24 0%, #121216 60%, #08080A 100%)';

  const accentColor = variant === 'burgundy' ? '#E5C158' : variant === 'navy' ? '#D4AF37' : '#C5A059';

  return (
    <div
      style={{
        position: 'relative',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 3D Acrylic Card Shoe Housing */}
      <motion.div
        animate={
          isDealing
            ? {
                x: [0, -3, 1, 0],
                y: [0, 2, -1, 0],
                rotate: [-8, -10, -7, -8],
              }
            : {
                rotate: -8,
              }
        }
        transition={{ duration: 0.28, ease: 'easeOut' }}
        style={{
          width: '94px',
          height: '130px',
          borderRadius: '10px 10px 4px 4px',
          background:
            'linear-gradient(135deg, rgba(28, 28, 32, 0.95) 0%, rgba(12, 12, 15, 0.98) 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow:
            '0 16px 32px rgba(0, 0, 0, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 0 12px rgba(212, 175, 55, 0.15)',
          padding: '8px 6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Smoked Acrylic Glass Sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(115deg, rgba(255, 255, 255, 0.12) 0%, transparent 45%, rgba(212, 175, 55, 0.08) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Shoe Metal Faceplate & Brand Crest */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            paddingBottom: '4px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: '0.55rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#D4AF37',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            VIP SHOE
          </span>
          <span
            style={{
              fontSize: '0.55rem',
              fontWeight: 700,
              color: '#8A8A8A',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            6-DECK
          </span>
        </div>

        {/* Visible Layered Deck Stack (3D Side-profile) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '6px 0',
          }}
        >
          {/* Stack Thickness Representation */}
          <div
            style={{
              width: '74px',
              height: `${deckThickness}px`,
              borderRadius: '6px',
              background: 'repeating-linear-gradient(0deg, #1C1C22 0px, #1C1C22 2px, #0F0F14 2px, #0F0F14 4px)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
            {/* Top Card Back visible in the dispenser with authentic matching vintage back */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                borderRadius: '5px',
                background: cardBackBg,
                border: `1px solid ${accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Subtle inner pattern matching the cards */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `repeating-linear-gradient(45deg, ${accentColor}18 0px, ${accentColor}18 2px, transparent 2px, transparent 6px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `1px solid ${accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.55rem',
                    color: accentColor,
                  }}
                >
                  ♠
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Discharge Roller Slot (Where cards slide out) */}
        <div
          style={{
            height: '12px',
            borderRadius: '3px',
            background: '#0B0D12',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '2px',
              borderRadius: '1px',
              background: '#D4AF37',
              boxShadow: '0 0 6px #D4AF37',
            }}
          />
        </div>
      </motion.div>

      {/* Label under shoe */}
      <span
        style={{
          marginTop: '6px',
          fontSize: '0.62rem',
          fontWeight: 700,
          color: '#8A8A8A',
          letterSpacing: '0.04em',
        }}
      >
        {cardsRemaining} KARTEN
      </span>
    </div>
  );
}
