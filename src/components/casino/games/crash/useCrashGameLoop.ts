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
  type CrashStatus,
  formatMultiplier,
  pseudoRandom,
  getRiskFactor,
  MILESTONE_VALUES,
  GROWTH_FACTOR,
  MAX_POINTS,
  getCrashTrajectoryState,
  getCrashMilestoneY,
} from './crash-helpers';

export type { CrashStatus } from './crash-helpers';

interface MilestoneFlash {
  value: number;
  key: number;
}

interface CrashGameLoopParams {
  status: CrashStatus;
  setStatus: Dispatch<SetStateAction<CrashStatus>>;
  setMultiplier: Dispatch<SetStateAction<number>>;
  setMilestoneFlash: Dispatch<SetStateAction<MilestoneFlash | null>>;
  setBetAmount: Dispatch<SetStateAction<number>>;
  settleCrashedRound: (crashPoint: number) => void;
  resetRiskVisuals: () => void;
  // DOM refs (owned by parent, mutated by the loop)
  canvasRef: RefObject<HTMLCanvasElement | null>;
  multiplierDisplayRef: RefObject<HTMLHeadingElement | null>;
  liveProfitDisplayRef: RefObject<HTMLDivElement | null>;
  cashoutButtonRef: RefObject<HTMLButtonElement | null>;
  vignetteRef: RefObject<HTMLDivElement | null>;
  cameraZoomRef: RefObject<HTMLDivElement | null>;
  // Data refs
  particlesRef: RefObject<Particle[]>;
  starsRef: RefObject<Star[]>;
  pointsRef: RefObject<{ x: number; y: number }[]>;
  lastUpdateRef: RefObject<number>;
  rocketImgRef: RefObject<HTMLImageElement | null>;
  shakeRef: RefObject<{ intensity: number }>;
  prngSeedRef: RefObject<number>;
  // Mirror refs (synced from state in parent)
  statusRef: RefObject<CrashStatus>;
  cashoutAtRef: RefObject<number | null>;
  crashPointRef: RefObject<number>;
  roundResolvedRef: RefObject<boolean>;
  multiplierRef: RefObject<number>;
  autoBetSettingsRef: RefObject<{ cashoutAt: number; amount: number; onLoss: string }>;
  isAutoCashoutEnabledRef: RefObject<boolean>;
  isAutoBettingRef: RefObject<boolean>;
  betAmountRef: RefObject<number>;
  lastMilestoneIndexRef: RefObject<number>;
  prefersReducedMotionRef: RefObject<boolean>;
  isMobileRef: RefObject<boolean>;
  handleCashoutRef: RefObject<(m?: number) => void>;
}

/**
 * Owns the crash RAF loop, canvas rendering (draw), particle physics, and crash resolution
 * detection. Extracted verbatim from crash/page.tsx — the useCallback dep arrays ([status] for
 * draw, [draw, settleCrashedRound, resetRiskVisuals] for gameLoop) are preserved exactly so the
 * ref-based RAF loop keeps its stable-handle semantics (stale closures would cause wrong
 * bet amounts / keyboard shortcuts). The parent owns all refs and state; this hook only reads
 * refs + drives setters, identical to the inlined original.
 */
