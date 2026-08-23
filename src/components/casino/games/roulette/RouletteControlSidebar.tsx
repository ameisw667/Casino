'use client';

import type { Dispatch, SetStateAction } from 'react';
import { RotateCcw, Trash2, Undo2, Zap, ShieldCheck, TrendingUp, Sliders } from 'lucide-react';
import type { BetPlacement } from './types';
import { VIP_CHIPS } from './roulette-config';
import { CasinoJeton } from './CasinoJeton';

interface AutoBetSettings {
  numberOfBets: number;
  stopOnProfit: number;
  stopOnLoss: number;
}

interface SessionStats {
  rounds: number;
  wins: number;
  profit: number;
}

interface RouletteControlSidebarProps {
  isMobile: boolean;
  balance: number;
  selectedChip: number;
  onSelectChip: (amount: number) => void;
  isAutoMode: boolean;
  autoRunning: boolean;
  onSetAutoMode: (v: boolean) => void;
  onAutoRunningToggle: () => void;
  spinning: boolean;
  isProcessing: boolean;
  currentBets: BetPlacement[];
  betHistory: BetPlacement[][];
  totalBetAmount: number;
  maxPotentialWin: number;
  autoBetSettings: AutoBetSettings;
  setAutoBetSettings: Dispatch<SetStateAction<AutoBetSettings>>;
  sessionStats: SessionStats;
  onClearBets: () => void;
  onUndo: () => void;
  onDoubleBets: () => void;
  onSpin: () => void;
}

/**
 * Roulette VIP control sidebar (Manual/Auto mode, chip selector, quick actions,
 * stake/win HUD, auto-pilot config, session stats, dynamic spin button,
 * provably-fair badge). Pure presentational — extracted verbatim from
 * RouletteClient.tsx. All state lives in the parent; interactions are callbacks.
 */
