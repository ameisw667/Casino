'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Zap,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Trophy,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

import { useCasinoStore } from '@/store/useCasinoStore';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { SlotReel, REEL_WINDOW_HEIGHT } from '@/components/casino/games/slots/SlotReel';
import { WinLine } from '@/components/casino/games/slots/WinLine';
import { CoinShower } from '@/components/casino/games/slots/CoinShower';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { CasinoLogger } from '@/lib/casino/logger';
import { GAME_SYMBOLS, STAGGER_DELAYS_MS, TOTAL_SPIN_MS } from './symbols';
import { SlotSymbol, type SymbolType } from '@/components/casino/SlotSymbol';

const REEL_COUNT = 5;

type ReelSymbols = [SymbolType, SymbolType, SymbolType];
type WinningRows = [boolean, boolean, boolean];

const POOL_SIZE = GAME_SYMBOLS.length;

function buildReel(idx: number): ReelSymbols {
  return [
    GAME_SYMBOLS[(idx + POOL_SIZE - 1) % POOL_SIZE],
    GAME_SYMBOLS[idx % POOL_SIZE],
    GAME_SYMBOLS[(idx + 1) % POOL_SIZE],
  ];
}

const DEFAULT_REELS: ReelSymbols[] = Array(REEL_COUNT)
  .fill(null)
  .map((_, i) => buildReel(i % POOL_SIZE));

const NO_WIN: WinningRows = [false, false, false];

const PAYTABLE: {
  symbolKey: SymbolType;
  name: string;
  tier: string;
  mult3: number;
  mult4: number;
  mult5: number;
  color: string;
}[] = [
  {
    symbolKey: 'zeus',
    name: 'ZEUS',
    tier: 'LEG',
    mult3: 10,
    mult4: 25,
    mult5: 75,
    color: '#FFD700',
  },
  {
    symbolKey: 'crown',
    name: 'CROWN',
    tier: 'EPIC',
    mult3: 5,
    mult4: 12,
    mult5: 35,
    color: '#FFD700',
  },
  {
    symbolKey: 'chalice',
    name: 'CHALICE',
    tier: 'RARE',
    mult3: 4,
    mult4: 8,
    mult5: 20,
    color: '#FF8C00',
  },
  {
    symbolKey: 'card_ace',
    name: 'ACE',
    tier: 'HIGH',
    mult3: 3,
    mult4: 6,
    mult5: 15,
    color: '#DC2626',
  },
  {
    symbolKey: 'card_king',
    name: 'KING',
    tier: 'MID',
    mult3: 2.5,
    mult4: 5,
    mult5: 12,
    color: '#EA580C',
  },
  {
    symbolKey: 'card_queen',
    name: 'QUEEN',
    tier: 'MID',
    mult3: 2,
    mult4: 4,
    mult5: 10,
    color: '#2563EB',
  },
  {
    symbolKey: 'card_jack',
    name: 'JACK',
    tier: 'LOW',
    mult3: 1.5,
    mult4: 3,
    mult5: 8,
    color: '#059669',
  },
  {
    symbolKey: 'card_ten',
    name: 'TEN',
    tier: 'LOW',
    mult3: 1,
    mult4: 2,
    mult5: 5,
    color: '#64748B',
  },
];

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

