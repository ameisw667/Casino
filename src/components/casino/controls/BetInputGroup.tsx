'use client';

import React from 'react';
import { Wallet, X } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

export interface BetInputGroupProps {
  value: number;
  onChange: (value: number) => void;
  balance: number;
  minBet?: number;
  maxBet?: number;
  disabled?: boolean;
  className?: string;
  soundEnabled?: boolean;
  label?: string;
}

/**
 * Standardized Casino Royale BetInputGroup Component.
 * Approved Standard (Initiative 7.2) — Seamless Single-Box & Stacked Preset Bar.
 *
 * Features:
 * - Solid obsidian dark background (#0b0f18)
 * - Muted champagne gold border (rgba(212, 175, 55, 0.25))
 * - Integrated Wallet balance badge with quick MAX fill
 * - Monospace input typography to prevent layout jitter
 * - Round2 float precision helper to prevent NaN and floating point bugs
 * - Full-width 4-button quick preset bar (MIN, 1/2, 2x, MAX)
 * - Tactile chip sound feedback via soundManager
 */
export function BetInputGroup({
  value,
  onChange,
  balance,
  minBet = 0.1,
  maxBet = 10000.0,
  disabled = false,
  className = '',
  soundEnabled = true,
  label = 'WETTEINSATZ',
}: BetInputGroupProps) {
  const round2 = (val: number) => Math.round(val * 100) / 100;

  const updateValue = (newVal: number) => {
    if (disabled) return;
    const clamped = Math.min(balance, Math.min(maxBet, Math.max(minBet, round2(newVal))));
    if (soundEnabled) {
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
        gap: '8px',
        width: '100%',
        boxSizing: 'border-box',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Seamless Single-Box Input Container */}
      <div
        style={{
          background: '#0b0f18',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '14px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Top Header Row inside Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#e5c158',
              fontFamily: 'var(--font-mono), monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>

          <button
            type="button"
            onClick={() => updateValue(balance)}
            disabled={disabled}
            title="Klick für Maximalwette (MAX)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono), monospace',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: 0,
            }}
          >
            <Wallet size={12} style={{ color: '#34d399' }} />
            <span>Guthaben:</span>
            <strong style={{ color: '#34d399' }}>${balance.toFixed(2)}</strong>
          </button>
        </div>

        {/* Input Value Row inside Box */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              color: '#e5c158',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
              fontSize: '1.2rem',
              marginRight: '6px',
            }}
          >
            $
          </span>
          <input
            type="number"
            value={value}
            disabled={disabled}
            onChange={(e) => updateValue(parseFloat(e.target.value) || 0)}
            style={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 800,
              fontSize: '1.2rem',
              padding: '2px 0',
              outline: 'none',
            }}
          />
          {value > 0 && !disabled && (
            <button
              type="button"
              onClick={() => updateValue(minBet)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Bottom Preset Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        <button
          type="button"
          onClick={() => updateValue(minBet)}
          disabled={disabled}
          style={{
            padding: '8px 0',
            background: '#131a26',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono), monospace',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          MIN
        </button>
        <button
          type="button"
          onClick={() => updateValue(value / 2)}
          disabled={disabled}
          style={{
            padding: '8px 0',
            background: '#131a26',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono), monospace',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          ½
        </button>
        <button
          type="button"
          onClick={() => updateValue(value * 2)}
          disabled={disabled}
          style={{
            padding: '8px 0',
            background: '#131a26',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono), monospace',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          2×
        </button>
        <button
          type="button"
          onClick={() => updateValue(balance)}
          disabled={disabled}
          style={{
            padding: '8px 0',
            background: 'rgba(212, 175, 55, 0.16)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '8px',
            color: '#e5c158',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono), monospace',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
}

export default BetInputGroup;