export function RouletteControlSidebar({
  isMobile,
  balance,
  selectedChip,
  onSelectChip,
  isAutoMode,
  autoRunning,
  onSetAutoMode,
  onAutoRunningToggle,
  spinning,
  isProcessing,
  currentBets,
  betHistory,
  totalBetAmount,
  maxPotentialWin,
  autoBetSettings,
  setAutoBetSettings,
  sessionStats,
  onClearBets,
  onUndo,
  onDoubleBets,
  onSpin,
}: RouletteControlSidebarProps) {
  return (
    <div
      className="roulette-left sidebar-left obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        borderRadius: '24px',
        order: isMobile ? 2 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <Zap size={18} color="#FFD700" />
          </div>
          <h3
            style={{
              margin: 0,
              letterSpacing: '1.5px',
              fontSize: '1rem',
              fontWeight: 900,
              color: '#FFF',
            }}
          >
            ROULETTE CONTROLS
          </h3>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#4ade80',
            fontSize: '0.7rem',
            fontWeight: 800,
          }}
        >
          <span>2.7% EDGE</span>
        </div>
      </div>

      {/* Mode Switcher: Manual / Auto Pilot */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '12px',
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
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
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
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
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

      {/* 1. DEEP-TONE HIGH-CONTRAST VIP CASINO JETONS (4x2 Grid) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '1px',
            }}
          >
            SELECT CHIP VALUE
          </label>
          <span
            style={{
              fontSize: '0.75rem',
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
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '12px 10px',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            alignItems: 'center',
            justifyItems: 'center',
          }}
        >
          {VIP_CHIPS.map((chip) => {
            const isSelected = selectedChip === chip.amount;
            return (
              <CasinoJeton
                key={chip.amount}
                amount={chip.amount}
                label={chip.label}
                baseColor={chip.baseColor}
                stripeColor={chip.stripeColor}
                coreBg={chip.coreBg}
                textColor={chip.textColor}
                size={40}
                isSelected={isSelected}
                onClick={() => onSelectChip(chip.amount)}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Action Modifiers (Clear, Undo, Double) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        <button
          className="quick-chip"
          disabled={spinning || isProcessing || currentBets.length === 0}
          onClick={onClearBets}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Trash2 size={12} />
            <span>Clear (C)</span>
          </div>
        </button>
        <button
          className="quick-chip"
          disabled={spinning || isProcessing || betHistory.length === 0}
          onClick={onUndo}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Undo2 size={12} />
            <span>Undo (U)</span>
          </div>
        </button>
        <button
          className="quick-chip"
          disabled={spinning || isProcessing || currentBets.length === 0}
          onClick={onDoubleBets}
          style={{ color: '#FFD700' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={12} />
            <span>2× Bet (S)</span>
          </div>
        </button>
      </div>

      {/* Total Bet & Max Potential Win HUD */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '14px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>TOTAL STAKE</div>
          <div
            style={{
              color: '#FFF',
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '1.1rem',
            }}
          >
            ${totalBetAmount.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>
            MAX POTENTIAL WIN
          </div>
          <div
            style={{
              color: '#4ade80',
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '1.1rem',
            }}
          >
            ${maxPotentialWin.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Auto Mode Config Section */}
      {isAutoMode && (
        <div
          style={{
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} color="#94a3b8" />
            <label
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              AUTO PILOT CONFIG
            </label>
          </div>
          <div>
            <label
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                fontWeight: 700,
                display: 'block',
                marginBottom: '4px',
              }}
            >
              NUMBER OF SPINS (0 = ∞)
            </label>
            <input
              type="number"
              disabled={autoRunning}
              value={autoBetSettings.numberOfBets}
              onChange={(e) =>
                setAutoBetSettings((prev) => ({
                  ...prev,
                  numberOfBets: Number(e.target.value),
                }))
              }
              style={{
                width: '100%',
                height: '36px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#FFF',
                padding: '0 10px',
                fontSize: '0.9rem',
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
          padding: '14px',
          borderRadius: '14px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <TrendingUp size={14} color="#94a3b8" />
          <label
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '1px',
            }}
          >
            SESSION PERFORMANCE
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700 }}>
              ROUNDS / WIN RATE
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontWeight: 800,
                color: '#FFF',
                fontSize: '0.85rem',
              }}
            >
              {sessionStats.rounds}{' '}
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                (
                {sessionStats.rounds > 0
                  ? `${((sessionStats.wins / sessionStats.rounds) * 100).toFixed(0)}%`
                  : '—'}
                )
              </span>
            </div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700 }}>NET PROFIT</div>
            <div
              style={{
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: sessionStats.profit >= 0 ? '#4ade80' : '#f87171',
              }}
            >
              {sessionStats.profit >= 0 ? '+' : ''}${sessionStats.profit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Spin Button */}
      <button
        key="roulette-spin-btn"
        className={currentBets.length > 0 ? 'gold-btn' : 'gold-btn-inactive'}
        style={{
          width: '100%',
          height: isMobile ? '60px' : '68px',
          fontSize: '1.2rem',
          borderRadius: '18px',
          cursor: spinning || isProcessing ? 'not-allowed' : 'pointer',
          opacity: spinning || isProcessing ? 0.6 : 1,
        }}
        onClick={() => {
          if (isAutoMode) {
            onAutoRunningToggle();
          } else {
            onSpin();
          }
        }}
        disabled={spinning || isProcessing}
      >
        {spinning || isProcessing
          ? 'SPINNING...'
          : isAutoMode
            ? autoRunning
              ? 'STOP AUTOBET'
              : 'START AUTOBET'
            : currentBets.length > 0
              ? `SPIN WHEEL ($${totalBetAmount.toFixed(2)})`
              : 'PLACE BETS ON TABLE'}
      </button>

      {/* Provably Fair Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '0.7rem',
          fontWeight: 700,
        }}
      >
        <ShieldCheck size={14} color="#D4AF37" />
        <span>PROVABLY FAIR SYSTEM ACTIVE</span>
      </div>
    </div>
  );
}
