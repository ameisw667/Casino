'use client';

import type { Dispatch, SetStateAction } from 'react';
import { RotateCcw, Zap, ShieldCheck, TrendingUp, Sliders } from 'lucide-react';

import { CasinoJeton } from '@/components/casino/games/slots/CasinoJeton';
import type { AutoBetSettings, SessionStats } from '@/components/casino/games/slots/slots-config';
import { VIP_CHIPS } from '@/components/casino/games/slots/slots-config';

interface SlotsControlSidebarProps {
  balance: number;
  betAmount: number;
  onBetAmountChange: Dispatch<SetStateAction<number>>;
  betMin: number;
  betMax: number;
  isAutoMode: boolean;
  onSetAutoMode: (mode: boolean) => void;
  autoRunning: boolean;
  onAutoRunningToggle: () => void;
  isSpinning: boolean;
  isProcessing: boolean;
  maxPotentialWin: number;
  autoBetSettings: AutoBetSettings;
  onAutoBetSettingsChange: Dispatch<SetStateAction<AutoBetSettings>>;
  sessionStats: SessionStats;
  onSpin: () => void;
}

export function SlotsControlSidebar({
  balance,
  betAmount,
  onBetAmountChange,
  betMin,
  betMax,
  isAutoMode,
  onSetAutoMode,
  autoRunning,
  onAutoRunningToggle,
  isSpinning,
  isProcessing,
  maxPotentialWin,
  autoBetSettings,
  onAutoBetSettingsChange,
  sessionStats,
  onSpin,
}: SlotsControlSidebarProps) {
  return (
    <div
      className="slots-left-controls obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '18px',
        borderRadius: '24px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              <Zap size={16} color="#FFD700" />
            </div>
            <h3
              style={{
                margin: 0,
                letterSpacing: '1px',
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#FFF',
              }}
            >
              SLOTS CONTROLS
            </h3>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#4ade80',
              fontSize: '0.68rem',
              fontWeight: 800,
            }}
          >
            <span>96.5% RTP</span>
          </div>
        </div>

        {/* Mode Switcher: Manual / Auto Pilot */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            onClick={() => {
              if (!autoRunning) onSetAutoMode(false);
            }}
            disabled={autoRunning}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: !isAutoMode
                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                : 'transparent',
              color: !isAutoMode ? '#FFD700' : '#64748b',
              border: !isAutoMode ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
              cursor: autoRunning ? 'not-allowed' : 'pointer',
            }}
          >
            Manual
          </button>
          <button
            onClick={() => {
              if (!autoRunning) onSetAutoMode(true);
            }}
            disabled={autoRunning}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: isAutoMode
                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                : 'transparent',
              color: isAutoMode ? '#FFD700' : '#64748b',
              border: isAutoMode ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
              cursor: autoRunning ? 'not-allowed' : 'pointer',
            }}
          >
            Auto Pilot
          </button>
        </div>

        {/* Bet Amount Input & Quick Modifiers */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '0.5px',
              }}
            >
              BET AMOUNT
            </label>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#FFD700',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              ${balance.toFixed(2)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              padding: '3px 8px',
              marginBottom: '6px',
            }}
          >
            <span style={{ color: '#D4AF37', fontWeight: 900, marginRight: '4px' }}>$</span>
            <input
              type="number"
              disabled={isSpinning || autoRunning}
              value={betAmount}
              onChange={(e) =>
                onBetAmountChange(
                  Math.min(betMax, Math.max(betMin, parseFloat(e.target.value) || betMin)),
                )
              }
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Quick Modifiers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
            <button
              className="quick-mod-btn"
              disabled={isSpinning || autoRunning}
              onClick={() =>
                onBetAmountChange((v) => Math.max(betMin, parseFloat((v / 2).toFixed(2))))
              }
            >
              ½ (A)
            </button>
            <button
              className="quick-mod-btn"
              disabled={isSpinning || autoRunning}
              onClick={() =>
                onBetAmountChange((v) => Math.min(betMax, parseFloat((v * 2).toFixed(2))))
              }
            >
              2× (S)
            </button>
            <button
              className="quick-mod-btn"
              disabled={isSpinning || autoRunning}
              onClick={() => onBetAmountChange(betMin)}
            >
              Min (D)
            </button>
            <button
              className="quick-mod-btn"
              disabled={isSpinning || autoRunning}
              onClick={() => onBetAmountChange(Math.min(betMax, balance))}
            >
              Max (F)
            </button>
          </div>
        </div>

        {/* 4x2 VIP Chips */}
        <div>
          <label
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.5px',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            VIP JETONS
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.45)',
              padding: '10px 8px',
              borderRadius: '14px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              justifyItems: 'center',
            }}
          >
            {VIP_CHIPS.map((chip) => {
              const isSelected = betAmount === chip.amount;
              return (
                <CasinoJeton
                  key={chip.amount}
                  label={chip.label}
                  baseColor={chip.baseColor}
                  stripeColor={chip.stripeColor}
                  coreBg={chip.coreBg}
                  textColor={chip.textColor}
                  size={38}
                  isSelected={isSelected}
                  onClick={() => onBetAmountChange(chip.amount)}
                />
              );
            })}
          </div>
        </div>

        {/* Stake & Max Win HUD */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>STAKE</div>
            <div
              style={{
                color: '#FFF',
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: '0.98rem',
              }}
            >
              ${betAmount.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
              MAX WIN (75× ZEUS)
            </div>
            <div
              style={{
                color: '#4ade80',
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: '0.98rem',
              }}
            >
              ${maxPotentialWin.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Auto Mode Config */}
        {isAutoMode && (
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={13} color="#94a3b8" />
              <label
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '0.5px',
                }}
              >
                AUTO PILOT LIMITS
              </label>
            </div>
            <div>
              <label
                style={{
                  fontSize: '0.62rem',
                  color: '#64748b',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '3px',
                }}
              >
                NUMBER OF SPINS (0 = ∞)
              </label>
              <input
                type="number"
                disabled={autoRunning}
                value={autoBetSettings.numberOfBets}
                onChange={(e) =>
                  onAutoBetSettingsChange((prev) => ({
                    ...prev,
                    numberOfBets: Number(e.target.value),
                  }))
                }
                style={{
                  width: '100%',
                  height: '32px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '0 8px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
                placeholder="∞"
              />
            </div>
          </div>
        )}

        {/* Session Performance Card */}
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
            <TrendingUp size={13} color="#94a3b8" />
            <label
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '0.5px',
              }}
            >
              SESSION PERFORMANCE
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 700 }}>
                SPINS / WIN RATE
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  color: '#FFF',
                  fontSize: '0.82rem',
                }}
              >
                {sessionStats.rounds}{' '}
                <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  (
                  {sessionStats.rounds > 0
                    ? `${((sessionStats.wins / sessionStats.rounds) * 100).toFixed(0)}%`
                    : '—'}
                  )
                </span>
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 700 }}>
                NET PROFIT
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: sessionStats.profit >= 0 ? '#4ade80' : '#f87171',
                }}
              >
                {sessionStats.profit >= 0 ? '+' : ''}${sessionStats.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Spin Action Button */}
        <button
          key="slots-spin-btn"
          className="gold-btn"
          style={{
            width: '100%',
            height: '58px',
            fontSize: '1.1rem',
            borderRadius: '16px',
            cursor: isSpinning || isProcessing ? 'not-allowed' : 'pointer',
            opacity: isSpinning || isProcessing ? 0.7 : 1,
          }}
          onClick={() => {
            if (isAutoMode) {
              onAutoRunningToggle();
            } else {
              onSpin();
            }
          }}
          disabled={isSpinning || isProcessing}
        >
          {isSpinning || isProcessing ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <RotateCcw size={20} className="animate-spin" />
              <span>SPINNING...</span>
            </div>
          ) : isAutoMode ? (
            autoRunning ? (
              'STOP AUTOBET'
            ) : (
              'START AUTOBET'
            )
          ) : (
            `SPIN SLOTS ($${betAmount.toFixed(2)})`
          )}
        </button>

        {/* Provably Fair Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.68rem',
            fontWeight: 700,
          }}
        >
          <ShieldCheck size={13} color="#D4AF37" />
          <span>PROVABLY FAIR SYSTEM ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
