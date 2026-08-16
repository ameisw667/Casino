'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import CardHand, { type BlackjackHand } from './CardHand';

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
}: BlackjackTableProps) {
  const hasResult = Boolean(result);
  const isWin = result === 'WIN' || result === 'BLACKJACK';

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        borderRadius: '24px',
        background: 'radial-gradient(ellipse at 50% 30%, #0d3827 0%, #062217 50%, #03120c 100%)',
        border: '2px solid rgba(212, 175, 55, 0.45)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), inset 0 0 40px rgba(0, 0, 0, 0.9)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '440px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Felt Background Arch */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '5%',
          right: '5%',
          height: '240px',
          borderRadius: '50%',
          border: '1.5px solid rgba(212, 175, 55, 0.15)',
          pointerEvents: 'none',
        }}
      />

      {/* Table Slogan Text */}
      <div
        style={{
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#D4AF37',
            textShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
          }}
        >
          BLACKJACK PAYS 3 TO 2
        </div>
        <div
          style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            color: 'rgba(212, 175, 55, 0.65)',
            marginTop: '2px',
          }}
        >
          DEALER MUST STAND ON 17 • INSURANCE PAYS 2 TO 1
        </div>
      </div>

      {/* 1. DEALER AREA */}
      <div style={{ zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <CardHand
          hand={dealerHand}
          label="Dealer"
          isActive={false}
          hideScore={dealerHand?.cards.some((c) => c.faceDown) ?? false}
        />
      </div>

      {/* 2. CENTER BETTING SPOT & RESULT BANNER */}
      <div
        style={{
          position: 'relative',
          margin: '12px 0',
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
                top: '-45px',
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
                fontSize: '1rem',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              {isWin && <Zap size={16} fill={result === 'BLACKJACK' ? '#000' : '#FFF'} />}
              <span>
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

        {/* Circular Betting Spot */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '2px dashed rgba(212, 175, 55, 0.45)',
            background: 'rgba(0, 0, 0, 0.4)',
            boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.8)',
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
            style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 900 }}
          >
            ${betAmount.toFixed(0)}
          </span>
        </div>
      </div>

      {/* 3. PLAYER HANDS AREA */}
      <div
        style={{
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        <CardHand
          hand={playerHand}
          label={playerHand2 ? 'Hand 1' : 'Player'}
          isActive={activeHandIndex === 0}
        />
        {playerHand2 && (
          <CardHand hand={playerHand2} label="Hand 2 (Split)" isActive={activeHandIndex === 1} />
        )}
      </div>
    </div>
  );
}
