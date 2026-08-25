'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { soundManager } from '@/lib/casino/sound-manager';
import { trackAllowedEvent } from '@/lib/analytics/events';
import {
  type Particle,
  type Star,
  type CrashStatus,
  formatMultiplier,
  ROCKET_X_FRACTION,
} from '@/components/casino/games/crash/crash-helpers';
import { crashStyles } from '@/components/casino/games/crash/crash-styles';
import { CrashTutorial } from '@/components/casino/games/crash/CrashTutorial';
import { CrashBigWin } from '@/components/casino/games/crash/CrashBigWin';
import { CrashControlSidebar } from '@/components/casino/games/crash/CrashControlSidebar';
import { CrashHistoryBar } from '@/components/casino/games/crash/CrashHistoryBar';
import { CrashStage } from '@/components/casino/games/crash/CrashStage';
import { useCrashGameLoop } from '@/components/casino/games/crash/useCrashGameLoop';
import { GameCoPilotHud } from '@/components/casino/hud/GameCoPilotHud';

// Inline LiveBet shape (write-only feed of recent bets; diverges from crash-helpers' broadcast
// LiveBet which carries a required `action` field — kept local to avoid changing construction).
interface LiveBet {
  user: string;
  amount: number;
  multiplier: number | null;
  payout: number | null;
  _target?: number;
}

// Cashout success visual delay before returning to IDLE (kept in page; used by status effect).
const CASHOUT_RESOLVE_DELAY_MS = 1200;