export function useCrashGameLoop(params: CrashGameLoopParams) {
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
    const exhaustSpread = 0.35;
    const count = isMobileRef.current ? 1 : 2;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perpX = -sinA;
    const perpY = cosA;

    // Dual nozzles at offset -46 along ship axis, ±11 perpendicular
    const nozzle1X = x - 46 * cosA + 11 * perpX;
    const nozzle1Y = y - 46 * sinA + 11 * perpY;
    const nozzle2X = x - 46 * cosA - 11 * perpX;
    const nozzle2Y = y - 46 * sinA - 11 * perpY;

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

      const originX = (k % 2 === 0 ? nozzle1X : nozzle2X) + (pseudoRandom(prngSeedRef) - 0.5) * 3;
      const originY = (k % 2 === 0 ? nozzle1Y : nozzle2Y) + (pseudoRandom(prngSeedRef) - 0.5) * 3;

      particlesRef.current.push({
        x: originX,
        y: originY,
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

  /**
   * Renders the Orbital Magnetic Docking Pad Base Station at (padX, padY).
   */
  const drawDockingPad = (
    ctx: CanvasRenderingContext2D,
    padX: number,
    padY: number,
    isActive: boolean,
    isCrashed: boolean,
    isCashedOut: boolean,
  ) => {
    ctx.save();

    // Outer magnetic deck ring
    ctx.fillStyle = 'rgba(11, 14, 20, 0.75)';
    ctx.strokeStyle = isCrashed
      ? 'rgba(239, 68, 68, 0.5)'
      : isCashedOut
        ? 'rgba(16, 185, 129, 0.5)'
        : isActive
          ? 'rgba(212, 175, 55, 0.7)'
          : 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(padX, padY + 16, 38, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner magnetic coil ring
    ctx.strokeStyle = isActive
      ? isCrashed
        ? 'rgba(239, 68, 68, 0.7)'
        : isCashedOut
          ? 'rgba(16, 185, 129, 0.7)'
          : 'rgba(255, 215, 0, 0.6)'
      : 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(padX, padY + 16, 24, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Mag-Lev Stabilizer Anchors
    ctx.strokeStyle = isActive ? 'rgba(255, 215, 0, 0.4)' : 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padX - 38, padY + 16);
    ctx.lineTo(padX - 44, padY + 16);
    ctx.moveTo(padX + 38, padY + 16);
    ctx.lineTo(padX + 44, padY + 16);
    ctx.stroke();

    // Active Ion Projector Emitter Glow at center
    if (isActive) {
      const pulse = Math.sin(performance.now() * 0.008) * 0.2 + 0.8;
      const emitterGlow = ctx.createRadialGradient(padX, padY, 1, padX, padY, 16);
      if (isCrashed) {
        emitterGlow.addColorStop(0, `rgba(255, 100, 100, ${0.9 * pulse})`);
        emitterGlow.addColorStop(0.6, `rgba(239, 68, 68, ${0.35 * pulse})`);
      } else if (isCashedOut) {
        emitterGlow.addColorStop(0, `rgba(110, 231, 183, ${0.9 * pulse})`);
        emitterGlow.addColorStop(0.6, `rgba(16, 185, 129, ${0.35 * pulse})`);
      } else {
        emitterGlow.addColorStop(0, `rgba(255, 245, 192, ${0.95 * pulse})`);
        emitterGlow.addColorStop(0.6, `rgba(212, 175, 55, ${0.4 * pulse})`);
      }
      emitterGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = emitterGlow;
      ctx.beginPath();
      ctx.arc(padX, padY, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  /**
   * Renders the Standby Quantum Interceptor Spacecraft on pad.
   */
  const drawStandbyRocket = (
    ctx: CanvasRenderingContext2D,
    padX: number,
    padY: number,
    rocketImg: HTMLImageElement | null,
  ) => {
    ctx.save();
    ctx.translate(padX, padY);
    ctx.rotate(-Math.PI * 0.16); // Tilted ~29° pointing up-right ready for launch

    // Warm dual thruster standby idle glow
    const idlePulse = Math.sin(performance.now() * 0.005) * 0.2 + 0.5;
    const thrusterIdleGlow = ctx.createRadialGradient(-45, 0, 2, -45, 0, 36);
    thrusterIdleGlow.addColorStop(0, `rgba(255, 180, 50, ${0.55 * idlePulse})`);
    thrusterIdleGlow.addColorStop(0.5, `rgba(212, 175, 55, ${0.22 * idlePulse})`);
    thrusterIdleGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = thrusterIdleGlow;
    ctx.beginPath();
    ctx.arc(-45, 0, 36, 0, Math.PI * 2);
    ctx.fill();

    // Render Spacecraft Sprite
    if (rocketImg && rocketImg.complete) {
      ctx.drawImage(rocketImg, -48, -20, 96, 40);
    } else {
      ctx.fillStyle = '#14141a';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  /**
   * Renders the Airborne Quantum Interceptor Spacecraft with dual oscillating plasma thrusters.
   */
  const drawFlyingRocket = (
    ctx: CanvasRenderingContext2D,
    rocketX: number,
    rocketY: number,
    flightAngle: number,
    riskFactor: number,
    isCashedOut: boolean,
    rocketImg: HTMLImageElement | null,
  ) => {
    ctx.save();
    ctx.translate(rocketX, rocketY);
    ctx.rotate(flightAngle);

    // Radial thruster glow behind nozzle
    const thrusterGlow = ctx.createRadialGradient(-46, 0, 2, -46, 0, 50);
    thrusterGlow.addColorStop(
      0,
      isCashedOut ? 'rgba(74, 222, 128, 0.85)' : 'rgba(255, 215, 0, 0.9)',
    );
    thrusterGlow.addColorStop(0.5, 'rgba(255, 120, 0, 0.45)');
    thrusterGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = thrusterGlow;
    ctx.beginPath();
    ctx.arc(-46, 0, 50, 0, Math.PI * 2);
    ctx.fill();

    // Dual Dynamic Oscillating Plasma Jet Flames
    const flamePulse = Math.sin(performance.now() * 0.04) * 5;
    const flameLength = 26 + riskFactor * 28 + flamePulse;

    const nozzlesY = [-11, 11];
    for (const nY of nozzlesY) {
      // Outer Jet Plume (Orange / Gold / Emerald)
      ctx.fillStyle = isCashedOut ? '#10B981' : '#FF6B00';
      ctx.beginPath();
      ctx.moveTo(-46, nY - 4);
      ctx.lineTo(-46 - flameLength, nY);
      ctx.lineTo(-46, nY + 4);
      ctx.closePath();
      ctx.fill();

      // Inner Core Flame (Ultra-bright White / Yellow / Emerald Plasma)
      ctx.fillStyle = isCashedOut ? '#ECFDF5' : '#FFF5C0';
      ctx.beginPath();
      ctx.moveTo(-46, nY - 2);
      ctx.lineTo(-46 - flameLength * 0.65, nY);
      ctx.lineTo(-46, nY + 2);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Spacecraft Sprite
    if (rocketImg && rocketImg.complete) {
      ctx.drawImage(rocketImg, -50, -21, 100, 42);
    } else {
      ctx.fillStyle = '#14141a';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
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

    // 1. DYNAMIC ALTITUDE & ATMOSPHERIC TINT (Translucent so backdrop shines through)
    if (isCrashed) {
      // Atmospheric red flash
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.fillRect(0, 0, width, height);
    } else if (isCashedOut) {
      // Atmospheric emerald flash
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.fillRect(0, 0, width, height);
    } else if (isRunning && m > 8.0) {
      // Deep Space / High Altitude: subtle darkening to make golden flight curve and stars pop
      const darkAlpha = Math.min(0.4, (m - 8.0) * 0.015);
      ctx.fillStyle = `rgba(2, 4, 8, ${darkAlpha})`;
      ctx.fillRect(0, 0, width, height);
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

    // 2. Trajectory State & Anchored Launchpad Coordinates
    const { padX, padY, rocketX, rocketY, flightAngle, maxClimb } = getCrashTrajectoryState(
      width,
      height,
      m,
    );

    // 3. MILESTONE HORIZON LINES (Obsidian & Gold standard, stable altitude grid)
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    MILESTONE_VALUES.forEach((milestoneValue, index) => {
      const y = getCrashMilestoneY(milestoneValue, padY, maxClimb);
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

    // 4. STANDBY / PRE-LAUNCH STATE (Ship docked on pad)
    if (status === 'IDLE') {
      drawDockingPad(ctx, padX, padY, false, false, false);
      drawStandbyRocket(ctx, padX, padY, rocketImgRef.current);
      updateAndDrawParticles(ctx);
      ctx.restore();
      return;
    }

    // 5. ACTIVE ORBITAL DOCKING PAD BASE STATION
    drawDockingPad(ctx, padX, padY, true, isCrashed, isCashedOut);

    // Exponential flight path geometry helpers
    const CURVE_SAMPLES = 50;
    const getBeamPoint = (t: number) => {
      const px = padX + (rocketX - padX) * Math.pow(t, 1.15);
      const py = padY - (padY - rocketY) * Math.pow(t, 2.15);
      return { x: px, y: py };
    };

    // 6. HOLOGRAPHIC ALTITUDE DROPLINES & 3D GROUND RADAR BEACONS (Milestone L3)
    if (rocketX - padX > 25) {
      const waypoints = [0.28, 0.58, 0.82];
      waypoints.forEach((tWp) => {
        const wp = getBeamPoint(tWp);
        if (padY - wp.y < 10) return;

        ctx.save();
        // Fine dashed vertical dropline
        ctx.strokeStyle = isCrashed
          ? 'rgba(239, 68, 68, 0.22)'
          : isCashedOut
            ? 'rgba(16, 185, 129, 0.22)'
            : 'rgba(212, 175, 55, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(wp.x, wp.y);
        ctx.lineTo(wp.x, padY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3D perspective ground beacon ellipse
        ctx.strokeStyle = isCrashed
          ? 'rgba(239, 68, 68, 0.4)'
          : isCashedOut
            ? 'rgba(16, 185, 129, 0.4)'
            : 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(wp.x, padY, 12, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Center beacon radar ping
        ctx.fillStyle = isCrashed ? '#EF4444' : isCashedOut ? '#10B981' : '#FFD700';
        ctx.beginPath();
        ctx.arc(wp.x, padY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Curve anchor tick
        ctx.fillStyle = isCrashed ? '#FCA5A5' : isCashedOut ? '#6EE7B7' : '#FFE082';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Dynamic live dropline directly below rocket
      if (padY - rocketY > 12) {
        ctx.save();
        ctx.strokeStyle = isCrashed
          ? 'rgba(239, 68, 68, 0.35)'
          : isCashedOut
            ? 'rgba(16, 185, 129, 0.35)'
            : 'rgba(212, 175, 55, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(rocketX, rocketY + 8);
        ctx.lineTo(rocketX, padY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dynamic radar sweep circle on ground
        const radarPulse = Math.sin(performance.now() * 0.006) * 2 + 12;
        ctx.strokeStyle = isCrashed
          ? 'rgba(239, 68, 68, 0.65)'
          : isCashedOut
            ? 'rgba(16, 185, 129, 0.65)'
            : 'rgba(255, 215, 0, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(rocketX, padY, radarPulse, radarPulse * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Telemetry Altitude Tag
        ctx.font = '600 9px monospace';
        ctx.fillStyle = isCrashed ? '#EF4444' : isCashedOut ? '#10B981' : 'rgba(212, 175, 55, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(`ALT ${Math.round((padY - rocketY) * 1.5)}M`, rocketX, padY + 14);
        ctx.restore();
      }
    }

    // 7. QUANTUM ION BEAM MULTI-PASS RENDERING (Milestone L1)
    if (rocketX - padX > 4) {
      const curveGradient = ctx.createLinearGradient(padX, padY, rocketX, rocketY);
      const coreBeamGradient = ctx.createLinearGradient(padX, padY, rocketX, rocketY);
      if (isCrashed) {
        curveGradient.addColorStop(0, 'rgba(127, 29, 29, 0.4)');
        curveGradient.addColorStop(0.6, '#EF4444');
        curveGradient.addColorStop(1, '#FCA5A5');

        coreBeamGradient.addColorStop(0, '#7F1D1D');
        coreBeamGradient.addColorStop(1, '#FFFFFF');
      } else if (isCashedOut) {
        curveGradient.addColorStop(0, 'rgba(6, 95, 70, 0.4)');
        curveGradient.addColorStop(0.6, '#10B981');
        curveGradient.addColorStop(1, '#6EE7B7');

        coreBeamGradient.addColorStop(0, '#065F46');
        coreBeamGradient.addColorStop(1, '#ECFDF5');
      } else {
        curveGradient.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
        curveGradient.addColorStop(0.5, '#D4AF37');
        curveGradient.addColorStop(1, '#FFE082');

        coreBeamGradient.addColorStop(0, '#B8860B');
        coreBeamGradient.addColorStop(0.7, '#FFF5C0');
        coreBeamGradient.addColorStop(1, '#FFFFFF');
      }

      const traceBeamPath = () => {
        ctx.moveTo(padX, padY);
        for (let i = 1; i <= CURVE_SAMPLES; i++) {
          const pt = getBeamPoint(i / CURVE_SAMPLES);
          if (isCrashed) {
            const jitter = (pseudoRandom(prngSeedRef) - 0.5) * 2;
            ctx.lineTo(pt.x, pt.y + jitter);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      };

      // Pass 1: Curved Atmospheric Mist Area Fill
      ctx.beginPath();
      ctx.moveTo(padX, padY);
      for (let i = 1; i <= CURVE_SAMPLES; i++) {
        const pt = getBeamPoint(i / CURVE_SAMPLES);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineTo(rocketX, padY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, rocketY, 0, padY);
      if (isCrashed) {
        areaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
        areaGrad.addColorStop(1, 'transparent');
      } else if (isCashedOut) {
        areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        areaGrad.addColorStop(1, 'transparent');
      } else {
        areaGrad.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
        areaGrad.addColorStop(0.6, 'rgba(212, 175, 55, 0.03)');
        areaGrad.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Pass 2: Outer Plasma Aura Glow Layer
      ctx.save();
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 24;
      ctx.shadowColor = isCrashed
        ? 'rgba(239, 68, 68, 0.85)'
        : isCashedOut
          ? 'rgba(16, 185, 129, 0.85)'
          : 'rgba(212, 175, 55, 0.85)';
      ctx.strokeStyle = curveGradient;
      ctx.beginPath();
      traceBeamPath();
      ctx.stroke();
      ctx.restore();

      // Pass 3: Middle Luminous Ribbon Layer
      ctx.save();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = isCrashed ? '#EF4444' : isCashedOut ? '#10B981' : '#FFD700';
      ctx.strokeStyle = curveGradient;
      ctx.beginPath();
      traceBeamPath();
      ctx.stroke();
      ctx.restore();

      // Pass 4: Ultra-Sharp Core Filament
      ctx.save();
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 4;
      ctx.shadowColor = isCrashed ? '#FFFFFF' : isCashedOut ? '#ECFDF5' : '#FFFDF0';
      ctx.strokeStyle = coreBeamGradient;
      ctx.beginPath();
      traceBeamPath();
      ctx.stroke();
      ctx.restore();

      // 8. KINETIC PHOTONIC PULSES (Traveling Laser Packets) (Milestone L2)
      if (isRunning && rocketX - padX > 25) {
        const pulseCount = 5;
        const pulseSpeed = 0.0006 + riskFactor * 0.0006;
        const now = performance.now();

        for (let k = 0; k < pulseCount; k++) {
          const tPulse = (now * pulseSpeed + k / pulseCount) % 1.0;
          const pos = getBeamPoint(tPulse);
          const prevPos = getBeamPoint(Math.max(0, tPulse - 0.04));

          // Trailing energy tail
          const tailGrad = ctx.createLinearGradient(prevPos.x, prevPos.y, pos.x, pos.y);
          tailGrad.addColorStop(0, 'transparent');
          tailGrad.addColorStop(1, 'rgba(255, 235, 150, 0.7)');

          ctx.save();
          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(prevPos.x, prevPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();

          // Luminous pulse core
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Outer ion ring
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 9. QUANTUM INTERCEPTOR SPACECRAFT & DUAL ION EXHAUST
    if (isRunning || isCashedOut) {
      if (isRunning && rocketX - padX > 10) {
        createTail(rocketX, rocketY, flightAngle, riskFactor);
      }

      drawFlyingRocket(
        ctx,
        rocketX,
        rocketY,
        flightAngle,
        riskFactor,
        isCashedOut,
        rocketImgRef.current,
      );
    }

    updateAndDrawParticles(ctx);
    ctx.restore();
    // Refs are stable across renders and are intentionally omitted — matching the original
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
                const { rocketX, rocketY } = getCrashTrajectoryState(width, height, next);
                createExplosion(rocketX, rocketY);
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
