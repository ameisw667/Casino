'use client';

import React, { useState } from 'react';
import BlackjackTable from '@/components/casino/games/blackjack/BlackjackTable';
import type { BlackjackHand } from '@/components/casino/games/blackjack/CardHand';

export default function FE03BlackjackTestingSandbox() {
  const [dealerCards, setDealerCards] = useState<BlackjackHand>({
    cards: [
      { suit: 'spades', value: 'A', numericValue: 11, faceDown: false },
      { suit: 'diamonds', value: 'K', numericValue: 10, faceDown: true },
    ],
    score: 21,
    isBlackjack: true,
    isBust: false,
    isSoft: true,
  });

  const [playerHand, setPlayerHand] = useState<BlackjackHand>({
    cards: [
      { suit: 'hearts', value: '10', numericValue: 10, faceDown: false },
      { suit: 'clubs', value: 'J', numericValue: 10, faceDown: false },
    ],
    score: 20,
    isBlackjack: false,
    isBust: false,
    isSoft: false,
  });

  const [isSplit, setIsSplit] = useState(false);
  const [activeHandIndex, setActiveHandIndex] = useState<0 | 1>(0);

  const playerHand2: BlackjackHand = {
    cards: [
      { suit: 'diamonds', value: '8', numericValue: 8, faceDown: false },
      { suit: 'spades', value: '9', numericValue: 9, faceDown: false },
    ],
    score: 17,
    isBlackjack: false,
    isBust: false,
    isSoft: false,
  };

  const handleToggleHoleCard = () => {
    setDealerCards((prev) => ({
      ...prev,
      cards: prev.cards.map((c, i) => (i === 1 ? { ...c, faceDown: !c.faceDown } : c)),
    }));
  };

  const handleAddCard = () => {
    setPlayerHand((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        { suit: 'diamonds', value: '2', numericValue: 2, faceDown: false },
      ],
      score: prev.score + 2,
    }));
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#FFFFFF',
      }}
    >
      {/* Sandbox Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: '#111111',
          border: '1px solid #262626',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.65rem',
              color: '#D4AF37',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            TESTING SANDBOX · ISOLIERT
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 0' }}>
            FE-03 Blackjack 3D-Karten & Dealer-Visuals
          </h1>
        </div>

        {/* Sandbox Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleToggleHoleCard}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #333333',
              background: '#1F1F1F',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hole-Card Aufdecken
          </button>
          <button
            type="button"
            onClick={() => setIsSplit((prev) => !prev)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #333333',
              background: isSplit ? '#D4AF37' : '#1F1F1F',
              color: isSplit ? '#000000' : '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Split-Modus: {isSplit ? 'Aktiv' : 'Inaktiv'}
          </button>
          <button
            type="button"
            onClick={() => setActiveHandIndex((prev) => (prev === 0 ? 1 : 0))}
            disabled={!isSplit}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #333333',
              background: '#1F1F1F',
              color: isSplit ? '#FFFFFF' : '#666666',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isSplit ? 'pointer' : 'not-allowed',
            }}
          >
            Aktive Hand: Hand {activeHandIndex + 1}
          </button>
          <button
            type="button"
            onClick={handleAddCard}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #333333',
              background: '#1F1F1F',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Karte geben (Hit)
          </button>
        </div>
      </div>

      {/* Blackjack Table Live Preview */}
      <div style={{ width: '100%' }}>
        <BlackjackTable
          dealerHand={dealerCards}
          playerHand={playerHand}
          playerHand2={isSplit ? playerHand2 : undefined}
          activeHandIndex={activeHandIndex}
          betAmount={50}
          payout={0}
        />
      </div>
    </div>
  );
}
