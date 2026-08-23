'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Zap, ShieldCheck, TrendingUp, Sparkles, RotateCcw } from 'lucide-react';

import { CasinoJeton } from '@/components/casino/games/blackjack/CasinoJeton';
import {
  VIP_CHIPS,
  type BlackjackSessionStats,
} from '@/components/casino/games/blackjack/blackjack-config';

interface BlackjackLeftSidebarProps {
  balance: number;
  betAmount: number;
  betMin: number;
  betMax: number;
  isInGame: boolean;
  isProcessing: boolean;
  sessionStats: BlackjackSessionStats;
  onSetBetAmount: Dispatch<SetStateAction<number>>;
  onDeal: () => void;
}

export function BlackjackLeftSidebar({
  balance,
  betAmount,
  betMin,
  betMax,
  isInGame,
  isProcessing,
  sessionStats,
  onSetBetAmount,
  onDeal,
}: BlackjackLeftSidebarProps) {
  return (
    <div
      className="blackjack-left-controls obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '18px',
        borderRadius: '24px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
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
            BLACKJACK CONTROLS
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
          <span>99.5% RTP</span>
        </div>
      </div>

      {/* VIP High Roller Mode Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(212, 175, 55, 0.08)',
          padding: '7px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          gap: '8px',
        }}
      >
        <Sparkles size={14} color="#FFD700" />
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 900,
            color: '#FFD700',
            letterSpacing: '0.5px',
          }}
        >
          MONTE CARLO VIP SUITE
        </span>
      </div>

      {/* Bet Amount Input & Quick Modifiers */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
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
            marginBottom: '5px',
          }}
        >
          <span style={{ color: '#D4AF37', fontWeight: 900, marginRight: '4px' }}>$</span>
          <input
            type="number"
            disabled={isInGame || isProcessing}
            value={betAmount}
            onChange={(e) =>
              onSetBetAmount(
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
            disabled={isInGame || isProcessing}
            onClick={() => onSetBetAmount((v) => Math.max(betMin, parseFloat((v / 2).toFixed(2))))}
          >
            ½
          </button>
          <button
            className="quick-mod-btn"
            disabled={isInGame || isProcessing}
            onClick={() => onSetBetAmount((v) => Math.min(betMax, parseFloat((v * 2).toFixed(2))))}
          >
            2×
          </button>
          <button
            className="quick-mod-btn"
            disabled={isInGame || isProcessing}
            onClick={() => onSetBetAmount(betMin)}
          >
            Min
          </button>
          <button
            className="quick-mod-btn"
            disabled={isInGame || isProcessing}
            onClick={() => onSetBetAmount(Math.min(betMax, balance))}
          >
            Max
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
            marginBottom: '5px',
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
            padding: '9px 8px',
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
                size={36}
                isSelected={isSelected}
                onClick={() => !isInGame && onSetBetAmount(chip.amount)}
              />
            );
          })}
        </div>
      </div>

      {/* Stake & Blackjack Payout HUD */}
      <div
        style={{
          padding: '9px 12px',
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
              fontSize: '0.95rem',
            }}
          >
            ${betAmount.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
            BLACKJACK (3:2)
          </div>
          <div
            style={{
              color: '#4ade80',
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '0.95rem',
            }}
          >
            ${(betAmount * 2.5).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Session Performance Card */}
      <div
        style={{
          padding: '11px',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
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
              HANDS / WIN RATE
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
            <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 700 }}>NET PROFIT</div>
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

      {/* Deal Button (Directly under Session Performance!) */}
      <button
        className="gold-btn"
        disabled={isInGame || isProcessing}
        onClick={onDeal}
        style={{
          width: '100%',
          height: '54px',
          fontSize: '1.05rem',
          borderRadius: '14px',
          cursor: isInGame || isProcessing ? 'not-allowed' : 'pointer',
          opacity: isInGame || isProcessing ? 0.7 : 1,
        }}
      >
        {isProcessing ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <RotateCcw size={18} className="animate-spin" />
            <span>DEALING...</span>
          </div>
        ) : isInGame ? (
          'IN PLAY...'
        ) : (
          `DEAL ($${betAmount.toFixed(2)})`
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
          paddingTop: '2px',
        }}
      >
        <ShieldCheck size={13} color="#D4AF37" />
        <span>PROVABLY FAIR SYSTEM ACTIVE</span>
      </div>
    </div>
  );
}
