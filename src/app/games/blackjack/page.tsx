'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { useCasinoStore } from '@/store/useCasinoStore';
import type { BlackjackGameState, Card } from '@/lib/games/blackjack';
import InsuranceModal from '@/components/casino/games/blackjack/InsuranceModal';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import { CasinoLogger } from '@/lib/casino/logger';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { blackjackPageStyles } from '@/components/casino/games/blackjack/blackjack-page-styles';
import { BlackjackLeftSidebar } from '@/components/casino/games/blackjack/BlackjackLeftSidebar';
import { BlackjackCenterStage } from '@/components/casino/games/blackjack/BlackjackCenterStage';
import { BlackjackRightRules } from '@/components/casino/games/blackjack/BlackjackRightRules';
import { getHiLoDelta } from '@/components/casino/games/blackjack/blackjack-config';

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

  // Keyboard Shortcuts (Space=Deal, H=Hit, S=Stand, D=Double, P=Split, Y/N=Insurance)
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
        } else if ((e.key === 'p' || e.key === 'P') && gameState?.canSplit) {
          e.preventDefault();
          handleAction('SPLIT');
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

        <style>{blackjackPageStyles}</style>

        {/* ── 1. LEFT SIDEBAR: FLIGHT CONTROLS (DIRECT DEAL PLACEMENT) ── */}
        <BlackjackLeftSidebar
          balance={balance}
          betAmount={betAmount}
          betMin={betMin}
          betMax={betMax}
          isInGame={isInGame}
          isProcessing={isProcessing}
          sessionStats={sessionStats}
          onSetBetAmount={setBetAmount}
          onDeal={handleDeal}
        />

        {/* ── 2. CENTER STAGE: MONTE CARLO VIP TABLE ── */}
        <BlackjackCenterStage
          isMobile={isMobile}
          gameState={gameState}
          betAmount={betAmount}
          balance={balance}
          isProcessing={isProcessing}
          history={history}
          sessionStats={sessionStats}
          onHit={() => handleAction('HIT')}
          onStand={() => handleAction('STAND')}
          onDouble={() => handleAction('DOUBLE')}
          onSplit={() => handleAction('SPLIT')}
        />

        {/* ── 3. RIGHT SIDEBAR: OPTION 1 — RULES, STRATEGY HEATMAP & VIP BADGES ── */}
        <BlackjackRightRules
          strategyAdvice={strategyAdvice}
          gameState={gameState}
          isInGame={isInGame}
          runningCount={runningCount}
          cardsDealtCount={cardsDealtCount}
          betAmount={betAmount}
        />
      </div>
    </GameErrorBoundary>
  );
}
