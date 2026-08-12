'use client';

import React from 'react';
import { soundManager } from '@/lib/casino/sound-manager';

export interface VibeSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  soundEnabled?: boolean;
  label?: string;
}

/**
 * Standardized Casino Royale VibeSlider Component.
 * Approved Standard (Initiative 7.4) — Obsidian Gold Dual-Stat VIP Slider.
 *
 * Features:
 * - Solid Champagne Gold active track fill (#e5c158)
 * - Integer percentage display without useless .00 trailing decimals (e.g. 50%)
 * - Dual Stat Panel: CHANCE (%) and MULTIPLIER (x)
 * - Interaktive Milestone-Buttons (1%, 25%, 50%, 75%, 98%)
 * - Custom metallic thumb handle with active gold ring
 * - Tactile audio tick feedback via soundManager.play('chip')
 * - Zero fuzzy AI glows
 */
export function VibeSlider({
  value,
  min = 1,
  max = 98,
  step = 1,
  onChange,
  disabled = false,
  className = '',
  soundEnabled = true,
  label = 'GEWINNCHANCE',
}: VibeSliderProps) {
  const safeValue = Math.round(Math.min(max, Math.max(min, value)));
  const multiplier = (98 / Math.max(1, safeValue)).toFixed(2);
  const percentage = ((safeValue - min) / (max - min)) * 100;

  const handleChange = (newVal: number) => {
    if (disabled) return;
    const clamped = Math.round(Math.min(max, Math.max(min, newVal)));
    if (soundEnabled && Math.abs(clamped - safeValue) >= 2) {
      soundManager.play('chip');
    }
    onChange(clamped);
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Dual Stat Header Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div
          style={{
            padding: '10px 14px',
            background: '#0b0f18',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </span>
          <strong
            style={{
              fontSize: '1.1rem',
              color: '#e5c158',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
            }}
          >
            {safeValue}%
          </strong>
        </div>

        <div
          style={{
            padding: '10px 14px',
            background: '#0b0f18',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            MULTIPLIER
          </span>
          <strong
            style={{
              fontSize: '1.1rem',
              color: '#e5c158',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
            }}
          >
            {multiplier}×
          </strong>
        </div>
      </div>

      {/* Custom Slider Track Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background Track */}
        <div
          style={{
            width: '100%',
            height: '10px',
            background: '#0b0f18',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '9999px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Active Fill Track */}
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: '#e5c158',
              borderRadius: '9999px',
              transition: 'width 0.05s ease',
            }}
          />
        </div>

        {/* Range Input Trigger Overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          disabled={disabled}
          onChange={(e) => handleChange(parseInt(e.target.value) || min)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            zIndex: 10,
          }}
        />

        {/* Custom Metallic Thumb Handle */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 14px)`,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#141108',
            border: '2px solid #e5c158',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e5c158' }}
          />
        </div>
      </div>

      {/* Milestone Quick Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          textAlign: 'center',
          gap: '4px',
        }}
      >
        {[1, 25, 50, 75, 98].map((pct) => (
          <button
            key={pct}
            type="button"
            disabled={disabled}
            onClick={() => handleChange(pct)}
            style={{
              padding: '6px 0',
              background: safeValue === pct ? 'rgba(212, 175, 55, 0.2)' : '#0b0f18',
              border:
                safeValue === pct
                  ? '1px solid rgba(212, 175, 55, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              color: safeValue === pct ? '#e5c158' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono), monospace',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {pct}%
          </button>
        ))}
      </div>
    </div>
  );
}

export default VibeSlider;