export default function SlotsPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const balance = useCasinoStore((s) => s.balance);
  const provablyFair = useCasinoStore((s) => s.provablyFairSettings);
  const setPF = useCasinoStore((s) => s.setProvablyFairSettings);
  const processResult = useCasinoStore((s) => s.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((s) => s.applyServerWalletSnapshot);
  const addToast = useCasinoStore((s) => s.addToast);
  const isProcessing = useCasinoStore((s) => s.isProcessing);
  const setProcessing = useCasinoStore((s) => s.setIsProcessing);
  const { betMin, betMax } = useCasinoStore((s) => s.gameConfig.limits);

  type LastResult = { type: 'win' | 'loss' | 'idle'; amount: number; multiplier?: number };

  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult>({ type: 'idle', amount: 0 });
  const [finalReels, setFinalReels] = useState<ReelSymbols[]>(DEFAULT_REELS);
  const [winRows, setWinRows] = useState<WinningRows[]>(Array(REEL_COUNT).fill(NO_WIN));
  const [winningRowIndex, setWinningRowIndex] = useState<0 | 1 | 2 | null>(null);
  const [history, setHistory] = useState<{ multiplier: number; amount: number; win: boolean }[]>(
    [],
  );
  const [isAnticipatingReel, setIsAnticipatingReel] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Session stats
  const [sessionStats, setSessionStats] = useState({
    rounds: 0,
    wins: 0,
    profit: 0,
  });

  // Auto-Pilot state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoBetSettings, setAutoBetSettings] = useState({
    numberOfBets: 0,
    stopOnProfit: 0,
    stopOnLoss: 0,
  });
  const [autoCount, setAutoCount] = useState(0);

  const maxPotentialWin = useMemo(() => betAmount * 75, [betAmount]);

  const lastSpinTimeRef = useRef(0);

  const handleSpin = useCallback(async () => {
    if (isSpinning || isProcessing) return;
    const now = Date.now();
    if (now - lastSpinTimeRef.current < 200) return;
    lastSpinTimeRef.current = now;

    const betError = validateBet(betAmount, balance);
    if (betError) {
      setAutoRunning(false);
      addToast(betError, 'error');
      return;
    }

    setProcessing(true);
    setWinRows(Array(REEL_COUNT).fill(NO_WIN));
    setWinningRowIndex(null);
    setLastResult({ type: 'idle', amount: 0 });
    setIsAnticipatingReel([false, false, false, false, false]);

    const sanitizedSeed = sanitizeClientSeed(provablyFair.clientSeed);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      // 1. Fetch server outcome FIRST before triggering physical reel rotation
      const res = await fetch('/api/casino/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          gameType: 'SLOTS',
          amount: betAmount,
          clientSeed: sanitizedSeed,
          currentNonce: provablyFair.nonce,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429 || errData.error?.code === 'RATE_LIMITED') {
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error(getApiErrorMessage(errData, 'Der Spin konnte nicht verarbeitet werden.'));
      }
      const data = await res.json();

      setPF({ serverSeedHash: data.serverSeedHash, nonce: data.nonce });

      // 2. Set new target reels in state SO SlotReel animates directly into them
      const engineSymbols: number[] = data.symbols ?? [];
      const newReels =
        engineSymbols.length === REEL_COUNT ? engineSymbols.map(buildReel) : DEFAULT_REELS;

      setFinalReels(newReels);

      // Check for Anticipation on Reels 0 & 1 center row
      const center0 = newReels[0][1];
      const center1 = newReels[1][1];
      const isHighTier =
        center0 === 'zeus' ||
        center0 === 'crown' ||
        center0 === 'chalice' ||
        center0 === 'card_ace';
      if (center0 === center1 && isHighTier) {
        setIsAnticipatingReel([false, false, true, true, true]);
      }

      // 3. NOW trigger visual reel spin with the exact server symbols (ZERO JUMP)
      setIsSpinning(true);
      soundManager.play('slots-spin');

      // 4. Wait for mechanical reels to sequentially stop and land
      await new Promise((r) => setTimeout(r, TOTAL_SPIN_MS));

      const mult = data.payout > 0 ? parseFloat((data.payout / betAmount).toFixed(2)) : 0;

      if (data.payout > 0) {
        setLastResult({ type: 'win', amount: data.payout, multiplier: mult });
        soundManager.play('slots-win');
      } else {
        setLastResult({ type: 'loss', amount: betAmount, multiplier: 0 });
      }

      // 5. Strict Center-Payline Evaluation (Row 1 ONLY)
      if (data.win && engineSymbols.length > 0) {
        const centerSymbols = newReels.map((reel) => reel[1]);
        const counts: Record<string, number> = {};
        centerSymbols.forEach((s) => {
          counts[s] = (counts[s] ?? 0) + 1;
        });
        const winningSymEntry = Object.entries(counts).find(([, c]) => c >= 3);
        const winningSym = winningSymEntry ? winningSymEntry[0] : null;

        if (winningSym) {
          const newWinRows: WinningRows[] = newReels.map((reel) => [
            false,
            reel[1] === winningSym,
            false,
          ]);
          setWinRows(newWinRows);
          setWinningRowIndex(1); // Center payline is row 1
        }
      }

      const net = (data.payout ?? 0) - betAmount;
      setSessionStats((prev) => ({
        rounds: prev.rounds + 1,
        wins: prev.wins + (data.win ? 1 : 0),
        profit: prev.profit + net,
      }));

      setHistory((prev) =>
        [{ multiplier: mult, amount: data.payout ?? 0, win: data.win ?? false }, ...prev].slice(
          0,
          14,
        ),
      );

      applyServerWalletSnapshot(data.wallet);
      processResult({
        game: 'SLOTS',
        amount: betAmount,
        multiplier: mult,
        payout: data.payout ?? 0,
        win: data.win ?? false,
        resultId: data.id ?? Math.random().toString(36).slice(2),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      setAutoRunning(false);
      CasinoLogger.error('Slots', 'Spin error', error);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Spin failed. Please try again.', 'error');
      }
    } finally {
      setIsSpinning(false);
      setProcessing(false);
    }
  }, [
    isSpinning,
    isProcessing,
    betAmount,
    balance,
    provablyFair,
    addToast,
    setPF,
    processResult,
    applyServerWalletSnapshot,
    setProcessing,
  ]);

  // Spacebar Hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin]);

  // Auto-Bet Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning && !isSpinning && !isProcessing) {
      const maxAllowed = autoBetSettings.numberOfBets > 0 ? autoBetSettings.numberOfBets : 500;
      if (autoCount >= maxAllowed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast(`Auto-bet stopped: Reached limit of ${maxAllowed} spins`, 'info');
        return;
      }
      if (autoBetSettings.stopOnProfit > 0 && sessionStats.profit >= autoBetSettings.stopOnProfit) {
        setAutoRunning(false);
        addToast('Auto-bet stopped: Profit goal reached!', 'success');
        return;
      }
      if (
        autoBetSettings.stopOnLoss > 0 &&
        Math.abs(sessionStats.profit) >= autoBetSettings.stopOnLoss &&
        sessionStats.profit < 0
      ) {
        setAutoRunning(false);
        addToast('Auto-bet stopped: Loss limit reached', 'info');
        return;
      }

      timer = setTimeout(() => {
        handleSpin();
        setAutoCount((prev) => prev + 1);
      }, 900);
    }
    return () => clearTimeout(timer);
  }, [
    autoRunning,
    isSpinning,
    isProcessing,
    autoBetSettings,
    autoCount,
    sessionStats.profit,
    addToast,
    handleSpin,
  ]);

  const hasWin = lastResult.type === 'win';
  const isBigWin = hasWin && (lastResult.multiplier ?? 0) >= 10;

  if (!mounted) return null;

  return (
    <GameErrorBoundary gameName="Slots">
      <div
        className="slots-page-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '310px 1fr 360px',
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
        {/* Coin Shower for Big Wins (Multiplier >= 10x) */}
        <CoinShower isVisible={isBigWin && !isSpinning} />

        <style>{`
        @media (max-width: 1360px) {
          .slots-page-container {
            grid-template-columns: 310px 1fr !important;
          }
          .slots-right-paytable {
            grid-column: span 2;
            order: 3;
          }
        }
        @media (max-width: 960px) {
          .slots-page-container {
            grid-template-columns: 1fr !important;
          }
          .slots-left-controls {
            order: 2 !important;
          }
          .slots-center-stage {
            order: 1 !important;
          }
          .slots-right-paytable {
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

        {/* ── 1. LEFT SIDEBAR: FLIGHT CONTROLS ── */}
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
                  if (!autoRunning) setIsAutoMode(false);
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
                  if (!autoRunning) setIsAutoMode(true);
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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}
              >
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
                  disabled={isSpinning || autoRunning}
                  onClick={() =>
                    setBetAmount((v) => Math.max(betMin, parseFloat((v / 2).toFixed(2))))
                  }
                >
                  ½
                </button>
                <button
                  className="quick-mod-btn"
                  disabled={isSpinning || autoRunning}
                  onClick={() =>
                    setBetAmount((v) => Math.min(betMax, parseFloat((v * 2).toFixed(2))))
                  }
                >
                  2×
                </button>
                <button
                  className="quick-mod-btn"
                  disabled={isSpinning || autoRunning}
                  onClick={() => setBetAmount(betMin)}
                >
                  Min
                </button>
                <button
                  className="quick-mod-btn"
                  disabled={isSpinning || autoRunning}
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
                      onClick={() => setBetAmount(chip.amount)}
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
                      setAutoBetSettings((prev) => ({
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
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}
              >
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
                  setAutoRunning(!autoRunning);
                } else {
                  handleSpin();
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

        {/* ── 2. CENTER STAGE: ZEUS VAULT 3D SLOT CABINET ── */}
        <div
          className="slots-center-stage obsidian-glass"
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
            {/* Top Bar: Title & Recent Multipliers */}
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
                  LIVE OLYMPUS VAULT
                </span>
              </div>

              {/* Recent History Multipliers */}
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
                      color: h.win ? '#FFD700' : '#64748b',
                      background: h.win ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: h.win
                        ? '1px solid rgba(212, 175, 55, 0.45)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {h.win ? `${h.multiplier}×` : '0×'}
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Slot Machine Cabinet */}
            <div
              className="slot-machine"
              style={{
                width: '100%',
                margin: '0 auto',
                background:
                  'radial-gradient(ellipse at 50% 20%, #1a1610 0%, #0c0b10 70%, #050508 100%)',
                border: '2px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '24px',
                padding: '16px',
                boxShadow: '0 15px 45px rgba(0,0,0,0.85), inset 0 0 30px rgba(0,0,0,0.9)',
              }}
            >
              {/* Cabinet Top Header */}
              <div
                className="slot-machine-top"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                }}
              >
                <h2
                  className="slot-machine-title"
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: '#FFF',
                    textShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
                  }}
                >
                  ZEUS VAULT
                </h2>
                <div className="slot-machine-lights" style={{ display: 'flex', gap: '6px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="slot-light"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isSpinning ? '#FFD700' : 'rgba(212, 175, 55, 0.4)',
                        boxShadow: isSpinning ? '0 0 8px #FFD700' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Reels Container: Fixed 336px Height */}
              <div
                className="slot-reels-container"
                style={{
                  position: 'relative',
                  height: `${REEL_WINDOW_HEIGHT + 24}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#040406',
                  borderRadius: '18px',
                  padding: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  overflow: 'hidden',
                }}
              >
                {/* Dynamic Win Banner Overlay */}
                <AnimatePresence>
                  {hasWin && !isSpinning && (
                    <motion.div
                      className="slot-win-banner"
                      initial={{ opacity: 0, scale: 0.7, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 30,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 22px',
                        borderRadius: '999px',
                        background:
                          'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
                        boxShadow:
                          '0 0 35px rgba(255, 215, 0, 0.9), 0 0 70px rgba(212, 175, 55, 0.5)',
                        color: '#000',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        fontSize: '1.25rem',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <Zap size={20} fill="#000" />
                      <span>
                        WIN +${lastResult.amount.toFixed(2)} ({lastResult.multiplier}×)
                      </span>
                      <Zap size={20} fill="#000" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 5-Reel Frame: Strictly 5 Columns x 3 Rows */}
                <div
                  className="slot-reels-frame"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '6px',
                    width: '100%',
                    height: `${REEL_WINDOW_HEIGHT}px`,
                    position: 'relative',
                  }}
                >
                  {finalReels.map((reelSyms, i) => (
                    <React.Fragment key={i}>
                      <SlotReel
                        finalSymbols={reelSyms}
                        isSpinning={isSpinning}
                        stopDelay={STAGGER_DELAYS_MS[i] + (isAnticipatingReel[i] ? 600 : 0)}
                        winningRows={winRows[i] ?? NO_WIN}
                        symbolPool={GAME_SYMBOLS}
                        isAnticipating={isAnticipatingReel[i] && isSpinning}
                        hasWinInCabinet={hasWin && !isSpinning}
                      />
                    </React.Fragment>
                  ))}
                  <WinLine rowIndex={winningRowIndex} isVisible={hasWin && !isSpinning} />
                </div>
              </div>

              {/* Machine Base Readouts */}
              <div
                className="slot-machine-base"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginTop: '14px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                    LAST RESULT
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      color:
                        lastResult.type === 'win'
                          ? '#4ade80'
                          : lastResult.type === 'loss'
                            ? '#f87171'
                            : '#94a3b8',
                    }}
                  >
                    {lastResult.type === 'win' && `+$${lastResult.amount.toFixed(2)}`}
                    {lastResult.type === 'loss' && `-$${lastResult.amount.toFixed(2)}`}
                    {lastResult.type === 'idle' && '—'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 800 }}>
                    TOTAL SPINS
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
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#64748b',
              fontSize: '0.68rem',
              fontWeight: 700,
              paddingTop: '6px',
            }}
          >
            <Sparkles size={13} color="#D4AF37" />
            <span>VIP OLYMPUS HIGH ROLLER SUITE</span>
          </div>
        </div>

        {/* ── 3. RIGHT SIDEBAR: STRUCTURED VIP PAYTABLE ── */}
        <div
          className="slots-right-paytable obsidian-glass"
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
            {/* Paytable Header */}
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
                  <Trophy size={16} color="#FFD700" />
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
                  PAYTABLE & VALUES
                </h3>
              </div>
            </div>

            {/* Payline Info Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                fontSize: '0.68rem',
                color: '#cbd5e1',
              }}
            >
              <HelpCircle size={14} color="#FFD700" style={{ flexShrink: 0 }} />
              <span>
                Wins pay on <strong>Center Line</strong> (Row 2). Multipliers calculate on{' '}
                <strong>${betAmount.toFixed(2)}</strong> bet.
              </span>
            </div>

            {/* Table Header Columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '105px 1fr 1fr 1fr',
                gap: '4px',
                padding: '4px 6px',
                fontSize: '0.62rem',
                fontWeight: 900,
                color: '#64748b',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'right',
              }}
            >
              <div style={{ textAlign: 'left' }}>SYMBOL</div>
              <div>3× HIT</div>
              <div>4× HIT</div>
              <div>5× HIT</div>
            </div>

            {/* 8 Symbol Tiers with Authentic SlotSymbol Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {PAYTABLE.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '105px 1fr 1fr 1fr',
                    gap: '4px',
                    alignItems: 'center',
                    padding: '6px 6px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontSize: '0.74rem',
                  }}
                >
                  {/* Col 1: Authentic SlotSymbol Icon & Tier */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'left',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SlotSymbol type={item.symbolKey} size={20} />
                    </div>
                    <span
                      style={{
                        fontWeight: 900,
                        color: item.color,
                        fontSize: '0.76rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.52rem',
                        fontWeight: 800,
                        padding: '1px 3px',
                        borderRadius: '3px',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#94a3b8',
                      }}
                    >
                      {item.tier}
                    </span>
                  </div>

                  {/* Col 2: 3x Hit */}
                  <div style={{ color: '#cbd5e1' }}>${(betAmount * item.mult3).toFixed(2)}</div>

                  {/* Col 3: 4x Hit */}
                  <div style={{ color: '#cbd5e1' }}>${(betAmount * item.mult4).toFixed(2)}</div>

                  {/* Col 4: 5x Hit */}
                  <div style={{ color: '#4ade80', fontWeight: 900 }}>
                    ${(betAmount * item.mult5).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paytable Footer Info */}
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
            <span>96.5% THEORETICAL RTP • 5 PAYLINE REELS</span>
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
