'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Zap } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { soundManager } from '@/lib/casino/sound-manager';
// Types for the particle system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
interface LiveBet {
  user: string;
  amount: number;
  multiplier: number | null;
  payout: number | null;
  _target?: number; // deterministic cashout target, not shown in UI
}
function formatMultiplier(mult: number): string {
  if (mult >= 100000) return `${(mult / 1000).toFixed(0)}k+x`;
  if (mult >= 10000) return `${(mult / 1000).toFixed(1)}kx`;
  return `${mult.toFixed(2)}x`;
}

// Cosmetic-only deterministic PRNG (linear congruential generator) for particle jitter.
// Never touches game outcome — crash point/payout come exclusively from ProvablyFairEngine
// on the server. Kept separate so it's obviously not a game-logic RNG on audit.
function pseudoRandom(seedRef: React.MutableRefObject<number>): number {
  seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
  return seedRef.current / 0x7fffffff;
}

// Asymptotic 0..1 "how tense does this feel" curve — crosses ~0.5 around 3.9x, approaches
// 1 at very high multipliers but never quite reaches it. Purely cosmetic (vignette/pulse/
// zoom intensity); has no bearing on odds, payout, or the real (server-set) crash point.
const RISK_ESCALATION_RATE = 0.35;
function getRiskFactor(multiplier: number): number {
  return 1 - 1 / (1 + Math.max(0, multiplier - 1) * RISK_ESCALATION_RATE);
}

