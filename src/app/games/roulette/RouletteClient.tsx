'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCasinoStore } from '@/store/useCasinoStore';
import { CasinoCore } from '@/lib/casino/casino-core';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { validateBet } from '@/lib/casino/bet-validator';
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
import { LuxuryRouletteWheel } from '@/components/casino/games/roulette/LuxuryRouletteWheel';
import { RouletteWinnerReveal } from '@/components/casino/games/roulette/RouletteWinnerReveal';
import { RouletteFeltBoard } from '@/components/casino/games/roulette/RouletteFeltBoard';
import { GameCoPilotHud } from '@/components/casino/hud/GameCoPilotHud';

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
  const [winningNumber, setWinningNumber] = useState<RouletteNumber | null>(null);
  const [history, setHistory] = useState<RouletteNumber[]>([]);
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

  // Sector Stats (Only evaluated with >= 5 history rounds)
  const sectorStats = useMemo(() => {
    if (history.length < 5) {
      return { hot: [], cold: [] };
    }
    const counts: Record<number, number> = {};
    history.forEach((h) => {
      counts[h.n] = (counts[h.n] || 0) + 1;
    });

    // Sort by count descending
    const sorted = Object.entries(counts)
      .map(([n, count]) => ({
        n: Number(n),
        count,
        c: ROULETTE_NUMBERS.find((r) => r.n === Number(n))?.c ?? 'GREEN',
      }))
      .sort((a, b) => b.count - a.count);

    const hot = sorted.slice(0, 3);
    const hitSet = new Set(sorted.map((s) => s.n));
    const unhit = ROULETTE_NUMBERS.filter((rn) => !hitSet.has(rn.n)).slice(0, 3);
    const cold = unhit.length >= 3 ? unhit : [...unhit, ...sorted.slice(-3)].slice(0, 3);

    return {
      hot,
      cold,
    };
  }, [history]);

  // Betting handlers (Left-Click to Add, Right-Click to Subtract)
  const handlePlaceBet = (type: BetType, amountToAdd = selectedChip) => {
    if (spinning || isProcessing) return;
    if (totalBetAmount + amountToAdd > balance) {
      addToast('Insufficient balance!', 'error');
      return;
    }
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    const key = betTypeKey(type);
    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], amount: next[idx].amount + amountToAdd };
        return next;
      }
      return [...prev, { id: crypto.randomUUID(), type, amount: amountToAdd }];
    });
  };

  const handleRemoveBet = (type: BetType, amountToSub = selectedChip) => {
    if (spinning || isProcessing) return;
    const key = betTypeKey(type);
    const existing = currentBets.find((b) => betTypeKey(b.type) === key);
    if (!existing) return;

    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].amount <= amountToSub) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], amount: next[idx].amount - amountToSub };
      }
      return next;
    });
  };

  const handleClearBets = () => {
    if (spinning || isProcessing || currentBets.length === 0) return;
    soundManager.play('click');
    setBetHistory((prev) => [...prev, currentBets]);
    setCurrentBets([]);
  };

  const handleUndo = () => {
    if (spinning || isProcessing || betHistory.length === 0) return;
    soundManager.play('click');
    const last = betHistory[betHistory.length - 1];
    setBetHistory((prev) => prev.slice(0, -1));
    setCurrentBets(last || []);
  };

  const handleDoubleBets = () => {
    if (spinning || isProcessing || currentBets.length === 0) return;
    if (totalBetAmount * 2 > balance) {
      addToast('Insufficient balance to double bets!', 'error');
      return;
    }
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);
    setCurrentBets((prev) => prev.map((b) => ({ ...b, amount: b.amount * 2 })));
  };

  const handleFrenchBet = (numbers: number[]) => {
    if (spinning || isProcessing) return;
    const unitAmount = selectedChip;
    if (totalBetAmount + unitAmount * numbers.length > balance) {
      addToast('Insufficient balance for sector bet!', 'error');
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

  const lastSpinTimeRef = useRef(0);

  // Spin Logic
  const handleSpin = useCallback(async () => {
    if (spinning || isProcessing) return;
    if (currentBets.length === 0) {
      // Trigger visual guide flash on table
      setFeltFlash(true);
      setTimeout(() => setFeltFlash(false), 600);
      addToast('Please place at least one chip on the table!', 'info');
      return;
    }
    const now = Date.now();
    if (now - lastSpinTimeRef.current < 200) return;
    lastSpinTimeRef.current = now;

    const betError = validateBet(totalBetAmount, balance);
    if (betError) {
      setAutoRunning(false);
      addToast(betError, 'error');
      return;
    }

    setSpinning(true);
    setIsProcessing(true);
    soundManager.play('roulette-spin');

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

      const result = await response.json();
      const winningNumObj = ROULETTE_NUMBERS.find((n) => n.n === result.roll) ?? {
        n: result.roll,
        c: 'GREEN',
      };
      setWinningNumber(winningNumObj);

      // Wait for cinematic wheel animation (6.25s)
      setTimeout(() => {
        setSpinning(false);
        setIsProcessing(false);
        setHistory((prev) => [winningNumObj, ...prev].slice(0, 18));
        setLastWinAmount(result.payout);
        setLastMultiplier(
          result.payout > 0 ? parseFloat((result.payout / totalBetAmount).toFixed(2)) : 0,
        );

        setProvablyFairSettings({
          serverSeedHash: result.serverSeedHash,
          nonce: result.nonce,
        });
        applyServerWalletSnapshot(result.wallet);
        processGameResult({
          game: 'ROULETTE',
          amount: totalBetAmount,
          multiplier: result.payout > 0 ? result.payout / totalBetAmount : 0,
          payout: result.payout,
          win: result.win,
          resultId: result.id,
          isFirstBet: result.isFirstBet,
        });

        setSessionStats((prev) => ({
          rounds: prev.rounds + 1,
          wins: prev.wins + (result.win ? 1 : 0),
          profit: prev.profit + (result.win ? result.payout - totalBetAmount : -totalBetAmount),
        }));

        if (result.win) {
          soundManager.play('win');
        }
      }, 6250);
    } catch (error) {
      setSpinning(false);
      setIsProcessing(false);
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
    balance,
    provablyFairSettings,
    applyServerWalletSnapshot,
    processGameResult,
    setProvablyFairSettings,
    setIsProcessing,
    addToast,
  ]);

  // Auto-Bet Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning && !spinning && !isProcessing && currentBets.length > 0) {
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
      }, 1000);
    }
    return () => clearTimeout(timer);
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

  // Spacebar & Enter Keydown Hotkeys + Bet Actions
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
    handleClearBets,
    handleUndo,
    handleDoubleBets,
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

        {/* 0. SIDEBAR: OBSIDIAN & GOLD FLIGHT CONTROLS */}
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

        {/* 2 & 3. MAIN GAME STAGE & MASTER BETTING FELT */}
        <div
          className="roulette-center game-area obsidian-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: isMobile ? '16px' : '24px',
            borderRadius: '28px',
            order: isMobile ? 1 : 2,
            minWidth: 0,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 30%, #12121c 0%, #06060a 100%)',
          }}
        >
          {/* Subtle Isometric Background Lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.04,
              backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.4) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Live Co-Pilot Roulette HUD */}
          <GameCoPilotHud
            context={{
              gameType: 'ROULETTE',
              rouletteState: {
                lastSelectedBet: 'red',
              },
            }}
            className="mb-1"
          />

          {/* Top Bar: Hot & Cold + Last 18 History Badges */}
          <RouletteHistoryBar history={history} sectorStats={sectorStats} />

          {/* 2. 420px MASTER-KESSEL SHOWCASE & WINNER REVEAL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 5,
            }}
          >
            <LuxuryRouletteWheel spinning={spinning} winningNumber={winningNumber} />

            {/* Winner Number Reveal HUD */}
            <RouletteWinnerReveal
              spinning={spinning}
              winningNumber={winningNumber}
              lastWinAmount={lastWinAmount}
              lastMultiplier={lastMultiplier}
            />
          </div>

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
            winningNumber={winningNumber}
            spinning={spinning}
          />
        </div>
      </div>
    </GameErrorBoundary>
  );
}
