'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Zap, TrendingUp, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { soundManager } from '@/lib/casino/sound-manager';
import { trackAllowedEvent } from '@/lib/analytics/events';

// Types for the particle & background system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'exhaust' | 'spark' | 'smoke' | 'explosion' | 'cashout' | 'shockwave';
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number; // 1 (far), 2 (mid), 3 (near)
  opacity: number;
  twinklePhase: number;
}

interface LiveBet {
  user: string;
  amount: number;
  multiplier: number | null;
  payout: number | null;
  _target?: number;
}

function formatMultiplier(mult: number): string {
  if (mult >= 100000) return `${(mult / 1000).toFixed(0)}k+x`;
  if (mult >= 10000) return `${(mult / 1000).toFixed(1)}kx`;
  return `${mult.toFixed(2)}x`;
}

// Cosmetic PRNG for visual particles
function pseudoRandom(seedRef: React.MutableRefObject<number>): number {
  seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
  return seedRef.current / 0x7fffffff;
}

// Risk factor curve: 0..1
const RISK_ESCALATION_RATE = 0.35;
function getRiskFactor(multiplier: number): number {
  return 1 - 1 / (1 + Math.max(0, multiplier - 1) * RISK_ESCALATION_RATE);
}

// Milestone multipliers that trigger a golden horizon line & pop
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
  const animationRef = useRef<number | null>(null);
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
  const statusRef = useRef<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const cashoutAtRef = useRef<number | null>(null);
  const isAutoCashoutEnabledRef = useRef(false);
  const isAutoBettingRef = useRef(false);
  const betAmountRef = useRef(10);
  const autoBetSettingsRef = useRef(autoBetSettings);
  const handleCashoutRef = useRef<(m?: number) => void>(() => {});

  // Game constants
  const GROWTH_FACTOR = 0.003;
  const MAX_POINTS = 500;
  const WINDOW_POINTS = 180;
  const ROCKET_X_FRACTION = 0.62;
  const CASHOUT_RESOLVE_DELAY_MS = 1200;

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

  // Explosions & Thruster Particle Physics
  const createExplosion = (x: number, y: number) => {
    if (!prefersReducedMotionRef.current) {
      shakeRef.current.intensity = 18;
    }
    const particleCount = isMobileRef.current ? 25 : 55;
    const colors = ['#FFF', '#FFD700', '#FF8800', '#FF3B30', '#B91C1C'];

    // Add expanding shockwave ring
    particlesRef.current.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      color: 'rgba(255, 100, 50, 0.8)',
      size: 10,
      type: 'shockwave',
    });

    for (let i = 0; i < particleCount; i++) {
      const angle = pseudoRandom(prngSeedRef) * Math.PI * 2;
      const speed = 2 + pseudoRandom(prngSeedRef) * 6;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.6 + pseudoRandom(prngSeedRef) * 0.6,
        color: colors[Math.floor(pseudoRandom(prngSeedRef) * colors.length)],
        size: 2 + pseudoRandom(prngSeedRef) * 3.5,
        type: 'explosion',
      });
    }
    soundManager.play('crash-explode');
  };

  const createTail = (x: number, y: number, angle: number, riskFactor: number) => {
    if (particlesRef.current.length > (isMobileRef.current ? 120 : 250)) return;

    // Direction opposite to rocket heading
    const backAngle = angle + Math.PI;
    const exhaustSpread = 0.45;
    const count = isMobileRef.current ? 1 : 2;

    for (let k = 0; k < count; k++) {
      const spreadAngle = backAngle + (pseudoRandom(prngSeedRef) - 0.5) * exhaustSpread;
      const speed = 2.0 + riskFactor * 2.5 + pseudoRandom(prngSeedRef) * 2;

      // Glow plasma core / amber sparks / smoke puffs
      const isSpark = pseudoRandom(prngSeedRef) > 0.4;
      const color = isSpark
        ? pseudoRandom(prngSeedRef) > 0.5
          ? '#FFFDF0'
          : '#FFD700'
        : pseudoRandom(prngSeedRef) > 0.5
          ? '#FF8C00'
          : 'rgba(120, 110, 100, 0.4)';

      particlesRef.current.push({
        x: x + (pseudoRandom(prngSeedRef) - 0.5) * 4,
        y: y + (pseudoRandom(prngSeedRef) - 0.5) * 4,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed + (pseudoRandom(prngSeedRef) - 0.5) * 0.6,
        life: 1,
        maxLife: isSpark ? 0.35 + pseudoRandom(prngSeedRef) * 0.25 : 0.65,
        color,
        size: isSpark ? 1.5 + pseudoRandom(prngSeedRef) * 2 : 3 + pseudoRandom(prngSeedRef) * 4,
        type: isSpark ? 'spark' : 'smoke',
      });
    }
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.type === 'shockwave') {
        p.size += 6;
        p.life -= 0.04;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 120, 50, ${p.life * 0.7})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF8800';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (p.type === 'cashout') {
        p.vy += 0.08; // gravity for coins
        p.life -= 0.015;
      } else if (p.type === 'smoke') {
        p.size += 0.15; // expanding smoke
        p.life -= 0.02;
      } else {
        p.life -= 0.025;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  // Main Canvas Draw Method
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

    // Apply Trauma-based Screen Shake during crash
    if (shakeRef.current.intensity > 0.1) {
      const shakeX = (pseudoRandom(prngSeedRef) - 0.5) * shakeRef.current.intensity;
      const shakeY = (pseudoRandom(prngSeedRef) - 0.5) * shakeRef.current.intensity;
      ctx.translate(shakeX, shakeY);
      shakeRef.current.intensity *= 0.9;
    }

    const m = multiplierRef.current;
    const isCrashed = status === 'CRASHED';
    const isCashedOut = status === 'CASHED_OUT';
    const isRunning = status === 'RUNNING';
    const riskFactor = isRunning ? getRiskFactor(m) : 0;

    // 1. LEVER 2: DYNAMIC BACKGROUND & ALTITUDE PROGRESSION
    // Altitude 1: 1.00x - 2.00x (Launchpad / Surface Troposphere)
    // Altitude 2: 2.00x - 10.00x (Stratosphere / Mesosphere)
    // Altitude 3: > 10.00x (Deep Space & Golden Nebula)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isCrashed) {
      bgGradient.addColorStop(0, '#100305');
      bgGradient.addColorStop(1, '#050102');
    } else if (isCashedOut) {
      bgGradient.addColorStop(0, '#020f08');
      bgGradient.addColorStop(1, '#010503');
    } else if (m < 2.0) {
      // Warm launchpad horizon glow
      bgGradient.addColorStop(0, '#060a12');
      bgGradient.addColorStop(0.7, '#070f1a');
      bgGradient.addColorStop(1, '#0a1424');
    } else if (m < 10.0) {
      // Stratosphere transition
      const stratT = (m - 2.0) / 8.0;
      bgGradient.addColorStop(0, '#03050c');
      bgGradient.addColorStop(0.6, `hsla(225, 45%, ${Math.round(8 - stratT * 4)}%, 1)`);
      bgGradient.addColorStop(1, '#020409');
    } else {
      // Deep Space Obsidian with subtle gold cosmic dust
      bgGradient.addColorStop(0, '#020306');
      bgGradient.addColorStop(0.5, '#04060c');
      bgGradient.addColorStop(1, '#010204');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Launchpad floor perspective grid (only during launch 1.0x - 2.5x or IDLE)
    if (m < 2.5 || status === 'IDLE') {
      const gridAlpha = status === 'IDLE' ? 0.08 : Math.max(0, 0.12 - (m - 1.0) * 0.08);
      ctx.strokeStyle = `rgba(212, 175, 55, ${gridAlpha})`;
      ctx.lineWidth = 1;

      const floorY = height * 0.95;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(width * 0.5 + (x - width * 0.5) * 0.2, floorY - 50);
        ctx.stroke();
      }
      for (let hOff = 0; hOff < 50; hOff += 12) {
        ctx.beginPath();
        ctx.moveTo(0, height - hOff);
        ctx.lineTo(width, height - hOff);
        ctx.stroke();
      }
    }

    // Parallax Starfield & Cosmic Hyper-Space Trails
    const starSpeed = isRunning ? 0.8 + riskFactor * 5 : 0.3;
    starsRef.current.forEach((star) => {
      // Drift diagonally down-left (ambient drift during IDLE)
      const currentSpeed = isRunning ? starSpeed : 0.25;
      star.x -= star.speed * star.layer * currentSpeed;
      star.y += star.speed * star.layer * (currentSpeed * 0.4);

      // Wrap around canvas
      if (star.x < 0) star.x = width + Math.random() * 20;
      if (star.y > height) star.y = -10;

      star.twinklePhase += 0.03;
      const alpha = star.opacity * (0.6 + Math.sin(star.twinklePhase) * 0.4);

      if (isRunning && m > 10.0 && star.layer === 3) {
        // Hyperspace warp streak
        ctx.strokeStyle = `rgba(255, 240, 200, ${alpha * 0.8})`;
        ctx.lineWidth = star.size * 0.9;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + 12 * riskFactor, star.y - 6 * riskFactor);
        ctx.stroke();
      } else {
        ctx.fillStyle = star.layer === 3 ? '#FFD700' : '#FFFFFF';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });

    const scaleY = height / Math.max(5, (m || 1) + 1);

    // 2. MILESTONE HORIZON LINES (Obsidian & Gold standard)
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    MILESTONE_VALUES.forEach((milestoneValue, index) => {
      const y = height - (milestoneValue - 1) * scaleY;
      if (y < 0 || y > height) return;
      const isReached = index < lastMilestoneIndexRef.current;

      ctx.strokeStyle = isReached ? 'rgba(212, 175, 55, 0.35)' : 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = isReached ? 1.5 : 1;
      ctx.setLineDash(isReached ? [] : [4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gold milestone chip tag
      ctx.fillStyle = isReached ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(8, y - 10, 36, 16);
      ctx.fillStyle = isReached ? '#FFD700' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(`${milestoneValue}x`, 12, y + 2);
    });

    if (pointsRef.current.length < 2) {
      if (status === 'IDLE') {
        const padX = width * 0.16;
        const padY = height * 0.84;

        // Launchpad Standby Base Structure
        ctx.save();
        ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1.5;

        // Platform base
        ctx.beginPath();
        ctx.moveTo(padX - 45, padY + 18);
        ctx.lineTo(padX + 45, padY + 18);
        ctx.lineTo(padX + 35, padY + 32);
        ctx.lineTo(padX - 35, padY + 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Support clamp arm
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.beginPath();
        ctx.moveTo(padX - 25, padY + 18);
        ctx.lineTo(padX - 25, padY - 8);
        ctx.lineTo(padX - 15, padY - 8);
        ctx.stroke();

        // Standby Rocket on pad
        ctx.save();
        ctx.translate(padX, padY);
        ctx.rotate(-Math.PI * 0.16); // Tilted ~29° pointing up-right ready for launch

        // Warm thruster standby idle glow
        const idlePulse = Math.sin(performance.now() * 0.005) * 0.2 + 0.5;
        const thrusterIdleGlow = ctx.createRadialGradient(-20, 0, 1, -20, 0, 26);
        thrusterIdleGlow.addColorStop(0, `rgba(255, 180, 50, ${0.45 * idlePulse})`);
        thrusterIdleGlow.addColorStop(0.6, `rgba(212, 175, 55, ${0.18 * idlePulse})`);
        thrusterIdleGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = thrusterIdleGlow;
        ctx.beginPath();
        ctx.arc(-20, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Render Rocket Vector
        if (rocketImgRef.current && rocketImgRef.current.complete) {
          ctx.drawImage(rocketImgRef.current, -32, -16, 64, 32);
        } else {
          ctx.fillStyle = '#14141a';
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
      }

      updateAndDrawParticles(ctx);
      ctx.restore();
      return;
    }

    const rocketPixelX = width * ROCKET_X_FRACTION;
    const windowScaleX = rocketPixelX / WINDOW_POINTS;
    const windowStart = Math.max(0, pointsRef.current.length - WINDOW_POINTS);
    const visiblePoints = pointsRef.current.slice(windowStart);
    const xForIndex = (index: number) => index * windowScaleX;

    // 3. FLIGHT CURVE RENDERING (Luxury Gold / Emerald / Ruby)
    const curveGradient = ctx.createLinearGradient(0, height, rocketPixelX, 0);
    if (isCrashed) {
      curveGradient.addColorStop(0, '#7f1d1d');
      curveGradient.addColorStop(1, '#ef4444');
    } else if (isCashedOut) {
      curveGradient.addColorStop(0, '#065f46');
      curveGradient.addColorStop(1, '#10b981');
    } else {
      // Obsidian & Gold 24k Palette
      curveGradient.addColorStop(0, 'rgba(212, 175, 55, 0.6)');
      curveGradient.addColorStop(0.7, '#D4AF37');
      curveGradient.addColorStop(1, '#FFF5C0');
    }

    // Curve area fill
    ctx.beginPath();
    ctx.moveTo(0, height);
    visiblePoints.forEach((p, i) => ctx.lineTo(xForIndex(i), height - (p.y - 1) * scaleY));
    ctx.lineTo(xForIndex(visiblePoints.length - 1), height);
    const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isCrashed) {
      areaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      areaGrad.addColorStop(1, 'transparent');
    } else if (isCashedOut) {
      areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      areaGrad.addColorStop(1, 'transparent');
    } else {
      areaGrad.addColorStop(0, 'rgba(212, 175, 55, 0.22)');
      areaGrad.addColorStop(0.6, 'rgba(212, 175, 55, 0.05)');
      areaGrad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Outer Glow Layer
    ctx.save();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = isCrashed
      ? 'rgba(239, 68, 68, 0.8)'
      : isCashedOut
        ? 'rgba(16, 185, 129, 0.8)'
        : 'rgba(212, 175, 55, 0.8)';
    ctx.strokeStyle = curveGradient;
    ctx.beginPath();
    visiblePoints.forEach((p, i) => {
      const x = xForIndex(i);
      const y = height - (p.y - 1) * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // Sharp Core Flight Line
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = curveGradient;
    ctx.beginPath();
    visiblePoints.forEach((p, i) => {
      const x = xForIndex(i);
      const y = height - (p.y - 1) * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // 4. LEVER 1: ROCKET SPRITE & DYNAMIC PLASMA JET ENGINE
    if (isRunning || isCashedOut) {
      const last = visiblePoints[visiblePoints.length - 1];
      const prev = visiblePoints[Math.max(0, visiblePoints.length - 3)] || last;
      const rocketX = xForIndex(visiblePoints.length - 1);
      const rocketY = height - (last.y - 1) * scaleY;
      const prevX = xForIndex(Math.max(0, visiblePoints.length - 3));
      const prevY = height - (prev.y - 1) * scaleY;

      // Smooth flight tangent angle
      const flightAngle = Math.atan2(rocketY - prevY, rocketX - prevX);

      // Spawn dynamic particle exhaust trail
      if (isRunning) {
        createTail(rocketX, rocketY, flightAngle, riskFactor);
      }

      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(flightAngle);

      // Radial thruster glow behind nozzle
      const thrusterGlow = ctx.createRadialGradient(-24, 0, 2, -24, 0, 45);
      thrusterGlow.addColorStop(
        0,
        isCashedOut ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255, 215, 0, 0.85)',
      );
      thrusterGlow.addColorStop(0.5, 'rgba(255, 120, 0, 0.4)');
      thrusterGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = thrusterGlow;
      ctx.beginPath();
      ctx.arc(-24, 0, 45, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Oscillating Plasma Jet Flame
      if (isRunning) {
        const flamePulse = Math.sin(performance.now() * 0.04) * 6;
        const flameLength = 32 + riskFactor * 25 + flamePulse;

        // Outer Flame (Orange)
        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.moveTo(-18, -6);
        ctx.lineTo(-18 - flameLength, 0);
        ctx.lineTo(-18, 6);
        ctx.closePath();
        ctx.fill();

        // Inner Core Flame (White/Yellow Plasma)
        ctx.fillStyle = '#FFF5C0';
        ctx.beginPath();
        ctx.moveTo(-18, -3);
        ctx.lineTo(-18 - flameLength * 0.65, 0);
        ctx.lineTo(-18, 3);
        ctx.closePath();
        ctx.fill();
      }

      // Render Clean Vector Rocket
      if (rocketImgRef.current && rocketImgRef.current.complete) {
        // Draw centered rocket SVG
        ctx.drawImage(rocketImgRef.current, -32, -16, 64, 32);
      } else {
        // Procedural crisp vector fallback
        ctx.fillStyle = '#14141a';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    updateAndDrawParticles(ctx);
    ctx.restore();
  }, [status]);

  const gameLoopRef = useRef<((ts: number) => void) | null>(null);

  // High-performance stable RAF Loop (reads refs)
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const deltaTime = Math.min(timestamp - lastUpdateRef.current, 50);
      lastUpdateRef.current = timestamp;

      if (statusRef.current === 'RUNNING') {
        const next =
          multiplierRef.current + multiplierRef.current * GROWTH_FACTOR * (deltaTime / 16);
        multiplierRef.current = next;

        const riskFactor = getRiskFactor(next);

        // 3. LEVER 3: MULTIPLIER & LIVE PROFIT HUD UPDATE
        if (multiplierDisplayRef.current) {
          multiplierDisplayRef.current.innerText = formatMultiplier(next);

          // Obsidian & Gold Color Progression
          if (next >= 10.0) {
            multiplierDisplayRef.current.style.color = '#FFD700';
            multiplierDisplayRef.current.style.textShadow =
              '0 0 35px rgba(255, 215, 0, 0.9), 0 0 70px rgba(212, 175, 55, 0.5)';
          } else if (next >= 2.0) {
            multiplierDisplayRef.current.style.color = '#FCE881';
            multiplierDisplayRef.current.style.textShadow =
              '0 0 30px rgba(212, 175, 55, 0.7), 0 0 60px rgba(212, 175, 55, 0.3)';
          } else {
            multiplierDisplayRef.current.style.color = '#FFFDF0';
            multiplierDisplayRef.current.style.textShadow = '0 0 25px rgba(255, 255, 255, 0.4)';
          }

          // Scale dynamics with motion preference check
          const pulseAmplitude = !prefersReducedMotionRef.current ? 0.02 + riskFactor * 0.04 : 0;
          const pulseFreq = 0.003 + riskFactor * 0.006;
          multiplierDisplayRef.current.style.transform = `scale(${1 + Math.sin(timestamp * pulseFreq) * pulseAmplitude})`;
        }

        // Live Profit update in HUD & Cashout Button
        const currentProfit = (next - 1) * betAmountRef.current;
        const currentPayout = next * betAmountRef.current;
        if (liveProfitDisplayRef.current) {
          liveProfitDisplayRef.current.innerText = `+${currentProfit.toFixed(2)}`;
        }
        if (cashoutButtonRef.current && !cashoutAtRef.current) {
          cashoutButtonRef.current.innerText = `CASHOUT $${currentPayout.toFixed(2)}`;
        }

        if (vignetteRef.current) {
          vignetteRef.current.style.opacity = String(Math.min(0.8, riskFactor * 0.9));
        }
        if (cameraZoomRef.current) {
          const breatheAmp = prefersReducedMotionRef.current ? 0 : 0.006 + riskFactor * 0.012;
          const zoomScale = 1 + Math.sin(timestamp * 0.002) * breatheAmp;
          cameraZoomRef.current.style.transform = `scale(${zoomScale})`;
        }

        // Milestone Announcements
        while (
          lastMilestoneIndexRef.current < MILESTONE_VALUES.length &&
          next >= MILESTONE_VALUES[lastMilestoneIndexRef.current]
        ) {
          const hitValue = MILESTONE_VALUES[lastMilestoneIndexRef.current];
          lastMilestoneIndexRef.current += 1;
          setMilestoneFlash({ value: hitValue, key: Date.now() });
        }

        // Auto Cashout trigger
        if (
          isAutoCashoutEnabledRef.current &&
          !cashoutAtRef.current &&
          next >= autoBetSettingsRef.current.cashoutAt
        ) {
          handleCashoutRef.current(next);
        }

        // Crash Resolution Check
        if (next >= crashPointRef.current && !roundResolvedRef.current) {
          roundResolvedRef.current = true;
          resetRiskVisuals();
          setStatus('CRASHED');
          setMultiplier(next);

          if (multiplierDisplayRef.current) {
            multiplierDisplayRef.current.innerText = formatMultiplier(next);
            multiplierDisplayRef.current.style.color = 'hsl(0, 85%, 60%)';
            multiplierDisplayRef.current.style.textShadow = '0 0 50px rgba(255, 60, 60, 0.8)';
          }

          if (!cashoutAtRef.current) {
            void settleCrashedRound(parseFloat(next.toFixed(2)));
            if (isAutoBettingRef.current) {
              if (autoBetSettingsRef.current.onLoss === 'DOUBLE') {
                setBetAmount((amount) => amount * 2);
              } else {
                setBetAmount(autoBetSettingsRef.current.amount);
              }
            }

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
          margin: '0 auto',
        }}
      >
        <style>{`
        .crash-container {
          display: grid;
          grid-template-columns: 330px 1fr;
          align-items: start;
          gap: 20px;
        }
        @media (max-width: 960px) {
          .crash-container {
            grid-template-columns: 1fr;
          }
          .sidebar-left { order: 2; }
          .game-area { order: 1; }
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
        .emerald-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-weight: 900;
          box-shadow: 0 6px 30px rgba(16, 185, 129, 0.45);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .emerald-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 35px rgba(16, 185, 129, 0.6);
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
          border-color: rgba(212, 175, 55, 0.4);
          color: #FFD700;
          transform: translateY(-1px);
        }
        .quick-chip:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        @keyframes milestone-pop {
          0% { opacity: 0; transform: translate(-50%, -40%) scale(0.6); }
          20% { opacity: 1; transform: translate(-50%, -55%) scale(1.15); }
          40% { transform: translate(-50%, -50%) scale(1); }
          75% { opacity: 1; transform: translate(-50%, -65%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -90%) scale(0.9); }
        }
        .milestone-pop {
          animation: milestone-pop 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes radar-pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .radar-glow {
          animation: radar-pulse 2.5s ease-in-out infinite;
        }
      `}</style>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowTutorial(false)}
          >
            <div
              className="obsidian-glass"
              style={{
                maxWidth: '520px',
                width: '100%',
                padding: '32px',
                borderRadius: '24px',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '28px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Sparkles size={28} color="#FFD700" />
              </div>
              <h2
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: '#FFD700',
                  letterSpacing: '1px',
                  marginBottom: '16px',
                }}
              >
                CRASH FLIGHT RULES
              </h2>
              <div
                style={{
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  lineHeight: '1.7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#FFD700', fontWeight: 900 }}>01.</span>
                  <span>Set your wager and launch before the rocket begins its ascent.</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#FFD700', fontWeight: 900 }}>02.</span>
                  <span>
                    Watch the multiplier skyrocket from 1.00x into deep space in real-time.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 900 }}>03.</span>
                  <span>
                    Hit <strong style={{ color: '#4ade80' }}>CASHOUT</strong> before the rocket
                    explodes to lock in your multiplied payout!
                  </span>
                </div>
              </div>
              <button
                className="gold-btn"
                style={{
                  marginTop: '28px',
                  width: '100%',
                  height: '50px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setShowTutorial(false)}
              >
                READY TO FLY
              </button>
            </div>
          </div>
        )}

        {/* Big Win Celebration */}
        {bigWin && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setBigWin(null)}
          >
            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontSize: 'clamp(3rem, 12vw, 5.5rem)',
                  color: '#FFD700',
                  textShadow: '0 0 60px rgba(255, 215, 0, 0.9)',
                  fontWeight: 900,
                  margin: 0,
                }}
              >
                BIG WIN!
              </h1>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
                  color: '#FFF',
                  fontFamily: 'monospace',
                  margin: '10px 0',
                }}
              >
                ${bigWin.amount.toFixed(2)}
              </h2>
              <div
                style={{
                  fontSize: '1.5rem',
                  color: '#4ade80',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                {bigWin.multiplier.toFixed(2)}x
              </div>
            </div>
          </div>
        )}

        {/* 4. LEVER 4: OBSIDIAN & GOLD VIP CONTROL SIDEBAR */}
        <div
          className="sidebar-left obsidian-glass"
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
                FLIGHT CONTROLS
              </h3>
            </div>
            <button
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
              onClick={() => setShowTutorial(true)}
            >
              <Info size={16} />
            </button>
          </div>

          {/* Mode Switcher: Manual / Auto */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              opacity: isRoundActive ? 0.5 : 1,
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
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: !isAutoBetting
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'transparent',
                color: !isAutoBetting ? '#FFD700' : '#64748b',
                border: !isAutoBetting ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                cursor: isRoundActive ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
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
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: isAutoBetting
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'transparent',
                color: isAutoBetting ? '#FFD700' : '#64748b',
                border: isAutoBetting ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                cursor: isRoundActive ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Auto Pilot
            </button>
          </div>

          {/* Bet Amount Input & Presets */}
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
                disabled={isRoundActive}
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
                  disabled={isRoundActive}
                  onClick={() => handleQuickBet(amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                className="quick-chip"
                disabled={isRoundActive}
                onClick={() => handleQuickBet(betAmount / 2)}
              >
                ½ Bet
              </button>
              <button
                className="quick-chip"
                disabled={isRoundActive}
                onClick={() => handleQuickBet(betAmount * 2)}
              >
                2× Bet
              </button>
              <button
                className="quick-chip"
                disabled={isRoundActive}
                onClick={() => handleQuickBet(balance)}
                style={{ color: '#FFD700' }}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Auto Cashout Section */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: isAutoCashoutEnabled ? '10px' : 0,
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
                  AUTO CASHOUT
                </label>
              </div>
              <button
                onClick={() => setIsAutoCashoutEnabled((v) => !v)}
                style={{
                  width: '42px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  background: isAutoCashoutEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#FFF',
                    transition: 'left 0.2s',
                    left: isAutoCashoutEnabled ? '21px' : '3px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                  }}
                />
              </button>
            </div>

            {isAutoCashoutEnabled && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  value={autoBetSettings.cashoutAt}
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '0 12px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#4ade80',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                  onChange={(e) =>
                    updateAutoSettings({ cashoutAt: parseFloat(e.target.value) || 1.1 })
                  }
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '5px',
                    marginTop: '8px',
                  }}
                >
                  {[1.2, 1.5, 2.0, 5.0, 10.0].map((preset) => (
                    <button
                      key={preset}
                      className="quick-chip"
                      style={{
                        background:
                          autoBetSettings.cashoutAt === preset
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(255, 255, 255, 0.04)',
                        border:
                          autoBetSettings.cashoutAt === preset
                            ? '1px solid rgba(16, 185, 129, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        color: autoBetSettings.cashoutAt === preset ? '#4ade80' : '#cbd5e1',
                      }}
                      onClick={() => updateAutoSettings({ cashoutAt: preset })}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
              }}
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
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

          {/* Primary Action Button (BET / CASHOUT) */}
          {!isRoundActive ? (
            <button
              key="action-btn-bet"
              className="gold-btn"
              style={{
                width: '100%',
                height: isMobile ? '60px' : '68px',
                fontSize: '1.25rem',
                borderRadius: '18px',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.7 : 1,
              }}
              onClick={handleStart}
              disabled={isProcessing}
            >
              {isProcessing
                ? 'ARMING THRUSTERS...'
                : isAutoBetting
                  ? 'AUTO FLIGHT ON'
                  : `LAUNCH BET ($${betAmount.toFixed(2)})`}
            </button>
          ) : (
            <button
              key="action-btn-cashout"
              ref={cashoutButtonRef}
              className="emerald-btn"
              style={{
                width: '100%',
                height: isMobile ? '60px' : '68px',
                fontSize: '1.15rem',
                borderRadius: '18px',
                border: cashoutAt ? '1px solid rgba(74, 222, 128, 0.6)' : 'none',
                cursor: cashoutAt ? 'default' : 'pointer',
                background: cashoutAt
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: cashoutAt ? '#4ade80' : '#FFF',
              }}
              onClick={() => {
                if (!cashoutAt) handleCashout();
              }}
              disabled={!!cashoutAt}
            >
              {cashoutAt
                ? `✓ SECURED $${(betAmount * cashoutAt).toFixed(2)} @ ${cashoutAt.toFixed(2)}x`
                : `CASHOUT $${(betAmount * multiplier).toFixed(2)}`}
            </button>
          )}

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

        {/* Main Center: Game Area & Canvas Stage */}
        <div
          className="game-area"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            order: isMobile ? 1 : 2,
          }}
        >
          {/* History Pills Bar */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {crashHistory.slice(0, 22).map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  fontFamily: 'monospace',
                  color:
                    h >= 10
                      ? '#FFD700'
                      : h >= 5
                        ? '#c084fc'
                        : h >= 2
                          ? '#60a5fa'
                          : 'rgba(255,255,255,0.45)',
                  background:
                    h >= 10
                      ? 'rgba(255,215,0,0.12)'
                      : h >= 5
                        ? 'rgba(192,132,252,0.12)'
                        : h >= 2
                          ? 'rgba(96,165,250,0.12)'
                          : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${
                    h >= 10
                      ? 'rgba(255,215,0,0.3)'
                      : h >= 5
                        ? 'rgba(192,132,252,0.3)'
                        : h >= 2
                          ? 'rgba(96,165,250,0.3)'
                          : 'rgba(255,255,255,0.08)'
                  }`,
                }}
              >
                {h.toFixed(2)}x
              </div>
            ))}
          </div>

          {/* 5. LEVER 5: STAGE CANVAS & IMMERSIVE STAGE HUD */}
          <div
            className="obsidian-glass"
            style={{
              position: 'relative',
              flex: 1,
              height: isMobile ? '360px' : '520px',
              minHeight: isMobile ? '360px' : '520px',
              padding: 0,
              overflow: 'hidden',
              borderRadius: '28px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            {/* Camera Zoom & Canvas Layer */}
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

            {/* Red Risk Edge Vignette */}
            <div
              ref={vignetteRef}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                pointerEvents: 'none',
                opacity: 0,
                boxShadow:
                  'inset 0 0 50px 15px rgba(255,60,40,0.5), inset 0 0 160px 30px rgba(255,20,10,0.4)',
                transition: 'opacity 0.1s ease',
              }}
            />

            {/* Central Stage Multiplier & Status Display */}
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
                padding: '24px',
              }}
            >
              {/* Idle State with radar indicator */}
              {status === 'IDLE' && !isProcessing && (
                <div
                  className="radar-glow"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#FFD700',
                    fontSize: isMobile ? '0.85rem' : '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    marginBottom: '12px',
                  }}
                >
                  <Sparkles size={16} color="#FFD700" />
                  <span>WAITING FOR NEXT LAUNCH</span>
                </div>
              )}

              {/* Processing / Arming State */}
              {status === 'IDLE' && isProcessing && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    color: '#FFD700',
                    fontSize: isMobile ? '0.85rem' : '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    marginBottom: '12px',
                  }}
                >
                  <span>ARMING THRUSTERS...</span>
                </div>
              )}

              {/* Big Multiplier Number */}
              <h1
                ref={multiplierDisplayRef}
                style={{
                  fontSize: isMobile ? '4.8rem' : 'min(9.5rem, 18vw)',
                  fontWeight: 900,
                  margin: 0,
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  color:
                    status === 'IDLE'
                      ? 'rgba(255, 255, 255, 0.35)'
                      : status === 'CRASHED'
                        ? '#ef4444'
                        : status === 'CASHED_OUT'
                          ? '#4ade80'
                          : '#FFFDF0',
                  textShadow:
                    status === 'IDLE'
                      ? 'none'
                      : status === 'CRASHED'
                        ? '0 0 60px rgba(239, 68, 68, 0.8)'
                        : status === 'CASHED_OUT'
                          ? '0 0 50px rgba(74, 222, 128, 0.7)'
                          : '0 0 40px rgba(212, 175, 55, 0.65)',
                }}
              >
                {status === 'IDLE' ? '1.00x' : ''}
              </h1>

              {/* Live Running Profit Pill (Lever 3) */}
              {status === 'RUNNING' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '12px',
                    background: 'rgba(14, 14, 20, 0.85)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
                    borderRadius: '16px',
                    padding: '6px 18px',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>
                    CURRENT PROFIT:
                  </span>
                  <div
                    ref={liveProfitDisplayRef}
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      color: '#4ade80',
                    }}
                  >
                    +$0.00
                  </div>
                </div>
              )}

              {/* Crashed State Feedback */}
              {status === 'CRASHED' && (
                <div style={{ marginTop: '12px' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '12px',
                      padding: '8px 24px',
                      color: '#ef4444',
                      fontWeight: 900,
                      fontSize: isMobile ? '1rem' : '1.3rem',
                      letterSpacing: '4px',
                    }}
                  >
                    CRASHED
                  </div>
                  {countdown !== null && (
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        marginTop: '10px',
                        letterSpacing: '1px',
                        fontFamily: 'monospace',
                      }}
                    >
                      Next launch sequence in {countdown}s…
                    </div>
                  )}
                </div>
              )}

              {/* Cashout Success Feedback */}
              {isRoundActive && cashoutAt && (
                <div
                  style={{
                    marginTop: '14px',
                    display: 'inline-block',
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(74, 222, 128, 0.6)',
                    boxShadow: '0 6px 25px rgba(16, 185, 129, 0.35)',
                    borderRadius: '16px',
                    padding: '10px 24px',
                    color: '#4ade80',
                    fontWeight: 900,
                    fontSize: isMobile ? '0.95rem' : '1.25rem',
                    letterSpacing: '1px',
                  }}
                >
                  ✓ SECURED @ {cashoutAt.toFixed(2)}x — +$
                  {(betAmount * cashoutAt - betAmount).toFixed(2)}
                </div>
              )}
            </div>

            {/* Milestone Flash Celebration Popup */}
            {milestoneFlash && (
              <div
                key={milestoneFlash.key}
                className="milestone-pop"
                style={{
                  position: 'absolute',
                  top: '22%',
                  left: '50%',
                  zIndex: 15,
                  pointerEvents: 'none',
                  fontSize: isMobile ? '1.8rem' : '2.8rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  whiteSpace: 'nowrap',
                  color: '#FFD700',
                  textShadow: '0 0 35px rgba(255, 215, 0, 0.9), 0 0 70px rgba(212, 175, 55, 0.5)',
                }}
              >
                {milestoneFlash.value}× MILESTONE REACHED!
              </div>
            )}
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
