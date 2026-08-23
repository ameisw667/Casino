import React from 'react';
import type { LiveBet } from '@/components/casino/games/crash/crash-helpers';
import type { CrashRoundBroadcastPayload } from '@/lib/casino/realtime-types';

type CrashStatus = 'IDLE' | 'WAITING' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT';

export function LivePlayerList({
  liveBets,
  roomRound,
  status,
  roomWaitDisplay,
  isMobile,
}: {
  liveBets: LiveBet[];
  roomRound: CrashRoundBroadcastPayload | null;
  status: CrashStatus;
  roomWaitDisplay: string;
  isMobile: boolean;
}) {
  return (
    <div
      className="glass-card"
      style={{
        position: 'absolute',
        top: isMobile ? '8px' : '16px',
        right: isMobile ? '8px' : '16px',
        width: isMobile ? '112px' : '200px',
        maxHeight: isMobile ? '132px' : '260px',
        overflowY: 'auto',
        borderRadius: '14px',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'rgba(10, 12, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: isMobile ? '8px' : '10px',
        zIndex: 15,
        fontFamily: 'monospace',
      }}
    >
      {roomRound && status === 'IDLE' && (
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px' }}>
          {roomWaitDisplay}
        </div>
      )}
      {liveBets.map((bet, index) => (
        <div
          key={`${bet.user}-${index}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '6px',
            fontSize: '0.75rem',
            padding: '3px 0',
            color:
              bet.action === 'CASHOUT' ? '#4ade80' : bet.action === 'BUST' ? '#ef4444' : '#e2e8f0',
          }}
        >
          <span>{bet.user}</span>
          <span>
            {bet.action === 'CASHOUT' && bet.payout !== null
              ? `+$${bet.payout.toFixed(2)}`
              : bet.action === 'BUST'
                ? 'BUST'
                : `$${bet.amount.toFixed(2)}`}
          </span>
        </div>
      ))}
    </div>
  );
}