// Camera Dynamics: milestone multipliers that trigger a one-off popup as they're crossed.
// Module-level (not component-scope) so it's a stable reference across renders.
const MILESTONE_VALUES = [2, 5, 10, 25, 50, 100, 250, 500, 1000];

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
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [_liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number; multiplier: number } | null>(null);
  // Camera Dynamics: transient milestone popup (2x, 5x, 10x, ...), low-frequency enough
  // to be plain React state + a keyed CSS animation instead of imperative ref mutation.
  const [milestoneFlash, setMilestoneFlash] = useState<{ value: number; key: number } | null>(null);

  // V2 Lever 1: Partial cashout — lets players bank half their stake and "let the rest ride"
  const [halfCashedOut, setHalfCashedOut] = useState<{ multiplier: number; amount: number } | null>(
    null,
  );
  const halfCashedOutRef = useRef<{ multiplier: number; amount: number } | null>(null);

  // V2 Lever 2: Session stats — running profit/loss tracker to encourage longer sessions
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
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const autoCountRef = useRef<number>(0);
  const rocketImgRef = useRef<HTMLImageElement | null>(null);
  const autoRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crashPointRef = useRef<number>(2.0);
  // Synchronous one-shot lock: whichever resolution path (natural crash in the RAF
  // loop, or a confirmed cashout in the async handler) reaches this first wins. Needed
  // because `statusRef`/`cashoutAtRef` are only synced via a useEffect (post-commit),
  // which lags behind these two code paths racing directly against each other.
  const roundResolvedRef = useRef(false);
  const bigWinQueueRef = useRef<Array<{ amount: number; multiplier: number }>>([]);
  const multiplierDisplayRef = useRef<HTMLHeadingElement>(null);
  const multiplierRef = useRef<number>(1.0);
  const roundIdRef = useRef<string | null>(null);
  // Risk Escalation + Camera Dynamics: DOM refs updated imperatively (60fps) so they
  // never touch React's render cycle — same pattern as multiplierDisplayRef above.
  const vignetteRef = useRef<HTMLDivElement>(null);
  const cameraZoomRef = useRef<HTMLDivElement>(null);
  // Cosmetic-only PRNG seed for the particle trail/explosion (see pseudoRandom above).
  const prngSeedRef = useRef(1);
  // Next index into MILESTONE_VALUES still to be announced this round.
  const lastMilestoneIndexRef = useRef(0);
  // Accessibility: mirrors OS-level prefers-reduced-motion so the pulse/zoom (real motion)
  // can be suppressed while the risk vignette (a color/intensity cue, not motion) stays on.
  const prefersReducedMotionRef = useRef(false);
  // Mobile perf: scales down (not off) particle count/zoom/pulse — same pattern as the
  // other *Ref mirrors below, needed because gameLoop reads refs only, never React state.
  const isMobileRef = useRef(false);

  // Refs to avoid stale closures in the game loop
  const statusRef = useRef<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const cashoutAtRef = useRef<number | null>(null);
  const isAutoCashoutEnabledRef = useRef(false);
  const isAutoBettingRef = useRef(false);
  const betAmountRef = useRef(10);
  const autoBetSettingsRef = useRef(autoBetSettings);
  const handleCashoutRef = useRef<(m?: number) => void>(() => {});

  // Game constants
  const GROWTH_FACTOR = 0.003; // ~3.7s to 2x at 60fps (market standard: Stake ~4s, Bustabit ~3s)
  const MAX_POINTS = 500;
  // Camera follow: only the last WINDOW_POINTS are drawn, mapped so the newest point (rocket)
  // always lands at ROCKET_X_FRACTION of the canvas width instead of drifting to the edge.
  const WINDOW_POINTS = 180;
  const ROCKET_X_FRACTION = 0.62;
  const CASHOUT_RESOLVE_DELAY_MS = 1000; // brief pause after a confirmed cashout before the next round can start
  // Risk Escalation: the multiplier number only starts pulsing once risk is meaningfully
  // above zero, so the calm 1.00x-1.4x range stays visually quiet.
  const MULTIPLIER_PULSE_RISK_THRESHOLD = 0.12;

  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/crash/crash-rocket.png';
    rocketImgRef.current = img;
  }, []);
  // Accessibility: track prefers-reduced-motion live (not just on mount) so toggling the
  // OS setting mid-round takes effect immediately.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = query.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);
  // BigWin queue: auto-dismiss after 3s and show next queued win
  useEffect(() => {
    if (!bigWin) return;
    const timer = setTimeout(() => {
      const next = bigWinQueueRef.current.shift() || null;
      setBigWin(next);
    }, 3000);
    return () => clearTimeout(timer);
  }, [bigWin]);
  // Milestone popup: timeout-based dismissal (not onAnimationEnd) so it also clears
  // correctly under prefers-reduced-motion, where the CSS animation is disabled and no
  // animationend event would ever fire.
  useEffect(() => {
    if (!milestoneFlash) return;
    const timer = setTimeout(() => setMilestoneFlash(null), 1100);
    return () => clearTimeout(timer);
  }, [milestoneFlash]);

  // Keep refs in sync with state/props (handleCashoutRef synced after handleCashout is declared)
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
    halfCashedOutRef.current = halfCashedOut;
  }, [halfCashedOut]);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // Clears the risk-driven pulse/vignette/zoom back to neutral. Called on round start and
  // the instant a round resolves, so nothing freezes mid-pulse on a stale risk level.
  const resetRiskVisuals = useCallback(() => {
    if (multiplierDisplayRef.current) multiplierDisplayRef.current.style.transform = 'scale(1)';
    if (vignetteRef.current) vignetteRef.current.style.opacity = '0';
    if (cameraZoomRef.current) cameraZoomRef.current.style.transform = 'scale(1)';
  }, []);

  // V2 Lever 1: Partial cashout — banks half the stake now, lets the other half ride.
  // Settled entirely client-side (no server call) since the server holds the full
  // original stake; the remaining half is reconciled on the final cashout/crash below.
  const handlePartialCashout = useCallback(() => {
    addToast(
      'Partial cashout is disabled until it has a dedicated atomic server transaction.',
      'info',
    );
  }, [addToast]);
  const handleCashout = useCallback(
    (specificMultiplier?: number) => {
      if (status !== 'RUNNING' || cashoutAt || !roundIdRef.current) return;
      const requestedMultiplier = specificMultiplier || multiplierRef.current;
      setCashoutAt(requestedMultiplier);
      setMultiplier(requestedMultiplier);
      setIsProcessing(true);

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

          // Instant resolve: freeze the curve at the confirmed result instead of animating
          // up to the round's real (predetermined) crash point. Guarded on the synchronous
          // roundResolvedRef lock so a natural crash that already landed during this
          // request (rare, sub-second window) is left untouched — it already recorded its
          // own history entry. (crashHistory itself is already updated by processGameResult
          // above via crashMultiplier — no need to push it again here.)
          if (!roundResolvedRef.current) {
            roundResolvedRef.current = true;
            resetRiskVisuals();
            if (data.win) {
              multiplierRef.current = requestedMultiplier;
              if (multiplierDisplayRef.current) {
                multiplierDisplayRef.current.innerText = formatMultiplier(requestedMultiplier);
                multiplierDisplayRef.current.style.color = '#4ade80';
              }
              setStatus('CASHED_OUT');
            } else {
              // Server determined the round had already crashed before this cashout
              // landed (e.g. an auto-cashout target at/above the real crash point) —
              // resolve as a loss, same as the normal crash flow.
              multiplierRef.current = crashPointRef.current;
              setMultiplier(crashPointRef.current);
              if (multiplierDisplayRef.current) {
                multiplierDisplayRef.current.innerText = formatMultiplier(crashPointRef.current);
                multiplierDisplayRef.current.style.color = 'hsl(0, 85%, 60%)';
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
  // Sync handleCashout ref after it's declared
  useEffect(() => {
    handleCashoutRef.current = handleCashout;
  }, [handleCashout]);

  const handleStart = useCallback(async () => {
    // Guard: only start when truly idle and not already processing
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
      roundIdRef.current = data.roundId;

      // Persist server seed hash + advance nonce for next round
      setProvablyFairSettings({ serverSeedHash: data.hash, nonce: data.nonce });

      // Reset all game state BEFORE setting status to RUNNING
      crashPointRef.current = data.crashPoint;
      roundResolvedRef.current = false;
      multiplierRef.current = 1.0;
      lastUpdateRef.current = performance.now();
      if (multiplierDisplayRef.current) {
        multiplierDisplayRef.current.innerText = '1.00x';
        multiplierDisplayRef.current.style.color = '#fff';
      }
      pointsRef.current = [{ x: 0, y: 1 }];
      particlesRef.current = [];
      setCashoutAt(null);
      cashoutAtRef.current = null;
      setHalfCashedOut(null);
      halfCashedOutRef.current = null;
      bigWinQueueRef.current = [];
      setBigWin(null);
      // Reseed cosmetic particle PRNG per round so the trail doesn't look identical
      // round to round (never affects the crash point — that comes from the server above).
      prngSeedRef.current = Date.now() % 0x7fffffff || 1;
      lastMilestoneIndexRef.current = 0;
      setMilestoneFlash(null);
      resetRiskVisuals();

      // Use real allBets from store (Zustand)
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

      // NOW start the game loop — crashPointRef and multiplierRef are fresh
      setIsProcessing(false);
      setStatus('RUNNING');
      soundManager.play('crash-launch');
    } catch (error: unknown) {
      CasinoLogger.error('Crash', 'Start error', error);
      // The server transaction is authoritative; there is no optimistic debit to restore.
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

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        )
          return;
        e.preventDefault();
        if (status !== 'RUNNING') handleStart();
        else handleCashout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleStart, handleCashout]);
  // Handle auto-restart or auto-betting logic
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
          autoRestartTimerRef.current = setTimeout(handleStart, 2000);
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
        setStatus('IDLE');
        setLiveBets([]);
      }, CASHOUT_RESOLVE_DELAY_MS);
      return () => clearTimeout(t);
    }
    return () => {
      if (autoRestartTimerRef.current) clearTimeout(autoRestartTimerRef.current);
    };
  }, [status, isAutoBetting, balance, betAmount, addToast, handleStart]);

  // Update live bets — deterministic cashout based on each player's _target
  useEffect(() => {
    if (status === 'RUNNING') {
      const interval = setInterval(() => {
        const liveM = multiplierRef.current;
        setLiveBets((prev) =>
          prev.map((bet) => {
            if (bet.multiplier === null && bet._target !== undefined && liveM >= bet._target) {
              return { ...bet, multiplier: bet._target, payout: bet.amount * bet._target };
            }
            return bet;
          }),
        );
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Particle System Logic (deterministic PRNG — see pseudoRandom above, cosmetic only)
  const EXPLOSION_COLORS = ['#ff3b30', '#ff6b35', '#ffae42'];
  const createExplosion = (x: number, y: number) => {
    const MAX_PARTICLES = 200;

    // Limit existing particles to make room for the explosion
    if (particlesRef.current.length > MAX_PARTICLES - 50) {
      particlesRef.current = particlesRef.current.slice(-(MAX_PARTICLES - 50));
    }
    // Fewer particles on mobile — cheaper canvas rendering on typically weaker GPUs.
    const particleCount = isMobileRef.current ? 20 : 40;
    for (let i = 0; i < particleCount; i++) {
      const angle = pseudoRandom(prngSeedRef) * Math.PI * 2;
      const speed = 1.5 + pseudoRandom(prngSeedRef) * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + pseudoRandom(prngSeedRef) * 0.4,
        color: EXPLOSION_COLORS[Math.floor(pseudoRandom(prngSeedRef) * EXPLOSION_COLORS.length)],
        size: 1.5 + pseudoRandom(prngSeedRef) * 2.5,
      });
    }
    soundManager.play('crash-explode');
  };
  const createTail = (x: number, y: number, riskFactor: number, color: string) => {
    // Lower steady-state trail population on mobile — same reasoning as the explosion above.
    if (particlesRef.current.length > (isMobileRef.current ? 150 : 300)) return;
    const speed = 0.4 + riskFactor * 0.8;
    const drift = (pseudoRandom(prngSeedRef) - 0.5) * speed;
    particlesRef.current.push({
      x,
      y,
      vx: -speed - pseudoRandom(prngSeedRef) * 0.5,
      vy: drift,
      life: 0.5 + pseudoRandom(prngSeedRef) * 0.3,
      color,
      size: 1 + pseudoRandom(prngSeedRef) * 1.5,
    });
  };
  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    const width = displayWidth;
    const height = displayHeight;
    ctx.clearRect(0, 0, width, height);

    const m = multiplierRef.current;
    const isCrashed = status === 'CRASHED';
    const isCashedOut = status === 'CASHED_OUT';
    const riskFactor = status === 'RUNNING' ? getRiskFactor(m) : 0;

    // Dynamic line color based on multiplier
    const lineHue = isCrashed ? 0 : m > 10 ? 45 : m > 5 ? 280 : m > 2 ? 200 : 180;
    const lineColor = isCrashed
      ? 'hsl(0, 90%, 60%)'
      : isCashedOut
        ? 'hsl(145, 80%, 55%)'
        : `hsl(${lineHue}, 100%, 65%)`;
    const glowColor = isCrashed
      ? 'rgba(255,50,50,0.8)'
      : isCashedOut
        ? 'rgba(34,197,94,0.8)'
        : m > 10
          ? 'rgba(255,215,0,0.8)'
          : m > 5
            ? 'rgba(200,50,255,0.8)'
            : 'rgba(0,255,255,0.8)';

    // Ambient background — desaturated, drifts cool-to-warm with risk instead of a static grid.
    // Kept low-alpha/low-saturation on purpose so it reads as mood lighting, not a color block.
    const bgHue = isCrashed ? 0 : isCashedOut ? 145 : 200 - riskFactor * 150;
    const bgAlpha = isCrashed
      ? 0.16
      : isCashedOut
        ? 0.09
        : Math.min(0.14, 0.04 + riskFactor * 0.12);
    const bgGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.95,
      0,
      width * 0.5,
      height * 0.95,
      Math.max(width, height) * 0.95,
    );
    bgGradient.addColorStop(0, `hsla(${bgHue}, 30%, 20%, ${bgAlpha})`);
    bgGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const scaleY = height / Math.max(5, (m || 1) + 1);

    // Milestone lines — only the thresholds in MILESTONE_VALUES get a line/label, and only
    // while they're within the currently visible multiplier range. Already-crossed milestones
    // (lastMilestoneIndexRef) render in gold to match the Obsidian & Gold system; upcoming ones
    // stay near-invisible so they don't compete with the curve.
    ctx.font = '600 10px monospace';
    ctx.textAlign = 'left';
    MILESTONE_VALUES.forEach((milestoneValue, index) => {
      const y = height - (milestoneValue - 1) * scaleY;
      if (y < 0 || y > height) return;
      const isReached = index < lastMilestoneIndexRef.current;
      ctx.strokeStyle = isReached ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillStyle = isReached ? 'rgba(212,175,55,0.55)' : 'rgba(255,255,255,0.22)';
      ctx.fillText(`${milestoneValue}x`, 8, y - 4 < 12 ? y + 14 : y - 4);
    });

    if (pointsRef.current.length < 2) {
      updateParticles(ctx);
      ctx.restore();
      return;
    }

    const rocketPixelX = width * ROCKET_X_FRACTION;
    const windowScaleX = rocketPixelX / WINDOW_POINTS;
    const windowStart = Math.max(0, pointsRef.current.length - WINDOW_POINTS);
    const visiblePoints = pointsRef.current.slice(windowStart);
    const xForIndex = (index: number) => index * windowScaleX;

    // Helper to trace the curve path
    const tracePath = () => {
      ctx.moveTo(0, height - (visiblePoints[0].y - 1) * scaleY);
      visiblePoints.forEach((p, i) => {
        ctx.lineTo(xForIndex(i), height - (p.y - 1) * scaleY);
      });
    };

    // Area fill — stronger gradient
    ctx.beginPath();
    ctx.moveTo(0, height);
    visiblePoints.forEach((p, i) => ctx.lineTo(xForIndex(i), height - (p.y - 1) * scaleY));
    ctx.lineTo(xForIndex(visiblePoints.length - 1), height);
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(
      0,
      isCrashed
        ? 'rgba(255,50,50,0.22)'
        : isCashedOut
          ? 'rgba(34,197,94,0.22)'
          : m > 5
            ? 'rgba(200,50,255,0.2)'
            : 'rgba(0,255,255,0.18)',
    );
    areaGradient.addColorStop(
      0.6,
      isCrashed
        ? 'rgba(255,50,50,0.05)'
        : isCashedOut
          ? 'rgba(34,197,94,0.05)'
          : 'rgba(0,255,255,0.04)',
    );
    areaGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Glow layer — wide, blurry, low opacity
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    tracePath();
    ctx.stroke();
    ctx.restore();

    // Mid glow layer
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    tracePath();
    ctx.stroke();
    ctx.restore();

    // Sharp core line — glow widens slightly as risk escalates
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20 + riskFactor * 15;
    ctx.shadowColor = glowColor;
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, 'hsl(180,100%,60%)');
    gradient.addColorStop(1, lineColor);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    visiblePoints.forEach((p, i) => {
      const x = xForIndex(i);
      const y = height - (p.y - 1) * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      if (status === 'RUNNING' && i === visiblePoints.length - 1)
        createTail(x, y, riskFactor, lineColor);
    });
    ctx.stroke();
    ctx.restore();

    // Rocket with dynamic glow (stays visible, frozen, once cashed out) — fixed at rocketPixelX
    // once the round outgrows the visible window, so it never gets pinned to the canvas edge.
    if (status === 'RUNNING' || isCashedOut) {
      const last = visiblePoints[visiblePoints.length - 1];
      const rocketX = xForIndex(visiblePoints.length - 1);
      const rocketY = height - (last.y - 1) * scaleY;
      const glowSize = Math.min(80, 25 + m * 4);
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(-Math.atan2(scaleY, windowScaleX) * 1.5);

      // Outer pulse ring
      ctx.shadowBlur = glowSize;
      ctx.shadowColor = glowColor;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Rocket body
      ctx.globalAlpha = 1;
      ctx.shadowBlur = glowSize;
      ctx.shadowColor = isCashedOut ? '#4ade80' : m > 5 ? 'magenta' : 'cyan';
      if (rocketImgRef.current && rocketImgRef.current.complete) {
        ctx.drawImage(rocketImgRef.current, -24, -16, 48, 32);
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flame/thruster
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'orange';
      ctx.fillStyle = m > 5 ? '#ff66ff' : 'orange';
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-30, -7);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-30, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    updateParticles(ctx);
    ctx.restore();
  }, [multiplier, status]);

  const gameLoopRef = useRef<((ts: number) => void) | null>(null);

  // Stable game loop — reads all game state from refs to avoid stale closures.
  // RAF is started once on mount and never restarted on state changes.
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const deltaTime = Math.min(timestamp - lastUpdateRef.current, 50); // cap to prevent huge jumps after tab switch
      lastUpdateRef.current = timestamp;

      if (statusRef.current === 'RUNNING') {
        const next =
          multiplierRef.current + multiplierRef.current * GROWTH_FACTOR * (deltaTime / 16);
        multiplierRef.current = next;

        const riskFactor = getRiskFactor(next);

        if (multiplierDisplayRef.current) {
          multiplierDisplayRef.current.innerText = formatMultiplier(next);
          const hue = next > 10 ? 45 : next > 5 ? 280 : next > 2 ? 200 : 180;
          multiplierDisplayRef.current.style.color = `hsl(${hue}, 100%, 70%)`;
          const glow = Math.min(60, 10 + next * 3);
          multiplierDisplayRef.current.style.textShadow = `0 0 ${glow}px hsl(${hue}, 100%, 60%), 0 0 ${glow * 2}px hsl(${hue}, 80%, 50%)`;

          // Risk Escalation: the number's pulse speeds up and widens as risk climbs.
          // Suppressed under prefers-reduced-motion — this is real scale motion, not just
          // a color/intensity cue, so it's the one that has to respect the OS setting.
          // Scaled down (not off) on mobile — smaller/handheld screens read scale motion
          // more strongly than desktop at the same amplitude.
          const mobileMotionScale = isMobileRef.current ? 0.6 : 1;
          const pulseAmplitude =
            !prefersReducedMotionRef.current && riskFactor > MULTIPLIER_PULSE_RISK_THRESHOLD
              ? (0.02 + riskFactor * 0.05) * mobileMotionScale
              : 0;
          const pulseFreq = 0.003 + riskFactor * 0.006;
          multiplierDisplayRef.current.style.transform = `scale(${1 + Math.sin(timestamp * pulseFreq) * pulseAmplitude})`;
        }
        if (vignetteRef.current) {
          // Risk Escalation: a warm edge-vignette that intensifies as risk climbs. Kept
          // active under reduced-motion — it's an opacity/color cue, not motion.
          vignetteRef.current.style.opacity = String(Math.min(0.85, riskFactor * 0.95));
        }
        if (cameraZoomRef.current) {
          // Camera Dynamics: subtle breathing zoom on the curve/rocket only — the HUD
          // (multiplier text, vignette) stays fixed so it's never affected by this.
          // Suppressed under prefers-reduced-motion, same reasoning as the pulse above.
          const breatheAmplitude = prefersReducedMotionRef.current
            ? 0
            : (0.006 + riskFactor * 0.01) * (isMobileRef.current ? 0.6 : 1);
          const breatheFreq = 0.0015 + riskFactor * 0.002;
          const zoomScale = 1 + Math.sin(timestamp * breatheFreq) * breatheAmplitude;
          cameraZoomRef.current.style.transform = `scale(${zoomScale})`;
        }

        // Camera Dynamics: one-off popup the instant a milestone multiplier is crossed.
        // A while-loop (not if) so a rare multi-milestone jump in a single frame still
        // ends on the highest one reached instead of getting stuck mid-sequence.
        while (
          lastMilestoneIndexRef.current < MILESTONE_VALUES.length &&
          next >= MILESTONE_VALUES[lastMilestoneIndexRef.current]
        ) {
          const hitValue = MILESTONE_VALUES[lastMilestoneIndexRef.current];
          lastMilestoneIndexRef.current += 1;
          setMilestoneFlash({ value: hitValue, key: Date.now() });
        }

        if (
          isAutoCashoutEnabledRef.current &&
          !cashoutAtRef.current &&
          next >= autoBetSettingsRef.current.cashoutAt
        ) {
          handleCashoutRef.current(next);
        }

        if (next >= crashPointRef.current && !roundResolvedRef.current) {
          roundResolvedRef.current = true;
          resetRiskVisuals();
          setStatus('CRASHED');
          setMultiplier(next);

          if (multiplierDisplayRef.current) {
            multiplierDisplayRef.current.innerText = formatMultiplier(next);
            multiplierDisplayRef.current.style.color = 'hsl(0, 85%, 60%)';
          }

          if (!cashoutAtRef.current) {
            void settleCrashedRound(parseFloat(next.toFixed(2)));
            if (isAutoBettingRef.current) {
              if (autoBetSettingsRef.current.onLoss === 'DOUBLE')
                setBetAmount((amount) => amount * 2);
              else setBetAmount(autoBetSettingsRef.current.amount);
            }
            // Explosion/crash sound only makes sense for an actual loss — a player who
            // already secured a cashout should never see/hear a "crashed" outcome.
            const canvas = canvasRef.current;
            if (canvas) {
              const width = canvas.clientWidth;
              const height = canvas.clientHeight;
              const rocketPixelX = width * ROCKET_X_FRACTION;
              const windowScaleX = rocketPixelX / WINDOW_POINTS;
              const explosionX =
                Math.min(pointsRef.current.length - 1, WINDOW_POINTS - 1) * windowScaleX;
              const scaleY = height / Math.max(5, next + 1);
              createExplosion(explosionX, height - (next - 1) * scaleY);
            }
          } else {
            const finalPoint = parseFloat(next.toFixed(2));
            useCasinoStore.setState((state) => ({
              crashHistory: [finalPoint, ...state.crashHistory].slice(0, 50),
            }));
          }
        } else if (next < crashPointRef.current) {
          pointsRef.current.push({ x: pointsRef.current.length, y: next });
          if (pointsRef.current.length > MAX_POINTS) pointsRef.current.shift();
        }
      }

      draw();
    },
    [draw, settleCrashedRound, resetRiskVisuals],
  );

  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  // RAF runs once on mount — stable loop via gameLoopRef
  useEffect(() => {
    const loop = (ts: number) => {
      gameLoopRef.current?.(ts);
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // A round occupies the "active" (non-idle, non-crashed) UI state either while the
  // curve is still climbing, or during the brief resolve pause right after a cashout.
  const isRoundActive = status === 'RUNNING' || status === 'CASHED_OUT';

  return (
    <GameErrorBoundary gameName="Crash">
      <div
        className="crash-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
          gap: isMobile ? '12px' : '16px',
          padding: isMobile ? '12px' : '16px 20px 16px 16px',
        }}
      >
        <style>{`
        .crash-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 16px;
          padding: 16px 20px 16px 16px;
        }
        @media (max-width: 900px) {
          .crash-container {
            grid-template-columns: 1fr;
          }
          .sidebar-left { order: 2; }
          .game-area { order: 1; }
        }
        .big-win-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.5s ease;
          padding: 20px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .multiplier-idle {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        @keyframes milestone-pop {
          0% { opacity: 0; transform: translate(-50%, -40%) scale(0.6); }
          18% { opacity: 1; transform: translate(-50%, -55%) scale(1.15); }
          35% { transform: translate(-50%, -50%) scale(1); }
          75% { opacity: 1; transform: translate(-50%, -70%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -95%) scale(0.92); }
        }
        .milestone-pop {
          animation: milestone-pop 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .milestone-pop {
            animation: none;
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="big-win-overlay" onClick={() => setShowTutorial(false)}>
            <div
              className="glass-card"
              style={{
                maxWidth: '500px',
                width: '100%',
                padding: 'clamp(24px, 5vw, 40px)',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Info
                size={48}
                color="hsl(var(--primary))"
                style={{ marginBottom: '24px', margin: '0 auto' }}
              />
              <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.2rem, 5vw, 2rem)' }}>
                HOW TO PLAY
              </h2>
              <p
                style={{
                  color: 'hsl(var(--text-muted))',
                  lineHeight: '1.6',
                  fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                }}
              >
                1. Place your bet before the rocket takes off.
                <br />
                2. Watch the multiplier grow higher and higher.
                <br />
                3. Cash out before the rocket explodes to win!
                <br />
                4. If the rocket crashes first, you lose your bet.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '24px', width: '100%', height: '56px' }}
                onClick={() => setShowTutorial(false)}
              >
                GOT IT!
              </button>
            </div>
          </div>
        )}
        {/* Big Win Celebration */}
        {bigWin && (
          <div className="big-win-overlay" onClick={() => setBigWin(null)}>
            <div className="animate-bounce" style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontSize: 'clamp(3rem, 15vw, 6rem)',
                  color: 'gold',
                  textShadow: '0 0 50px gold',
                }}
              >
                BIG WIN!
              </h1>
              <h2 style={{ fontSize: 'clamp(1.5rem, 8vw, 3rem)', color: '#fff' }}>
                ${bigWin.amount.toFixed(2)}
              </h2>
              <div style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: 'hsl(var(--success))' }}>
                {bigWin.multiplier.toFixed(2)}x
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Left: Control Panel */}
        <div
          className="sidebar-left glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px',
            padding: isMobile ? '20px 16px' : '24px',
            borderRadius: '24px',
            order: isMobile ? 2 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Zap size={20} color="hsl(var(--primary))" />
              <h3
                style={{
                  margin: 0,
                  letterSpacing: '1px',
                  fontSize: isMobile ? '0.9rem' : '1.1rem',
                }}
              >
                CONTROL
              </h3>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px' }}
              onClick={() => setShowTutorial(true)}
            >
              <Info size={16} />
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              background: '#0f212e',
              padding: '4px',
              borderRadius: '8px',
              opacity: isRoundActive ? 0.4 : 1,
            }}
          >
            <button
              onClick={() => {
                if (!isRoundActive) setIsAutoBetting(false);
              }}
              disabled={isRoundActive}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: !isAutoBetting ? '#2f4553' : 'transparent',
                color: !isAutoBetting ? '#fff' : '#b1bad3',
                border: 'none',
                cursor: isRoundActive ? 'not-allowed' : 'pointer',
              }}
            >
              Manual
            </button>
            <button
              onClick={() => {
                if (!isRoundActive) setIsAutoBetting(true);
              }}
              disabled={isRoundActive}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: isAutoBetting ? '#2f4553' : 'transparent',
                color: isAutoBetting ? '#fff' : '#b1bad3',
                border: 'none',
                cursor: isRoundActive ? 'not-allowed' : 'pointer',
              }}
            >
              Auto
            </button>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'hsl(var(--text-muted))',
                  letterSpacing: '1px',
                }}
              >
                BET AMOUNT
              </label>
              <span className="mono" style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>
                ${balance.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="input mono"
                  value={betAmount}
                  style={{
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: 700,
                    flex: 1,
                    minHeight: isMobile ? '48px' : '56px',
                  }}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setBetAmount(val);
                    updateAutoSettings({ amount: val });
                  }}
                />
                {!isMobile && (
                  <>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0 10px' }}
                      onClick={() => setBetAmount((prev) => prev / 2)}
                    >
                      1/2
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0 10px' }}
                      onClick={() => setBetAmount((prev) => prev * 2)}
                    >
                      2x
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Auto-Cashout — available in both Manual and Auto tabs */}
          <div className="glass" style={{ padding: '12px', borderRadius: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: isAutoCashoutEnabled ? '10px' : 0,
              }}
            >
              <label
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'hsl(var(--text-muted))',
                  letterSpacing: '1px',
                }}
              >
                AUTO CASHOUT
              </label>
              <button
                onClick={() => setIsAutoCashoutEnabled((v) => !v)}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  background: isAutoCashoutEnabled
                    ? 'hsl(var(--success))'
                    : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                    left: isAutoCashoutEnabled ? '21px' : '3px',
                  }}
                />
              </button>
            </div>
            {isAutoCashoutEnabled && (
              <>
                <input
                  type="number"
                  className="input mono"
                  value={autoBetSettings.cashoutAt}
                  step="0.1"
                  min="1.1"
                  style={{ fontSize: '0.9rem', width: '100%', minHeight: '40px' }}
                  onChange={(e) =>
                    updateAutoSettings({ cashoutAt: parseFloat(e.target.value) || 1.1 })
                  }
                />
                {/* V2 Lever 3: one-tap target presets — removes the friction of typing a target every round */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {[1.5, 2, 3, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background:
                          autoBetSettings.cashoutAt === preset
                            ? 'hsl(var(--primary) / 0.25)'
                            : 'transparent',
                        border:
                          autoBetSettings.cashoutAt === preset
                            ? '1px solid hsl(var(--primary) / 0.5)'
                            : '1px solid rgba(255,255,255,0.08)',
                      }}
                      onClick={() => updateAutoSettings({ cashoutAt: preset })}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* V2 Lever 2: Session stats — running profit tracker keeps players oriented across rounds */}
          <div className="glass" style={{ padding: '12px', borderRadius: '12px' }}>
            <label
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'hsl(var(--text-muted))',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              SESSION STATS
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>ROUNDS</div>
                <div className="mono" style={{ fontWeight: 800 }}>
                  {sessionStats.rounds}
                </div>
              </div>
              <div>
                <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>WIN RATE</div>
                <div className="mono" style={{ fontWeight: 800 }}>
                  {sessionStats.rounds > 0
                    ? `${((sessionStats.wins / sessionStats.rounds) * 100).toFixed(0)}%`
                    : '—'}
                </div>
              </div>
              <div>
                <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>PROFIT</div>
                <div
                  className="mono"
                  style={{
                    fontWeight: 800,
                    color: sessionStats.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))',
                  }}
                >
                  {sessionStats.profit >= 0 ? '+' : ''}
                  {sessionStats.profit.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>BEST</div>
                <div className="mono" style={{ fontWeight: 800 }}>
                  {sessionStats.biggestMultiplier > 0
                    ? `${sessionStats.biggestMultiplier.toFixed(2)}x`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Auto Settings */}
          {isAutoBetting && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    fontSize: '0.65rem',
                    background: autoBetSettings.onLoss === 'RESET' ? '#2f4553' : 'transparent',
                  }}
                  onClick={() => updateAutoSettings({ onLoss: 'RESET' })}
                >
                  ON LOSS: RESET
                </button>
                <button
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    fontSize: '0.65rem',
                    background: autoBetSettings.onLoss === 'DOUBLE' ? '#2f4553' : 'transparent',
                  }}
                  onClick={() => updateAutoSettings({ onLoss: 'DOUBLE' })}
                >
                  ON LOSS: 2X
                </button>
              </div>
            </div>
          )}
          {!isRoundActive ? (
            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                height: isMobile ? '60px' : '70px',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 900,
                borderRadius: '20px',
                opacity: isProcessing ? 0.7 : 1,
                background: isProcessing ? 'rgba(212,175,55,0.3)' : undefined,
                border: isProcessing ? '2px solid rgba(212,175,55,0.5)' : undefined,
              }}
              onClick={handleStart}
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ LAUNCHING...' : isAutoBetting ? '🎰 AUTO ON' : 'BET'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                height: isMobile ? '60px' : '70px',
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                fontWeight: 900,
                borderRadius: '20px',
                background: cashoutAt ? 'rgba(34, 197, 94, 0.12)' : 'hsl(var(--success))',
                border: cashoutAt ? '2px solid rgba(34,197,94,0.6)' : 'none',
                boxShadow: cashoutAt ? 'none' : '0 10px 40px hsla(145, 80%, 50%, 0.4)',
                color: cashoutAt ? '#4ade80' : '#000',
                cursor: cashoutAt ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (!cashoutAt) handleCashout();
              }}
              disabled={!!cashoutAt}
            >
              {cashoutAt
                ? `✓ WON $${((halfCashedOut ? betAmount / 2 : betAmount) * cashoutAt).toFixed(2)} @ ${cashoutAt.toFixed(2)}x`
                : `CASHOUT`}
            </button>
          )}
          {/* V2 Lever 1: Cash Out Half — bank profit on half the stake, let the rest ride */}
          {status === 'RUNNING' && !cashoutAt && (
            <button
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: isMobile ? '44px' : '50px',
                fontSize: '0.8rem',
                fontWeight: 800,
                borderRadius: '14px',
                opacity: halfCashedOut ? 0.5 : 1,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={handlePartialCashout}
              disabled={!!halfCashedOut}
            >
              {halfCashedOut
                ? `✓ HALF BANKED: $${halfCashedOut.amount.toFixed(2)} @ ${halfCashedOut.multiplier.toFixed(2)}x`
                : `CASH OUT HALF ($${(betAmount / 2).toFixed(2)})`}
            </button>
          )}
        </div>
        {/* Main Center: Game Area */}
        <div
          className="game-area"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px',
            order: isMobile ? 1 : 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '5px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {crashHistory.slice(0, 20).map((h, i) => (
              <div
                key={i}
                className="glass"
                style={{
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  color: h >= 10 ? '#FFD700' : h >= 5 ? '#c084fc' : h >= 2 ? '#60a5fa' : '#f87171',
                  border: `1px solid ${h >= 10 ? 'rgba(255,215,0,0.25)' : h >= 5 ? 'rgba(192,132,252,0.25)' : h >= 2 ? 'rgba(96,165,250,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  background:
                    h >= 10
                      ? 'rgba(255,215,0,0.08)'
                      : h >= 5
                        ? 'rgba(192,132,252,0.08)'
                        : h >= 2
                          ? 'rgba(96,165,250,0.08)'
                          : 'rgba(248,113,113,0.08)',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              >
                {h.toFixed(2)}x
              </div>
            ))}
          </div>
          <div
            className="glass-card"
            style={{
              position: 'relative',
              flex: 1,
              minHeight: isMobile ? '300px' : 'clamp(300px, 50vh, 550px)',
              padding: 0,
              overflow: 'hidden',
              // V2: flat, low-contrast backdrop (no busy texture) so the multiplier curve & HUD stay legible at all times
              background:
                'radial-gradient(circle at 50% 100%, #0c1620 0%, #050a10 60%, #02050a 100%)',
              borderRadius: '32px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Camera Dynamics: only the curve/rocket breathes with risk — the HUD below stays fixed */}
            <div
              ref={cameraZoomRef}
              style={{ position: 'absolute', inset: 0, transformOrigin: 'center', zIndex: 1 }}
            >
              <canvas
                ref={canvasRef}
                width={1200}
                height={800}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
            {/* Risk Escalation: warm edge-vignette, intensity driven imperatively from gameLoop */}
            <div
              ref={vignetteRef}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                pointerEvents: 'none',
                opacity: 0,
                boxShadow:
                  'inset 0 0 40px 10px rgba(255,60,40,0.5), inset 0 0 140px 20px rgba(255,30,20,0.5)',
              }}
            />
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
                // V2: soft backdrop plate so the multiplier stays readable regardless of curve color/position
                padding: isMobile ? '16px 24px' : '24px 48px',
                borderRadius: '24px',
                background: 'radial-gradient(circle, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 75%)',
              }}
            >
              {status === 'IDLE' && !isProcessing && (
                <div
                  className="multiplier-idle"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.4rem',
                    fontWeight: 700,
                    color: 'rgba(0,255,255,0.5)',
                    letterSpacing: '4px',
                    marginBottom: '8px',
                  }}
                >
                  WAITING FOR BETS
                </div>
              )}
              {status === 'IDLE' && isProcessing && (
                <div
                  className="multiplier-idle"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.4rem',
                    fontWeight: 700,
                    color: 'rgba(212,175,55,0.7)',
                    letterSpacing: '4px',
                    marginBottom: '8px',
                  }}
                >
                  LAUNCHING...
                </div>
              )}
              <h1
                ref={multiplierDisplayRef}
                className={status === 'IDLE' ? 'multiplier-idle' : ''}
                style={{
                  fontSize: isMobile ? '4.5rem' : 'min(10rem, 20vw)',
                  fontWeight: 900,
                  textShadow:
                    status === 'CRASHED'
                      ? '0 0 60px rgba(255,50,50,0.8)'
                      : status === 'CASHED_OUT'
                        ? '0 0 50px rgba(74,222,128,0.6)'
                        : '0 0 40px rgba(0,255,255,0.4)',
                  margin: 0,
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  color:
                    status === 'IDLE'
                      ? 'rgba(255,255,255,0.3)'
                      : status === 'CRASHED'
                        ? 'hsl(0,90%,60%)'
                        : status === 'CASHED_OUT'
                          ? '#4ade80'
                          : '#fff',
                }}
              />
              {status === 'CRASHED' && (
                <div style={{ marginTop: '8px' }}>
                  <div
                    className="animate-slide-up"
                    style={{
                      fontSize: isMobile ? '0.85rem' : '1.5rem',
                      fontWeight: 800,
                      color: 'hsl(var(--error))',
                      letterSpacing: isMobile ? '2px' : '8px',
                    }}
                  >
                    CRASHED
                  </div>
                  {countdown !== null && (
                    <div
                      style={{
                        fontSize: isMobile ? '0.75rem' : '1rem',
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: '8px',
                        letterSpacing: '2px',
                      }}
                    >
                      Next round in {countdown}…
                    </div>
                  )}
                </div>
              )}
              {/* #16: Cashout success feedback */}
              {isRoundActive && cashoutAt && (
                <div
                  style={{
                    marginTop: '12px',
                    display: 'inline-block',
                    background: 'hsla(145, 80%, 30%, 0.85)',
                    border: '1px solid hsl(var(--success))',
                    borderRadius: '12px',
                    padding: '8px 20px',
                    color: 'hsl(var(--success))',
                    fontWeight: 800,
                    fontSize: isMobile ? '0.85rem' : '1.1rem',
                    letterSpacing: '1px',
                  }}
                >
                  ✓ CASHED OUT @ {cashoutAt.toFixed(2)}x — +${(betAmount * cashoutAt).toFixed(2)}
                </div>
              )}
            </div>
            {/* Camera Dynamics: milestone popup (2x, 5x, 10x, ...) */}
            {milestoneFlash && (
              <div
                key={milestoneFlash.key}
                className="milestone-pop"
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '50%',
                  zIndex: 11,
                  pointerEvents: 'none',
                  fontSize: isMobile ? '1.5rem' : '2.4rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  whiteSpace: 'nowrap',
                  color: '#FFD700',
                  textShadow: '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4)',
                }}
              >
                {milestoneFlash.value}×
              </div>
            )}
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
