'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { type BlackjackHand } from './CardHand';
import { BlackjackShoe } from './BlackjackShoe';
import { BlackjackSplitHandBox } from './BlackjackSplitHandBox';
import { ClassicCasinoTableFelt } from './ClassicCasinoTableFelt';

interface BlackjackTableProps {
  dealerHand: BlackjackHand | null;
  playerHand: BlackjackHand | null;
  playerHand2?: BlackjackHand | null;
  activeHandIndex?: 0 | 1;
  betAmount: number;
  result?: 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK' | 'BUST';
  result2?: 'WIN' | 'LOSS' | 'PUSH' | 'BUST';
  payout: number;
  isProcessing?: boolean;
}

export default function BlackjackTable({
  dealerHand,
  playerHand,
  playerHand2,
  activeHandIndex = 0,
  betAmount,
  result,
  payout,
  isProcessing = false,
}: BlackjackTableProps) {
  const hasResult = Boolean(result);
  const isWin = result === 'WIN' || result === 'BLACKJACK';

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <ClassicCasinoTableFelt
      theme="emerald"
      shoeNode={
        <BlackjackShoe
          isDealing={isProcessing}
          deckCount={6}
          cardsRemaining={240}
          variant="obsidian"
        />
      }
    >
      {/* 1. DEALER HAND AREA (High-End Vintage Obsidian Gold Hole-Card) */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '12px',
        }}
      >
        <BlackjackSplitHandBox
          hand={dealerHand}
          label="Dealer"
          isDealer={true}
          cardBackVariant="obsidian"
          isMobile={isMobile}
        />
      </div>

      {/* 2. CENTER BETTING SPOT & RESULT BANNER */}
      <div
        style={{
          position: 'relative',
          margin: '14px 0',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Dynamic Win Banner */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
              style={{
                position: 'absolute',
                top: '-46px',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '999px',
                background:
                  result === 'BLACKJACK'
                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)'
                    : isWin
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : result === 'PUSH'
                        ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                        : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                boxShadow: isWin
                  ? '0 0 30px rgba(255, 215, 0, 0.8)'
                  : '0 0 20px rgba(0, 0, 0, 0.7)',
                color: result === 'BLACKJACK' ? '#000' : '#FFF',
                fontWeight: 900,
                fontFamily: 'monospace',
                fontSize: isMobile ? '0.85rem' : '1rem',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? '92vw' : 'none',
                textAlign: 'center',
              }}
            >
              {isWin && <Zap size={16} fill={result === 'BLACKJACK' ? '#000' : '#FFF'} />}
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: isMobile ? '60vw' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {result === 'BLACKJACK' && `BLACKJACK! +$${payout.toFixed(2)} (3:2)`}
                {result === 'WIN' && `YOU WIN +$${payout.toFixed(2)}`}
                {result === 'PUSH' && 'PUSH (BET RETURNED)'}
                {result === 'BUST' && 'BUST! (DEALER WINS)'}
                {result === 'LOSS' && 'DEALER WINS'}
              </span>
              {isWin && <Zap size={16} fill={result === 'BLACKJACK' ? '#000' : '#FFF'} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Betting Spot with Spring Physics */}
        <motion.div
          key={betAmount}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            border: '2px dashed rgba(212, 175, 55, 0.55)',
            background:
              'radial-gradient(circle at 35% 35%, rgba(20, 24, 30, 0.9) 0%, rgba(10, 12, 16, 0.95) 100%)',
            boxShadow: 'inset 0 0 14px rgba(0, 0, 0, 0.9), 0 0 16px rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              color: '#D4AF37',
              fontSize: '0.55rem',
              fontWeight: 900,
              letterSpacing: '0.5px',
            }}
          >
            BET
          </span>
          <span
            style={{
              color: '#FFF',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              fontWeight: 900,
            }}
          >
            ${betAmount.toFixed(0)}
          </span>
        </motion.div>
      </div>

      {/* 3. PLAYER HANDS AREA (100% Unveränderte Original-Spielerkarten mit Split-Unterstützung) */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '14px' : '28px',
          flexWrap: 'wrap',
          marginTop: '12px',
        }}
      >
        <BlackjackSplitHandBox
          hand={playerHand}
          label={playerHand2 ? 'Hand 1' : 'Deine Hand'}
          isActive={activeHandIndex === 0}
          isSplit={Boolean(playerHand2)}
          cardBackVariant="obsidian"
          isMobile={isMobile}
        />
        {playerHand2 && (
          <BlackjackSplitHandBox
            hand={playerHand2}
            label="Hand 2"
            isActive={activeHandIndex === 1}
            isSplit={true}
            cardBackVariant="obsidian"
            isMobile={isMobile}
          />
        )}
      </div>
    </ClassicCasinoTableFelt>
  );
}
