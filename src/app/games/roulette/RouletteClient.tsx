'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCasinoStore } from '@/store/useCasinoStore';
import { CasinoCore } from '@/lib/casino/casino-core';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import {
  ROULETTE_NUMBERS,
  type BetType,
  type BetPlacement,
  type RouletteNumber,
} from '@/components/casino/games/roulette/types';
import { betTypeKey } from '@/components/casino/games/roulette/roulette-config';
import { roulettePageStyles } from '@/components/casino/games/roulette/roulette-page-styles';
import { RouletteControlSidebar } from '@/components/casino/games/roulette/RouletteControlSidebar';
import { RouletteHistoryBar } from '@/components/casino/games/roulette/RouletteHistoryBar';
import { RouletteFeltBoard } from '@/components/casino/games/roulette/RouletteFeltBoard';
import { getAutoBetStopReason } from '@/components/casino/games/roulette/roulette-auto-bet';
import { RouletteCroupierRibbon } from '@/components/casino/games/roulette/RouletteCroupierRibbon';
import { RouletteFeltStage } from '@/components/casino/games/roulette/RouletteFeltStage';
import { RouletteWheelShowcase } from '@/components/casino/games/roulette/RouletteWheelShowcase';
import { RouletteStrategyBar } from '@/components/casino/games/roulette/RouletteStrategyBar';
import type { RouletteStrategyPreset } from '@/components/casino/games/roulette/RouletteStrategyBar';

