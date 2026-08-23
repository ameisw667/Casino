'use client';

import type { RefObject } from 'react';
import { Info, Zap, Sliders, TrendingUp, ShieldCheck } from 'lucide-react';

interface CrashSessionStats {
  rounds: number;
  wins: number;
  profit: number;
  biggestMultiplier: number;
}

interface CrashControlSidebarProps {
  isMobile: boolean;
  balance: number;
  betAmount: number;
  isAutoBetting: boolean;
  isRoundActive: boolean;
  isProcessing: boolean;
  isAutoCashoutEnabled: boolean;
  autoCashoutAt: number;
  sessionStats: CrashSessionStats;
  cashoutAt: number | null;
  multiplier: number;
  cashoutButtonRef: RefObject<HTMLButtonElement | null>;
  onShowTutorial: () => void;
  onSetAutoBetting: (v: boolean) => void;
  onBetAmountChange: (val: number) => void;
  onQuickBet: (amt: number) => void;
  onToggleAutoCashout: () => void;
  onAutoCashoutChange: (val: number) => void;
  onStart: () => void;
  onCashout: () => void;
}

/**
 * Crash VIP control sidebar (Manual/Auto mode, bet amount, auto-cashout, session stats,
 * primary action button, provably-fair badge). Pure presentational — extracted verbatim
 * from crash/page.tsx. All state lives in the parent; interactions are callbacks.
 */
export function CrashControlSidebar({
  isMobile,
  balance,
  betAmount,
  isAutoBetting,
  isRoundActive,
  isProcessing,
  isAutoCashoutEnabled,
  autoCashoutAt,
  sessionStats,
  cashoutAt,
  multiplier,
  cashoutButtonRef,
  onShowTutorial,
  onSetAutoBetting,
  onBetAmountChange,
  onQuickBet,
  onToggleAutoCashout,
  onAutoCashoutChange,
  onStart,
  onCashout,
}: CrashControlSidebarProps) {
  return (
    <div
      className="sidebar-left obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        borderRadius: '24px',
        order: isMobile ? 2 : 1,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
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
            FLIGHT CONTROLS
          </h3>
        </div>
        <button
          style={{
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
          onClick={onShowTutorial}
        >
          <Info size={16} />
        </button>
      </div>

      {/* Mode Switcher: Manual / Auto */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          opacity: isRoundActive ? 0.5 : 1,
        }}
      >
        <button
          onClick={() => {
            if (!isRoundActive) onSetAutoBetting(false);
          }}
          disabled={isRoundActive}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
            background: !isAutoBetting
              ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
              : 'transparent',
            color: !isAutoBetting ? '#FFD700' : '#64748b',
            border: !isAutoBetting ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
            cursor: isRoundActive ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Manual
        </button>
        <button
          onClick={() => {
            if (!isRoundActive) onSetAutoBetting(true);
          }}
          disabled={isRoundActive}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
            background: isAutoBetting
              ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
              : 'transparent',
            color: isAutoBetting ? '#FFD700' : '#64748b',
            border: isAutoBetting ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
            cursor: isRoundActive ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Auto Pilot
        </button>
      </div>

      {/* Bet Amount Input & Presets */}
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
            disabled={isRoundActive}
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
          {[1, 5, 10, 50, 100].map((amt) => (
            <button
              key={amt}
              className="quick-chip"
              disabled={isRoundActive}
              onClick={() => onQuickBet(amt)}
            >
              ${amt}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <button
            className="quick-chip"
            disabled={isRoundActive}
            onClick={() => onQuickBet(betAmount / 2)}
          >
            ½ Bet
          </button>
          <button
            className="quick-chip"
            disabled={isRoundActive}
            onClick={() => onQuickBet(betAmount * 2)}
          >
            2× Bet
          </button>
          <button
            className="quick-chip"
            disabled={isRoundActive}
            onClick={() => onQuickBet(balance)}
            style={{ color: '#FFD700' }}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Auto Cashout Section */}
      <div
        style={{
          padding: '14px',
          borderRadius: '14px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isAutoCashoutEnabled ? '10px' : 0,
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
              AUTO CASHOUT
            </label>
          </div>
          <button
            onClick={onToggleAutoCashout}
            style={{
              width: '42px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              background: isAutoCashoutEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#FFF',
                transition: 'left 0.2s',
                left: isAutoCashoutEnabled ? '21px' : '3px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
              }}
            />
          </button>
        </div>

        {isAutoCashoutEnabled && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="number"
              step="0.1"
              min="1.1"
              value={autoCashoutAt}
              style={{
                width: '100%',
                height: '40px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '10px',
                padding: '0 12px',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#4ade80',
                fontFamily: 'monospace',
                outline: 'none',
              }}
              onChange={(e) => onAutoCashoutChange(parseFloat(e.target.value) || 1.1)}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '5px',
                marginTop: '8px',
              }}
            >
              {[1.2, 1.5, 2.0, 5.0, 10.0].map((preset) => (
                <button
                  key={preset}
                  className="quick-chip"
                  style={{
                    background:
                      autoCashoutAt === preset
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                    border:
                      autoCashoutAt === preset
                        ? '1px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    color: autoCashoutAt === preset ? '#4ade80' : '#cbd5e1',
                  }}
                  onClick={() => onAutoCashoutChange(preset)}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Performance Stats */}
      <div
        style={{
          padding: '14px',
          borderRadius: '14px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px',
          }}
        >
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
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

      {/* Primary Action Button (BET / CASHOUT) */}
      {!isRoundActive ? (
        <button
          key="action-btn-bet"
          className="gold-btn"
          style={{
            width: '100%',
            height: isMobile ? '60px' : '68px',
            fontSize: '1.25rem',
            borderRadius: '18px',
            border: 'none',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.7 : 1,
          }}
          onClick={onStart}
          disabled={isProcessing}
        >
          {isProcessing
            ? 'ARMING THRUSTERS...'
            : isAutoBetting
              ? 'AUTO FLIGHT ON'
              : `LAUNCH BET ($${betAmount.toFixed(2)})`}
        </button>
      ) : (
        <button
          key="action-btn-cashout"
          ref={cashoutButtonRef}
          className="emerald-btn"
          style={{
            width: '100%',
            height: isMobile ? '60px' : '68px',
            fontSize: '1.15rem',
            borderRadius: '18px',
            border: cashoutAt ? '1px solid rgba(74, 222, 128, 0.6)' : 'none',
            cursor: cashoutAt ? 'default' : 'pointer',
            background: cashoutAt
              ? 'rgba(16, 185, 129, 0.2)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: cashoutAt ? '#4ade80' : '#FFF',
          }}
          onClick={() => {
            if (!cashoutAt) onCashout();
          }}
          disabled={!!cashoutAt}
        >
          {cashoutAt
            ? `✓ SECURED $${(betAmount * cashoutAt).toFixed(2)} @ ${cashoutAt.toFixed(2)}x`
            : `CASHOUT $${(betAmount * multiplier).toFixed(2)}`}
        </button>
      )}

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
