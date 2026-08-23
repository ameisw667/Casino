'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { ROULETTE_NUMBERS, type BetType, type BetPlacement, type RouletteNumber } from './types';
import { FRENCH_SECTORS, OUTSIDE_BETS, betTypeKey } from './roulette-config';
import { TableChipStack } from './TableChipStack';

interface RouletteFeltBoardProps {
  isMobile: boolean;
  showRacetrack: boolean;
  onToggleRacetrack: () => void;
  onFrenchBet: (numbers: number[]) => void;
  feltFlash: boolean;
  currentBets: BetPlacement[];
  hoveredArea: BetType | null;
  onHoverChange: (area: BetType | null) => void;
  onPlaceBet: (type: BetType, amount?: number) => void;
  onRemoveBet: (type: BetType, amount?: number) => void;
  winningNumber: RouletteNumber | null;
  spinning: boolean;
}

/**
 * French racetrack toggle + sectors, mobile scroll hint, and the master betting
 * felt (green zero, 36 numbers, 2:1 columns, dozens, outside bets) with placed-chip
 * stacks. Pure presentational — extracted verbatim from RouletteClient.tsx. All bet
 * interactions are callbacks; hover state is owned by the parent.
 */
export function RouletteFeltBoard({
  isMobile,
  showRacetrack,
  onToggleRacetrack,
  onFrenchBet,
  feltFlash,
  currentBets,
  hoveredArea,
  onHoverChange,
  onPlaceBet,
  onRemoveBet,
  winningNumber,
  spinning,
}: RouletteFeltBoardProps) {
  return (
    <>
      {/* French Racetrack Sector Quick Bets Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onToggleRacetrack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: showRacetrack ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            padding: '6px 14px',
            borderRadius: '10px',
            color: '#FFD700',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <Compass size={14} />
          <span>{showRacetrack ? 'HIDE FRENCH RACETRACK' : 'SHOW FRENCH RACETRACK'}</span>
        </button>
      </div>

      {/* French Racetrack Sectors */}
      {showRacetrack && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '12px',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          {FRENCH_SECTORS.map((sec) => (
            <button
              key={sec.label}
              className="quick-chip"
              onClick={() => onFrenchBet(sec.numbers)}
              style={{
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ color: '#FFD700', fontWeight: 900 }}>{sec.label}</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                ({sec.numbers.length} Numbers)
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Mobile-Hinweis: Roulette-Tisch ist inhärent breit — horizontales Scrollen. */}
      {isMobile && (
        <div
          style={{
            fontSize: '0.66rem',
            color: 'rgba(255, 255, 255, 0.45)',
            textAlign: 'center',
            marginBottom: '6px',
            letterSpacing: '0.04em',
          }}
        >
          ← Tisch wischen →
        </div>
      )}

      {/* MASTER-FELT MIT DEAD-CENTER-TYPOGRAFIE & SKALIERTEN 54PX KOMFORT-ZELLEN (Option A) */}
      <div
        className="roulette-board"
        style={{
          background: '#09090e',
          border: feltFlash ? '2px solid #FFD700' : '2px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '24px',
          padding: isMobile ? '12px 10px' : '18px 16px',
          boxShadow: feltFlash
            ? '0 0 25px rgba(212, 175, 55, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.9)'
            : 'inset 0 0 30px rgba(0, 0, 0, 0.9), 0 10px 30px rgba(0, 0, 0, 0.5)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'thin',
          position: 'relative',
          transition: 'border 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div
          style={{
            minWidth: '880px',
            display: 'grid',
            gridTemplateColumns: '72px 1fr 64px',
            gap: '5px',
          }}
        >
          {/* Green Zero Cell (Dead Center, Left-Click Add, Right-Click Subtract) */}
          <div
            className="felt-cell"
            onClick={() => onPlaceBet({ type: 'STRAIGHT', value: 0 })}
            onContextMenu={(e) => {
              e.preventDefault();
              onRemoveBet({ type: 'STRAIGHT', value: 0 });
            }}
            onMouseEnter={() => onHoverChange({ type: 'STRAIGHT', value: 0 })}
            onMouseLeave={() => onHoverChange(null)}
            style={{
              gridRow: 'span 3',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderRadius: '14px 0 0 14px',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#FFF',
              fontSize: '1.6rem',
              fontWeight: 1000,
              boxShadow:
                winningNumber?.n === 0 && !spinning
                  ? '0 0 25px rgba(16, 185, 129, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.5)'
                  : 'none',
            }}
          >
            0{/* Placed Chip Badge */}
            {(() => {
              const bet = currentBets.find((b) => betTypeKey(b.type) === 'STRAIGHT:0');
              if (!bet) return null;
              return <TableChipStack amount={bet.amount} size={38} />;
            })()}
          </div>

          {/* 36 Numbers Grid (3 Rows x 12 Cols, 54px Height, Left-Click Add, Right-Click Subtract) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridTemplateRows: 'repeat(3, 54px)',
              gap: '5px',
            }}
          >
            {[
              [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
              [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
              [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
            ].map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                {row.map((num) => {
                  const numData = ROULETTE_NUMBERS.find((rn) => rn.n === num)!;
                  const isWin = winningNumber?.n === num && !spinning;
                  const bet = currentBets.find((b) => betTypeKey(b.type) === `STRAIGHT:${num}`);
                  const isHovered = hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === num;

                  return (
                    <div
                      key={num}
                      className="felt-cell"
                      onClick={() => onPlaceBet({ type: 'STRAIGHT', value: num })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onRemoveBet({ type: 'STRAIGHT', value: num });
                      }}
                      onMouseEnter={() => onHoverChange({ type: 'STRAIGHT', value: num })}
                      onMouseLeave={() => onHoverChange(null)}
                      style={{
                        background:
                          numData.c === 'RED'
                            ? 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
                            : 'linear-gradient(135deg, #181822 0%, #0f0f15 100%)',
                        border: isHovered
                          ? '1.5px solid #FFD700'
                          : '1px solid rgba(212, 175, 55, 0.28)',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '1.3rem',
                        fontWeight: 1000,
                        boxShadow: isWin
                          ? '0 0 25px rgba(255, 215, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.6)'
                          : 'none',
                      }}
                    >
                      {num}
                      {bet && <TableChipStack amount={bet.amount} size={36} />}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* 2:1 Column Bets (54px Height, Left-Click Add, Right-Click Subtract) */}
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 54px)', gap: '5px' }}>
            {[1, 2, 3].map((col) => {
              const bet = currentBets.find((b) => betTypeKey(b.type) === `COLUMN:${col}`);
              return (
                <div
                  key={col}
                  className="felt-cell"
                  onClick={() => onPlaceBet({ type: 'COLUMN', value: col as 1 | 2 | 3 })}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onRemoveBet({ type: 'COLUMN', value: col as 1 | 2 | 3 });
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(212, 175, 55, 0.28)',
                    borderRadius: '0 8px 8px 0',
                    color: '#FFD700',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                  }}
                >
                  2:1
                  {bet && <TableChipStack amount={bet.amount} size={36} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dozen Bets (48px Height, Left-Click Add, Right-Click Subtract) */}
        <div
          style={{
            minWidth: '880px',
            display: 'grid',
            gridTemplateColumns: '72px repeat(3, 1fr) 64px',
            gap: '5px',
            marginTop: '5px',
          }}
        >
          <div />
          {[
            { label: '1st 12', val: 1 },
            { label: '2nd 12', val: 2 },
            { label: '3rd 12', val: 3 },
          ].map((dz) => {
            const bet = currentBets.find((b) => betTypeKey(b.type) === `DOZEN:${dz.val}`);
            return (
              <div
                key={dz.val}
                className="felt-cell"
                onClick={() => onPlaceBet({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 })}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRemoveBet({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 });
                }}
                style={{
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  color: '#FFD700',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                }}
              >
                {dz.label}
                {bet && <TableChipStack amount={bet.amount} size={38} />}
              </div>
            );
          })}
          <div />
        </div>

        {/* Outside Bets (52px Height, Left-Click Add, Right-Click Subtract) */}
        <div
          style={{
            minWidth: '880px',
            display: 'grid',
            gridTemplateColumns: '72px repeat(6, 1fr) 64px',
            gap: '5px',
            marginTop: '5px',
          }}
        >
          <div />
          {OUTSIDE_BETS.map((ob) => {
            const key = betTypeKey(ob.type);
            const bet = currentBets.find((b) => betTypeKey(b.type) === key);
            return (
              <div
                key={ob.label}
                data-testid={ob.label === 'RED' ? 'roulette-bet-red' : undefined}
                className="felt-cell"
                onClick={() => onPlaceBet(ob.type)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRemoveBet(ob.type);
                }}
                style={{
                  height: '52px',
                  background: ob.bg || 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                }}
              >
                {ob.label}
                {bet && <TableChipStack amount={bet.amount} size={38} />}
              </div>
            );
          })}
          <div />
        </div>
      </div>
    </>
  );
}
