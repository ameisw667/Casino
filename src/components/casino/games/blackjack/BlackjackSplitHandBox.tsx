'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { BlackjackHand } from './CardHand';
import PlayingCard from './PlayingCard';
import { BlackjackCard3D } from './BlackjackCard3D';

interface BlackjackSplitHandBoxProps {
  hand: BlackjackHand | null;
  label: string;
  isActive?: boolean;
  isSplit?: boolean;
  hideScore?: boolean;
  isDealer?: boolean;
  isPeeking?: boolean;
  isMobile?: boolean;
  cardBackVariant?: 'burgundy' | 'navy' | 'obsidian';
}

export function BlackjackSplitHandBox({
  hand,
  label,
  isActive = false,
  isSplit = false,
  hideScore = false,
  isDealer = false,
  isPeeking = false,
  isMobile = false,
  cardBackVariant = 'burgundy',
}: BlackjackSplitHandBoxProps) {
  if (!hand || hand.cards.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: isMobile ? '76px' : '88px',
            height: isMobile ? '108px' : '124px',
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

  // Calculate score display
  let scoreBadgeText = `${hand.score}`;
  let scoreBadgeBg = 'rgba(30, 41, 59, 0.8)';
  let scoreBadgeBorder = 'rgba(255, 255, 255, 0.15)';
  let scoreBadgeColor = '#FFFFFF';

  if (hideScore) {
    const firstScore = hand.cards[0]?.numericValue ?? 0;
    scoreBadgeText = firstScore === 11 ? '1 / 11' : `${firstScore}`;
    scoreBadgeColor = '#cbd5e1';
  } else if (hand.isBlackjack) {
    scoreBadgeText = 'BLACKJACK!';
    scoreBadgeBg = 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)';
    scoreBadgeBorder = '#FFE066';
    scoreBadgeColor = '#000000';
  } else if (hand.isBust) {
    scoreBadgeText = `BUST (${hand.score})`;
    scoreBadgeBg = '#7F1D1D';
    scoreBadgeBorder = '#ef4444';
    scoreBadgeColor = '#FCA5A5';
  } else if (hand.isSoft) {
    scoreBadgeText = `SOFT ${hand.score}`;
    scoreBadgeBg = 'rgba(212, 175, 55, 0.15)';
    scoreBadgeBorder = '#D4AF37';
    scoreBadgeColor = '#D4AF37';
  }

  const isHighlighted = isSplit && isActive;

  return (
    <motion.div
      animate={{
        scale: isHighlighted ? 1.02 : isSplit ? 0.96 : 1,
        opacity: isSplit && !isActive ? 0.6 : 1,
      }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: isSplit ? (isMobile ? '8px' : '14px 18px') : '0',
        borderRadius: '16px',
        background: isHighlighted
          ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 17, 24, 0.6) 100%)'
          : isSplit
            ? 'rgba(15, 17, 24, 0.4)'
            : 'transparent',
        border: isHighlighted
          ? '1.5px solid rgba(212, 175, 55, 0.55)'
          : isSplit
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : 'none',
        boxShadow: isHighlighted
          ? '0 0 25px rgba(212, 175, 55, 0.25), inset 0 0 12px rgba(212, 175, 55, 0.1)'
          : 'none',
        position: 'relative',
      }}
    >
      {/* Header: Label & Score Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: isHighlighted ? '#D4AF37' : '#94a3b8',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>

        {/* Score Chip */}
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            background: scoreBadgeBg,
            color: scoreBadgeColor,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            fontWeight: 800,
            border: `1px solid ${scoreBadgeBorder}`,
          }}
        >
          {scoreBadgeText}
        </span>
      </div>

      {/* Active Hand Indicator Badge */}
      {isHighlighted && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            padding: '2px 10px',
            borderRadius: '10px',
            background: '#D4AF37',
            color: '#000000',
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#000000',
            }}
          />
          AKTIVE HAND
        </div>
      )}

      {/* Overlapping Fan of Cards */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '4px 8px',
        }}
      >
        {hand.cards.map((card, idx) => {
          const isHoleCard = isDealer && idx === 1;
          const showFaceDown = isHoleCard && card.faceDown && !hideScore;

          return (
            <div
              key={`${card.suit}-${card.value}-${idx}`}
              style={{
                marginLeft: idx === 0 ? 0 : isMobile ? '-38px' : '-44px',
                zIndex: idx + 1,
              }}
            >
              {isDealer ? (
                /* Dealer Card: High-End Monte-Carlo Hole Card mit 2-Stufen-Peek & Reveal */
                <BlackjackCard3D
                  card={card}
                  faceDown={showFaceDown}
                  isPeeking={isHoleCard && isPeeking}
                  size={isMobile ? 'sm' : 'md'}
                  variant={cardBackVariant}
                />
              ) : (
                /* Spielerkarten: 100% klassisches, unverändertes Original-Design (von Jan als optimal bestätigt) */
                <PlayingCard card={card} faceDown={false} size={isMobile ? 'sm' : 'md'} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
