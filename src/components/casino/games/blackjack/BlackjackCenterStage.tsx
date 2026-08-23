'use client';

import type { BlackjackGameState } from '@/lib/games/blackjack';
import BlackjackTable from '@/components/casino/games/blackjack/BlackjackTable';
import BlackjackActions from '@/components/casino/games/blackjack/BlackjackActions';
import type {
  BlackjackHistoryItem,
  BlackjackSessionStats,
} from '@/components/casino/games/blackjack/blackjack-config';

interface BlackjackCenterStageProps {
  isMobile: boolean;
  gameState: BlackjackGameState | null;
  betAmount: number;
  balance: number;
  isProcessing: boolean;
  history: BlackjackHistoryItem[];
  sessionStats: BlackjackSessionStats;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
}

export function BlackjackCenterStage({
  isMobile,
  gameState,
  betAmount,
  balance,
  isProcessing,
  history,
  sessionStats,
  onHit,
  onStand,
  onDouble,
  onSplit,
}: BlackjackCenterStageProps) {
  return (
    <div
      className="blackjack-center-stage obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        padding: isMobile ? '14px' : '20px',
        borderRadius: '26px',
        minWidth: 0,
        width: '100%',
        height: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Bar: Title & Recent History */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 10px #FFD700',
              }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '1px',
                color: '#FFD700',
              }}
            >
              LIVE MONTE CARLO VIP TABLE
            </span>
          </div>

          {/* Recent Outcomes Stream */}
          <div
            style={{
              display: 'flex',
              gap: '5px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '3px 7px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  color: h.isWin ? '#4ade80' : h.result === 'PUSH' ? '#60a5fa' : '#f87171',
                  background: h.isWin
                    ? 'rgba(16, 185, 129, 0.15)'
                    : h.result === 'PUSH'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {h.result}
              </div>
            ))}
          </div>
        </div>

        {/* 3D Blackjack Felt Table */}
        <BlackjackTable
          dealerHand={gameState?.dealerHand || null}
          playerHand={gameState?.playerHand || null}
          playerHand2={gameState?.playerHand2 || null}
          activeHandIndex={gameState?.activeHandIndex || 0}
          betAmount={betAmount}
          result={gameState?.result}
          result2={gameState?.result2}
          payout={gameState ? (gameState.payout || 0) * betAmount : 0}
          isProcessing={isProcessing}
        />

        {/* Action Bar (HIT, STAND, DOUBLE, SPLIT) */}
        <BlackjackActions
          phase={gameState?.phase || 'IDLE'}
          canDouble={Boolean(gameState?.canDouble && betAmount * 2 <= balance)}
          canSplit={Boolean(gameState?.canSplit)}
          isProcessing={isProcessing}
          onHit={onHit}
          onStand={onStand}
          onDouble={onDouble}
          onSplit={onSplit}
        />
      </div>

      {/* Machine Base Readouts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '10px',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>LAST OUTCOME</div>
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '0.88rem',
              color: history[0]?.isWin
                ? '#4ade80'
                : history[0]?.result === 'PUSH'
                  ? '#60a5fa'
                  : history[0]
                    ? '#f87171'
                    : '#94a3b8',
            }}
          >
            {history[0]?.result || '—'}
          </div>
        </div>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>TOTAL ROUNDS</div>
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '0.88rem',
              color: '#FFF',
            }}
          >
            {sessionStats.rounds}
          </div>
        </div>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
            SESSION PROFIT
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '0.88rem',
              color: sessionStats.profit >= 0 ? '#4ade80' : '#f87171',
            }}
          >
            {sessionStats.profit >= 0 ? '+' : ''}${sessionStats.profit.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
