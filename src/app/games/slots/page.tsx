'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { useCasinoStore } from '@/store/useCasinoStore';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { CoinShower } from '@/components/casino/games/slots/CoinShower';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { CasinoLogger } from '@/lib/casino/logger';
import { TOTAL_SPIN_MS } from './symbols';
import {
  buildReel,
  DEFAULT_REELS,
  NO_WIN,
  REEL_COUNT,
  type AutoBetSettings,
  type HistoryEntry,
  type LastResult,
  type ReelSymbols,
  type SessionStats,
  type WinningRows,
} from '@/components/casino/games/slots/slots-config';
import { slotsPageStyles } from '@/components/casino/games/slots/slots-page-styles';
import { SlotsControlSidebar } from '@/components/casino/games/slots/SlotsControlSidebar';
import { SlotsCenterStage } from '@/components/casino/games/slots/SlotsCenterStage';
import { SlotsPaytable } from '@/components/casino/games/slots/SlotsPaytable';
import { GameCoPilotHud } from '@/components/casino/hud/GameCoPilotHud';

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

  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult>({ type: 'idle', amount: 0 });
  const [finalReels, setFinalReels] = useState<ReelSymbols[]>(DEFAULT_REELS);
  const [winRows, setWinRows] = useState<WinningRows[]>(Array(REEL_COUNT).fill(NO_WIN));
  const [winningRowIndex, setWinningRowIndex] = useState<0 | 1 | 2 | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isAnticipatingReel, setIsAnticipatingReel] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Session stats
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    rounds: 0,
    wins: 0,
    profit: 0,
  });

  // Auto-Pilot state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoBetSettings, setAutoBetSettings] = useState<AutoBetSettings>({
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
        isFirstBet: data.isFirstBet,
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

  // Spacebar Hotkey + Bet Modifiers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isAutoMode) {
          setAutoRunning(!autoRunning);
        } else {
          handleSpin();
        }
        return;
      }
      if (isSpinning || autoRunning) return;
      if (e.key === 'a') setBetAmount((v) => Math.max(betMin, parseFloat((v / 2).toFixed(2))));
      if (e.key === 's') setBetAmount((v) => Math.min(betMax, parseFloat((v * 2).toFixed(2))));
      if (e.key === 'd') setBetAmount(betMin);
      if (e.key === 'f') setBetAmount(Math.min(betMax, balance));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin, isSpinning, autoRunning, betMin, betMax, balance, isAutoMode, setAutoRunning]);

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

        <style>{slotsPageStyles}</style>

        {/* ── 1. LEFT SIDEBAR: FLIGHT CONTROLS ── */}
        <SlotsControlSidebar
          balance={balance}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          betMin={betMin}
          betMax={betMax}
          isAutoMode={isAutoMode}
          onSetAutoMode={setIsAutoMode}
          autoRunning={autoRunning}
          onAutoRunningToggle={() => setAutoRunning(!autoRunning)}
          isSpinning={isSpinning}
          isProcessing={isProcessing}
          maxPotentialWin={maxPotentialWin}
          autoBetSettings={autoBetSettings}
          onAutoBetSettingsChange={setAutoBetSettings}
          sessionStats={sessionStats}
          onSpin={handleSpin}
        />

        {/* ── 2. CENTER STAGE: ZEUS VAULT 3D SLOT CABINET ── */}
        <SlotsCenterStage
          isMobile={isMobile}
          isSpinning={isSpinning}
          finalReels={finalReels}
          isAnticipatingReel={isAnticipatingReel}
          winRows={winRows}
          winningRowIndex={winningRowIndex}
          hasWin={hasWin}
          lastResult={lastResult}
          history={history}
          sessionStats={sessionStats}
        />

        {/* ── 3. RIGHT SIDEBAR: STRUCTURED VIP PAYTABLE & CO-PILOT ── */}
        <div className="flex flex-col gap-3 w-full min-w-0" style={{ order: isMobile ? 3 : 3 }}>
          <GameCoPilotHud
            context={{
              gameType: 'SLOTS',
              slotsState: {
                betAmount,
                isSpinning,
              },
            }}
            className="mb-1"
          />
          <SlotsPaytable isMobile={isMobile} betAmount={betAmount} />
        </div>
      </div>
    </GameErrorBoundary>
  );
}
