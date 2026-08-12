'use client';

import React from 'react';
import { DollarSign, ShieldAlert, Infinity as InfinityIcon, Play, Square } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { GameActionButton } from './GameActionButton';

export interface AutoBetConfig {
  numberOfBets: number; // 0 = unlimited (Infinity)
  onWinIncrease: number; // % to increase on win (0 = reset to base)
  onLossIncrease: number; // % to increase on loss (e.g. 100 = double)
  stopProfit: number;
  stopLoss: number;
}

export interface AutoBetDrawerProps {
  config: AutoBetConfig;
  onChange: (config: AutoBetConfig) => void;
  isAutoRunning: boolean;
  onStartAuto: () => void;
  onStopAuto: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Standardized Casino Royale AutoBetDrawer Component.
 * Approved Standard (Initiative 7.5) — 2026 VIP Auto-Bet Configuration Drawer.
 *
 * Features:
 * - Number of bets selection (Infinity, 10, 50, 100)
 * - On Win & On Loss strategy triggers (Reset vs Increase by %)
 * - Stop Profit and Stop Loss safety limits
 * - Harmonized with Obsidian Gold design system
 */
export function AutoBetDrawer({
  config,
  onChange,
  isAutoRunning,
  onStartAuto,
  onStopAuto,
  disabled = false,
  className = '',
}: AutoBetDrawerProps) {
  const updateField = <K extends keyof AutoBetConfig>(field: K, val: AutoBetConfig[K]) => {
    if (disabled || isAutoRunning) return;
    soundManager.play('chip');
    onChange({ ...config, [field]: val });
  };

  return (
    <div
      className={className}
      style={{
        background: '#090d15',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        boxSizing: 'border-box',
        width: '100%',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Drawer Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#e5c158',
            fontFamily: 'var(--font-mono), monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          AUTO-WETT KONFIGURATION
        </span>
        <span
          style={{
            padding: '2px 8px',
            background: isAutoRunning ? 'rgba(239, 68, 68, 0.15)' : '#121826',
            border: isAutoRunning
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            color: isAutoRunning ? '#f87171' : '#94a3b8',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono), monospace',
            fontWeight: 800,
          }}
        >
          {isAutoRunning ? 'RUNNING' : 'STANDBY'}
        </span>
      </div>

      {/* 1. Number of Bets Preset Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontFamily: 'var(--font-mono), monospace',
            fontWeight: 700,
          }}
        >
          ANZAHL DER WETTEN
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { label: '∞', val: 0 },
            { label: '10', val: 10 },
            { label: '50', val: 50 },
            { label: '100', val: 100 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              disabled={disabled || isAutoRunning}
              onClick={() => updateField('numberOfBets', preset.val)}
              style={{
                padding: '8px 0',
                background:
                  config.numberOfBets === preset.val ? 'rgba(212, 175, 55, 0.2)' : '#0b0f18',
                border:
                  config.numberOfBets === preset.val
                    ? '1px solid rgba(212, 175, 55, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                color: config.numberOfBets === preset.val ? '#e5c158' : '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono), monospace',
                cursor: disabled || isAutoRunning ? 'not-allowed' : 'pointer',
              }}
            >
              {preset.label === '∞' ? (
                <InfinityIcon size={14} style={{ margin: '0 auto' }} />
              ) : (
                preset.label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. On Win / On Loss Strategy Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* On Win */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: '0.68rem',
              color: '#34d399',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            BEI GEWINN
          </label>
          <div
            style={{
              display: 'flex',
              background: '#0b0f18',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
              padding: '4px 8px',
            }}
          >
            <span
              style={{
                color: '#34d399',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              +
            </span>
            <input
              type="number"
              value={config.onWinIncrease}
              disabled={disabled || isAutoRunning}
              onChange={(e) =>
                updateField('onWinIncrease', Math.max(0, parseFloat(e.target.value) || 0))
              }
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
                outline: 'none',
                padding: '4px',
              }}
            />
            <span
              style={{
                color: '#94a3b8',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.75rem',
              }}
            >
              %
            </span>
          </div>
        </div>

        {/* On Loss */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: '0.68rem',
              color: '#f87171',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            BEI VERLUST
          </label>
          <div
            style={{
              display: 'flex',
              background: '#0b0f18',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '4px 8px',
            }}
          >
            <span
              style={{
                color: '#f87171',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              +
            </span>
            <input
              type="number"
              value={config.onLossIncrease}
              disabled={disabled || isAutoRunning}
              onChange={(e) =>
                updateField('onLossIncrease', Math.max(0, parseFloat(e.target.value) || 0))
              }
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
                outline: 'none',
                padding: '4px',
              }}
            />
            <span
              style={{
                color: '#94a3b8',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.75rem',
              }}
            >
              %
            </span>
          </div>
        </div>
      </div>

      {/* 3. Stop Profit / Stop Loss Limits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Stop Profit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: '0.68rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            STOP-GEWINN LIMIT
          </label>
          <div
            style={{
              display: 'flex',
              background: '#0b0f18',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '4px 8px',
            }}
          >
            <span
              style={{
                color: '#e5c158',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
              }}
            >
              $
            </span>
            <input
              type="number"
              value={config.stopProfit}
              disabled={disabled || isAutoRunning}
              onChange={(e) =>
                updateField('stopProfit', Math.max(0, parseFloat(e.target.value) || 0))
              }
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
                outline: 'none',
                padding: '4px',
              }}
            />
          </div>
        </div>

        {/* Stop Loss */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: '0.68rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            STOP-VERLUST LIMIT
          </label>
          <div
            style={{
              display: 'flex',
              background: '#0b0f18',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '4px 8px',
            }}
          >
            <span
              style={{
                color: '#e5c158',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
              }}
            >
              $
            </span>
            <input
              type="number"
              value={config.stopLoss}
              disabled={disabled || isAutoRunning}
              onChange={(e) =>
                updateField('stopLoss', Math.max(0, parseFloat(e.target.value) || 0))
              }
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 800,
                outline: 'none',
                padding: '4px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Start/Stop Auto Action CTA */}
      <GameActionButton
        label={isAutoRunning ? 'STOP AUTO BET' : 'START AUTO BET'}
        disabled={disabled}
        onClick={isAutoRunning ? onStopAuto : onStartAuto}
      />
    </div>
  );
}

export default AutoBetDrawer;
