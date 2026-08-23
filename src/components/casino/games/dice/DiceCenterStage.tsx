'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  RotateCcw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';

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
  onUpdateFromWinChance,
  onUpdateFromMultiplier,
  onUpdateFromTarget,
  onToggleRollMode,
}: DiceCenterStageProps) {
  return (
    <div
      className="dice-main game-area obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
        padding: isMobile ? '16px' : '28px',
        borderRadius: '28px',
        order: isMobile ? 1 : 2,
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, #101018 0%, #06060a 100%)',
      }}
    >
      {/* Subtle Isometric Geometric Grid Line Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.05,
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Victory Radial Glow Flash on Win */}
      {lastResult?.win && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Top Bar: Win Streak & 3. LEVER 3: INTERACTIVE HISTORY PILLS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {winStreak >= 2 ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 215, 0, 0.15)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#FFD700',
              fontSize: '0.75rem',
              fontWeight: 900,
            }}
          >
            <Flame size={14} color="#FFD700" />
            <span>{winStreak}× WIN STREAK</span>
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800 }}>ROLL HISTORY</div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            maxWidth: '70%',
          }}
        >
          {history.map((h) => (
            <div
              key={h.id}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                flexShrink: 0,
                fontFamily: 'monospace',
                color: h.win ? (h.multiplier >= 10 ? '#FFD700' : '#4ade80') : '#f87171',
                background: h.win
                  ? h.multiplier >= 10
                    ? 'rgba(255, 215, 0, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${
                  h.win
                    ? h.multiplier >= 10
                      ? 'rgba(255, 215, 0, 0.5)'
                      : 'rgba(16, 185, 129, 0.35)'
                    : 'rgba(239, 68, 68, 0.25)'
                }`,
              }}
            >
              {h.roll.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      {/* 2. LEVER 2: DIGITAL ODOMETER & CENTRAL RESULT DISPLAY */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '160px' : '220px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {displayTicker !== null || lastResult !== null ? (
          <motion.div
            key={lastResult?.id || 'ticker'}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: isMobile ? '5.5rem' : 'min(9.5rem, 18vw)',
              fontWeight: 900,
              color: loading ? '#FFFDF0' : lastResult?.win ? '#4ade80' : '#ef4444',
              textShadow: loading
                ? '0 0 35px rgba(255, 255, 255, 0.5)'
                : lastResult?.win
                  ? '0 0 50px rgba(74, 222, 128, 0.7)'
                  : '0 0 50px rgba(239, 68, 68, 0.7)',
              fontFamily: 'monospace',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {(displayTicker !== null ? displayTicker : lastResult?.roll || 50.0).toFixed(2)}
          </motion.div>
        ) : (
          <div
            className="pulse-glow"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'rgba(212, 175, 55, 0.7)',
            }}
          >
            <Sparkles size={36} color="#FFD700" />
            <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '3px' }}>
              SET YOUR TARGET & ROLL
            </span>
          </div>
        )}
      </div>

      {/* 1. LEVER 1: 24PX LUXURY-SLIDER WITH DYNAMIC GOLD TARGET-THUMB & TOOLTIP */}
      <div
        ref={sliderRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          position: 'relative',
          padding: '30px 0',
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10,
        }}
      >
        {/* 24px Rounded Track */}
        <div
          style={{
            height: '24px',
            width: '100%',
            background: '#0a0a0f',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Green Win Zone */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: isRollOver ? `${targetPoint}%` : 0,
              right: isRollOver ? 0 : `${100 - targetPoint}%`,
              background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
              transition: isDraggingThumb ? 'none' : 'all 0.15s ease',
            }}
          />

          {/* Red Loss Zone */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: isRollOver ? 0 : `${targetPoint}%`,
              right: isRollOver ? `${100 - targetPoint}%` : 0,
              background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
              transition: isDraggingThumb ? 'none' : 'all 0.15s ease',
            }}
          />
        </div>

        {/* Dynamic Result Marker Pin */}
        {visualResult !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${visualResult}%`,
              top: '42px',
              transform: 'translate(-50%, -50%)',
              width: '6px',
              height: '42px',
              zIndex: 25,
              pointerEvents: 'none',
              transition: loading ? 'none' : 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `10px solid ${lastResult?.win ? '#4ade80' : '#ef4444'}`,
                filter: `drop-shadow(0 0 8px ${lastResult?.win ? 'rgba(74, 222, 128, 0.8)' : 'rgba(239, 68, 68, 0.8)'})`,
              }}
            />
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '3px',
                background: lastResult?.win ? '#4ade80' : '#ef4444',
                boxShadow: `0 0 16px ${lastResult?.win ? 'rgba(74, 222, 128, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
              }}
            />
          </div>
        )}

        {/* 24k Gold Precision Slider Thumb */}
        <div
          style={{
            position: 'absolute',
            top: '42px',
            left: `${targetPoint}%`,
            transform: 'translate(-50%, -50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 45%, #AA820A 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.5)',
            border: '3px solid #14141a',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
            transition: isDraggingThumb ? 'none' : 'left 0.15s ease',
          }}
        >
          {/* Floating Target Tooltip */}
          <div
            style={{
              position: 'absolute',
              top: '-42px',
              left: '50%',
              transform: isMobile
                ? targetPoint < 12
                  ? 'translateX(0)'
                  : targetPoint > 88
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)'
                : 'translateX(-50%)',
              background: 'rgba(14, 14, 20, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              padding: '4px 10px',
              borderRadius: '10px',
              color: '#FFD700',
              fontSize: '0.75rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              maxWidth: isMobile ? '92px' : 'none',
              overflow: isMobile ? 'hidden' : 'visible',
              textOverflow: isMobile ? 'ellipsis' : 'clip',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
            }}
          >
            {isRollOver ? `OVER ${targetPoint.toFixed(2)}` : `UNDER ${targetPoint.toFixed(2)}`}
          </div>

          {/* Thumb Center Grip Needle */}
          <div
            style={{
              width: '4px',
              height: '20px',
              borderRadius: '2px',
              background: '#0a0a0f',
            }}
          />
        </div>

        {/* Slider Scale Ticks */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            color: '#64748b',
            fontSize: '0.8rem',
            fontWeight: 800,
            fontFamily: 'monospace',
          }}
        >
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* 5. LEVER 5: 3-SÄULEN-HUD MIT OVER/UNDER-TOGGLE & QUICK MULTIPLIER CHIPS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '10px' : '16px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Column 1: Multiplier Input + Quick Presets */}
        <div className="hud-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="#FFD700" />
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                MULTIPLIER
              </label>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#FFD700',
                fontWeight: 900,
                fontFamily: 'monospace',
              }}
            >
              ×
            </span>
          </div>
          <input
            type="number"
            step="0.1"
            min="1.0102"
            max="9900"
            value={multiplier}
            onChange={(e) => onUpdateFromMultiplier(parseFloat(e.target.value))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '1.35rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              outline: 'none',
              width: '100%',
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(5, minmax(0, 1fr))' : 'repeat(5, 1fr)',
              gap: isMobile ? '3px' : '4px',
              marginTop: '4px',
            }}
          >
            {MULTIPLIER_PRESETS.map((m) => (
              <button
                key={m}
                className="quick-chip"
                style={{
                  background:
                    multiplier === m ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.04)',
                  border:
                    multiplier === m
                      ? '1px solid rgba(212, 175, 55, 0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                  color: multiplier === m ? '#FFD700' : '#cbd5e1',
                  fontSize: isMobile ? '0.6rem' : undefined,
                  padding: isMobile ? '0 2px' : undefined,
                }}
                onClick={() => onUpdateFromMultiplier(m)}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Roll Target with Animated Over/Under Switch */}
        <div className="hud-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isRollOver ? (
                <ArrowUpRight size={14} color="#4ade80" />
              ) : (
                <ArrowDownRight size={14} color="#f87171" />
              )}
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                {isRollOver ? 'ROLL OVER' : 'ROLL UNDER'}
              </label>
            </div>
            <button
              onClick={onToggleRollMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                padding: '2px 8px',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>SWAP (T)</span>
            </button>
          </div>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="99.99"
            value={targetPoint}
            onChange={(e) => onUpdateFromTarget(parseFloat(e.target.value))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '1.35rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              outline: 'none',
              width: '100%',
            }}
          />
          <div
            style={{
              height: '6px',
              width: '100%',
              borderRadius: '3px',
              overflow: 'hidden',
              display: 'flex',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                width: `${targetPoint}%`,
                background: isRollOver ? '#ef4444' : '#10b981',
              }}
            />
            <div
              style={{
                width: `${100 - targetPoint}%`,
                background: isRollOver ? '#10b981' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Column 3: Win Chance Input */}
        <div className="hud-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={14} color="#4ade80" />
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                WIN CHANCE
              </label>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#4ade80',
                fontWeight: 900,
                fontFamily: 'monospace',
              }}
            >
              %
            </span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="98.99"
            value={winChance}
            onChange={(e) => onUpdateFromWinChance(parseFloat(e.target.value))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '1.35rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              outline: 'none',
              width: '100%',
            }}
          />
          <div
            style={{
              height: '6px',
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${winChance}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                borderRadius: '3px',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
