'use client';

import { Zap, Sliders, TrendingUp, ShieldCheck } from 'lucide-react';

import {
  QUICK_BET_AMOUNTS,
  type DiceAutoBetSettings,
  type SessionStats,
} from '@/components/casino/games/dice/dice-config';
import { GameCoPilotHud } from '@/components/casino/hud/GameCoPilotHud';

interface DiceControlSidebarProps {
  isMobile: boolean;
  balance: number;
  betAmount: number;
  targetPoint?: number;
  isRollOver?: boolean;
  onBetAmountChange: (val: number) => void;
  isAutoMode: boolean;
  onSetAutoMode: (mode: boolean) => void;
  autoRunning: boolean;
  loading: boolean;
  isProcessing: boolean;
  profitOnWin: number;
  multiplier: number;
  autoBetSettings: DiceAutoBetSettings;
  onAutoBetSettingsChange: (patch: Partial<DiceAutoBetSettings>) => void;
  sessionStats: SessionStats;
  onQuickBet: (amt: number) => void;
  onPrimaryAction: () => void;
}

export function DiceControlSidebar({
  isMobile,
  balance,
  betAmount,
  targetPoint,
  isRollOver,
  onBetAmountChange,
  isAutoMode,
  onSetAutoMode,
  autoRunning,
  loading,
  isProcessing,
  profitOnWin,
  multiplier,
  autoBetSettings,
  onAutoBetSettingsChange,
  sessionStats,
  onQuickBet,
  onPrimaryAction,
}: DiceControlSidebarProps) {
  return (
    <div
      className="dice-sidebar sidebar-left obsidian-glass"
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
            DICE CONTROLS
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
          <span>1% EDGE</span>
        </div>
      </div>

      {/* Live Co-Pilot Smart HUD (Embedded into Dice Controls) */}
      <GameCoPilotHud
        context={{
          gameType: 'DICE',
          diceState: {
            target: targetPoint ?? 50.5,
            isOver: isRollOver ?? true,
          },
        }}
        isFloating={false}
      />

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
            transition: 'all 0.15s ease',
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
            transition: 'all 0.15s ease',
          }}
        >
          Auto Pilot
        </button>
      </div>

      {/* Bet Amount Input & Quick Chips */}
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
            BET AMOUNT
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

        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <input
            type="number"
            disabled={loading || autoRunning}
            value={betAmount}
            style={{
              width: '100%',
              height: '48px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '12px',
              padding: '0 16px',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#FFF',
              fontFamily: 'monospace',
              outline: 'none',
            }}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              onBetAmountChange(val);
            }}
          />
        </div>

        {/* Quick Bet Preset Chips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px',
            marginBottom: '6px',
          }}
        >
          {QUICK_BET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              className="quick-chip"
              disabled={loading || autoRunning}
              onClick={() => onQuickBet(amt)}
            >
              ${amt}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <button
            className="quick-chip"
            disabled={loading || autoRunning}
            onClick={() => onQuickBet(betAmount / 2)}
          >
            ½ Bet (A)
          </button>
          <button
            className="quick-chip"
            disabled={loading || autoRunning}
            onClick={() => onQuickBet(betAmount * 2)}
          >
            2× Bet (S)
          </button>
          <button
            className="quick-chip"
            disabled={loading || autoRunning}
            onClick={() => onQuickBet(balance)}
            style={{ color: '#FFD700' }}
          >
            MAX (F)
          </button>
        </div>
      </div>

      {/* Profit on Win Display */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>
            PROFIT ON WIN
          </div>
          <div
            style={{
              color: '#4ade80',
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '1.05rem',
            }}
          >
            +${profitOnWin.toFixed(2)}
          </div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#FFD700',
            fontSize: '0.8rem',
            fontWeight: 900,
            fontFamily: 'monospace',
          }}
        >
          {multiplier.toFixed(2)}x
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
              AUTO CONFIG
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
              NUMBER OF BETS (0 = ∞)
            </label>
            <input
              type="number"
              disabled={autoRunning}
              value={autoBetSettings.numberOfBets}
              onChange={(e) => onAutoBetSettingsChange({ numberOfBets: Number(e.target.value) })}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                ON WIN (+%)
              </label>
              <input
                type="number"
                disabled={autoRunning}
                value={autoBetSettings.onWin}
                onChange={(e) => onAutoBetSettingsChange({ onWin: Number(e.target.value) })}
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
              />
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
                ON LOSS (+%)
              </label>
              <input
                type="number"
                disabled={autoRunning}
                value={autoBetSettings.onLoss}
                onChange={(e) => onAutoBetSettingsChange({ onLoss: Number(e.target.value) })}
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Session Performance Stats */}
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

      {/* Primary Roll Button */}
      <button
        key="dice-action-btn"
        className="gold-btn"
        style={{
          width: '100%',
          height: isMobile ? '60px' : '68px',
          fontSize: '1.25rem',
          borderRadius: '18px',
          border: 'none',
          cursor: loading || isProcessing ? 'not-allowed' : 'pointer',
          opacity: loading || isProcessing ? 0.7 : 1,
        }}
        onClick={onPrimaryAction}
        disabled={loading || isProcessing}
      >
        {loading || isProcessing
          ? 'ROLLING...'
          : isAutoMode
            ? autoRunning
              ? 'STOP AUTOBET'
              : 'START AUTOBET'
            : `ROLL DICE ($${betAmount.toFixed(2)})`}
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
