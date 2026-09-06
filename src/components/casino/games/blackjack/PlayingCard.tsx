'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface Card {
  suit: 'spades' | 'clubs' | 'hearts' | 'diamonds';
  value: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  numericValue: number;
  faceDown?: boolean;
}

interface PlayingCardProps {
  card: Card | null;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: '♠',
  clubs: '♣',
  hearts: '♥',
  diamonds: '♦',
};

export default function PlayingCard({ card, faceDown = false, size = 'md' }: PlayingCardProps) {
  const isRed = card?.suit === 'hearts' || card?.suit === 'diamonds';
  const suitIcon = card ? SUIT_SYMBOLS[card.suit] : '♠';

  const width = size === 'sm' ? 68 : size === 'lg' ? 104 : 88;
  const height = size === 'sm' ? 96 : size === 'lg' ? 148 : 124;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        perspective: '1000px',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          borderRadius: '12px',
          boxShadow:
            '0 18px 36px -4px rgba(0, 0, 0, 0.85), 0 8px 16px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Front Face (Face Up) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F8FA 60%, #EEEEF2 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.55)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,1), inset 0 -1px 2px rgba(0,0,0,0.12)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: isRed ? '#DC2626' : '#0F172A',
            overflow: 'hidden',
          }}
        >
          {/* Top-Left Corner */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 'fit-content',
            }}
          >
            <span
              style={{
                fontSize: size === 'sm' ? '0.85rem' : '1.1rem',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {card?.value}
            </span>
            <span
              style={{
                fontSize: size === 'sm' ? '0.75rem' : '0.95rem',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              {suitIcon}
            </span>
          </div>

          {/* Center Graphic */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: size === 'sm' ? '1.8rem' : size === 'lg' ? '2.8rem' : '2.4rem',
                lineHeight: 1,
                filter: isRed
                  ? 'drop-shadow(0 2px 4px rgba(220, 38, 38, 0.25))'
                  : 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.25))',
              }}
            >
              {suitIcon}
            </span>
            {card?.value && ['J', 'Q', 'K', 'A'].includes(card.value) && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: isRed ? '#991B1B' : '#334155',
                  marginTop: '2px',
                  fontFamily: 'monospace',
                }}
              >
                {card.value === 'A'
                  ? 'ACE'
                  : card.value === 'K'
                    ? 'KING'
                    : card.value === 'Q'
                      ? 'QUEEN'
                      : 'JACK'}
              </span>
            )}
          </div>

          {/* Bottom-Right Corner (Inverted) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 'fit-content',
              alignSelf: 'flex-end',
              transform: 'rotate(180deg)',
            }}
          >
            <span
              style={{
                fontSize: size === 'sm' ? '0.85rem' : '1.1rem',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {card?.value}
            </span>
            <span
              style={{
                fontSize: size === 'sm' ? '0.75rem' : '0.95rem',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              {suitIcon}
            </span>
          </div>
        </div>

        {/* Back Face (Face Down) - Royal Obsidian & Gold Motif */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '12px',
            background:
              'radial-gradient(ellipse at 50% 50%, #1c1810 0%, #0c0b0f 70%, #050508 100%)',
            border: '2px solid #D4AF37',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.35), inset 0 0 12px rgba(0, 0, 0, 0.8)',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              background: `repeating-linear-gradient(
                45deg,
                rgba(212, 175, 55, 0.08),
                rgba(212, 175, 55, 0.08) 6px,
                transparent 6px,
                transparent 12px
              )`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #FFD700 0%, #B8860B 100%)',
                border: '1.5px solid #FFE066',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1200',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              ♠
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