export default function CrashPage() {
  const isMobile = useCasinoStore((state) => state.isMobile);
  const balance = useCasinoStore((state) => state.balance);
  const crashHistory = useCasinoStore((state) => state.crashHistory);
  const provablyFairSettings = useCasinoStore((state) => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore((state) => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore((state) => state.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((state) => state.applyServerWalletSnapshot);
  const addToast = useCasinoStore((state) => state.addToast);
  const isProcessing = useCasinoStore((state) => state.isProcessing);
  const setIsProcessing = useCasinoStore((state) => state.setIsProcessing);
  const allBets = useCasinoStore((state) => state.allBets);
  const { betMin, betMax } = useCasinoStore((state) => state.gameConfig.limits);

  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState<CrashStatus>('IDLE');
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [_liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number; multiplier: number } | null>(null);
  const [milestoneFlash, setMilestoneFlash] = useState<{ value: number; key: number } | null>(null);

  // Session stats tracker
  const [sessionStats, setSessionStats] = useState({
    rounds: 0,
    wins: 0,
    profit: 0,
    biggestMultiplier: 0,
  });

  // Auto-betting state
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const autoBetSettings = useCasinoStore((state) => state.autoBetSettings.crash);
  const setAutoBetSettings = useCasinoStore((state) => state.setAutoBetSettings);
  const updateAutoSettings = (
    updater:
      Partial<typeof autoBetSettings> | ((prev: typeof autoBetSettings) => typeof autoBetSettings),
  ) => {
    const newSettings =
      typeof updater === 'function' ? updater(autoBetSettings) : { ...autoBetSettings, ...updater };
    setAutoBetSettings('crash', newSettings);
  };
  const [countdown, setCountdown] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const autoCountRef = useRef<number>(0);
  const rocketImgRef = useRef<HTMLImageElement | null>(null);
  const autoRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crashPointRef = useRef<number>(2.0);
  const roundResolvedRef = useRef(false);
  const bigWinQueueRef = useRef<Array<{ amount: number; multiplier: number }>>([]);
  const multiplierDisplayRef = useRef<HTMLHeadingElement>(null);
  const liveProfitDisplayRef = useRef<HTMLDivElement>(null);
  const cashoutButtonRef = useRef<HTMLButtonElement>(null);
  const multiplierRef = useRef<number>(1.0);
  const roundIdRef = useRef<string | null>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const cameraZoomRef = useRef<HTMLDivElement>(null);
  const prngSeedRef = useRef(1);
  const lastMilestoneIndexRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);
  const isMobileRef = useRef(false);
  const shakeRef = useRef<{ intensity: number }>({ intensity: 0 });

  // Refs for stable RAF loop
  const statusRef = useRef<CrashStatus>('IDLE');
  const cashoutAtRef = useRef<number | null>(null);
  const isAutoCashoutEnabledRef = useRef(false);
  const isAutoBettingRef = useRef(false);
  const betAmountRef = useRef(10);
  const autoBetSettingsRef = useRef(autoBetSettings);
  const handleCashoutRef = useRef<(m?: number) => void>(() => {});

  // Initialize stars and load vector rocket asset
  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/crash/crash-rocket.svg';
    img.onload = () => {
      rocketImgRef.current = img;
    };
    img.onerror = () => {
      // Fallback to existing asset if SVG load fails
      const fallback = new window.Image();
      fallback.src = '/images/crash/crash-rocket.png';
      rocketImgRef.current = fallback;
    };

    // Initialize 70 cosmic stars
    const initialStars: Star[] = [];
    for (let i = 0; i < 70; i++) {
      initialStars.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.8 + 0.3,
        layer: Math.floor(Math.random() * 3) + 1,
        opacity: Math.random() * 0.7 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = initialStars;
  }, []);

  // Motion accessibility
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = query.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  // BigWin queue
  useEffect(() => {
    if (!bigWin) return;
    const timer = setTimeout(() => {
      const next = bigWinQueueRef.current.shift() || null;
      setBigWin(next);
    }, 3000);
    return () => clearTimeout(timer);
  }, [bigWin]);

  // Milestone flash dismiss
  useEffect(() => {
    if (!milestoneFlash) return;
    const timer = setTimeout(() => setMilestoneFlash(null), 1200);
    return () => clearTimeout(timer);
  }, [milestoneFlash]);

  // Sync refs
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    cashoutAtRef.current = cashoutAt;
  }, [cashoutAt]);
  useEffect(() => {
    isAutoCashoutEnabledRef.current = isAutoCashoutEnabled;
  }, [isAutoCashoutEnabled]);
  useEffect(() => {
    isAutoBettingRef.current = isAutoBetting;
  }, [isAutoBetting]);
  useEffect(() => {
    betAmountRef.current = betAmount;
  }, [betAmount]);
  useEffect(() => {
    autoBetSettingsRef.current = autoBetSettings;
  }, [autoBetSettings]);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // Reset visual effects on neutral state
  const resetRiskVisuals = useCallback(() => {
    if (multiplierDisplayRef.current) multiplierDisplayRef.current.style.transform = 'scale(1)';
    if (vignetteRef.current) vignetteRef.current.style.opacity = '0';
    if (cameraZoomRef.current) cameraZoomRef.current.style.transform = 'scale(1)';
    shakeRef.current.intensity = 0;
  }, []);

  // Cashout handling
  const handleCashout = useCallback(
    (specificMultiplier?: number) => {
      if (status !== 'RUNNING' || cashoutAt || cashoutAtRef.current || !roundIdRef.current) return;
      const requestedMultiplier = specificMultiplier || multiplierRef.current;
      cashoutAtRef.current = requestedMultiplier;
      multiplierRef.current = requestedMultiplier;
      setCashoutAt(requestedMultiplier);
      setMultiplier(requestedMultiplier);
      setIsProcessing(true);
      resetRiskVisuals();

      // Immediate optimistic visual lock (0ms perceived latency)
      if (multiplierDisplayRef.current) {
        multiplierDisplayRef.current.innerText = formatMultiplier(requestedMultiplier);
        multiplierDisplayRef.current.style.color = '#4ade80';
        multiplierDisplayRef.current.style.textShadow = '0 0 40px rgba(74, 222, 128, 0.7)';
        multiplierDisplayRef.current.style.transform = 'scale(1)';
      }
      if (liveProfitDisplayRef.current) {
        const profit = (requestedMultiplier - 1) * betAmount;
        liveProfitDisplayRef.current.innerText = `+${profit >= 0 ? '' : '-'}$${Math.abs(profit).toFixed(2)}`;
      }
      if (cashoutButtonRef.current) {
        cashoutButtonRef.current.innerText = `✓ SECURED $${(betAmount * requestedMultiplier).toFixed(2)} @ ${requestedMultiplier.toFixed(2)}x`;
        cashoutButtonRef.current.style.background = 'rgba(16, 185, 129, 0.2)';
        cashoutButtonRef.current.style.color = '#4ade80';
        cashoutButtonRef.current.style.border = '1px solid rgba(74, 222, 128, 0.6)';
        cashoutButtonRef.current.style.cursor = 'default';
      }

      void (async () => {
        try {
          const response = await fetch('/api/casino/bet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestId: crypto.randomUUID(),
              action: 'CASHOUT_CRASH',
              roundId: roundIdRef.current,
              cashoutMultiplier: requestedMultiplier,
              clientSeed: sanitizeClientSeed(provablyFairSettings.clientSeed),
              currentNonce: provablyFairSettings.nonce,
            }),
          });
          if (!response.ok) throw new Error(`Cashout failed with HTTP ${response.status}`);
          const data = await response.json();
          applyServerWalletSnapshot(data.wallet);
          processGameResult({
            game: 'CRASH',
            amount: betAmount,
            multiplier: data.multiplier,
            payout: data.payout,
            win: data.win,
            resultId: data.id,
            crashMultiplier: data.crashPoint,
            isSettlement: true,
          });
          setSessionStats((previous) => ({
            rounds: previous.rounds + 1,
            wins: previous.wins + (data.win ? 1 : 0),
            profit: previous.profit + data.payout - betAmount,
            biggestMultiplier: Math.max(previous.biggestMultiplier, data.multiplier),
          }));

          if (!roundResolvedRef.current) {
            roundResolvedRef.current = true;
            resetRiskVisuals();
            if (data.win) {
              multiplierRef.current = requestedMultiplier;
              if (multiplierDisplayRef.current) {
                multiplierDisplayRef.current.innerText = formatMultiplier(requestedMultiplier);
                multiplierDisplayRef.current.style.color = '#4ade80';
                multiplierDisplayRef.current.style.textShadow = '0 0 40px rgba(74, 222, 128, 0.7)';
              }
              setStatus('CASHED_OUT');
              soundManager.play('win');

              // Spawn gold coin celebration particles at rocket location
              const canvas = canvasRef.current;
              if (canvas) {
                const w = canvas.clientWidth;
                const h = canvas.clientHeight;
                const rX = w * ROCKET_X_FRACTION;
                const sY = h / Math.max(5, requestedMultiplier + 1);
                const rY = h - (requestedMultiplier - 1) * sY;
                for (let i = 0; i < 35; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 2 + Math.random() * 4;
                  particlesRef.current.push({
                    x: rX,
                    y: rY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1.5,
                    life: 1,
                    maxLife: 1,
                    color: Math.random() > 0.4 ? '#FFD700' : '#4ade80',
                    size: 2.5 + Math.random() * 3,
                    type: 'cashout',
                  });
                }
              }
            } else {
              multiplierRef.current = crashPointRef.current;
              setMultiplier(crashPointRef.current);
              if (multiplierDisplayRef.current) {
                multiplierDisplayRef.current.innerText = formatMultiplier(crashPointRef.current);
                multiplierDisplayRef.current.style.color = 'hsl(0, 85%, 60%)';
                multiplierDisplayRef.current.style.textShadow = '0 0 50px rgba(255, 60, 60, 0.8)';
              }
              setStatus('CRASHED');
            }
          }
        } catch (error) {
          setCashoutAt(null);
          cashoutAtRef.current = null;
          CasinoLogger.error('Crash', 'Server cashout settlement failed closed', error);
          addToast('Cashout could not be confirmed by the server.', 'error');
        } finally {
          setIsProcessing(false);
        }
      })();
    },
    [
      status,
      cashoutAt,
      betAmount,
      processGameResult,
      applyServerWalletSnapshot,
      setIsProcessing,
      provablyFairSettings,
      addToast,
      resetRiskVisuals,
    ],
  );

  useEffect(() => {
    handleCashoutRef.current = handleCashout;
  }, [handleCashout]);

  // Round start
  const handleStart = useCallback(async () => {
    if (status !== 'IDLE' || isProcessing) return;

    if (betAmount < betMin || betAmount > betMax) {
      addToast(
        `Bet amount must be between $${betMin.toFixed(2)} and $${betMax.toLocaleString()}!`,
        'error',
      );
      return;
    }
    if (balance < betAmount) {
      addToast('Insufficient balance!', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      let response: Response;
      try {
        response = await fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            action: 'START_CRASH',
            amount: betAmount,
            clientSeed: sanitizeClientSeed(provablyFairSettings.clientSeed),
            currentNonce: provablyFairSettings.nonce,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error('API failed');
      }
      const data = await response.json();
      applyServerWalletSnapshot(data.wallet);
      // Crash's START_CRASH response, not settlement, is where isFirstBet actually appears
      // (server-side: bet/route.ts's START_CRASH branch) — no processGameResult() call happens
      // here at all (a round start isn't a win/loss result yet), so this must fire directly.
      if (data.isFirstBet) {
        void trackAllowedEvent({ name: 'first_game_started', props: { game: 'CRASH' } });
      }
      roundIdRef.current = data.roundId;

      setProvablyFairSettings({ serverSeedHash: data.hash, nonce: data.nonce });

      // Reset all round state BEFORE starting new flight
      setCashoutAt(null);
      cashoutAtRef.current = null;
      crashPointRef.current = data.crashPoint;
      roundResolvedRef.current = false;
      multiplierRef.current = 1.0;
      lastUpdateRef.current = performance.now();
      if (multiplierDisplayRef.current) {
        multiplierDisplayRef.current.innerText = '1.00x';
        multiplierDisplayRef.current.style.color = '#FFFDF0';
        multiplierDisplayRef.current.style.textShadow = '0 0 35px rgba(212, 175, 55, 0.6)';
      }
      if (liveProfitDisplayRef.current) {
        liveProfitDisplayRef.current.innerText = `+$0.00`;
      }
      if (cashoutButtonRef.current) {
        cashoutButtonRef.current.innerText = `CASHOUT $${betAmount.toFixed(2)}`;
      }
      pointsRef.current = [{ x: 0, y: 1 }];
      particlesRef.current = [];

      bigWinQueueRef.current = [];
      setBigWin(null);
      prngSeedRef.current = Date.now() % 0x7fffffff || 1;
      lastMilestoneIndexRef.current = 0;
      setMilestoneFlash(null);
      resetRiskVisuals();

      const recentBets = allBets
        .filter((b) => b.game === 'CRASH')
        .slice(0, 10)
        .map((b) => ({
          user: b.user || 'Player',
          amount: b.amount,
          multiplier: null,
          payout: null,
          _target: undefined,
        }));
      if (recentBets.length > 0) {
        setLiveBets(recentBets);
      }

      setIsProcessing(false);
      setStatus('RUNNING');
      soundManager.play('crash-launch');
    } catch (error: unknown) {
      CasinoLogger.error('Crash', 'Start error', error);
      setIsProcessing(false);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Failed to start game. No client wallet change was applied.', 'error');
      }
    }
  }, [
    status,
    isProcessing,
    betAmount,
    balance,
    betMin,
    betMax,
    allBets,
    provablyFairSettings,
    addToast,
    applyServerWalletSnapshot,
    setIsProcessing,
    setProvablyFairSettings,
    resetRiskVisuals,
  ]);

  const settleCrashedRound = useCallback(
    async (crashPoint: number) => {
      const roundId = roundIdRef.current;
      if (!roundId) return;
      roundIdRef.current = null;
      const requestId = crypto.randomUUID();
      try {
        const response = await fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            action: 'RESOLVE_CRASH',
            roundId,
            clientSeed: sanitizeClientSeed(provablyFairSettings.clientSeed),
            currentNonce: provablyFairSettings.nonce,
          }),
        });
        if (!response.ok) throw new Error(`Crash resolution failed with HTTP ${response.status}`);
        const data = await response.json();
        applyServerWalletSnapshot(data.wallet);
        processGameResult({
          game: 'CRASH',
          amount: betAmountRef.current,
          multiplier: 0,
          payout: 0,
          win: false,
          resultId: data.id,
          crashMultiplier: crashPoint,
          isSettlement: true,
        });
        setSessionStats((previous) => ({
          ...previous,
          rounds: previous.rounds + 1,
          profit: previous.profit - betAmountRef.current,
        }));
      } catch (error) {
        CasinoLogger.error('Crash', 'Server crash resolution failed closed', error);
        addToast('Crash result is awaiting server reconciliation.', 'error');
      }
    },
    [addToast, applyServerWalletSnapshot, processGameResult, provablyFairSettings],
  );

  // RAF render loop + particle physics + crash resolution detection (extracted verbatim into the
  // hook; the parent owns all refs/state and passes them in so the stable-handle semantics and
  // useCallback dep arrays of the original inlined loop are preserved exactly).
  useCrashGameLoop({
    status,
    setStatus,
    setMultiplier,
    setMilestoneFlash,
    setBetAmount,
    settleCrashedRound,
    resetRiskVisuals,
    canvasRef,
    multiplierDisplayRef,
    liveProfitDisplayRef,
    cashoutButtonRef,
    vignetteRef,
    cameraZoomRef,
    particlesRef,
    starsRef,
    pointsRef,
    lastUpdateRef,
    rocketImgRef,
    shakeRef,
    prngSeedRef,
    statusRef,
    cashoutAtRef,
    crashPointRef,
    roundResolvedRef,
    multiplierRef,
    autoBetSettingsRef,
    isAutoCashoutEnabledRef,
    isAutoBettingRef,
    betAmountRef,
    lastMilestoneIndexRef,
    prefersReducedMotionRef,
    isMobileRef,
    handleCashoutRef,
  });

  // Hotkeys: Space & Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (status !== 'RUNNING') handleStart();
        else handleCashout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleStart, handleCashout]);

  // Auto-bet / status transitions
  useEffect(() => {
    if (status === 'IDLE') {
      if (isAutoBetting) {
        if (autoCountRef.current >= 500) {
          setIsAutoBetting(false);
          addToast('Auto-bet stopped: Reached 500 bet limit', 'info');
          return;
        }
        if (balance >= betAmount) {
          autoCountRef.current += 1;
          autoRestartTimerRef.current = setTimeout(handleStart, 1800);
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsAutoBetting(false);
          addToast('Auto-bet stopped: Insufficient balance', 'error');
        }
      } else {
        autoCountRef.current = 0;
      }
    } else if (status === 'CRASHED') {
      setCountdown(3);
      const t1 = setTimeout(() => setCountdown(2), 1000);
      const t2 = setTimeout(() => setCountdown(1), 2000);
      const t3 = setTimeout(() => {
        setCountdown(null);
        setCashoutAt(null);
        cashoutAtRef.current = null;
        setStatus('IDLE');
        setLiveBets([]);
      }, 3000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (status === 'CASHED_OUT') {
      const t = setTimeout(() => {
        setCashoutAt(null);
        cashoutAtRef.current = null;
        setStatus('IDLE');
        setLiveBets([]);
      }, CASHOUT_RESOLVE_DELAY_MS);
      return () => clearTimeout(t);
    }
    return () => {
      if (autoRestartTimerRef.current) clearTimeout(autoRestartTimerRef.current);
    };
  }, [status, isAutoBetting, balance, betAmount, addToast, handleStart]);

  const isRoundActive = status === 'RUNNING' || status === 'CASHED_OUT';

  // Quick Bet presets helper
  const handleQuickBet = (amt: number) => {
    if (isRoundActive) return;
    const clamped = Math.max(betMin, Math.min(betMax, Math.min(balance, amt)));
    setBetAmount(clamped);
    updateAutoSettings({ amount: clamped });
  };

  return (
    <GameErrorBoundary gameName="Crash">
      <div
        className="crash-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '330px 1fr',
          alignItems: 'start',
          gap: isMobile ? '12px' : '20px',
          padding: isMobile ? '12px' : '20px',
          maxWidth: '1600px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
      >
        <style>{crashStyles}</style>

        {showTutorial && <CrashTutorial onClose={() => setShowTutorial(false)} />}

        {bigWin && (
          <CrashBigWin
            amount={bigWin.amount}
            multiplier={bigWin.multiplier}
            onClose={() => setBigWin(null)}
          />
        )}

        {/* 4. LEVER 4: OBSIDIAN & GOLD VIP CONTROL SIDEBAR */}
        <CrashControlSidebar
          isMobile={isMobile}
          balance={balance}
          betAmount={betAmount}
          isAutoBetting={isAutoBetting}
          isRoundActive={isRoundActive}
          isProcessing={isProcessing}
          isAutoCashoutEnabled={isAutoCashoutEnabled}
          autoCashoutAt={autoBetSettings.cashoutAt}
          sessionStats={sessionStats}
          cashoutAt={cashoutAt}
          multiplier={multiplier}
          cashoutButtonRef={cashoutButtonRef}
          onShowTutorial={() => setShowTutorial(true)}
          onSetAutoBetting={setIsAutoBetting}
          onBetAmountChange={(val) => {
            setBetAmount(val);
            updateAutoSettings({ amount: val });
          }}
          onQuickBet={handleQuickBet}
          onToggleAutoCashout={() => setIsAutoCashoutEnabled((v) => !v)}
          onAutoCashoutChange={(val) => updateAutoSettings({ cashoutAt: val })}
          onStart={handleStart}
          onCashout={handleCashout}
        />

        {/* Main Center: Game Area & Canvas Stage */}
        <div
          className="game-area"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            order: isMobile ? 1 : 2,
            width: '100%',
            minWidth: 0,
          }}
        >
          {/* History Pills Bar */}
          <CrashHistoryBar history={crashHistory} />

          {/* Stage Container with Live Co-Pilot Radar HUD */}
          <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <GameCoPilotHud
              context={{
                gameType: 'CRASH',
                crashState: {
                  multiplier,
                  status,
                  hasPlacedBet: isRoundActive,
                },
              }}
              isFloating={!isMobile}
              style={isMobile ? { marginBottom: '10px' } : undefined}
            />

            {/* 5. LEVER 5: STAGE CANVAS & IMMERSIVE STAGE HUD */}
            <CrashStage
              isMobile={isMobile}
              status={status}
              isProcessing={isProcessing}
              cashoutAt={cashoutAt}
              betAmount={betAmount}
              countdown={countdown}
              milestoneFlash={milestoneFlash}
              canvasRef={canvasRef}
              cameraZoomRef={cameraZoomRef}
              vignetteRef={vignetteRef}
              multiplierDisplayRef={multiplierDisplayRef}
              liveProfitDisplayRef={liveProfitDisplayRef}
            />
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
