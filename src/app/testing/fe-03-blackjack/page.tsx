'use client';

import React, { useState } from 'react';
import BlackjackTable from '@/components/casino/games/blackjack/BlackjackTable';
import { BlackjackShoe } from '@/components/casino/games/blackjack/BlackjackShoe';
import { BlackjackSplitHandBox } from '@/components/casino/games/blackjack/BlackjackSplitHandBox';
import {
  ClassicCasinoTableFelt,
  type FeltTheme,
} from '@/components/casino/games/blackjack/ClassicCasinoTableFelt';
import type { BlackjackHand } from '@/components/casino/games/blackjack/CardHand';
import type { Card } from '@/components/casino/games/blackjack/PlayingCard';

export default function FE03BlackjackTestingSandbox() {
  const [viewMode, setViewMode] = useState<'AFTER' | 'BEFORE'>('AFTER');
  const [isDealing, setIsDealing] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [holeCardFaceDown, setHoleCardFaceDown] = useState(true);
  const [isSplit, setIsSplit] = useState(false);
  const [activeHandIndex, setActiveHandIndex] = useState<0 | 1>(0);

  // Table Felt & Card Back Customization (Emotional & Nostalgic)
  const [feltTheme, setFeltTheme] = useState<FeltTheme>('emerald');
  const [cardBackVariant, setCardBackVariant] = useState<'burgundy' | 'navy' | 'obsidian'>(
    'burgundy',
  );

  // Deck state
  const [cardsRemaining, setCardsRemaining] = useState(244);

  // Hands state
  const [dealerHand, setDealerHand] = useState<BlackjackHand>({
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
      { suit: 'clubs', value: '8', numericValue: 8, faceDown: false },
    ],
    score: 18,
    isBlackjack: false,
    isBust: false,
    isSoft: false,
  });

  const [playerHand2, setPlayerHand2] = useState<BlackjackHand>({
    cards: [
      { suit: 'diamonds', value: '8', numericValue: 8, faceDown: false },
      { suit: 'spades', value: '9', numericValue: 9, faceDown: false },
    ],
    score: 17,
    isBlackjack: false,
    isBust: false,
    isSoft: false,
  });

  // Action: Deal New Fresh Hand
  const handleDealNewHand = () => {
    setIsDealing(true);
    setCardsRemaining((prev) => Math.max(20, prev - 4));
    setHoleCardFaceDown(true);
    setIsPeeking(false);

    setDealerHand({
      cards: [
        { suit: 'spades', value: 'A', numericValue: 11, faceDown: false },
        { suit: 'diamonds', value: 'K', numericValue: 10, faceDown: true },
      ],
      score: 21,
      isBlackjack: true,
      isBust: false,
      isSoft: true,
    });

    setPlayerHand({
      cards: [
        { suit: 'hearts', value: '10', numericValue: 10, faceDown: false },
        { suit: 'clubs', value: '8', numericValue: 8, faceDown: false },
      ],
      score: 18,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
    });

    setTimeout(() => setIsDealing(false), 450);
  };

  // Action: Hit (Deal 1 new card to active player hand)
  const handleHit = () => {
    setIsDealing(true);
    setCardsRemaining((prev) => Math.max(10, prev - 1));

    const sampleCards: Card[] = [
      { suit: 'diamonds', value: '3', numericValue: 3, faceDown: false },
      { suit: 'clubs', value: '2', numericValue: 2, faceDown: false },
      { suit: 'hearts', value: 'A', numericValue: 1, faceDown: false },
      { suit: 'spades', value: '5', numericValue: 5, faceDown: false },
    ];
    const newCard = sampleCards[Math.floor(Math.random() * sampleCards.length)];

    if (!isSplit || activeHandIndex === 0) {
      setPlayerHand((prev) => {
        const nextCards = [...prev.cards, newCard];
        const nextScore = prev.score + newCard.numericValue;
        return {
          ...prev,
          cards: nextCards,
          score: nextScore,
          isBust: nextScore > 21,
        };
      });
    } else {
      setPlayerHand2((prev) => {
        const nextCards = [...prev.cards, newCard];
        const nextScore = prev.score + newCard.numericValue;
        return {
          ...prev,
          cards: nextCards,
          score: nextScore,
          isBust: nextScore > 21,
        };
      });
    }

    setTimeout(() => setIsDealing(false), 400);
  };

  // Action: 2-Stage Dealer Peek & Reveal
  const handlePeekOrReveal = () => {
    if (holeCardFaceDown && !isPeeking) {
      // Step 1: Dealer Peeks under hole card
      setIsPeeking(true);
    } else if (holeCardFaceDown && isPeeking) {
      // Step 2: Dealer Reveals full card
      setIsPeeking(false);
      setHoleCardFaceDown(false);
      setDealerHand((prev) => ({
        ...prev,
        cards: prev.cards.map((c, i) => (i === 1 ? { ...c, faceDown: false } : c)),
      }));
    } else {
      // Reset back to hidden
      setHoleCardFaceDown(true);
      setIsPeeking(false);
      setDealerHand((prev) => ({
        ...prev,
        cards: prev.cards.map((c, i) => (i === 1 ? { ...c, faceDown: true } : c)),
      }));
    }
  };

  return (
    <div
      style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '24px 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#FFFFFF',
      }}
    >
      {/* 1. Header & Live Comparison Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '18px 24px',
          borderRadius: '16px',
          background: '#111111',
          border: '1px solid #222222',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#D4AF37',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              FE-03 SANDBOX · TESTING ENVIRONMENT
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: '#A3A3A3',
                background: '#1F1F1F',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #2A2A2A',
              }}
            >
              Live-Seite unberührt
            </span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 0' }}>
            Blackjack 3D-Karten-Deal, Flip-Physik & Dealer-Visuals
          </h1>
        </div>

        {/* Big Before / After Toggle */}
        <div
          style={{
            display: 'flex',
            background: '#0B0D12',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #262626',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('BEFORE')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'BEFORE' ? '#262626' : 'transparent',
              color: viewMode === 'BEFORE' ? '#FFFFFF' : '#737373',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Vorher (Klassisch)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('AFTER')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'AFTER' ? '#D4AF37' : 'transparent',
              color: viewMode === 'AFTER' ? '#000000' : '#737373',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Nachher (Option 1: 3D Shoe & Physik)
          </button>
        </div>
      </div>

      {/* 2. Interactive Feature Action Bar & Customizer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: '14px',
          background: '#141414',
          border: '1px solid #222222',
        }}
      >
        {/* Row A: Interaction Triggers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#8A8A8A', fontWeight: 700 }}>
              Spielfluss testen:
            </span>

            <button
              type="button"
              onClick={handleDealNewHand}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#1F1F1F',
                border: '1px solid #333333',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>🃏</span>
              <span>Neu Dealen</span>
            </button>

            <button
              type="button"
              onClick={handleHit}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#1F1F1F',
                border: '1px solid #333333',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>+</span>
              <span>Karte geben (Hit)</span>
            </button>

            <button
              type="button"
              onClick={handlePeekOrReveal}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: isPeeking ? 'rgba(212, 175, 55, 0.2)' : '#1F1F1F',
                border: isPeeking ? '1.5px solid #D4AF37' : '1px solid #333333',
                color: isPeeking ? '#D4AF37' : '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>👁️</span>
              <span>
                {holeCardFaceDown
                  ? isPeeking
                    ? 'Stufe 2: Hole-Card aufdecken'
                    : 'Stufe 1: Dealer-Peek (Anheben)'
                  : 'Hole-Card wieder verdecken'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsSplit((prev) => !prev)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: isSplit ? '#2A2616' : '#1F1F1F',
                border: isSplit ? '1px solid #D4AF37' : '1px solid #333333',
                color: isSplit ? '#D4AF37' : '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Split: {isSplit ? 'Aktiv (2 Hände)' : 'Inaktiv'}
            </button>

            {isSplit && (
              <button
                type="button"
                onClick={() => setActiveHandIndex((prev) => (prev === 0 ? 1 : 0))}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: '#D4AF37',
                  border: 'none',
                  color: '#000000',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Fokus wechseln ➔ Hand {activeHandIndex === 0 ? '2' : '1'}
              </button>
            )}
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              color: '#737373',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {viewMode === 'AFTER'
              ? '✓ 100% Original-Spielerkarten • Vintage-Hole-Card • Grand Felt'
              : 'Standard 2D'}
          </div>
        </div>

        {/* Row B: Nostalgie & Atmosphäre-Auswahl (Filzfarbe & Vintage-Kartenrücken) */}
        {viewMode === 'AFTER' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #222222',
            }}
          >
            {/* Felt Theme Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#A3A3A3', fontWeight: 700 }}>
                Tischfilz-Atmosphäre:
              </span>
              <button
                type="button"
                onClick={() => setFeltTheme('emerald')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: feltTheme === 'emerald' ? '#0F3826' : '#1A1A1A',
                  border: feltTheme === 'emerald' ? '1.5px solid #10B981' : '1px solid #2E2E2E',
                  color: feltTheme === 'emerald' ? '#34D399' : '#8A8A8A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Classic Monte-Carlo (Smaragdgrün)
              </button>
              <button
                type="button"
                onClick={() => setFeltTheme('obsidian')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: feltTheme === 'obsidian' ? '#262626' : '#1A1A1A',
                  border: feltTheme === 'obsidian' ? '1.5px solid #D4AF37' : '1px solid #2E2E2E',
                  color: feltTheme === 'obsidian' ? '#D4AF37' : '#8A8A8A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Royale Obsidian Velvet (Tiefschwarz)
              </button>
              <button
                type="button"
                onClick={() => setFeltTheme('burgundy')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: feltTheme === 'burgundy' ? '#3D0D14' : '#1A1A1A',
                  border: feltTheme === 'burgundy' ? '1.5px solid #F87171' : '1px solid #2E2E2E',
                  color: feltTheme === 'burgundy' ? '#FCA5A5' : '#8A8A8A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Baden-Baden Heritage (Karminrot)
              </button>
            </div>

            {/* Vintage Card Back Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#A3A3A3', fontWeight: 700 }}>
                Hole-Card Rücken:
              </span>
              <button
                type="button"
                onClick={() => setCardBackVariant('burgundy')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: cardBackVariant === 'burgundy' ? '#3D0606' : '#1A1A1A',
                  border:
                    cardBackVariant === 'burgundy' ? '1.5px solid #E5C158' : '1px solid #2E2E2E',
                  color: cardBackVariant === 'burgundy' ? '#E5C158' : '#8A8A8A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Vintage Karminrot (Rider Back)
              </button>
              <button
                type="button"
                onClick={() => setCardBackVariant('navy')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: cardBackVariant === 'navy' ? '#0C1A33' : '#1A1A1A',
                  border: cardBackVariant === 'navy' ? '1.5px solid #D4AF37' : '1px solid #2E2E2E',
                  color: cardBackVariant === 'navy' ? '#93C5FD' : '#8A8A8A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Imperial Navy
              </button>
              <button
                type="button"
                onClick={() => setCardBackVariant('obsidian')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: cardBackVariant === 'obsidian' ? '#262626' : '#1A1A1A',
                  border:
                    cardBackVariant === 'obsidian' ? '1.5px solid #D4AF37' : '1px solid #2E2E2E',
                  color: cardBackVariant === 'obsidian' ? '#D4AF37' : '#8A8A8A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Obsidian Gold
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Stage Preview (Before vs. After) */}
      <div style={{ width: '100%' }}>
        {viewMode === 'BEFORE' ? (
          /* ======================================================== */
          /* BEFORE: Die klassische BlackjackTable-Komponente        */
          /* ======================================================== */
          <div>
            <div
              style={{
                marginBottom: '10px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#1F1F1F',
                fontSize: '0.78rem',
                color: '#A3A3A3',
              }}
            >
              <strong>Status Quo (Vorher):</strong> Karten erscheinen abrupt ohne Kartenschlitten,
              die Hole-Card hat keine Spannungsaufdeckung, und der Tischhintergrund nutzt die alte
              elliptische Vektor-Linie.
            </div>
            <BlackjackTable
              dealerHand={dealerHand}
              playerHand={playerHand}
              playerHand2={isSplit ? playerHand2 : undefined}
              activeHandIndex={activeHandIndex}
              betAmount={50}
              payout={0}
            />
          </div>
        ) : (
          /* ======================================================== */
          /* AFTER: Option 1 mit Classic Casino Table Felt & Vintage Shoe */
          /* ======================================================== */
          <ClassicCasinoTableFelt
            theme={feltTheme}
            shoeNode={
              <BlackjackShoe
                isDealing={isDealing}
                deckCount={6}
                cardsRemaining={cardsRemaining}
                variant={cardBackVariant}
              />
            }
          >
            {/* Dealer Hand Area (Mit 2-Stufen-Peek und authentischem Vintage Rider Back) */}
            <div style={{ position: 'relative', zIndex: 5, margin: '20px 0 10px' }}>
              <BlackjackSplitHandBox
                hand={dealerHand}
                label="Dealer"
                isDealer={true}
                isPeeking={isPeeking}
                cardBackVariant={cardBackVariant}
              />
            </div>

            {/* Player Hands Area (100% unveränderte, klassische Original-Spielerkarten) */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isSplit ? '28px' : '0',
                position: 'relative',
                zIndex: 5,
                marginTop: '16px',
              }}
            >
              {isSplit ? (
                <>
                  <BlackjackSplitHandBox
                    hand={playerHand}
                    label="Hand 1"
                    isActive={activeHandIndex === 0}
                    isSplit={true}
                    cardBackVariant={cardBackVariant}
                  />
                  <BlackjackSplitHandBox
                    hand={playerHand2}
                    label="Hand 2"
                    isActive={activeHandIndex === 1}
                    isSplit={true}
                    cardBackVariant={cardBackVariant}
                  />
                </>
              ) : (
                <BlackjackSplitHandBox
                  hand={playerHand}
                  label="Deine Hand"
                  isActive={true}
                  isSplit={false}
                  cardBackVariant={cardBackVariant}
                />
              )}
            </div>
          </ClassicCasinoTableFelt>
        )}
      </div>
    </div>
  );
}
