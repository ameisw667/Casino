'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { soundManager } from '@/lib/casino/sound-manager';
import { dicePageStyles } from '@/components/casino/games/dice/dice-page-styles';
import { useDiceOdometer } from '@/components/casino/games/dice/useDiceOdometer';
import { DiceControlSidebar } from '@/components/casino/games/dice/DiceControlSidebar';
import { DiceCenterStage } from '@/components/casino/games/dice/DiceCenterStage';
import type { DiceHistoryItem, SessionStats } from '@/components/casino/games/dice/dice-config';

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
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [winStreak, setWinStreak] = useState(0);

  // Session stats tracker
  const [sessionStats, setSessionStats] = useState<SessionStats>({
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

  // Digital Odometer Roll Animation (extracted into a hook so the ticker state
  // travels with the animation callback it belongs to).
  const { displayTicker, runOdometerAnimation } = useDiceOdometer(autoRunning);

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
        if (loading || isProcessing) return;
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
        return;
      }
      if (e.key === 'a') setBetAmount((prev) => Math.max(betMin, prev / 2));
      if (e.key === 's') setBetAmount((prev) => Math.min(betMax, prev * 2));
      if (e.key === 'd') setBetAmount(1);
      if (e.key === 'f') setBetAmount(balance);
      if (e.key === 't') toggleRollMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    loading,
    isProcessing,
    handleRoll,
    balance,
    betMin,
    betMax,
    toggleRollMode,
    isAutoMode,
    autoRunning,
    setAutoRunning,
    setBaseBetAmount,
    betAmount,
  ]);

  if (!mounted) return null;

  const handleQuickBet = (amt: number) => {
    if (loading || isProcessing) return;
    const clamped = Math.max(betMin, Math.min(betMax, Math.min(balance, amt)));
    setBetAmount(clamped);
    updateAutoSettings({ amount: clamped });
  };

  const handlePrimaryAction = () => {
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
        <style>{dicePageStyles}</style>

        {/* 0. BASE: OBSIDIAN & GOLD FLIGHT-CONTROLS SIDEBAR */}
        <DiceControlSidebar
          isMobile={isMobile}
          balance={balance}
          betAmount={betAmount}
          onBetAmountChange={(val) => {
            setBetAmount(val);
            updateAutoSettings({ amount: val });
          }}
          isAutoMode={isAutoMode}
          onSetAutoMode={setIsAutoMode}
          autoRunning={autoRunning}
          loading={loading}
          isProcessing={isProcessing}
          profitOnWin={profitOnWin}
          multiplier={multiplier}
          autoBetSettings={autoBetSettings}
          onAutoBetSettingsChange={(patch) => updateAutoSettings(patch)}
          sessionStats={sessionStats}
          targetPoint={targetPoint}
          isRollOver={isRollOver}
          onQuickBet={handleQuickBet}
          onPrimaryAction={handlePrimaryAction}
        />

        {/* 4. LEVER 4: MAIN STAGE WITH GEOMETRIC OBSIDIAN BACKDROP */}
        <DiceCenterStage
          isMobile={isMobile}
            loading={loading}
            lastResult={lastResult}
            displayTicker={displayTicker}
            history={history}
            winStreak={winStreak}
            visualResult={visualResult}
            targetPoint={targetPoint}
            isRollOver={isRollOver}
            winChance={winChance}
            multiplier={multiplier}
            isDraggingThumb={isDraggingThumb}
            sliderRef={sliderRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onUpdateFromWinChance={updateFromWinChance}
            onUpdateFromMultiplier={updateFromMultiplier}
            onUpdateFromTarget={updateFromTarget}
            onToggleRollMode={toggleRollMode}
          />
      </div>
    </GameErrorBoundary>
  );
}
