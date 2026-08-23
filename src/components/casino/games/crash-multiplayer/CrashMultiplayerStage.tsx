'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import type { RefObject } from 'react';
import type { LiveBet } from '@/components/casino/games/crash/crash-helpers';
import type { CrashRoundBroadcastPayload } from '@/lib/casino/realtime-types';
import { LivePlayerList } from './LivePlayerList';
import { MilestoneFlash } from './MilestoneFlash';

type CrashStatus = 'IDLE' | 'WAITING' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT';

interface MilestoneFlashValue {
  value: number;
  key: number;
}

interface CrashMultiplayerStageProps {
  isMobile: boolean;
  status: CrashStatus;
  isProcessing: boolean;
  isRoundActive: boolean;
  bettingWindowSecondsLeft: number | null;
  countdown: number | null;
  cashoutAt: number | null;
  betAmount: number;
  liveBets: LiveBet[];
  roomRound: CrashRoundBroadcastPayload | null;
  roomWaitDisplay: string;
  milestoneFlash: MilestoneFlashValue | null;
  cameraZoomRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  vignetteRef: RefObject<HTMLDivElement | null>;
  multiplierDisplayRef: RefObject<HTMLHeadingElement | null>;
  liveProfitDisplayRef: RefObject<HTMLDivElement | null>;
}

export function CrashMultiplayerStage({
  isMobile,
  status,
  isProcessing,
  isRoundActive,
  bettingWindowSecondsLeft,
  countdown,
  cashoutAt,
  betAmount,
  liveBets,
  roomRound,
  roomWaitDisplay,
  milestoneFlash,
  cameraZoomRef,
  canvasRef,
  vignetteRef,
  multiplierDisplayRef,
  liveProfitDisplayRef,
}: CrashMultiplayerStageProps) {
  return (
    <div
      className="obsidian-glass"
      style={{
        position: 'relative',
        flex: 1,
        height: isMobile ? '360px' : '520px',
        minHeight: isMobile ? '360px' : '520px',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '28px',
        border: '1px solid rgba(212, 175, 55, 0.2)',
      }}
    >
      {/* Camera Zoom & Canvas Layer */}
      <div
        ref={cameraZoomRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transformOrigin: 'center',
          zIndex: 1,
        }}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* Red Risk Edge Vignette */}
      <div
        ref={vignetteRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          opacity: 0,
          boxShadow:
            'inset 0 0 50px 15px rgba(255,60,40,0.5), inset 0 0 160px 30px rgba(255,20,10,0.4)',
          transition: 'opacity 0.1s ease',
        }}
      />

      {/* Central Stage Multiplier & Status Display */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          width: '100%',
          padding: '24px',
        }}
      >
        {/* Idle State with radar indicator */}
        {status === 'IDLE' && !isProcessing && (
          <div
            className="radar-glow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#FFD700',
              fontSize: isMobile ? '0.85rem' : '1.1rem',
              fontWeight: 800,
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            <Sparkles size={16} color="#FFD700" />
            <span>WAITING FOR NEXT LAUNCH</span>
          </div>
        )}

        {/* Shared betting window — real countdown to the synchronized launch (FR2). */}
        {status === 'WAITING' && (
          <div
            className="radar-glow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#FFD700',
              fontSize: isMobile ? '0.85rem' : '1.1rem',
              fontWeight: 800,
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            <Sparkles size={16} color="#FFD700" />
            <span>
              LAUNCH IN {bettingWindowSecondsLeft ?? '…'}s
              {liveBets.length > 0
                ? ` · ${liveBets.length} PLAYER${liveBets.length === 1 ? '' : 'S'}`
                : ''}
            </span>
          </div>
        )}

        {/* Processing / Arming State */}
        {status === 'IDLE' && isProcessing && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              color: '#FFD700',
              fontSize: isMobile ? '0.85rem' : '1.1rem',
              fontWeight: 800,
              letterSpacing: '3px',
              marginBottom: '12px',
            }}
          >
            <span>ARMING THRUSTERS...</span>
          </div>
        )}

        {/* Big Multiplier Number */}
        <h1
          ref={multiplierDisplayRef}
          style={{
            fontSize: isMobile ? '4.8rem' : 'min(9.5rem, 18vw)',
            fontWeight: 900,
            margin: 0,
            fontFamily: 'monospace',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            color:
              status === 'IDLE' || status === 'WAITING'
                ? 'rgba(255, 255, 255, 0.35)'
                : status === 'CRASHED'
                  ? '#ef4444'
                  : status === 'CASHED_OUT'
                    ? '#4ade80'
                    : '#FFFDF0',
            textShadow:
              status === 'IDLE' || status === 'WAITING'
                ? 'none'
                : status === 'CRASHED'
                  ? '0 0 60px rgba(239, 68, 68, 0.8)'
                  : status === 'CASHED_OUT'
                    ? '0 0 50px rgba(74, 222, 128, 0.7)'
                    : '0 0 40px rgba(212, 175, 55, 0.65)',
          }}
        >
          {status === 'IDLE' || status === 'WAITING' ? '1.00x' : ''}
        </h1>

        {/* Live Running Profit Pill (Lever 3) */}
        {status === 'RUNNING' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '12px',
              background: 'rgba(14, 14, 20, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
              borderRadius: '16px',
              padding: '6px 18px',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>
              CURRENT PROFIT:
            </span>
            <div
              ref={liveProfitDisplayRef}
              style={{
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: '1.05rem',
                color: '#4ade80',
              }}
            >
              +$0.00
            </div>
          </div>
        )}

        {/* Crashed State Feedback */}
        {status === 'CRASHED' && (
          <div style={{ marginTop: '12px' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                padding: '8px 24px',
                color: '#ef4444',
                fontWeight: 900,
                fontSize: isMobile ? '1rem' : '1.3rem',
                letterSpacing: '4px',
              }}
            >
              CRASHED
            </div>
            {countdown !== null && (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  marginTop: '10px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace',
                }}
              >
                Next launch sequence in {countdown}s…
              </div>
            )}
          </div>
        )}

        {/* Cashout Success Feedback */}
        {isRoundActive && cashoutAt && (
          <div
            style={{
              marginTop: '14px',
              display: 'inline-block',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(74, 222, 128, 0.6)',
              boxShadow: '0 6px 25px rgba(16, 185, 129, 0.35)',
              borderRadius: '16px',
              padding: '10px 24px',
              color: '#4ade80',
              fontWeight: 900,
              fontSize: isMobile ? '0.95rem' : '1.25rem',
              letterSpacing: '1px',
            }}
          >
            ✓ SECURED @ {cashoutAt.toFixed(2)}x — +$
            {(betAmount * cashoutAt - betAmount).toFixed(2)}
          </div>
        )}
      </div>

      {/* Live player list (FR3) — real bets/cashouts from the shared
          room broadcast, not local simulation. Room status line shown
          even before this browser has bet, driven by roomRound alone. */}
      {(liveBets.length > 0 || (roomRound && status === 'IDLE')) && (
        <LivePlayerList
          liveBets={liveBets}
          roomRound={roomRound}
          status={status}
          roomWaitDisplay={roomWaitDisplay}
          isMobile={isMobile}
        />
      )}

      {/* Milestone Flash Celebration Popup */}
      {milestoneFlash && (
        <MilestoneFlash key={milestoneFlash.key} value={milestoneFlash.value} isMobile={isMobile} />
      )}
    </div>
  );
}
