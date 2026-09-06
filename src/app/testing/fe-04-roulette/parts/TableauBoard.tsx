'use client';

import React from 'react';
import {
  ROULETTE_NUMBERS,
  type BetType,
  type BetPlacement,
  type RouletteNumber,
} from '@/components/casino/games/roulette/types';
import { betTypeKey } from '@/components/casino/games/roulette/roulette-config';
import { BetChipOverlay } from './BetChipOverlay';
import { OUTSIDE_BETS } from './shared';

interface TableauBoardProps {
  currentBets: BetPlacement[];
  spinning: boolean;
  revealedWinner: RouletteNumber | null;
  hoveredArea: BetType | null;
  onHover: (area: BetType | null) => void;
  onPlaceBet: (type: BetType) => void;
  onRemoveBet: (type: BetType) => void;
}

const NUMBER_GRID_ROWS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const DOZENS = [
  { label: '12 P (1-12)', val: 1 },
  { label: '12 M (13-24)', val: 2 },
  { label: '12 D (25-36)', val: 3 },
];

export function TableauBoard({
  currentBets,
  spinning,
  revealedWinner,
  hoveredArea,
  onHover,
  onPlaceBet,
  onRemoveBet,
}: TableauBoardProps) {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: '16px',
        background: 'radial-gradient(ellipse at 50% 50%, #082417 0%, #03120B 100%)',
        border: '1.5px solid rgba(184, 134, 11, 0.45)',
        boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.9), 0 8px 30px rgba(0, 0, 0, 0.6)',
        padding: '16px',
        overflowX: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          minWidth: '920px',
          display: 'grid',
          gridTemplateColumns: '74px 1fr 64px',
          gap: '6px',
        }}
      >
        {/* Green Zero Cell */}
        <div
          onClick={() => onPlaceBet({ type: 'STRAIGHT', value: 0 })}
          onContextMenu={(e) => {
            e.preventDefault();
            onRemoveBet({ type: 'STRAIGHT', value: 0 });
          }}
          onMouseEnter={() => onHover({ type: 'STRAIGHT', value: 0 })}
          onMouseLeave={() => onHover(null)}
          style={{
            gridRow: 'span 3',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(180deg, #047857 0%, #024E38 100%)',
            borderRadius: '12px 0 0 12px',
            border:
              hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === 0
                ? '1.5px solid #FFD700'
                : '1px solid rgba(212, 175, 55, 0.4)',
            color: '#FFFFFF',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.15s ease',
            boxShadow:
              revealedWinner?.n === 0 && !spinning
                ? '0 0 30px rgba(16, 185, 129, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.5)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 8px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              fontFamily: 'serif',
              letterSpacing: '1px',
            }}
          >
            0
          </span>
          <BetChipOverlay bet={currentBets.find((b) => betTypeKey(b.type) === 'STRAIGHT:0')} />
        </div>

        {/* 36 Numbers Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(3, 56px)',
            gap: '6px',
          }}
        >
          {NUMBER_GRID_ROWS.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {row.map((num) => {
                const numData = ROULETTE_NUMBERS.find((rn) => rn.n === num)!;
                const isWin = revealedWinner?.n === num && !spinning;
                const bet = currentBets.find((b) => betTypeKey(b.type) === `STRAIGHT:${num}`);
                const isHovered = hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === num;
                const isRed = numData.c === 'RED';

                return (
                  <div
                    key={num}
                    onClick={() => onPlaceBet({ type: 'STRAIGHT', value: num })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onRemoveBet({ type: 'STRAIGHT', value: num });
                    }}
                    onMouseEnter={() => onHover({ type: 'STRAIGHT', value: num })}
                    onMouseLeave={() => onHover(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      background: isRed
                        ? 'radial-gradient(circle at 40% 30%, #B91C1C 0%, #700E0E 100%)'
                        : 'radial-gradient(circle at 40% 30%, #242630 0%, #0A0A0F 100%)',
                      border: isHovered
                        ? '1.5px solid #FFD700'
                        : '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: isWin
                        ? '0 0 25px rgba(255, 215, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.6)'
                        : 'inset 0 2px 3px rgba(255, 255, 255, 0.25), inset 0 -2px 3px rgba(0, 0, 0, 0.7), 0 3px 6px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.28rem',
                        fontWeight: 900,
                        fontFamily: 'serif',
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {num}
                    </span>
                    <BetChipOverlay bet={bet} />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* 2:1 Columns */}
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 56px)', gap: '6px' }}>
          {[1, 2, 3].map((col) => {
            const bet = currentBets.find((b) => betTypeKey(b.type) === `COLUMN:${col}`);
            const isHovered = hoveredArea?.type === 'COLUMN' && hoveredArea.value === col;
            return (
              <div
                key={col}
                onClick={() => onPlaceBet({ type: 'COLUMN', value: col as 1 | 2 | 3 })}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRemoveBet({ type: 'COLUMN', value: col as 1 | 2 | 3 });
                }}
                onMouseEnter={() => onHover({ type: 'COLUMN', value: col as 1 | 2 | 3 })}
                onMouseLeave={() => onHover(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
                  border: isHovered ? '1.5px solid #FFD700' : '1px solid rgba(212, 175, 55, 0.28)',
                  borderRadius: '0 10px 10px 0',
                  color: '#F5E6A3',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.35)',
                }}
              >
                <span>2:1</span>
                <BetChipOverlay bet={bet} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dozens */}
      <div
        style={{
          minWidth: '920px',
          display: 'grid',
          gridTemplateColumns: '74px repeat(3, 1fr) 64px',
          gap: '6px',
          marginTop: '6px',
        }}
      >
        <div />
        {DOZENS.map((dz) => {
          const bet = currentBets.find((b) => betTypeKey(b.type) === `DOZEN:${dz.val}`);
          const isHovered = hoveredArea?.type === 'DOZEN' && hoveredArea.value === dz.val;
          return (
            <div
              key={dz.val}
              onClick={() => onPlaceBet({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 })}
              onContextMenu={(e) => {
                e.preventDefault();
                onRemoveBet({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 });
              }}
              onMouseEnter={() => onHover({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 })}
              onMouseLeave={() => onHover(null)}
              style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
                border: isHovered ? '1.5px solid #FFD700' : '1px solid rgba(212, 175, 55, 0.28)',
                borderRadius: '8px',
                color: '#F5E6A3',
                fontSize: '0.88rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.35)',
              }}
            >
              <span>{dz.label}</span>
              <BetChipOverlay bet={bet} />
            </div>
          );
        })}
        <div />
      </div>

      {/* Outside Bets */}
      <div
        style={{
          minWidth: '920px',
          display: 'grid',
          gridTemplateColumns: '74px repeat(6, 1fr) 64px',
          gap: '6px',
          marginTop: '6px',
        }}
      >
        <div />
        {OUTSIDE_BETS.map((ob) => {
          const key = betTypeKey(ob.type);
          const bet = currentBets.find((b) => betTypeKey(b.type) === key);
          const isHovered = hoveredArea && betTypeKey(hoveredArea) === key;
          return (
            <div
              key={ob.label}
              onClick={() => onPlaceBet(ob.type)}
              onContextMenu={(e) => {
                e.preventDefault();
                onRemoveBet(ob.type);
              }}
              onMouseEnter={() => onHover(ob.type)}
              onMouseLeave={() => onHover(null)}
              style={{
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background:
                  ob.bg ||
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
                border: isHovered ? '1.5px solid #FFD700' : '1px solid rgba(212, 175, 55, 0.28)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.35)',
              }}
            >
              <span>{ob.label}</span>
              <BetChipOverlay bet={bet} />
            </div>
          );
        })}
        <div />
      </div>
    </div>
  );
}
