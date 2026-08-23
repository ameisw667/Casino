'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

import { SlotReel, SLOT_CELL_HEIGHT } from '@/components/casino/games/slots/SlotReel';
import { WinLine } from '@/components/casino/games/slots/WinLine';
import { GAME_SYMBOLS, STAGGER_DELAYS_MS } from '@/app/games/slots/symbols';
import {
  NO_WIN,
  type HistoryEntry,
  type LastResult,
  type ReelSymbols,
  type SessionStats,
  type WinningRows,
} from '@/components/casino/games/slots/slots-config';

interface SlotsCenterStageProps {
  isMobile: boolean;
  isSpinning: boolean;
  finalReels: ReelSymbols[];
  isAnticipatingReel: boolean[];
  winRows: WinningRows[];
  winningRowIndex: 0 | 1 | 2 | null;
  hasWin: boolean;
  lastResult: LastResult;
  history: HistoryEntry[];
  sessionStats: SessionStats;
}

export function SlotsCenterStage({
  isMobile,
  isSpinning,
  finalReels,
  isAnticipatingReel,
  winRows,
  winningRowIndex,
  hasWin,
  lastResult,
  history,
  sessionStats,
}: SlotsCenterStageProps) {
  const slotCellHeight = isMobile ? 84 : SLOT_CELL_HEIGHT;
  const reelWindowHeight = slotCellHeight * 3;

  return (
    <div
      className="slots-center-stage obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        padding: isMobile ? '14px' : '20px',
        borderRadius: '26px',
        minWidth: 0,
        width: '100%',
        height: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Bar: Title & Recent Multipliers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 10px #FFD700',
              }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '1px',
                color: '#FFD700',
              }}
            >
              LIVE OLYMPUS VAULT
            </span>
          </div>

          {/* Recent History Multipliers */}
          <div
            style={{
              display: 'flex',
              gap: '5px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '3px 7px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: h.win ? '#FFD700' : '#64748b',
                  background: h.win ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: h.win
                    ? '1px solid rgba(212, 175, 55, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {h.win ? `${h.multiplier}×` : '0×'}
              </div>
            ))}
          </div>
        </div>

        {/* 3D Slot Machine Cabinet */}
        <div
          className="slot-machine"
          style={{
            width: '100%',
            margin: '0 auto',
            background:
              'radial-gradient(ellipse at 50% 20%, #1a1610 0%, #0c0b10 70%, #050508 100%)',
            border: '2px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '24px',
            padding: '16px',
            boxShadow: '0 15px 45px rgba(0,0,0,0.85), inset 0 0 30px rgba(0,0,0,0.9)',
          }}
        >
          {/* Cabinet Top Header */}
          <div
            className="slot-machine-top"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <h2
              className="slot-machine-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '2px',
                color: '#FFF',
                textShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
              }}
            >
              ZEUS VAULT
            </h2>
            <div className="slot-machine-lights" style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="slot-light"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSpinning ? '#FFD700' : 'rgba(212, 175, 55, 0.4)',
                    boxShadow: isSpinning ? '0 0 8px #FFD700' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Reels Container: Fixed 336px Height */}
          <div
            className="slot-reels-container"
            style={{
              position: 'relative',
              height: `${reelWindowHeight + 24}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#040406',
              borderRadius: '18px',
              padding: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Dynamic Win Banner Overlay */}
            <AnimatePresence>
              {hasWin && !isSpinning && (
                <motion.div
                  className="slot-win-banner"
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 30,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 22px',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
                    boxShadow: '0 0 35px rgba(255, 215, 0, 0.9), 0 0 70px rgba(212, 175, 55, 0.5)',
                    color: '#000',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  <Zap size={20} fill="#000" />
                  <span>
                    WIN +${lastResult.amount.toFixed(2)} ({lastResult.multiplier}×)
                  </span>
                  <Zap size={20} fill="#000" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 5-Reel Frame: Strictly 5 Columns x 3 Rows */}
            <div
              className="slot-reels-frame"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                width: '100%',
                height: `${reelWindowHeight}px`,
                position: 'relative',
              }}
            >
              {finalReels.map((reelSyms, i) => (
                <React.Fragment key={i}>
                  <SlotReel
                    finalSymbols={reelSyms}
                    isSpinning={isSpinning}
                    stopDelay={STAGGER_DELAYS_MS[i] + (isAnticipatingReel[i] ? 600 : 0)}
                    winningRows={winRows[i] ?? NO_WIN}
                    symbolPool={GAME_SYMBOLS}
                    isAnticipating={isAnticipatingReel[i] && isSpinning}
                    hasWinInCabinet={hasWin && !isSpinning}
                    cellHeight={slotCellHeight}
                  />
                </React.Fragment>
              ))}
              <WinLine rowIndex={winningRowIndex} isVisible={hasWin && !isSpinning} />
            </div>
          </div>

          {/* Machine Base Readouts */}
          <div
            className="slot-machine-base"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                LAST RESULT
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  color:
                    lastResult.type === 'win'
                      ? '#4ade80'
                      : lastResult.type === 'loss'
                        ? '#f87171'
                        : '#94a3b8',
                }}
              >
                {lastResult.type === 'win' && `+$${lastResult.amount.toFixed(2)}`}
                {lastResult.type === 'loss' && `-$${lastResult.amount.toFixed(2)}`}
                {lastResult.type === 'idle' && '—'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                TOTAL SPINS
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  color: '#FFF',
                }}
              >
                {sessionStats.rounds}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                SESSION PROFIT
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  color: sessionStats.profit >= 0 ? '#4ade80' : '#f87171',
                }}
              >
                {sessionStats.profit >= 0 ? '+' : ''}${sessionStats.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#64748b',
          fontSize: '0.68rem',
          fontWeight: 700,
          paddingTop: '6px',
        }}
      >
        <Sparkles size={13} color="#D4AF37" />
        <span>VIP OLYMPUS HIGH ROLLER SUITE</span>
      </div>
    </div>
  );
}
