'use client';

import { BookOpen, Shield, Gauge, Copy, Layers, Info } from 'lucide-react';
import type { BlackjackGameState } from '@/lib/games/blackjack';
import StrategyMatrix from '@/components/casino/games/blackjack/StrategyMatrix';
import CardCountingPanel from '@/components/casino/games/blackjack/CardCountingPanel';
import { GameCoPilotHud } from '@/components/casino/hud/GameCoPilotHud';

interface BlackjackRightRulesProps {
  strategyAdvice?: string;
  gameState: BlackjackGameState | null;
  isInGame: boolean;
  runningCount: number;
  cardsDealtCount: number;
  betAmount: number;
}

export function BlackjackRightRules({
  strategyAdvice: _strategyAdvice,
  gameState,
  isInGame,
  runningCount,
  cardsDealtCount,
  betAmount,
}: BlackjackRightRulesProps) {
  return (
    <div
      className="blackjack-right-rules obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '18px',
        borderRadius: '24px',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              <BookOpen size={16} color="#FFD700" />
            </div>
            <h3
              style={{
                margin: 0,
                letterSpacing: '0.5px',
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#FFF',
              }}
            >
              RULES & STRATEGY
            </h3>
          </div>
        </div>

        {/* Live Co-Pilot Smart HUD */}
        <GameCoPilotHud
          context={{
            gameType: 'BLACKJACK',
            blackjackState: {
              playerScore: gameState?.playerHand.score ?? 0,
              isSoft: gameState?.playerHand.isSoft ?? false,
              cards: gameState?.playerHand.cards ?? [],
              dealerUpcard: gameState?.dealerHand?.cards?.[0],
              canDouble: gameState?.canDouble,
              canSplit: gameState?.canSplit,
              phase: gameState?.phase,
            },
          }}
          isFloating={false}
        />

        {/* Interactive Strategy Heatmap */}
        <StrategyMatrix
          playerHand={gameState?.playerHand || null}
          dealerUpcardNumeric={gameState?.dealerHand?.cards[0]?.numericValue}
          isInGame={isInGame}
        />

        {/* Hebel 5: Hi-Lo Card Counting Visualizer Panel */}
        <CardCountingPanel
          runningCount={runningCount}
          cardsDealt={cardsDealtCount}
          totalDecks={6}
        />

        {/* 2x2 Structured VIP House Rules Badges (Replaces Bullet List) */}
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              color: '#94a3b8',
              letterSpacing: '0.5px',
              marginBottom: '5px',
            }}
          >
            HOUSE RULES SPECIFICATION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shield size={12} color="#D4AF37" />
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#FFF' }}>
                  STANDS ON 17
                </span>
              </div>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                Dealer must stand on all 17s
              </span>
            </div>

            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Gauge size={12} color="#D4AF37" />
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#FFF' }}>
                  DOUBLE ANY 2
                </span>
              </div>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                Double down on first 2 cards
              </span>
            </div>

            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Copy size={12} color="#D4AF37" />
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#FFF' }}>
                  SPLIT PAIRS
                </span>
              </div>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                Split once on matching rank
              </span>
            </div>

            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={12} color="#D4AF37" />
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#FFF' }}>
                  6-DECK SHOE
                </span>
              </div>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Continuous auto-shuffle</span>
            </div>
          </div>
        </div>

        {/* Table Payout Matrix */}
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              color: '#94a3b8',
              letterSpacing: '0.5px',
              marginBottom: '5px',
            }}
          >
            PAYOUT STRUCTURE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Blackjack (Natural)</span>
              <span style={{ color: '#FFD700', fontFamily: 'monospace', fontWeight: 900 }}>
                3:2 (${(betAmount * 1.5).toFixed(2)})
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Standard Win</span>
              <span style={{ color: '#4ade80', fontFamily: 'monospace', fontWeight: 900 }}>
                1:1 (${betAmount.toFixed(2)})
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Push (Tie)</span>
              <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 900 }}>
                1:1 (Return)
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Insurance</span>
              <span style={{ color: '#a78bfa', fontFamily: 'monospace', fontWeight: 900 }}>
                2:1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '0.68rem',
          fontWeight: 700,
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <Info size={12} color="#94a3b8" />
        <span>6-DECK CONTINUOUS SHOE • 99.5% RTP</span>
      </div>
    </div>
  );
}
