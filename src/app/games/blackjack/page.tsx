'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  BookOpen,
  Info,
  RotateCcw,
  Shield,
  Layers,
  Copy,
  Gauge,
} from 'lucide-react';

import { useCasinoStore } from '@/store/useCasinoStore';
import type { BlackjackGameState, Card } from '@/lib/games/blackjack';
import BlackjackTable from '@/components/casino/games/blackjack/BlackjackTable';
import BlackjackActions from '@/components/casino/games/blackjack/BlackjackActions';
import InsuranceModal from '@/components/casino/games/blackjack/InsuranceModal';
import CardCountingPanel from '@/components/casino/games/blackjack/CardCountingPanel';
import StrategyMatrix from '@/components/casino/games/blackjack/StrategyMatrix';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { CasinoLogger } from '@/lib/casino/logger';
import { trackAllowedEvent } from '@/lib/analytics/events';

interface ChipDef {
  amount: number;
  label: string;
  baseColor: string;
  stripeColor: string;
  coreBg: string;
  textColor: string;
}

const VIP_CHIPS: ChipDef[] = [
  {
    amount: 1,
    label: '1',
    baseColor: '#64748B',
    stripeColor: '#FFFFFF',
    coreBg: 'radial-gradient(circle at 35% 35%, #334155 0%, #0F172A 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 5,
    label: '5',
    baseColor: '#DC2626',
    stripeColor: '#FCA5A5',
    coreBg: 'radial-gradient(circle at 35% 35%, #991B1B 0%, #450A0A 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 25,
    label: '25',
    baseColor: '#059669',
    stripeColor: '#6EE7B7',
    coreBg: 'radial-gradient(circle at 35% 35%, #065F46 0%, #022C22 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 100,
    label: '100',
    baseColor: '#2563EB',
    stripeColor: '#93C5FD',
    coreBg: 'radial-gradient(circle at 35% 35%, #1E40AF 0%, #172554 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 500,
    label: '500',
    baseColor: '#9333EA',
    stripeColor: '#E9D5FF',
    coreBg: 'radial-gradient(circle at 35% 35%, #6B21A8 0%, #3B0764 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 1000,
    label: '1k',
    baseColor: '#D97706',
    stripeColor: '#FDE68A',
    coreBg: 'radial-gradient(circle at 35% 35%, #92400E 0%, #451A03 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 5000,
    label: '5k',
    baseColor: '#AA820A',
    stripeColor: '#FFD700',
    coreBg: 'radial-gradient(circle at 35% 35%, #2A2000 0%, #0A0A0F 100%)',
    textColor: '#FFD700',
  },
];

