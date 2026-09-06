'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { DiceRollHistory } from './HistoryTopRow';

interface OddsSliderProps {
  sliderRef: React.RefObject<HTMLDivElement | null>;
  isRollOver: boolean;
  targetPoint: number;
  lastResult: DiceRollHistory | null;
  onMouseDown: (e: React.MouseEvent) => void;
}

const SCALE_TICKS = [0, 10, 25, 50, 75, 90, 100];

export function OddsSlider({
  sliderRef,
  isRollOver,
  targetPoint,
  lastResult,
  onMouseDown,
}: OddsSliderProps) {
  return (
    <div style={{ position: 'relative', padding: '16px 0 34px' }}>
      {/* 28px 3D Schienen-Track */}
      <div
        ref={sliderRef}
        onMouseDown={onMouseDown}
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
          }}
        />

        {/* Gefräste Messing-Skalen-Ticks (0, 10, 25, 50, 75, 90, 100) */}
        {SCALE_TICKS.map((tick) => (
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
            background: 'radial-gradient(circle at 35% 30%, #FFFCE0 0%, #FFD700 45%, #8C6510 100%)',
            border: '2.5px solid #FFFFFF',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 215, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#1E1402',
            }}
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
        {lastResult && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            style={{
              position: 'absolute',
              left: `${lastResult.roll}%`,
              top: '-12px',
              bottom: '-12px',
              width: '4px',
              borderRadius: '2px',
              background: lastResult.win ? '#34D399' : '#F87171',
              boxShadow: `0 0 15px ${lastResult.win ? '#34D399' : '#F87171'}`,
              transform: 'translateX(-50%)',
              zIndex: 25,
              pointerEvents: 'none',
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
                background: lastResult.win ? '#34D399' : '#F87171',
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
  );
}
