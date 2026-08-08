'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Zap } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
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

export default function CrashPage() {
  const isMobile = useCasinoStore(state => state.isMobile);
  const balance = useCasinoStore(state => state.balance);
  const crashHistory = useCasinoStore(state => state.crashHistory);
  const provablyFairSettings = useCasinoStore(state => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore(state => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore(state => state.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore(state => state.applyServerWalletSnapshot);
  const addToast = useCasinoStore(state => state.addToast);
  const isProcessing = useCasinoStore(state => state.isProcessing);
  const setIsProcessing = useCasinoStore(state => state.setIsProcessing);
  const allBets = useCasinoStore(state => state.allBets);
  const { betMin, betMax } = useCasinoStore(state => state.gameConfig.limits);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [_liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number, multiplier: number } | null>(null);

  // V2 Lever 1: Partial cashout — lets players bank half their stake and "let the rest ride"
  const [halfCashedOut, setHalfCashedOut] = useState<{ multiplier: number, amount: number } | null>(null);
  const halfCashedOutRef = useRef<{ multiplier: number, amount: number } | null>(null);

  // V2 Lever 2: Session stats — running profit/loss tracker to encourage longer sessions
  const [sessionStats, setSessionStats] = useState({ rounds: 0, wins: 0, profit: 0, biggestMultiplier: 0 });

  // Auto-betting state
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const autoBetSettings = useCasinoStore(state => state.autoBetSettings.crash);
  const setAutoBetSettings = useCasinoStore(state => state.setAutoBetSettings);
  const updateAutoSettings = (updater: Partial<typeof autoBetSettings> | ((prev: typeof autoBetSettings) => typeof autoBetSettings)) => {
    const newSettings = typeof updater === 'function' ? updater(autoBetSettings) : { ...autoBetSettings, ...updater };
    setAutoBetSettings('crash', newSettings);
  };
  const [countdown, setCountdown] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const pointsRef = useRef<{x: number, y: number}[]>([]);
  const autoCountRef = useRef<number>(0);
  const rocketImgRef = useRef<HTMLImageElement | null>(null);
  const autoRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crashPointRef = useRef<number>(2.00);
  const bigWinQueueRef = useRef<Array<{ amount: number, multiplier: number }>>([]);
  const multiplierDisplayRef = useRef<HTMLHeadingElement>(null);
  const multiplierRef = useRef<number>(1.00);
  const roundIdRef = useRef<string | null>(null);

  // Refs to avoid stale closures in the game loop
  const statusRef = useRef<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const cashoutAtRef = useRef<number | null>(null);
  const isAutoCashoutEnabledRef = useRef(false);
  const isAutoBettingRef = useRef(false);
  const betAmountRef = useRef(10);
  const autoBetSettingsRef = useRef(autoBetSettings);
  const handleCashoutRef = useRef<(m?: number) => void>(() => {});
  
  // Audio Refs (Infrastructure for Lever 13)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  // Game constants
  const GROWTH_FACTOR = 0.003; // ~3.7s to 2x at 60fps (market standard: Stake ~4s, Bustabit ~3s)
  const MAX_POINTS = 500;
  // Initialize Audio
  useEffect(() => {
    const sounds = {
      engine: '/sounds/engine.mp3', // Rocket launch
      cashout: '/sounds/win.mp3', // Ding
      crash: '/sounds/loss.mp3'   // Explosion
    };
    Object.entries(sounds).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.4;
      audioRefs.current[name] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach(a => {
        a.pause();
        a.src = '';
      });
    };
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/crash/crash-rocket.png';
    rocketImgRef.current = img;
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

  // Keep refs in sync with state/props (handleCashoutRef synced after handleCashout is declared)
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { cashoutAtRef.current = cashoutAt; }, [cashoutAt]);
  useEffect(() => { isAutoCashoutEnabledRef.current = isAutoCashoutEnabled; }, [isAutoCashoutEnabled]);
  useEffect(() => { isAutoBettingRef.current = isAutoBetting; }, [isAutoBetting]);
  useEffect(() => { betAmountRef.current = betAmount; }, [betAmount]);
  useEffect(() => { autoBetSettingsRef.current = autoBetSettings; }, [autoBetSettings]);
  useEffect(() => { halfCashedOutRef.current = halfCashedOut; }, [halfCashedOut]);

  const playSound = (name: string) => {
    const audio = audioRefs.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => CasinoLogger.warn('Crash', 'Audio playback failed', e));
    }
  };

  // V2 Lever 1: Partial cashout — banks half the stake now, lets the other half ride.
  // Settled entirely client-side (no server call) since the server holds the full
  // original stake; the remaining half is reconciled on the final cashout/crash below.
  const handlePartialCashout = useCallback(() => {
    addToast('Partial cashout is disabled until it has a dedicated atomic server transaction.', 'info');
  }, [addToast]);
  const handleCashout = useCallback((specificMultiplier?: number) => {
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
        playSound('cashout');
        setSessionStats((previous) => ({
          rounds: previous.rounds + 1,
          wins: previous.wins + (data.win ? 1 : 0),
          profit: previous.profit + data.payout - betAmount,
          biggestMultiplier: Math.max(previous.biggestMultiplier, data.multiplier),
        }));
      } catch (error) {
        setCashoutAt(null);
        cashoutAtRef.current = null;
        CasinoLogger.error('Crash', 'Server cashout settlement failed closed', error);
        addToast('Cashout could not be confirmed by the server.', 'error');
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [status, cashoutAt, betAmount, processGameResult, applyServerWalletSnapshot, setIsProcessing, provablyFairSettings, addToast]);
  // Sync handleCashout ref after it's declared
  useEffect(() => { handleCashoutRef.current = handleCashout; }, [handleCashout]);

  const handleStart = useCallback(async () => {
    // Guard: only start when truly idle and not already processing
    if (status !== 'IDLE' || isProcessing) return;

    if (betAmount < betMin || betAmount > betMax) {
      addToast(`Bet amount must be between $${betMin.toFixed(2)} and $${betMax.toLocaleString()}!`, 'error');
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
            currentNonce: provablyFairSettings.nonce
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      applyServerWalletSnapshot(data.wallet);
      roundIdRef.current = data.roundId;

      // Persist server seed hash + advance nonce for next round
      setProvablyFairSettings({ serverSeedHash: data.hash, nonce: data.nonce });

      // Reset all game state BEFORE setting status to RUNNING
      crashPointRef.current = data.crashPoint;
      multiplierRef.current = 1.00;
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

      // Use real allBets from store (Zustand)
      const recentBets = allBets
        .filter(b => b.game === 'CRASH')
        .slice(0, 10)
        .map(b => ({
          user: b.user || 'Player',
          amount: b.amount,
          multiplier: null,
          payout: null,
          _target: undefined
        }));
      if (recentBets.length > 0) {
        setLiveBets(recentBets);
      }

      // NOW start the game loop — crashPointRef and multiplierRef are fresh
      setIsProcessing(false);
      setStatus('RUNNING');
      playSound('engine');
    } catch (error: unknown) {
      CasinoLogger.error('Crash', 'Start error', error);
      // The server transaction is authoritative; there is no optimistic debit to restore.
      setIsProcessing(false);
      addToast('Failed to start game. No client wallet change was applied.', 'error');
    }
  }, [status, isProcessing, betAmount, balance, provablyFairSettings, addToast, applyServerWalletSnapshot, setIsProcessing, setProvablyFairSettings]);

  const settleCrashedRound = useCallback(async (crashPoint: number) => {
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
  }, [addToast, applyServerWalletSnapshot, processGameResult, provablyFairSettings]);

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
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
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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
        setLiveBets(prev => prev.map(bet => {
          if (bet.multiplier === null && bet._target !== undefined && liveM >= bet._target) {
            return { ...bet, multiplier: bet._target, payout: bet.amount * bet._target };
          }
          return bet;
        }));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);


  // Particle System Logic
  const createExplosion = (_x: number, _y: number) => {
    const MAX_PARTICLES = 200;

    // Limit existing particles to make room for the explosion
    if (particlesRef.current.length > MAX_PARTICLES - 50) {
      particlesRef.current = particlesRef.current.slice(- (MAX_PARTICLES - 50));
    }
    // Particle effects disabled to remove Math.random() dependency
    // TODO: Replace with CSS-based burst animation
    playSound('crash');
  };
  const createTail = (_x: number, _y: number) => {
    if (particlesRef.current.length > 300) return;
    // Tail particles disabled to remove Math.random() dependency
    // TODO: Replace with deterministic animation or CSS trail effect
  };
  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    particlesRef.current.forEach(p => {
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

    // Dynamic line color based on multiplier
    const lineHue = isCrashed ? 0 : m > 10 ? 45 : m > 5 ? 280 : m > 2 ? 200 : 180;
    const lineColor = isCrashed ? 'hsl(0, 90%, 60%)' : `hsl(${lineHue}, 100%, 65%)`;
    const glowColor = isCrashed ? 'rgba(255,50,50,0.8)' : m > 10 ? 'rgba(255,215,0,0.8)' : m > 5 ? 'rgba(200,50,255,0.8)' : 'rgba(0,255,255,0.8)';

    // Grid — toned down so it never competes with the multiplier line
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(0, (height / 10) * i); ctx.lineTo(width, (height / 10) * i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo((width / 10) * i, 0); ctx.lineTo((width / 10) * i, height); ctx.stroke();
    }

    // V2: Y-axis multiplier scale — gives the curve a readable reference frame
    const axisScaleY = height / Math.max(5, (m || 1) + 1);
    ctx.font = '500 11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      const value = 1 + (height - y) / axisScaleY;
      if (value < 1) continue;
      ctx.fillText(`${value.toFixed(1)}x`, 8, y - 4 < 12 ? 14 : y - 4);
    }

    if (pointsRef.current.length < 2) {
      updateParticles(ctx);
      ctx.restore();
      return;
    }

    const scaleX = width / Math.max(100, pointsRef.current.length);
    const scaleY = height / Math.max(5, (m || 1) + 1);

    // Helper to trace the curve path
    const tracePath = () => {
      ctx.moveTo(0, height - (pointsRef.current[0].y - 1) * scaleY);
      pointsRef.current.forEach((p, i) => {
        ctx.lineTo(i * scaleX, height - (p.y - 1) * scaleY);
      });
    };

    // Area fill — stronger gradient
    ctx.beginPath();
    ctx.moveTo(0, height);
    pointsRef.current.forEach((p, i) => ctx.lineTo(i * scaleX, height - (p.y - 1) * scaleY));
    ctx.lineTo(pointsRef.current.length * scaleX, height);
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(0, isCrashed ? 'rgba(255,50,50,0.22)' : m > 5 ? 'rgba(200,50,255,0.2)' : 'rgba(0,255,255,0.18)');
    areaGradient.addColorStop(0.6, isCrashed ? 'rgba(255,50,50,0.05)' : 'rgba(0,255,255,0.04)');
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

    // Sharp core line
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, 'hsl(180,100%,60%)');
    gradient.addColorStop(1, lineColor);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    pointsRef.current.forEach((p, i) => {
      const x = i * scaleX;
      const y = height - (p.y - 1) * scaleY;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      if (status === 'RUNNING' && i === pointsRef.current.length - 1) createTail(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // Rocket with dynamic glow
    if (status === 'RUNNING') {
      const last = pointsRef.current[pointsRef.current.length - 1];
      const rocketX = pointsRef.current.length * scaleX;
      const rocketY = height - (last.y - 1) * scaleY;
      const glowSize = Math.min(80, 25 + m * 4);
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(-Math.atan2(scaleY, scaleX) * 1.5);

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
      ctx.shadowColor = m > 5 ? 'magenta' : 'cyan';
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
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
    const deltaTime = Math.min(timestamp - lastUpdateRef.current, 50); // cap to prevent huge jumps after tab switch
    lastUpdateRef.current = timestamp;

    if (statusRef.current === 'RUNNING') {
      const next = multiplierRef.current + multiplierRef.current * GROWTH_FACTOR * (deltaTime / 16);
      multiplierRef.current = next;

      if (multiplierDisplayRef.current) {
        multiplierDisplayRef.current.innerText = formatMultiplier(next);
        const hue = next > 10 ? 45 : next > 5 ? 280 : next > 2 ? 200 : 180;
        multiplierDisplayRef.current.style.color = `hsl(${hue}, 100%, 70%)`;
        const glow = Math.min(60, 10 + next * 3);
        multiplierDisplayRef.current.style.textShadow = `0 0 ${glow}px hsl(${hue}, 100%, 60%), 0 0 ${glow * 2}px hsl(${hue}, 80%, 50%)`;
      }

      if (isAutoCashoutEnabledRef.current && !cashoutAtRef.current && next >= autoBetSettingsRef.current.cashoutAt) {
        handleCashoutRef.current(next);
      }

      if (next >= crashPointRef.current) {
        setStatus('CRASHED');
        setMultiplier(next);

        if (multiplierDisplayRef.current) {
          multiplierDisplayRef.current.innerText = formatMultiplier(next);
          multiplierDisplayRef.current.style.color = 'hsl(0, 85%, 60%)';
        }

        if (!cashoutAtRef.current) {
          void settleCrashedRound(parseFloat(next.toFixed(2)));
          if (isAutoBettingRef.current) {
            if (autoBetSettingsRef.current.onLoss === 'DOUBLE') setBetAmount((amount) => amount * 2);
            else setBetAmount(autoBetSettingsRef.current.amount);
          }
        } else {
          const finalPoint = parseFloat(next.toFixed(2));
          useCasinoStore.setState((state) => ({
            crashHistory: [finalPoint, ...state.crashHistory].slice(0, 50),
          }));
        }
        const canvas = canvasRef.current;
        if (canvas) {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          const scaleX = width / Math.max(100, pointsRef.current.length);
          const scaleY = height / Math.max(5, next + 1);
          createExplosion(pointsRef.current.length * scaleX, height - (next - 1) * scaleY);
        }
      } else {
        pointsRef.current.push({ x: pointsRef.current.length, y: next });
        if (pointsRef.current.length > MAX_POINTS) pointsRef.current.shift();
      }
    }

    draw();
  }, [draw, settleCrashedRound]);

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
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);




  return (
    <GameErrorBoundary gameName="Crash">
      <div className="crash-container" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
        gap: isMobile ? '12px' : '16px',
        padding: isMobile ? '12px' : '16px 20px 16px 16px'
      }}>
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
      `}</style>
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="big-win-overlay" onClick={() => setShowTutorial(false)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <Info size={48} color="hsl(var(--primary))" style={{ marginBottom: '24px', margin: '0 auto' }} />
            <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.2rem, 5vw, 2rem)' }}>HOW TO PLAY</h2>
            <p style={{ color: 'hsl(var(--text-muted))', lineHeight: '1.6', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
              1. Place your bet before the rocket takes off.<br/>
              2. Watch the multiplier grow higher and higher.<br/>
              3. Cash out before the rocket explodes to win!<br/>
              4. If the rocket crashes first, you lose your bet.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '24px', width: '100%', height: '56px' }} onClick={() => setShowTutorial(false)}>GOT IT!</button>
          </div>
        </div>
      )}
      {/* Big Win Celebration */}
      {bigWin && (
        <div className="big-win-overlay" onClick={() => setBigWin(null)}>
          <div className="animate-bounce" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(3rem, 15vw, 6rem)', color: 'gold', textShadow: '0 0 50px gold' }}>BIG WIN!</h1>
            <h2 style={{ fontSize: 'clamp(1.5rem, 8vw, 3rem)', color: '#fff' }}>${bigWin.amount.toFixed(2)}</h2>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: 'hsl(var(--success))' }}>{bigWin.multiplier.toFixed(2)}x</div>
          </div>
        </div>
      )}
      
      {/* Sidebar Left: Control Panel */}
      <div className="sidebar-left glass-card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '16px' : '20px', 
        padding: isMobile ? '20px 16px' : '24px', 
        borderRadius: '24px',
        order: isMobile ? 2 : 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={20} color="hsl(var(--primary))" />
            <h3 style={{ margin: 0, letterSpacing: '1px', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>CONTROL</h3>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setShowTutorial(true)}>
            <Info size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', background: '#0f212e', padding: '4px', borderRadius: '8px', opacity: status === 'RUNNING' ? 0.4 : 1 }}>
          <button
            onClick={() => { if (status !== 'RUNNING') setIsAutoBetting(false); }}
            disabled={status === 'RUNNING'}
            style={{
              flex: 1, padding: '10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800,
              background: !isAutoBetting ? '#2f4553' : 'transparent',
              color: !isAutoBetting ? '#fff' : '#b1bad3', border: 'none',
              cursor: status === 'RUNNING' ? 'not-allowed' : 'pointer'
            }}
          >
            Manual
          </button>
          <button
            onClick={() => { if (status !== 'RUNNING') setIsAutoBetting(true); }}
            disabled={status === 'RUNNING'}
            style={{
              flex: 1, padding: '10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800,
              background: isAutoBetting ? '#2f4553' : 'transparent',
              color: isAutoBetting ? '#fff' : '#b1bad3', border: 'none',
              cursor: status === 'RUNNING' ? 'not-allowed' : 'pointer'
            }}
          >
            Auto
          </button>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '1px' }}>BET AMOUNT</label>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>${balance.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                className="input mono" 
                value={betAmount} 
                style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, flex: 1, minHeight: isMobile ? '48px' : '56px' }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setBetAmount(val);
                  updateAutoSettings({ amount: val });
                }} 
              />
              {!isMobile && (
                <>
                  <button className="btn btn-secondary" style={{ padding: '0 10px' }} onClick={() => setBetAmount(prev => prev / 2)}>1/2</button>
                  <button className="btn btn-secondary" style={{ padding: '0 10px' }} onClick={() => setBetAmount(prev => prev * 2)}>2x</button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Auto-Cashout — available in both Manual and Auto tabs */}
        <div className="glass" style={{ padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isAutoCashoutEnabled ? '10px' : 0 }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '1px' }}>AUTO CASHOUT</label>
            <button
              onClick={() => setIsAutoCashoutEnabled(v => !v)}
              style={{
                width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative',
                background: isAutoCashoutEnabled ? 'hsl(var(--success))' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s'
              }}
            >
              <span style={{
                position: 'absolute', top: '3px', width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                left: isAutoCashoutEnabled ? '21px' : '3px'
              }} />
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
                onChange={(e) => updateAutoSettings({ cashoutAt: parseFloat(e.target.value) || 1.1 })}
              />
              {/* V2 Lever 3: one-tap target presets — removes the friction of typing a target every round */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[1.5, 2, 3, 5, 10].map(preset => (
                  <button
                    key={preset}
                    className="btn btn-secondary"
                    style={{
                      flex: 1, padding: '6px 0', fontSize: '0.7rem', fontWeight: 800,
                      background: autoBetSettings.cashoutAt === preset ? 'hsl(var(--primary) / 0.25)' : 'transparent',
                      border: autoBetSettings.cashoutAt === preset ? '1px solid hsl(var(--primary) / 0.5)' : '1px solid rgba(255,255,255,0.08)'
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
          <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            SESSION STATS
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>ROUNDS</div>
              <div className="mono" style={{ fontWeight: 800 }}>{sessionStats.rounds}</div>
            </div>
            <div>
              <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>WIN RATE</div>
              <div className="mono" style={{ fontWeight: 800 }}>
                {sessionStats.rounds > 0 ? `${((sessionStats.wins / sessionStats.rounds) * 100).toFixed(0)}%` : '—'}
              </div>
            </div>
            <div>
              <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>PROFIT</div>
              <div className="mono" style={{ fontWeight: 800, color: sessionStats.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                {sessionStats.profit >= 0 ? '+' : ''}{sessionStats.profit.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.6rem' }}>BEST</div>
              <div className="mono" style={{ fontWeight: 800 }}>
                {sessionStats.biggestMultiplier > 0 ? `${sessionStats.biggestMultiplier.toFixed(2)}x` : '—'}
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
                style={{ flex: 1, fontSize: '0.65rem', background: autoBetSettings.onLoss === 'RESET' ? '#2f4553' : 'transparent' }}
                onClick={() => updateAutoSettings({ onLoss: 'RESET' })}
              >
                ON LOSS: RESET
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '0.65rem', background: autoBetSettings.onLoss === 'DOUBLE' ? '#2f4553' : 'transparent' }}
                onClick={() => updateAutoSettings({ onLoss: 'DOUBLE' })}
              >
                ON LOSS: 2X
              </button>
            </div>
          </div>
        )}
        {status !== 'RUNNING' ? (
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
              background: cashoutAt
                ? 'rgba(34, 197, 94, 0.12)'
                : 'hsl(var(--success))',
              border: cashoutAt ? '2px solid rgba(34,197,94,0.6)' : 'none',
              boxShadow: cashoutAt ? 'none' : '0 10px 40px hsla(145, 80%, 50%, 0.4)',
              color: cashoutAt ? '#4ade80' : '#000',
              cursor: cashoutAt ? 'default' : 'pointer',
            }}
            onClick={() => { if (!cashoutAt) handleCashout(); }}
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
              width: '100%', height: isMobile ? '44px' : '50px', fontSize: '0.8rem', fontWeight: 800,
              borderRadius: '14px', opacity: halfCashedOut ? 0.5 : 1,
              border: '1px solid rgba(255,255,255,0.1)'
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
      <div className="game-area" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px', order: isMobile ? 1 : 2 }}>
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {crashHistory.slice(0, 20).map((h, i) => (
            <div key={i} className="glass" style={{
              padding: '3px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
              color: h >= 10 ? '#FFD700' : h >= 5 ? '#c084fc' : h >= 2 ? '#60a5fa' : '#f87171',
              border: `1px solid ${h >= 10 ? 'rgba(255,215,0,0.25)' : h >= 5 ? 'rgba(192,132,252,0.25)' : h >= 2 ? 'rgba(96,165,250,0.25)' : 'rgba(248,113,113,0.25)'}`,
              background: h >= 10 ? 'rgba(255,215,0,0.08)' : h >= 5 ? 'rgba(192,132,252,0.08)' : h >= 2 ? 'rgba(96,165,250,0.08)' : 'rgba(248,113,113,0.08)',
              textAlign: 'center', fontFamily: 'monospace'
            }}>
              {h.toFixed(2)}x
            </div>
          ))}
        </div>
        <div className="glass-card" style={{
          position: 'relative', flex: 1, minHeight: isMobile ? '300px' : 'clamp(300px, 50vh, 550px)', padding: 0, overflow: 'hidden',
          // V2: flat, low-contrast backdrop (no busy texture) so the multiplier curve & HUD stay legible at all times
          background: 'radial-gradient(circle at 50% 100%, #0c1620 0%, #050a10 60%, #02050a 100%)',
          borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            textAlign: 'center', zIndex: 10, pointerEvents: 'none', width: '100%',
            // V2: soft backdrop plate so the multiplier stays readable regardless of curve color/position
            padding: isMobile ? '16px 24px' : '24px 48px', borderRadius: '24px',
            background: 'radial-gradient(circle, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 75%)'
          }}>
            {status === 'IDLE' && !isProcessing && (
              <div className="multiplier-idle" style={{
                fontSize: isMobile ? '1rem' : '1.4rem', fontWeight: 700,
                color: 'rgba(0,255,255,0.5)', letterSpacing: '4px', marginBottom: '8px'
              }}>
                WAITING FOR BETS
              </div>
            )}
            {isProcessing && (
              <div className="multiplier-idle" style={{
                fontSize: isMobile ? '1rem' : '1.4rem', fontWeight: 700,
                color: 'rgba(212,175,55,0.7)', letterSpacing: '4px', marginBottom: '8px'
              }}>
                LAUNCHING...
              </div>
            )}
            <h1
              ref={multiplierDisplayRef}
              className={status === 'IDLE' ? 'multiplier-idle' : ''}
              style={{
                fontSize: isMobile ? '4.5rem' : 'min(10rem, 20vw)', fontWeight: 900,
                textShadow: status === 'CRASHED' ? '0 0 60px rgba(255,50,50,0.8)' : '0 0 40px rgba(0,255,255,0.4)',
                margin: 0, fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                color: status === 'IDLE' ? 'rgba(255,255,255,0.3)' : status === 'CRASHED' ? 'hsl(0,90%,60%)' : '#fff'
              }}
            />
            {status === 'CRASHED' && (
              <div style={{ marginTop: '8px' }}>
                <div className="animate-slide-up" style={{ fontSize: isMobile ? '0.85rem' : '1.5rem', fontWeight: 800, color: 'hsl(var(--error))', letterSpacing: isMobile ? '2px' : '8px' }}>
                  CRASHED
                </div>
                {countdown !== null && (
                  <div style={{ fontSize: isMobile ? '0.75rem' : '1rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', letterSpacing: '2px' }}>
                    Next round in {countdown}…
                  </div>
                )}
              </div>
            )}
            {/* #16: Cashout success feedback */}
            {status === 'RUNNING' && cashoutAt && (
              <div style={{
                marginTop: '12px', display: 'inline-block',
                background: 'hsla(145, 80%, 30%, 0.85)', border: '1px solid hsl(var(--success))',
                borderRadius: '12px', padding: '8px 20px',
                color: 'hsl(var(--success))', fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1.1rem',
                letterSpacing: '1px'
              }}>
                ✓ CASHED OUT @ {cashoutAt.toFixed(2)}x — +${(betAmount * cashoutAt).toFixed(2)}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} width={1200} height={800} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      </div>
      </div>
    </GameErrorBoundary>
  );
}