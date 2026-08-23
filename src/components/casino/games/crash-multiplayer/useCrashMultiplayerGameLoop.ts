'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { soundManager } from '@/lib/casino/sound-manager';
import {
  type Particle,
  type Star,
  formatMultiplier,
  pseudoRandom,
  getRiskFactor,
  MILESTONE_VALUES,
  GROWTH_FACTOR,
  MAX_POINTS,
  WINDOW_POINTS,
  ROCKET_X_FRACTION,
} from '../crash/crash-helpers';

// Multiplayer adds a shared 'WAITING' betting window between IDLE and RUNNING
// that solo crash (../crash/crash-helpers CrashStatus) does not have, so this
// local union is the authoritative multiplayer status type — matches the
// inline union in crash-multiplayer/page.tsx and CrashMultiplayerStage.
type CrashStatus = 'IDLE' | 'WAITING' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT';

interface MilestoneFlash {
  value: number;
  key: number;
}

interface CrashMultiplayerGameLoopParams {
  status: CrashStatus;
  setStatus: Dispatch<SetStateAction<CrashStatus>>;
  setMultiplier: Dispatch<SetStateAction<number>>;
  setMilestoneFlash: Dispatch<SetStateAction<MilestoneFlash | null>>;
  setBetAmount: Dispatch<SetStateAction<number>>;
  settleCrashedRound: (crashPoint: number) => void;
  resetRiskVisuals: () => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  multiplierDisplayRef: RefObject<HTMLHeadingElement | null>;
  liveProfitDisplayRef: RefObject<HTMLDivElement | null>;
  cashoutButtonRef: RefObject<HTMLButtonElement | null>;
  vignetteRef: RefObject<HTMLDivElement | null>;
  cameraZoomRef: RefObject<HTMLDivElement | null>;
  particlesRef: RefObject<Particle[]>;
  starsRef: RefObject<Star[]>;
  pointsRef: RefObject<{ x: number; y: number }[]>;
  lastUpdateRef: RefObject<number>;
  rocketImgRef: RefObject<HTMLImageElement | null>;
  shakeRef: RefObject<{ intensity: number }>;
  prngSeedRef: RefObject<number>;
  statusRef: RefObject<CrashStatus>;
  cashoutAtRef: RefObject<number | null>;
  crashPointRef: RefObject<number>;
  roundResolvedRef: RefObject<boolean>;
  multiplierRef: RefObject<number>;
  autoBetSettingsRef: RefObject<{ cashoutAt: number; amount: number; onLoss: 'RESET' | 'DOUBLE' }>;
  isAutoCashoutEnabledRef: RefObject<boolean>;
  isAutoBettingRef: RefObject<boolean>;
  betAmountRef: RefObject<number>;
  lastMilestoneIndexRef: RefObject<number>;
  prefersReducedMotionRef: RefObject<boolean>;
  isMobileRef: RefObject<boolean>;
  handleCashoutRef: RefObject<(m?: number) => void>;
}

/**
 * Multiplayer-crash RAF loop, canvas draw, particle physics, and crash-resolution detection.
 * Verbatim extraction from crash-multiplayer/page.tsx — identical to the solo crash loop in
 * useCrashGameLoop except for the cashed-out-at-crash history push (multiplayerCrashHistory).
 * Dep arrays ([status] for draw, [draw, settleCrashedRound, resetRiskVisuals] for gameLoop) are
 * preserved exactly so the ref-based RAF loop keeps stable-handle semantics. Parent owns all
 * refs/state; this hook only reads refs + drives setters, identical to the inlined original.
 */
export function useCrashMultiplayerGameLoop(params: CrashMultiplayerGameLoopParams) {
  const {
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
  } = params;

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
    // Refs are stable across renders and intentionally omitted — matching the original
    // inlined loop's dep array verbatim (the rule can't recognize param-sourced refs as stable).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const gameLoopRef = useRef<((ts: number) => void) | null>(null);
  const animationRef = useRef<number | null>(null);

  // High-performance stable RAF Loop (reads refs)
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const deltaTime = Math.min(timestamp - lastUpdateRef.current, 50);
      lastUpdateRef.current = timestamp;

      if (statusRef.current === 'RUNNING') {
        if (cashoutAtRef.current !== null) {
          // Cashout already locked in optimistically: keep HUD locked on secured multiplier
          if (multiplierDisplayRef.current) {
            multiplierDisplayRef.current.innerText = formatMultiplier(cashoutAtRef.current);
            multiplierDisplayRef.current.style.color = '#4ade80';
            multiplierDisplayRef.current.style.textShadow = '0 0 40px rgba(74, 222, 128, 0.7)';
            multiplierDisplayRef.current.style.transform = 'scale(1)';
          }
        } else {
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
                multiplayerCrashHistory: [finalPoint, ...state.multiplayerCrashHistory].slice(
                  0,
                  50,
                ),
              }));
            }
          } else if (next < crashPointRef.current) {
            pointsRef.current.push({ x: pointsRef.current.length, y: next });
            if (pointsRef.current.length > MAX_POINTS) pointsRef.current.shift();
          }
        }
      }

      draw();
    },
    // Refs/setters are stable and intentionally omitted — matches the original inlined loop's
    // dep array verbatim (the rule can't recognize param-sourced refs as stable).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
}
