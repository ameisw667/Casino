'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayingCard, { type Card } from './PlayingCard';

export interface BlackjackHand {
  cards: Card[];
  score: number;
  isBust: boolean;
  isBlackjack: boolean;
  isSoft: boolean;
}

interface CardHandProps {
  hand: BlackjackHand | null;
  label: string;
  isActive?: boolean;
  hideScore?: boolean;
}

export default function CardHand({
  hand,
  label,
  isActive = false,
  hideScore = false,
}: CardHandProps) {
  if (!hand || hand.cards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: '88px',
            height: '124px',
            borderRadius: '12px',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
          }}
        >
          WAITING
        </div>
      </div>
    );
  }

  // Determine score display & badge styling
  let badgeText = `${hand.score}`;
  let badgeBg = 'rgba(30, 41, 59, 0.8)';
  let badgeBorder = 'rgba(255, 255, 255, 0.15)';
  let badgeColor = '#FFF';

  if (hideScore) {
    // Show only first card score
    const firstCardScore = hand.cards[0]?.numericValue ?? 0;
    badgeText = firstCardScore === 11 ? '1 / 11' : `${firstCardScore}`;
    badgeColor = '#cbd5e1';
  } else if (hand.isBlackjack) {
    badgeText = 'BLACKJACK!';
    badgeBg = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
    badgeBorder = '#FFE066';
    badgeColor = '#000';
  } else if (hand.isBust) {
    badgeText = `BUST (${hand.score})`;
    badgeBg = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
    badgeBorder = '#FCA5A5';
    badgeColor = '#FFF';
  } else if (hand.score === 21) {
    badgeText = '21';
    badgeBg = 'linear-gradient(135deg, #059669 0%, #065F46 100%)';
    badgeBorder = '#6EE7B7';
    badgeColor = '#FFF';
  } else if (hand.isSoft && hand.score > 0) {
    badgeText = `SOFT ${hand.score}`;
    badgeBg = 'rgba(37, 99, 235, 0.85)';
    badgeBorder = 'rgba(147, 197, 253, 0.5)';
    badgeColor = '#FFF';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        position: 'relative',
      }}
    >
      {/* Hand Label & Score Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 900,
            letterSpacing: '1px',
            color: isActive ? '#FFD700' : '#94a3b8',
            textTransform: 'uppercase',
            textShadow: isActive ? '0 0 8px rgba(255, 215, 0, 0.6)' : 'none',
          }}
        >
          {label}
        </span>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            color: badgeColor,
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {badgeText}
        </motion.div>
      </div>

      {/* Overlapping Cards Container */}
      <div
        style={{
          position: 'relative',
          height: '124px',
          width: `${88 + (hand.cards.length - 1) * 32}px`,
          minWidth: '88px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence>
          {hand.cards.map((card, index) => (
            <motion.div
              key={`${card.suit}-${card.value}-${index}`}
              initial={{ opacity: 0, y: -40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'absolute',
                left: `${index * 32}px`,
                zIndex: index + 1,
              }}
            >
              <PlayingCard card={card} faceDown={card.faceDown || false} size="md" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
