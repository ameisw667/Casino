'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Zap,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Sliders,
  Flame,
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { soundManager } from '@/lib/casino/sound-manager';
import { motion } from 'framer-motion';

interface DiceHistoryItem {
  roll: number;
  win: boolean;
  multiplier: number;
  id: string;
}

export default function DicePage() {
  const isMobile = useCasinoStore((state) => state.isMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const balance = useCasinoStore((state) => state.balance);
  const provablyFairSettings = useCasinoStore((state) => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore((state) => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore((state) => state.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((state) => state.applyServerWalletSnapshot);
  const addToast = useCasinoStore((state) => state.addToast);
  const isProcessing = useCasinoStore((state) => state.isProcessing);
  const setIsProcessing = useCasinoStore((state) => state.setIsProcessing);
  const { betMin, betMax } = useCasinoStore((state) => state.gameConfig.limits);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(2.0);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<DiceHistoryItem | null>(null);
  const [history, setHistory] = useState<DiceHistoryItem[]>([]);
  const [isRollOver, setIsRollOver] = useState(true);
  const [winChance, setWinChance] = useState(49.5);
  const [targetPoint, setTargetPoint] = useState(50.5);
  const [visualResult, setVisualResult] = useState<number | null>(null);
  const [displayTicker, setDisplayTicker] = useState<number | null>(null);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [winStreak, setWinStreak] = useState(0);

  // Session stats tracker
  const [sessionStats, setSessionStats] = useState({
    rounds: 0,
    wins: 0,
    profit: 0,
    biggestMultiplier: 0,
  });

  // Auto-betting state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoBetSettings = useCasinoStore((state) => state.autoBetSettings.dice);
  const setAutoBetSettings = useCasinoStore((state) => state.setAutoBetSettings);
  const updateAutoSettings = (
    updater:
      ((prev: typeof autoBetSettings) => typeof autoBetSettings) | Partial<typeof autoBetSettings>,
  ) => {
    const newSettings =
      typeof updater === 'function' ? updater(autoBetSettings) : { ...autoBetSettings, ...updater };
    setAutoBetSettings('dice', newSettings);
  };

  const [currentAutoCount, setCurrentAutoCount] = useState(0);
  const [baseBetAmount, setBaseBetAmount] = useState(10);

  const profitOnWin = useMemo(() => betAmount * (multiplier - 1), [betAmount, multiplier]);

  // Calculations: Standard 1% House Edge
  const updateFromWinChance = useCallback(
    (chance: number) => {
      const val = Math.max(0.01, Math.min(98.99, chance));
      setWinChance(parseFloat(val.toFixed(2)));
      const newMult = 99 / val;
      setMultiplier(parseFloat(newMult.toFixed(4)));
      setTargetPoint(parseFloat((isRollOver ? 100 - val : val).toFixed(2)));
    },
    [isRollOver],
  );

  const updateFromMultiplier = useCallback(
    (mult: number) => {
      const val = Math.max(1.0102, Math.min(9900, mult));
      setMultiplier(parseFloat(val.toFixed(4)));
      const newChance = 99 / val;
      setWinChance(parseFloat(newChance.toFixed(2)));
      setTargetPoint(parseFloat((isRollOver ? 100 - newChance : newChance).toFixed(2)));
    },
    [isRollOver],
  );

  const updateFromTarget = useCallback(
    (target: number) => {
      const val = Math.max(0.01, Math.min(99.99, target));
      setTargetPoint(parseFloat(val.toFixed(2)));
      const newChance = isRollOver ? 100 - val : val;
      setWinChance(parseFloat(newChance.toFixed(2)));
      setMultiplier(parseFloat((99 / newChance).toFixed(4)));
    },
    [isRollOver],
  );

  const toggleRollMode = () => {
    const newMode = !isRollOver;
    setIsRollOver(newMode);
    setTargetPoint(parseFloat((100 - targetPoint).toFixed(2)));
  };

  // Slider Drag Handling
  const handleSliderDrag = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(1.0, Math.min(99.0, position));
    updateFromTarget(parseFloat(clamped.toFixed(2)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDraggingThumb(true);
    handleSliderDrag(e.clientX);
    const onMouseMove = (moveEvent: MouseEvent) => handleSliderDrag(moveEvent.clientX);
    const onMouseUp = () => {
      setIsDraggingThumb(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDraggingThumb(true);
    if (e.touches[0]) handleSliderDrag(e.touches[0].clientX);
    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) handleSliderDrag(moveEvent.touches[0].clientX);
    };
    const onTouchEnd = () => {
      setIsDraggingThumb(false);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const lastBetTimeRef = useRef(0);

  // Digital Odometer Roll Animation
  const runOdometerAnimation = useCallback(
    (finalRoll: number, callback: () => void) => {
      const duration = autoRunning ? 150 : 300;
      const startTime = performance.now();
      const interval = 25;

      const timer = setInterval(() => {
        const elapsed = performance.now() - startTime;
        if (elapsed >= duration) {
          clearInterval(timer);
          setDisplayTicker(finalRoll);
          callback();
        } else {
          setDisplayTicker(parseFloat((Math.random() * 99.99).toFixed(2)));
        }
      }, interval);
    },
    [autoRunning],
  );

  const handleRoll = useCallback(async () => {
    if (isRunningRef.current) return;
    const now = Date.now();
    if (now - lastBetTimeRef.current < 150) return;
    lastBetTimeRef.current = now;

    const betError = validateBet(betAmount, balance);
    if (betError) {
      setAutoRunning(false);
      addToast(betError, 'error');
      return;
    }

    isRunningRef.current = true;
    setIsProcessing(true);
    setLoading(true);
    soundManager.play('dice-roll');

    try {
      const sanitizedClientSeed = sanitizeClientSeed(provablyFairSettings.clientSeed);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      let response: Response;
      try {
        response = await fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            gameType: 'DICE',
            amount: betAmount,
            multiplier,
            target: targetPoint,
            condition: isRollOver ? 'OVER' : 'UNDER',
            clientSeed: sanitizedClientSeed,
            currentNonce: provablyFairSettings.nonce,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429 || errData.error?.code === 'RATE_LIMITED') {
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error(
          getApiErrorMessage(errData, 'Der Einsatz konnte nicht verarbeitet werden.'),
        );
      }
      const result = await response.json();

      setProvablyFairSettings({
        serverSeedHash: result.serverSeedHash,
        nonce: result.nonce,
      });
      applyServerWalletSnapshot(result.wallet);
      processGameResult({
        game: 'DICE',
        amount: betAmount,
        multiplier: multiplier,
        payout: result.payout,
        win: result.win,
        resultId: result.id,
        isFirstBet: result.isFirstBet,
      });

      // Update session statistics
      setSessionStats((prev) => ({
        rounds: prev.rounds + 1,
        wins: prev.wins + (result.win ? 1 : 0),
        profit: prev.profit + (result.win ? result.payout - betAmount : -betAmount),
        biggestMultiplier: result.win
          ? Math.max(prev.biggestMultiplier, multiplier)
          : prev.biggestMultiplier,
      }));

      // Update win streak
      setWinStreak((prev) => (result.win ? prev + 1 : 0));

      // Run digital odometer animation
      runOdometerAnimation(result.roll, () => {
        setVisualResult(result.roll);
        const outcome = {
          roll: result.roll,
          win: result.win,
          multiplier,
          id: result.id || String(Date.now()),
        };
        setLastResult(outcome);
        setHistory((prev) => [outcome, ...prev].slice(0, 16));

        if (result.win) {
          soundManager.play('win');
        }

        if (isAutoMode) {
          if (result.win) {
            if (autoBetSettings.onWin > 0) {
              setBetAmount((prev) => prev + prev * (autoBetSettings.onWin / 100));
            } else {
              setBetAmount(baseBetAmount);
            }
          } else {
            if (autoBetSettings.onLoss > 0) {
              setBetAmount((prev) => prev + prev * (autoBetSettings.onLoss / 100));
            } else {
              setBetAmount(baseBetAmount);
            }
          }
        }
      });
    } catch (error) {
      setAutoRunning(false);
      CasinoLogger.error('Dice', 'Bet error', error);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Bet failed. Please try again.', 'error');
      }
    } finally {
      isRunningRef.current = false;
      setLoading(false);
      setIsProcessing(false);
    }
  }, [
    betAmount,
    balance,
    multiplier,
    targetPoint,
    isRollOver,
    provablyFairSettings,
    applyServerWalletSnapshot,
    processGameResult,
    setProvablyFairSettings,
    setIsProcessing,
    addToast,
    isAutoMode,
    autoBetSettings,
    baseBetAmount,
    runOdometerAnimation,
  ]);

  // Auto-Bet Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning && !loading) {
      const maxAllowed = autoBetSettings.numberOfBets > 0 ? autoBetSettings.numberOfBets : 500;

      if (currentAutoCount >= maxAllowed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast(`Auto-bet stopped: Reached limit of ${maxAllowed} bets`, 'info');
        return;
      }
      if (betAmount > betMax) {
        setAutoRunning(false);
        addToast(
          `Auto-bet stopped: Bet amount exceeded $${betMax.toLocaleString()} limit`,
          'error',
        );
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
        handleRoll();
        setCurrentAutoCount((prev) => prev + 1);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [
    autoRunning,
    loading,
    sessionStats.profit,
    currentAutoCount,
    betAmount,
    autoBetSettings,
    betMax,
    addToast,
    handleRoll,
  ]);

  useEffect(() => {
    if (!autoRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentAutoCount(0);
    }
  }, [autoRunning]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!loading && !isProcessing) handleRoll();
      }
      if (e.key === 'a') setBetAmount((prev) => Math.max(betMin, prev / 2));
      if (e.key === 's') setBetAmount((prev) => Math.min(betMax, prev * 2));
      if (e.key === 'd') setBetAmount(1);
      if (e.key === 'f') setBetAmount(balance);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, isProcessing, handleRoll, balance, betMin, betMax]);

  if (!mounted) return null;

  const handleQuickBet = (amt: number) => {
    if (loading || isProcessing) return;
    const clamped = Math.max(betMin, Math.min(betMax, Math.min(balance, amt)));
    setBetAmount(clamped);
    updateAutoSettings({ amount: clamped });
  };

  return (
    <GameErrorBoundary gameName="Dice">
      <div
        className="dice-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '330px 1fr',
          gap: isMobile ? '12px' : '20px',
          padding: isMobile ? '12px' : '20px',
          maxWidth: '1600px',
          width: '100%',
          minWidth: 0,
          margin: '0 auto',
        }}
      >
        <style>{`
        .dice-container {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 20px;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        @media (max-width: 1024px) {
          .dice-container {
            grid-template-columns: 1fr;
            flex-wrap: nowrap !important;
          }
          .dice-sidebar {
            order: 2 !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .dice-main {
            order: 1 !important;
            width: 100% !important;
          }
          .dice-stat-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .dice-stat-grid > div {
            min-width: 0 !important;
          }
          .dice-stat-grid > div:last-child {
            grid-column: span 2 !important;
          }
        }
        .obsidian-glass {
          background: rgba(14, 14, 20, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.15);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
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
        .quick-chip {
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
        .quick-chip:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #FFD700;
          transform: translateY(-1px);
        }
        .quick-chip:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .hud-card {
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 18px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.2s ease;
        }
        .hud-card:focus-within {
          border: 1px solid rgba(212, 175, 55, 0.6);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

        {/* 0. BASE: OBSIDIAN & GOLD FLIGHT-CONTROLS SIDEBAR */}
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
                if (!autoRunning) setIsAutoMode(false);
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
                if (!autoRunning) setIsAutoMode(true);
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
                  setBetAmount(val);
                  updateAutoSettings({ amount: val });
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
                  disabled={loading || autoRunning}
                  onClick={() => handleQuickBet(amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                className="quick-chip"
                disabled={loading || autoRunning}
                onClick={() => handleQuickBet(betAmount / 2)}
              >
                ½ Bet
              </button>
              <button
                className="quick-chip"
                disabled={loading || autoRunning}
                onClick={() => handleQuickBet(betAmount * 2)}
              >
                2× Bet
              </button>
              <button
                className="quick-chip"
                disabled={loading || autoRunning}
                onClick={() => handleQuickBet(balance)}
                style={{ color: '#FFD700' }}
              >
                MAX
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
                  onChange={(e) => updateAutoSettings({ numberOfBets: Number(e.target.value) })}
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
                    onChange={(e) => updateAutoSettings({ onWin: Number(e.target.value) })}
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
                    onChange={(e) => updateAutoSettings({ onLoss: Number(e.target.value) })}
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
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}
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
                <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700 }}>
                  NET PROFIT
                </div>
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
            onClick={() => {
              if (isAutoMode) {
                if (!autoRunning) {
                  setBaseBetAmount(betAmount);
                  setAutoRunning(true);
                } else {
                  setAutoRunning(false);
                }
              } else {
                handleRoll();
              }
            }}
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

        {/* 4. LEVER 4: MAIN STAGE WITH GEOMETRIC OBSIDIAN BACKDROP */}
        <div
          className="dice-main game-area obsidian-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
            padding: isMobile ? '16px' : '28px',
            borderRadius: '28px',
            order: isMobile ? 1 : 2,
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 50%, #101018 0%, #06060a 100%)',
          }}
        >
          {/* Subtle Isometric Geometric Grid Line Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.05,
              backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.4) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Victory Radial Glow Flash on Win */}
          {lastResult?.win && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.25, 0] }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
              }}
            />
          )}

          {/* Top Bar: Win Streak & 3. LEVER 3: INTERACTIVE HISTORY PILLS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 5,
            }}
          >
            {winStreak >= 2 ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  color: '#FFD700',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                <Flame size={14} color="#FFD700" />
                <span>{winStreak}× WIN STREAK</span>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800 }}>
                ROLL HISTORY
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                maxWidth: '70%',
              }}
            >
              {history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    fontFamily: 'monospace',
                    color: h.win ? (h.multiplier >= 10 ? '#FFD700' : '#4ade80') : '#f87171',
                    background: h.win
                      ? h.multiplier >= 10
                        ? 'rgba(255, 215, 0, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${
                      h.win
                        ? h.multiplier >= 10
                          ? 'rgba(255, 215, 0, 0.5)'
                          : 'rgba(16, 185, 129, 0.35)'
                        : 'rgba(239, 68, 68, 0.25)'
                    }`,
                  }}
                >
                  {h.roll.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          {/* 2. LEVER 2: DIGITAL ODOMETER & CENTRAL RESULT DISPLAY */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: isMobile ? '160px' : '220px',
              position: 'relative',
              zIndex: 5,
            }}
          >
            {displayTicker !== null || lastResult !== null ? (
              <motion.div
                key={lastResult?.id || 'ticker'}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  fontSize: isMobile ? '5.5rem' : 'min(9.5rem, 18vw)',
                  fontWeight: 900,
                  color: loading ? '#FFFDF0' : lastResult?.win ? '#4ade80' : '#ef4444',
                  textShadow: loading
                    ? '0 0 35px rgba(255, 255, 255, 0.5)'
                    : lastResult?.win
                      ? '0 0 50px rgba(74, 222, 128, 0.7)'
                      : '0 0 50px rgba(239, 68, 68, 0.7)',
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {(displayTicker !== null ? displayTicker : lastResult?.roll || 50.0).toFixed(2)}
              </motion.div>
            ) : (
              <div
                className="pulse-glow"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'rgba(212, 175, 55, 0.7)',
                }}
              >
                <Sparkles size={36} color="#FFD700" />
                <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '3px' }}>
                  SET YOUR TARGET & ROLL
                </span>
              </div>
            )}
          </div>

          {/* 1. LEVER 1: 24PX LUXURY-SLIDER WITH DYNAMIC GOLD TARGET-THUMB & TOOLTIP */}
          <div
            ref={sliderRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{
              position: 'relative',
              padding: '30px 0',
              cursor: 'pointer',
              touchAction: 'none',
              userSelect: 'none',
              zIndex: 10,
            }}
          >
            {/* 24px Rounded Track */}
            <div
              style={{
                height: '24px',
                width: '100%',
                background: '#0a0a0f',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Green Win Zone */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: isRollOver ? `${targetPoint}%` : 0,
                  right: isRollOver ? 0 : `${100 - targetPoint}%`,
                  background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                  transition: isDraggingThumb ? 'none' : 'all 0.15s ease',
                }}
              />

              {/* Red Loss Zone */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: isRollOver ? 0 : `${targetPoint}%`,
                  right: isRollOver ? `${100 - targetPoint}%` : 0,
                  background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                  transition: isDraggingThumb ? 'none' : 'all 0.15s ease',
                }}
              />
            </div>

            {/* Dynamic Result Marker Pin */}
            {visualResult !== null && (
              <div
                style={{
                  position: 'absolute',
                  left: `${visualResult}%`,
                  top: '42px',
                  transform: 'translate(-50%, -50%)',
                  width: '6px',
                  height: '42px',
                  zIndex: 25,
                  pointerEvents: 'none',
                  transition: loading
                    ? 'none'
                    : 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: `10px solid ${lastResult?.win ? '#4ade80' : '#ef4444'}`,
                    filter: `drop-shadow(0 0 8px ${lastResult?.win ? 'rgba(74, 222, 128, 0.8)' : 'rgba(239, 68, 68, 0.8)'})`,
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '3px',
                    background: lastResult?.win ? '#4ade80' : '#ef4444',
                    boxShadow: `0 0 16px ${lastResult?.win ? 'rgba(74, 222, 128, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
                  }}
                />
              </div>
            )}

            {/* 24k Gold Precision Slider Thumb */}
            <div
              style={{
                position: 'absolute',
                top: '42px',
                left: `${targetPoint}%`,
                transform: 'translate(-50%, -50%)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 45%, #AA820A 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.5)',
                border: '3px solid #14141a',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30,
                transition: isDraggingThumb ? 'none' : 'left 0.15s ease',
              }}
            >
              {/* Floating Target Tooltip */}
              <div
                style={{
                  position: 'absolute',
                  top: '-42px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(14, 14, 20, 0.95)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  color: '#FFD700',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                  pointerEvents: 'none',
                }}
              >
                {isRollOver ? `OVER ${targetPoint.toFixed(2)}` : `UNDER ${targetPoint.toFixed(2)}`}
              </div>

              {/* Thumb Center Grip Needle */}
              <div
                style={{
                  width: '4px',
                  height: '20px',
                  borderRadius: '2px',
                  background: '#0a0a0f',
                }}
              />
            </div>

            {/* Slider Scale Ticks */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '16px',
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* 5. LEVER 5: 3-SÄULEN-HUD MIT OVER/UNDER-TOGGLE & QUICK MULTIPLIER CHIPS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
              position: 'relative',
              zIndex: 5,
            }}
          >
            {/* Column 1: Multiplier Input + Quick Presets */}
            <div className="hud-card">
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#FFD700" />
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                    MULTIPLIER
                  </label>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#FFD700',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                  }}
                >
                  ×
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="1.0102"
                max="9900"
                value={multiplier}
                onChange={(e) => updateFromMultiplier(parseFloat(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                {[2.0, 5.0, 10.0, 50.0, 100.0].map((m) => (
                  <button
                    key={m}
                    className="quick-chip"
                    style={{
                      background:
                        multiplier === m ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.04)',
                      border:
                        multiplier === m
                          ? '1px solid rgba(212, 175, 55, 0.5)'
                          : '1px solid rgba(255,255,255,0.08)',
                      color: multiplier === m ? '#FFD700' : '#cbd5e1',
                    }}
                    onClick={() => updateFromMultiplier(m)}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Roll Target with Animated Over/Under Switch */}
            <div className="hud-card">
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isRollOver ? (
                    <ArrowUpRight size={14} color="#4ade80" />
                  ) : (
                    <ArrowDownRight size={14} color="#f87171" />
                  )}
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                    {isRollOver ? 'ROLL OVER' : 'ROLL UNDER'}
                  </label>
                </div>
                <button
                  onClick={toggleRollMode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    color: '#FFD700',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>SWAP</span>
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="99.99"
                value={targetPoint}
                onChange={(e) => updateFromTarget(parseFloat(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    width: `${targetPoint}%`,
                    background: isRollOver ? '#ef4444' : '#10b981',
                  }}
                />
                <div
                  style={{
                    width: `${100 - targetPoint}%`,
                    background: isRollOver ? '#10b981' : '#ef4444',
                  }}
                />
              </div>
            </div>

            {/* Column 3: Win Chance Input */}
            <div className="hud-card">
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Percent size={14} color="#4ade80" />
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                    WIN CHANCE
                  </label>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#4ade80',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                  }}
                >
                  %
                </span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="98.99"
                value={winChance}
                onChange={(e) => updateFromWinChance(parseFloat(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${winChance}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.15s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
