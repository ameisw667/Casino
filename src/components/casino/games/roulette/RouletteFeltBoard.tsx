'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ROULETTE_NUMBERS, type BetType, type BetPlacement, type RouletteNumber } from './types';
import { FRENCH_SECTORS, betTypeKey } from './roulette-config';
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
  hideBuiltInRacetrackToggle?: boolean;
}

/**
 * Salon Privé 3D-Bevel Roulette Felt Board:
 * Dead-center typography, French terminology (12P/12M/12D, Manque/Passe, Pair/Impair),
 * 3D-beveled cells with depth shadow, and subtle brass hairlines without glaring yellow borders.
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
  hideBuiltInRacetrackToggle = false,
}: RouletteFeltBoardProps) {
  return (
    <>
      {/* Optional Built-in French Racetrack Toggle */}
      {!hideBuiltInRacetrackToggle && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onToggleRacetrack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showRacetrack
                ? 'linear-gradient(180deg, hsla(var(--primary), 0.25) 0%, hsla(var(--primary), 0.1) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: showRacetrack
                ? '1px solid hsla(var(--primary), 0.65)'
                : '1px solid rgba(255, 255, 255, 0.12)',
              padding: '6px 14px',
              borderRadius: '8px',
              color: showRacetrack ? '#FFD700' : 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.70rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: showRacetrack ? '#FFD700' : 'rgba(255, 255, 255, 0.4)',
              }}
            />
            <span>{showRacetrack ? 'Rennbahn schließen' : 'Kessel-Rennbahn'}</span>
          </button>
        </div>
      )}

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
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '12px',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          {FRENCH_SECTORS.map((sec) => (
            <button
              key={sec.label}
              onClick={() => onFrenchBet(sec.numbers)}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#F5E6A3',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span style={{ color: '#FCE7A1', fontWeight: 900, fontSize: '0.78rem' }}>
                {sec.label}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                ({sec.numbers.length} Zahlen)
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Mobile-Hinweis */}
      {isMobile && (
        <div
          style={{
            fontSize: '0.66rem',
            color: 'rgba(255, 255, 255, 0.45)',
            textAlign: 'center',
            marginBottom: '4px',
            letterSpacing: '0.04em',
          }}
        >
          ← Tisch wischen →
        </div>
      )}

      {/* ── MASTER-FELT MIT SALON PRIVÉ 3D-BEVEL & DEAD-CENTER TYPOGRAFIE ── */}
      <div
        className="roulette-board"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #082417 0%, #03120B 100%)',
          border: feltFlash ? '1.5px solid #FFD700' : '1.2px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '18px',
          padding: isMobile ? '12px 10px' : '16px 14px',
          boxShadow: feltFlash
            ? '0 0 25px rgba(212, 175, 55, 0.5), inset 0 0 35px rgba(0, 0, 0, 0.9)'
            : 'inset 0 0 35px rgba(0, 0, 0, 0.9), 0 8px 25px rgba(0, 0, 0, 0.5)',
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
            minWidth: '920px',
            display: 'grid',
            gridTemplateColumns: '74px 1fr 64px',
            gap: '6px',
          }}
        >
          {/* Green Zero Cell (Dead Center) */}
          <div
            onClick={() => onPlaceBet({ type: 'STRAIGHT', value: 0 })}
            onContextMenu={(e) => {
              e.preventDefault();
              onRemoveBet({ type: 'STRAIGHT', value: 0 });
            }}
            onMouseEnter={() => onHoverChange({ type: 'STRAIGHT', value: 0 })}
            onMouseLeave={() => onHoverChange(null)}
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
                winningNumber?.n === 0 && !spinning
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
            {(() => {
              const bet = currentBets.find((b) => betTypeKey(b.type) === 'STRAIGHT:0');
              if (!bet) return null;
              return (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <TableChipStack amount={bet.amount} size={36} />
                </div>
              );
            })()}
          </div>

          {/* 36 Numbers Grid (3 Rows x 12 Cols, 56px Height, 3D Beveled Cells) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridTemplateRows: 'repeat(3, 56px)',
              gap: '6px',
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
                  const isRed = numData.c === 'RED';

                  return (
                    <div
                      key={num}
                      onClick={() => onPlaceBet({ type: 'STRAIGHT', value: num })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onRemoveBet({ type: 'STRAIGHT', value: num });
                      }}
                      onMouseEnter={() => onHoverChange({ type: 'STRAIGHT', value: num })}
                      onMouseLeave={() => onHoverChange(null)}
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
                          : '1px solid rgba(212, 175, 55, 0.32)',
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
                      {bet && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <TableChipStack amount={bet.amount} size={36} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* 2:1 Column Bets (56px Height) */}
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
                  onMouseEnter={() => onHoverChange({ type: 'COLUMN', value: col as 1 | 2 | 3 })}
                  onMouseLeave={() => onHoverChange(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background:
                      'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
                    border: isHovered
                      ? '1.5px solid #FFD700'
                      : '1px solid rgba(212, 175, 55, 0.28)',
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
                  {bet && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <TableChipStack amount={bet.amount} size={36} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dozen Bets (P12, M12, D12) */}
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
          {[
            { label: '12 P (1-12)', val: 1 },
            { label: '12 M (13-24)', val: 2 },
            { label: '12 D (25-36)', val: 3 },
          ].map((dz) => {
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
                onMouseEnter={() => onHoverChange({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 })}
                onMouseLeave={() => onHoverChange(null)}
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
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.35)',
                }}
              >
                <span>{dz.label}</span>
                {bet && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <TableChipStack amount={bet.amount} size={36} />
                  </div>
                )}
              </div>
            );
          })}
          <div />
        </div>

        {/* Outside Bets (MANQUE, PAIR, RED, BLACK, IMPAIR, PASSE) */}
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
          {[
            {
              label: 'MANQUE (1-18)',
              type: { type: 'RANGE' as const, value: '1-18' as const },
              bg: '',
            },
            { label: 'PAIR', type: { type: 'EVEN_ODD' as const, value: 'EVEN' as const }, bg: '' },
            {
              label: 'RED',
              type: { type: 'COLOR' as const, value: 'RED' as const },
              bg: 'linear-gradient(180deg, #A81B1B 0%, #7F1414 100%)',
            },
            {
              label: 'BLACK',
              type: { type: 'COLOR' as const, value: 'BLACK' as const },
              bg: 'linear-gradient(180deg, #1A1C24 0%, #0F1016 100%)',
            },
            { label: 'IMPAIR', type: { type: 'EVEN_ODD' as const, value: 'ODD' as const }, bg: '' },
            {
              label: 'PASSE (19-36)',
              type: { type: 'RANGE' as const, value: '19-36' as const },
              bg: '',
            },
          ].map((ob) => {
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
                onMouseEnter={() => onHoverChange(ob.type)}
                onMouseLeave={() => onHoverChange(null)}
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
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.35)',
                }}
              >
                <span>{ob.label}</span>
                {bet && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <TableChipStack amount={bet.amount} size={36} />
                  </div>
                )}
              </div>
            );
          })}
          <div />
        </div>
      </div>
    </>
  );
}