export function RouletteClient() {
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
  const gameConfig = useCasinoStore((state) => state.gameConfig);

  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [currentBets, setCurrentBets] = useState<BetPlacement[]>([]);
  const [betHistory, setBetHistory] = useState<BetPlacement[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<
    'idle' | 'ball_launched' | 'no_more_bets' | 'drop' | 'resolved'
  >('idle');
  const [wheelTargetNumber, setWheelTargetNumber] = useState<RouletteNumber | null>(null);
  const [displayWinningNumber, setDisplayWinningNumber] = useState<RouletteNumber | null>(null);
  const [history, setHistory] = useState<RouletteNumber[]>([
    { n: 17, c: 'BLACK' },
    { n: 32, c: 'RED' },
    { n: 0, c: 'GREEN' },
    { n: 19, c: 'RED' },
    { n: 4, c: 'BLACK' },
    { n: 21, c: 'RED' },
  ]);
  const [showRacetrack, setShowRacetrack] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<BetType | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);
  const [feltFlash, setFeltFlash] = useState(false);

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

  const totalBetAmount = useMemo(
    () => currentBets.reduce((sum, b) => sum + b.amount, 0),
    [currentBets],
  );

  const maxPotentialWin = useMemo(() => {
    if (currentBets.length === 0) return 0;
    let maxWin = 0;
    for (let i = 0; i <= 36; i++) {
      let winForNumber = 0;
      for (const bet of currentBets) {
        if (CasinoCore.isRouletteWin(bet.type as never, i)) {
          winForNumber +=
            bet.amount * CasinoCore.getRouletteMultiplier(bet.type as never, gameConfig);
        }
      }
      maxWin = Math.max(maxWin, winForNumber);
    }
    return maxWin;
  }, [currentBets, gameConfig]);

  // Handle Bet Placement
  const handlePlaceBet = (type: BetType, amount = selectedChip) => {
    if (spinning || isProcessing) return;
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    const key = betTypeKey(type);
    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], amount: next[idx].amount + amount };
        return next;
      }
      return [...prev, { id: crypto.randomUUID(), type, amount }];
    });
  };

  // Handle Bet Removal (Right Click)
  const handleRemoveBet = (type: BetType, amount = selectedChip) => {
    if (spinning || isProcessing) return;
    const key = betTypeKey(type);
    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx === -1) return prev;
      soundManager.play('chip');
      setBetHistory((h) => [...h, prev]);
      const next = [...prev];
      if (next[idx].amount <= amount) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], amount: next[idx].amount - amount };
      }
      return next;
    });
  };

  // Undo Last Action
  const handleUndo = () => {
    if (spinning || isProcessing || betHistory.length === 0) return;
    soundManager.play('chip');
    const prev = betHistory[betHistory.length - 1];
    setCurrentBets(prev);
    setBetHistory((h) => h.slice(0, -1));
  };

  // Double All Bets
  const handleDoubleBets = () => {
    if (spinning || isProcessing || currentBets.length === 0) return;
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);
    setCurrentBets((prev) => prev.map((b) => ({ ...b, amount: b.amount * 2 })));
  };

  // Clear All Bets
  const handleClearBets = () => {
    if (spinning || isProcessing) return;
    if (currentBets.length > 0) {
      soundManager.play('chip');
      setBetHistory((prev) => [...prev, currentBets]);
      setCurrentBets([]);
    }
  };

  // Quick Sector Bets
  const handleFrenchBet = (numbers: number[]) => {
    if (spinning || isProcessing) return;
    const unitAmount = selectedChip;
    const totalCost = unitAmount * numbers.length;
    if (totalCost > balance) {
      addToast('Not enough balance for full sector bet', 'error');
      return;
    }
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    setCurrentBets((prev) => {
      const next = [...prev];
      numbers.forEach((num) => {
        const type: BetType = { type: 'STRAIGHT', value: num };
        const key = betTypeKey(type);
        const idx = next.findIndex((b) => betTypeKey(b.type) === key);
        if (idx !== -1) {
          next[idx] = { ...next[idx], amount: next[idx].amount + unitAmount };
        } else {
          next.push({ id: crypto.randomUUID(), type, amount: unitAmount });
        }
      });
      return next;
    });
  };

  // Strategy Presets
  const handleApplyPreset = (preset: RouletteStrategyPreset) => {
    if (spinning || isProcessing) return;
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    if (preset === 'VOISINS') {
      handleFrenchBet([22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]);
    } else if (preset === 'TIERS') {
      handleFrenchBet([27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]);
    } else if (preset === 'ORPHELINS') {
      handleFrenchBet([1, 20, 14, 31, 9, 17, 34, 6]);
    } else if (preset === 'RED_BLACK_HEDGE') {
      setCurrentBets([
        {
          id: crypto.randomUUID(),
          type: { type: 'COLOR', value: 'RED' },
          amount: selectedChip * 2,
        },
        { id: crypto.randomUUID(), type: { type: 'STRAIGHT', value: 0 }, amount: selectedChip },
      ]);
    } else if (preset === 'ZERO_HEDGE') {
      setCurrentBets([
        {
          id: crypto.randomUUID(),
          type: { type: 'COLOR', value: 'BLACK' },
          amount: selectedChip * 2,
        },
        { id: crypto.randomUUID(), type: { type: 'STRAIGHT', value: 0 }, amount: selectedChip },
      ]);
    }
  };

  const lastSpinTimeRef = useRef(0);
  const pendingResultRef = useRef<{
    winningNumObj: RouletteNumber;
    result: {
      roll: number;
      win: boolean;
      payout: number;
      serverSeedHash: string;
      nonce: number;
      wallet?: Parameters<typeof applyServerWalletSnapshot>[0];
      id?: string;
      isFirstBet?: boolean;
    };
    totalBetAmount: number;
  } | null>(null);

  // Handler: Wird EXAKT bei Kugel-Stillstand im Zielfach nach 6.25s aufgerufen
  const handleWheelSettled = useCallback(() => {
    const pending = pendingResultRef.current;
    if (!pending) return;

    const { winningNumObj, result, totalBetAmount: betAmt } = pending;
    setSpinning(false);
    setIsProcessing(false);
    setSpinPhase('resolved');
    setDisplayWinningNumber(winningNumObj);
    setHistory((prev) => [winningNumObj, ...prev].slice(0, 18));
    setLastWinAmount(result.payout);
    setLastMultiplier(result.payout > 0 ? parseFloat((result.payout / betAmt).toFixed(2)) : 0);

    setProvablyFairSettings({
      serverSeedHash: result.serverSeedHash,
      nonce: result.nonce,
    });
    if (result.wallet) {
      applyServerWalletSnapshot(result.wallet);
    }
    processGameResult({
      game: 'ROULETTE',
      amount: betAmt,
      multiplier: result.payout > 0 ? result.payout / betAmt : 0,
      payout: result.payout,
      win: result.win,
      resultId: result.id || crypto.randomUUID(),
      isFirstBet: result.isFirstBet,
    });

    setSessionStats((prev) => ({
      rounds: prev.rounds + 1,
      wins: prev.wins + (result.win ? 1 : 0),
      profit: prev.profit + (result.win ? result.payout - betAmt : -betAmt),
    }));

    if (result.win) {
      soundManager.play('win');
    }

    pendingResultRef.current = null;
  }, [applyServerWalletSnapshot, processGameResult, setIsProcessing, setProvablyFairSettings]);

  // Spin Logic with strict 6.25s sync (Winning number revealed ONLY after ball lands)
  const handleSpin = useCallback(async () => {
    if (spinning || isProcessing) return;
    if (currentBets.length === 0) {
      setFeltFlash(true);
      setTimeout(() => setFeltFlash(false), 600);
      addToast('Bitte platziere mindestens einen Jeton auf dem Tisch!', 'info');
      return;
    }
    const now = Date.now();
    if (now - lastSpinTimeRef.current < 200) return;
    lastSpinTimeRef.current = now;

    setIsProcessing(true);
    setSpinning(true);
    setSpinPhase('ball_launched');
    setDisplayWinningNumber(null);
    setLastWinAmount(null);
    setLastMultiplier(null);
    soundManager.play('roulette-spin');

    // Phase: Rien ne va plus (2.2s)
    setTimeout(() => {
      setSpinPhase('no_more_bets');
    }, 2200);

    // Phase: Ball Deceleration (4.4s)
    setTimeout(() => {
      setSpinPhase('drop');
    }, 4400);

    try {
      const sanitizedClientSeed = sanitizeClientSeed(provablyFairSettings.clientSeed);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      let response: Response;
      try {
        response = await fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            gameType: 'ROULETTE',
            amount: totalBetAmount,
            bets: currentBets.map((b) => ({
              amount: b.amount,
              type: b.type,
            })),
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

      const raw = await response.json();
      const result = raw?.data ?? raw;
      const winningNumObj = ROULETTE_NUMBERS.find((n) => n.n === result.roll) ?? {
        n: result.roll,
        c: 'GREEN',
      };

      // Set target on wheel so rotation aligns with target pocket
      setWheelTargetNumber(winningNumObj);

      // Store pending outcome until ball lands in pocket at 6.25s
      pendingResultRef.current = {
        winningNumObj,
        result,
        totalBetAmount,
      };
    } catch (error) {
      setSpinning(false);
      setIsProcessing(false);
      setSpinPhase('idle');
      setAutoRunning(false);
      CasinoLogger.error('Roulette', 'Spin error', error);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Spin failed. Please try again.', 'error');
      }
    }
  }, [
    spinning,
    isProcessing,
    currentBets,
    totalBetAmount,
    provablyFairSettings,
    setIsProcessing,
    addToast,
  ]);

  // Auto-Bet Logic
  useEffect(() => {
    if (!autoRunning || spinning || isProcessing || currentBets.length === 0) return;

    const stopReason = getAutoBetStopReason({
      autoCount,
      numberOfBets: autoBetSettings.numberOfBets,
      profit: sessionStats.profit,
      stopOnProfit: autoBetSettings.stopOnProfit,
      stopOnLoss: autoBetSettings.stopOnLoss,
    });

    if (stopReason) {
      const stopTimer = setTimeout(() => {
        setAutoRunning(false);
        if (stopReason.type === 'limit') {
          addToast(`Auto-bet stopped: Reached limit of ${stopReason.maxAllowed} spins`, 'info');
        } else if (stopReason.type === 'profit') {
          addToast('Auto-bet stopped: Profit goal reached!', 'success');
        } else {
          addToast('Auto-bet stopped: Loss limit reached', 'info');
        }
      }, 0);

      return () => clearTimeout(stopTimer);
    }

    const spinTimer = setTimeout(() => {
      handleSpin();
      setAutoCount((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(spinTimer);
  }, [
    autoRunning,
    spinning,
    isProcessing,
    currentBets,
    autoBetSettings,
    autoCount,
    sessionStats.profit,
    addToast,
    handleSpin,
  ]);

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
        if (spinning || isProcessing) return;
        if (isAutoMode) {
          setAutoRunning(!autoRunning);
        } else if (currentBets.length > 0) {
          handleSpin();
        }
        return;
      }
      if (spinning || isProcessing) return;
      if (e.key === 'c' && currentBets.length > 0) handleClearBets();
      if (e.key === 'u' && betHistory.length > 0) handleUndo();
      if (e.key === 's' && currentBets.length > 0) handleDoubleBets();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    spinning,
    isProcessing,
    currentBets,
    handleSpin,
    betHistory,
    isAutoMode,
    autoRunning,
    setAutoRunning,
  ]);

  if (!mounted) return null;

  return (
    <GameErrorBoundary gameName="Roulette">
      <div
        className="roulette-page"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '330px 1fr',
          gap: isMobile ? '12px' : '20px',
          padding: isMobile ? '12px' : '20px',
          maxWidth: '1600px',
          width: '100%',
          minWidth: 0,
          margin: '0 auto',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <style>{roulettePageStyles}</style>

        {/* 0. SIDEBAR: FLIGHT CONTROLS */}
        <RouletteControlSidebar
          isMobile={isMobile}
          balance={balance}
          selectedChip={selectedChip}
          onSelectChip={setSelectedChip}
          isAutoMode={isAutoMode}
          autoRunning={autoRunning}
          onSetAutoMode={setIsAutoMode}
          onAutoRunningToggle={() => setAutoRunning(!autoRunning)}
          spinning={spinning}
          isProcessing={isProcessing}
          currentBets={currentBets}
          betHistory={betHistory}
          totalBetAmount={totalBetAmount}
          maxPotentialWin={maxPotentialWin}
          autoBetSettings={autoBetSettings}
          setAutoBetSettings={setAutoBetSettings}
          sessionStats={sessionStats}
          onClearBets={handleClearBets}
          onUndo={handleUndo}
          onDoubleBets={handleDoubleBets}
          onSpin={handleSpin}
        />

        {/* 1. MAIN GAME STAGE) */}
        <RouletteFeltStage
          isMobile={isMobile}
          displayWinningNumber={displayWinningNumber}
          spinning={spinning}
        >
          {/* ── TOP HEADER ROW: [CROUPIER VOICE RIBBON LINKS] + [PERMANENZEN RECHTS] ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              position: 'relative',
              zIndex: 10,
              width: '100%',
            }}
          >
            <RouletteCroupierRibbon
              spinning={spinning}
              spinPhase={spinPhase}
              displayWinningNumber={displayWinningNumber}
            />

            {/* History Stream (Sauber rechtsbündig) */}
            <RouletteHistoryBar history={history} hideHotCold={true} />
          </div>

          {/* 2. 420px MASTER-KESSEL SHOWCASE & WINNER REVEAL */}
          <RouletteWheelShowcase
            spinning={spinning}
            wheelTargetNumber={wheelTargetNumber}
            onSettled={handleWheelSettled}
            displayWinningNumber={displayWinningNumber}
            lastWinAmount={lastWinAmount}
            lastMultiplier={lastMultiplier}
          />

          {/* ── EINHEITLICHE ZEILE: KESSEL-RENNBAHN + STRATEGY PILLS + POTENZIAL ── */}
          <RouletteStrategyBar
            showRacetrack={showRacetrack}
            onToggleRacetrack={() => setShowRacetrack(!showRacetrack)}
            onApplyPreset={handleApplyPreset}
            lastWinAmount={lastWinAmount}
            maxPotentialWin={maxPotentialWin}
          />

          {/* 3. SALON PRIVÉ 3D-BEVEL MASTER TABLEAU */}
          <RouletteFeltBoard
            isMobile={isMobile}
            showRacetrack={showRacetrack}
            onToggleRacetrack={() => setShowRacetrack(!showRacetrack)}
            onFrenchBet={handleFrenchBet}
            feltFlash={feltFlash}
            currentBets={currentBets}
            hoveredArea={hoveredArea}
            onHoverChange={setHoveredArea}
            onPlaceBet={handlePlaceBet}
            onRemoveBet={handleRemoveBet}
            winningNumber={displayWinningNumber}
            spinning={spinning}
            hideBuiltInRacetrackToggle={true}
          />
        </RouletteFeltStage>
      </div>
    </GameErrorBoundary>
  );
}
