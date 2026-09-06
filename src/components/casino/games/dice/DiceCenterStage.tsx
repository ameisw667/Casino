'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Percent, RefreshCw } from 'lucide-react';
import {
  MULTIPLIER_PRESETS,
  type DiceHistoryItem,
} from '@/components/casino/games/dice/dice-config';

interface DiceCenterStageProps {
  isMobile: boolean;
  loading: boolean;
  lastResult: DiceHistoryItem | null;
  displayTicker: number | null;
  history: DiceHistoryItem[];
  winStreak: number;
  visualResult: number | null;
  targetPoint: number;
  isRollOver: boolean;
  winChance: number;
  multiplier: number;
  isDraggingThumb: boolean;
  sliderRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onUpdateFromWinChance: (val: number) => void;
  onUpdateFromMultiplier: (val: number) => void;
  onUpdateFromTarget: (val: number) => void;
  onToggleRollMode: () => void;
}

export function DiceCenterStage({
  isMobile,
  loading,
  lastResult,
  displayTicker,
  history,
  winStreak,
  visualResult,
  targetPoint,
  isRollOver,
  winChance,
  multiplier,
  isDraggingThumb,
  sliderRef,
  onMouseDown,
  onTouchStart,
  onUpdateFromWinChance: _onUpdateFromWinChance,
  onUpdateFromMultiplier,
  onUpdateFromTarget: _onUpdateFromTarget,
  onToggleRollMode,
}: DiceCenterStageProps) {
  const currentRollValue = displayTicker !== null ? displayTicker : (lastResult?.roll ?? 50.0);
  const isNearMiss =
    !lastResult?.win && lastResult !== null && Math.abs(lastResult.roll - targetPoint) <= 3.0;

  return (
    <div
      className="dice-main game-area"
      style={{
        borderRadius: '32px',
        background: '#07090E',
        border: '3px solid #2B1D12',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.99), inset 0 2px 6px rgba(255, 255, 255, 0.12)',
        padding: isMobile ? '10px' : '16px',
        perspective: '1400px',
        position: 'relative',
        boxSizing: 'border-box',
        order: isMobile ? 1 : 2,
        minWidth: 0,
        width: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Haupt-Filzboden (Smaragd-Kaschmir mit sanftem Eigenschatten) */}
      <div
        style={{
          width: '100%',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% 28%, #144832 0%, #0B2C1E 52%, #05160E 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 0 50px rgba(0, 0, 0, 0.7)',
          padding: isMobile ? '16px 12px 24px' : '28px 32px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '20px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.6s ease',
        }}
      >
        {/* Spotlight-Kegel */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 22%, rgba(255, 235, 170, 0.15) 0%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* Victory Radial Glow Flash on Win */}
        {lastResult?.win && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.35) 0%, transparent 70%)',
            }}
          />
        )}

        {/* ── TOP HEADER: WIN STREAK + ROLL HISTORY ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {winStreak >= 2 ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.28)',
                color: '#D4AF37',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <Flame size={13} color="#D4AF37" />
              <span>{winStreak}× WIN STREAK</span>
            </div>
          ) : (
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.40)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              ROLL HISTORY
            </span>
          )}

          {/* History Stream */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '70%' }}>
            {history.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: h.win ? (h.multiplier >= 5 ? '#FFD700' : '#34D399') : '#F87171',
                  background: h.win ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${h.win ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.25)'}`,
                }}
              >
                {h.roll.toFixed(2)}
              </div>
            ))}
          </div>
        </div>

        {/* ── ZENTRALER ZIFFERN-BEREICH (SANFTER SCHATTEN & 100% CLEAN) ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? '140px' : '175px',
            position: 'relative',
            zIndex: 5,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
            caretColor: 'transparent',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              userSelect: 'none',
            }}
          >
            {/* Ziffern mit sanftem, natürlichem Eigenschatten (ohne harten schwarzen Klotz) */}
            <motion.div
              key={lastResult?.id || displayTicker || 'satin-clean'}
              initial={{ scale: 0.96, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontSize: isMobile ? '5.2rem' : 'min(7.6rem, 15vw)',
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-2px',
                color: '#FFFFFF',
                filter:
                  'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              {currentRollValue.toFixed(2)}
            </motion.div>

            {/* Subtile edle Statuszeile */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: '20px',
                background: loading
                  ? 'rgba(0, 0, 0, 0.25)'
                  : lastResult?.win
                    ? 'rgba(6, 78, 59, 0.45)'
                    : 'rgba(127, 29, 29, 0.4)',
                border: loading
                  ? '1px solid rgba(255, 255, 255, 0.12)'
                  : lastResult?.win
                    ? '1px solid rgba(52, 211, 153, 0.35)'
                    : '1px solid rgba(248, 113, 113, 0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: loading ? '#CBD5E1' : lastResult?.win ? '#34D399' : '#FCA5A5',
                }}
              >
                {loading
                  ? 'ROLLT...'
                  : lastResult?.win
                    ? `GEWINN! +${lastResult.multiplier.toFixed(2)}× AUSZAHLUNG`
                    : isNearMiss
                      ? `KNAPP VERFEHLT (${Math.abs(lastResult!.roll - targetPoint).toFixed(2)})`
                      : lastResult !== null
                        ? `KEIN TREFFER (${lastResult.roll.toFixed(2)})`
                        : 'PLATZIERE DEINEN EINSATZ'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. DER 3D-SCHIEBEREGLER (OVER/UNDER JETZT ERGONOMISCH UNTER DEM SLIDER) ── */}
        <div style={{ position: 'relative', padding: isMobile ? '12px 0 28px' : '16px 0 34px' }}>
          {/* 28px 3D Schienen-Track */}
          <div
            ref={sliderRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{
              height: '28px',
              width: '100%',
              borderRadius: '14px',
              background: '#04070A',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.95), 0 4px 12px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              overflow: 'visible',
              cursor: 'pointer',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {/* Win Zone (Grün) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: isRollOver ? `${targetPoint}%` : 0,
                right: isRollOver ? 0 : `${100 - targetPoint}%`,
                borderRadius: isRollOver ? '0 12px 12px 0' : '12px 0 0 12px',
                background: 'linear-gradient(180deg, #10B981 0%, #047857 100%)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                transition: isDraggingThumb ? 'none' : 'all 0.15s ease',
              }}
            />

            {/* Loss Zone (Rot) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: isRollOver ? 0 : `${targetPoint}%`,
                right: isRollOver ? `${100 - targetPoint}%` : 0,
                borderRadius: isRollOver ? '12px 0 0 12px' : '0 12px 12px 0',
                background: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                transition: isDraggingThumb ? 'none' : 'all 0.15s ease',
              }}
            />

            {/* Gefräste Messing-Skalen-Ticks (0, 10, 25, 50, 75, 90, 100) */}
            {[0, 10, 25, 50, 75, 90, 100].map((tick) => (
              <div
                key={`tick-${tick}`}
                style={{
                  position: 'absolute',
                  left: `${tick}%`,
                  top: '-6px',
                  bottom: '-6px',
                  width: '2px',
                  background: 'rgba(255, 255, 255, 0.35)',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* 3D Gold-Target-Thumb (Cursor) */}
            <div
              style={{
                position: 'absolute',
                left: `${targetPoint}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 30%, #FFFCE0 0%, #FFD700 45%, #8C6510 100%)',
                border: '2.5px solid #FFFFFF',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 215, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <div
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1E1402' }}
              />
            </div>

            {/* Target Value Tooltip Bubble (JETZT SAUBER UNTER DEM SLIDER) */}
            <div
              style={{
                position: 'absolute',
                left: `${targetPoint}%`,
                bottom: '-34px',
                transform: 'translateX(-50%)',
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
                color: '#000000',
                fontSize: '0.74rem',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 22,
              }}
            >
              {isRollOver ? 'OVER' : 'UNDER'} {targetPoint.toFixed(2)}
            </div>

            {/* Result Indicator Pin (Wo das Ergebnis einschlug) */}
            {visualResult !== null && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{
                  position: 'absolute',
                  left: `${visualResult}%`,
                  top: '-12px',
                  bottom: '-12px',
                  width: '4px',
                  borderRadius: '2px',
                  background: lastResult?.win ? '#34D399' : '#F87171',
                  boxShadow: `0 0 15px ${lastResult?.win ? '#34D399' : '#F87171'}`,
                  transform: 'translateX(-50%)',
                  zIndex: 25,
                  pointerEvents: 'none',
                  transition: loading
                    ? 'none'
                    : 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: lastResult?.win ? '#34D399' : '#F87171',
                    border: '1.5px solid #FFFFFF',
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Skalen-Zahlen unten (unter dem Badge platziert) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '42px',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.45)',
              fontFamily: 'var(--font-mono, monospace)',
              userSelect: 'none',
            }}
          >
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* ── 4. DIE 3 SUBTILEN STATISTIK- & TELEMETRIE-KARTEN ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '8px' : '12px',
            marginTop: '4px',
          }}
        >
          {/* Card 1: Multiplier (Subtil) */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              userSelect: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'rgba(212, 175, 55, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                MULTIPLIER
              </span>
              <span
                style={{ fontSize: '0.72rem', color: 'rgba(212, 175, 55, 0.8)', fontWeight: 900 }}
              >
                ×
              </span>
            </div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#F8FAFC',
              }}
            >
              {multiplier.toFixed(2)}x
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {MULTIPLIER_PRESETS.map((preset) => (
                <button
                  key={`mult-${preset}`}
                  type="button"
                  onClick={() => onUpdateFromMultiplier(preset)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: '5px',
                    border:
                      multiplier === preset
                        ? '1px solid rgba(212, 175, 55, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    background:
                      multiplier === preset
                        ? 'rgba(212, 175, 55, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    color: multiplier === preset ? '#FFD700' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Roll Over / Under Target (Subtil) */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              userSelect: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'rgba(212, 175, 55, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {isRollOver ? 'ROLL OVER' : 'ROLL UNDER'}
              </span>
              <button
                type="button"
                onClick={onToggleRollMode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#FFD700',
                  fontSize: '0.64rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={9} />
                <span>SWAP</span>
              </button>
            </div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#F8FAFC',
              }}
            >
              {targetPoint.toFixed(2)}
            </span>
            <div
              style={{
                height: '4px',
                width: '100%',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${targetPoint}%`,
                  background: isRollOver ? '#EF4444' : '#10B981',
                }}
              />
            </div>
          </div>

          {/* Card 3: Win Chance (Subtil) */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              userSelect: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'rgba(212, 175, 55, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                WIN CHANCE
              </span>
              <Percent size={11} color="rgba(212, 175, 55, 0.8)" />
            </div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#F8FAFC',
              }}
            >
              {winChance.toFixed(2)}%
            </span>
            <div
              style={{
                height: '4px',
                width: '100%',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '100%', width: `${winChance}%`, background: '#10B981' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