interface CasinoJetonProps {
  label: string;
  baseColor: string;
  stripeColor: string;
  coreBg: string;
  textColor: string;
  size?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

function CasinoJeton({
  label,
  baseColor,
  stripeColor,
  coreBg,
  textColor,
  size = 38,
  isSelected = false,
  onClick,
}: CasinoJetonProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isSelected ? 'translateY(-3px) scale(1.08)' : 'none',
        boxShadow: isSelected
          ? '0 0 14px rgba(212, 175, 55, 0.9), 0 6px 14px rgba(0, 0, 0, 0.75)'
          : '0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        border: isSelected ? '2px solid #FFD700' : '1px solid rgba(0, 0, 0, 0.6)',
        background: `conic-gradient(
          from 0deg,
          ${baseColor} 0deg 25deg,
          ${stripeColor} 25deg 45deg,
          ${baseColor} 45deg 70deg,
          ${stripeColor} 70deg 90deg,
          ${baseColor} 90deg 115deg,
          ${stripeColor} 115deg 135deg,
          ${baseColor} 135deg 160deg,
          ${stripeColor} 160deg 180deg,
          ${baseColor} 180deg 205deg,
          ${stripeColor} 205deg 225deg,
          ${baseColor} 225deg 250deg,
          ${stripeColor} 250deg 270deg,
          ${baseColor} 270deg 295deg,
          ${stripeColor} 295deg 315deg,
          ${baseColor} 315deg 340deg,
          ${stripeColor} 340deg 360deg
        )`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '72%',
          height: '72%',
          borderRadius: '50%',
          background: coreBg,
          border: '1px solid rgba(212, 175, 55, 0.9)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: '0.78rem',
          letterSpacing: '-0.03em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// Hi-Lo Card Value Evaluator (2-6: +1, 7-9: 0, 10-A: -1)
function getHiLoDelta(card: Card): number {
  if (card.faceDown) return 0;
  const num = card.numericValue;
  if (num >= 2 && num <= 6) return 1;
  if (num >= 10 || card.value === 'A') return -1;
  return 0;
}

export default function BlackjackPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Store selectors
  const balance = useCasinoStore((s) => s.balance);
  const provablyFairSettings = useCasinoStore((s) => s.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore((s) => s.setProvablyFairSettings);
  const processGameResult = useCasinoStore((s) => s.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((s) => s.applyServerWalletSnapshot);
  const addToast = useCasinoStore((s) => s.addToast);
  const isProcessing = useCasinoStore((s) => s.isProcessing);
  const setIsProcessing = useCasinoStore((s) => s.setIsProcessing);
  const { betMin, betMax } = useCasinoStore((s) => s.gameConfig.limits);

  // Local state
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null);
  const [history, setHistory] = useState<{ result: string; amount: number; isWin: boolean }[]>([]);

  // Session stats & Card counting state
  const [sessionStats, setSessionStats] = useState({
    rounds: 0,
    wins: 0,
    profit: 0,
  });
  const [runningCount, setRunningCount] = useState(0);
  const [cardsDealtCount, setCardsDealtCount] = useState(0);

  // Insurance Prompt state
  const [showInsurance, setShowInsurance] = useState(false);

  const roundIdRef = useRef<string | null>(null);
  const roundVersionRef = useRef(0);
  const lastKnownCardsRef = useRef<Set<string>>(new Set());

  // Accumulate Hi-Lo Count whenever new cards are revealed
  useEffect(() => {
    if (!gameState) return;
    const allCards: Card[] = [
      ...(gameState.dealerHand?.cards || []),
      ...(gameState.playerHand?.cards || []),
      ...(gameState.playerHand2?.cards || []),
    ];

    let delta = 0;
    let newCardsCount = 0;

    allCards.forEach((c, idx) => {
      if (!c.faceDown) {
        const key = `${c.suit}-${c.value}-${idx}`;
        if (!lastKnownCardsRef.current.has(key)) {
          lastKnownCardsRef.current.add(key);
          delta += getHiLoDelta(c);
          newCardsCount += 1;
        }
      }
    });

    if (delta !== 0 || newCardsCount !== 0) {
      setRunningCount((prev) => prev + delta);
      setCardsDealtCount((prev) => prev + newCardsCount);
    }
  }, [gameState]);

  const applyBlackjackResponse = useCallback(
    (
      data: {
        gameState: BlackjackGameState;
        roundId: string;
        version: number;
        wallet: Parameters<typeof applyServerWalletSnapshot>[0];
        settled?: boolean;
        result?: { id: string; win: boolean; payout: number; multiplier: number };
        serverSeedHash?: string;
        nonce?: number;
        isFirstBet?: boolean;
      },
      totalBet: number,
    ) => {
      applyServerWalletSnapshot(data.wallet);
      // Only ever true on the DEAL response (server-side: blackjack/route.ts's DEAL branch) —
      // the HIT/STAND/DOUBLE/SPLIT responses that also funnel through this same handler never
      // set it, so this check is safe as a single trigger point for both call sites.
      if (data.isFirstBet) {
        void trackAllowedEvent({ name: 'first_game_started', props: { game: 'BLACKJACK' } });
      }
      roundIdRef.current = data.roundId;
      roundVersionRef.current = data.version;
      setGameState(data.gameState);

      if (data.serverSeedHash && data.nonce !== undefined) {
        setProvablyFairSettings({ serverSeedHash: data.serverSeedHash, nonce: data.nonce });
      }

      // Check for Dealer Ace Insurance Situation
      const dealerShowsAce = data.gameState.dealerHand?.cards[0]?.value === 'A';
      const isInitialTurn =
        data.gameState.phase === 'PLAYER_TURN' && data.gameState.playerHand.cards.length === 2;
      if (dealerShowsAce && isInitialTurn && !data.settled) {
        setShowInsurance(true);
      } else {
        setShowInsurance(false);
      }

      if (data.settled && data.result) {
        const net = data.result.payout - totalBet;
        setSessionStats((prev) => ({
          rounds: prev.rounds + 1,
          wins: prev.wins + (data.result!.win ? 1 : 0),
          profit: prev.profit + net,
        }));

        processGameResult({
          game: 'BLACKJACK',
          amount: totalBet,
          multiplier: data.result.multiplier,
          payout: data.result.payout,
          win: data.result.win,
          resultId: data.result.id,
        });

        if (data.result.win) {
          soundManager.play('blackjack-win');
        }

        setHistory((prev) =>
          [
            {
              result: data.gameState.result || (data.result!.win ? 'WIN' : 'LOSS'),
              amount: data.result!.payout,
              isWin: data.result!.win,
            },
            ...prev,
          ].slice(0, 14),
        );
      }
    },
    [applyServerWalletSnapshot, processGameResult, setProvablyFairSettings],
  );

  // 1. DEAL ACTION
  const handleDeal = useCallback(async () => {
    if (isProcessing) return;
    if (betAmount < betMin || betAmount > betMax || betAmount > balance) {
      addToast(
        `Bet must be between $${betMin.toFixed(2)} and $${betMax.toLocaleString()}`,
        'error',
      );
      return;
    }

    setIsProcessing(true);
    setShowInsurance(false);
    soundManager.play('blackjack-card');

    try {
      const clientSeed = provablyFairSettings.clientSeed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
      const response = await fetch('/api/casino/blackjack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DEAL',
          requestId: crypto.randomUUID(),
          amount: betAmount,
          clientSeed,
          currentNonce: provablyFairSettings.nonce,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error(getApiErrorMessage(errData, 'Deal failed'));
      }

      const data = await response.json();
      applyBlackjackResponse(data, betAmount);
    } catch (error) {
      CasinoLogger.error('Blackjack', 'Deal error', error);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Deal failed. Please try again.', 'error');
      }
      setGameState(null);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    betAmount,
    betMin,
    betMax,
    balance,
    provablyFairSettings,
    setIsProcessing,
    addToast,
    applyBlackjackResponse,
  ]);

  // 2. PLAYER ACTIONS (HIT, STAND, DOUBLE, SPLIT)
  const handleAction = useCallback(
    async (action: 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT') => {
      if (isProcessing || !roundIdRef.current) return;
      setIsProcessing(true);
      setShowInsurance(false);
      soundManager.play('blackjack-card');

      try {
        const response = await fetch('/api/casino/blackjack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            requestId: crypto.randomUUID(),
            roundId: roundIdRef.current,
            version: roundVersionRef.current,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(getApiErrorMessage(errData, `${action} failed`));
        }

        const data = await response.json();
        const effectiveBet = action === 'DOUBLE' ? betAmount * 2 : betAmount;
        applyBlackjackResponse(data, effectiveBet);
      } catch (error) {
        CasinoLogger.error('Blackjack', `${action} error`, error);
        addToast(`Action ${action} failed.`, 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, betAmount, setIsProcessing, addToast, applyBlackjackResponse],
  );

  // Keyboard Shortcuts (Space=Deal, H=Hit, S=Stand, D=Double, Y/N=Insurance)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const isPlayerTurn =
        gameState?.phase === 'PLAYER_TURN' || gameState?.phase === 'PLAYER_TURN_HAND2';

      if (showInsurance) {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          setShowInsurance(false);
          addToast('Insurance purchased for 0.5x stake.', 'info');
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setShowInsurance(false);
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState || gameState.phase === 'SETTLEMENT') {
          handleDeal();
        }
      } else if (isPlayerTurn) {
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handleAction('HIT');
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleAction('STAND');
        } else if ((e.key === 'd' || e.key === 'D') && gameState?.canDouble) {
          e.preventDefault();
          handleAction('DOUBLE');
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, showInsurance, handleDeal, handleAction, addToast]);

  // Dynamic Basic Strategy Advice Calculation
  const strategyAdvice = useMemo(() => {
    if (!gameState || !gameState.playerHand || gameState.playerHand.cards.length < 2) {
      return 'Place your bet and deal cards to view real-time Basic Strategy.';
    }

    const pScore = gameState.playerHand.score;
    const isSoft = gameState.playerHand.isSoft;
    const dealerUpcard = gameState.dealerHand?.cards[0]?.numericValue ?? 0;

    if (pScore >= 21) {
      return pScore === 21 ? 'Natural 21! Payout is 3:2 for Blackjack.' : 'Hand has exceeded 21.';
    }

    if (isSoft) {
      if (pScore >= 19) return `Soft ${pScore}: Always STAND against any dealer upcard.`;
      if (pScore === 18) {
        return dealerUpcard >= 9
          ? `Soft 18 vs Dealer ${dealerUpcard}: Basic Strategy advises HIT.`
          : `Soft 18 vs Dealer ${dealerUpcard}: Basic Strategy advises DOUBLE or STAND.`;
      }
      return `Soft ${pScore}: Basic Strategy advises DOUBLE vs 4-6, otherwise HIT.`;
    }

    if (pScore >= 17) {
      return `Hard ${pScore}: Always STAND. High risk of busting on hit.`;
    }
    if (pScore >= 13 && pScore <= 16) {
      return dealerUpcard <= 6
        ? `Player ${pScore} vs Dealer ${dealerUpcard}: STAND (Dealer has high bust probability).`
        : `Player ${pScore} vs Dealer ${dealerUpcard}: HIT (Dealer shows strong upcard).`;
    }
    if (pScore === 12) {
      return dealerUpcard >= 4 && dealerUpcard <= 6
        ? `Player 12 vs Dealer ${dealerUpcard}: STAND.`
        : `Player 12 vs Dealer ${dealerUpcard}: HIT.`;
    }
    if (pScore === 11) {
      return 'Player 11: Always DOUBLE DOWN for maximum mathematical value!';
    }
    if (pScore === 10) {
      return dealerUpcard <= 9
        ? `Player 10 vs Dealer ${dealerUpcard}: DOUBLE DOWN.`
        : 'Player 10 vs Dealer 10/A: HIT.';
    }
    if (pScore === 9) {
      return dealerUpcard >= 3 && dealerUpcard <= 6
        ? `Player 9 vs Dealer ${dealerUpcard}: DOUBLE DOWN.`
        : 'Player 9: HIT.';
    }
    return `Player ${pScore}: Always HIT to build your hand total.`;
  }, [gameState]);

  const isInGame = Boolean(
    gameState && (gameState.phase === 'PLAYER_TURN' || gameState.phase === 'PLAYER_TURN_HAND2'),
  );

  if (!mounted) return null;

  return (
    <GameErrorBoundary gameName="Blackjack">
      <div
        className="blackjack-page-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '310px 1fr 340px',
          alignItems: 'stretch',
          gap: isMobile ? '12px' : '18px',
          padding: isMobile ? '12px' : '18px',
          maxWidth: '1680px',
          width: '100%',
          minWidth: 0,
          margin: '0 auto',
          background: 'transparent',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Insurance / Even Money Interactive Prompt Modal */}
        <InsuranceModal
          isOpen={showInsurance}
          isEvenMoney={Boolean(gameState?.playerHand.isBlackjack)}
          insuranceCost={betAmount * 0.5}
          onAccept={() => {
            setShowInsurance(false);
            if (gameState?.playerHand.isBlackjack) {
              handleAction('STAND');
            } else {
              addToast('Insurance purchased.', 'info');
            }
          }}
          onDecline={() => setShowInsurance(false)}
        />

        <style>{`
        @media (max-width: 1360px) {
          .blackjack-page-container {
            grid-template-columns: 310px 1fr !important;
          }
          .blackjack-right-rules {
            grid-column: span 2;
            order: 3;
          }
        }
        @media (max-width: 960px) {
          .blackjack-page-container {
            grid-template-columns: 1fr !important;
          }
          .blackjack-left-controls {
            order: 2 !important;
          }
          .blackjack-center-stage {
            order: 1 !important;
          }
          .blackjack-right-rules {
            grid-column: span 1;
            order: 3 !important;
          }
        }
        .obsidian-glass {
          background: rgba(14, 14, 20, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.18);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .gold-btn {
          background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%);
          color: #050508;
          font-weight: 900;
          box-shadow: 0 6px 25px rgba(212, 175, 55, 0.35);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gold-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
          filter: brightness(1.1);
        }
        .quick-mod-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 7px 0;
          border-radius: 8px;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .quick-mod-btn:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #FFD700;
          transform: translateY(-1px);
        }
        .quick-mod-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        `}</style>

        {/* ── 1. LEFT SIDEBAR: FLIGHT CONTROLS (DIRECT DEAL PLACEMENT) ── */}
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
                  setBetAmount(
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
                onClick={() =>
                  setBetAmount((v) => Math.max(betMin, parseFloat((v / 2).toFixed(2))))
                }
              >
                ½
              </button>
              <button
                className="quick-mod-btn"
                disabled={isInGame || isProcessing}
                onClick={() =>
                  setBetAmount((v) => Math.min(betMax, parseFloat((v * 2).toFixed(2))))
                }
              >
                2×
              </button>
              <button
                className="quick-mod-btn"
                disabled={isInGame || isProcessing}
                onClick={() => setBetAmount(betMin)}
              >
                Min
              </button>
              <button
                className="quick-mod-btn"
                disabled={isInGame || isProcessing}
                onClick={() => setBetAmount(Math.min(betMax, balance))}
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
                    onClick={() => !isInGame && setBetAmount(chip.amount)}
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

          {/* Deal Button (Directly under Session Performance!) */}
          <button
            className="gold-btn"
            disabled={isInGame || isProcessing}
            onClick={handleDeal}
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

        {/* ── 2. CENTER STAGE: MONTE CARLO VIP TABLE ── */}
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
              onHit={() => handleAction('HIT')}
              onStand={() => handleAction('STAND')}
              onDouble={() => handleAction('DOUBLE')}
              onSplit={() => handleAction('SPLIT')}
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
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                LAST OUTCOME
              </div>
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
              <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                TOTAL ROUNDS
              </div>
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

        {/* ── 3. RIGHT SIDEBAR: OPTION 1 — RULES, STRATEGY HEATMAP & VIP BADGES ── */}
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

            {/* Live Basic Strategy Coach */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="#FFD700" />
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: '#FFD700',
                    letterSpacing: '0.5px',
                  }}
                >
                  LIVE STRATEGY COACH
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.72rem',
                  lineHeight: '1.4',
                  color: '#e2e8f0',
                  fontWeight: 600,
                }}
              >
                {strategyAdvice}
              </p>
            </div>

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
                  <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                    Continuous auto-shuffle
                  </span>
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
      </div>
    </GameErrorBoundary>
  );
}
