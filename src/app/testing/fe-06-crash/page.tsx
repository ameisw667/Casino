'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxHeader } from './parts/SandboxHeader';
import { FlightTopRow } from './parts/FlightTopRow';
import { FlightStageFrame } from './parts/FlightStageFrame';
import { AltimeterScale } from './parts/AltimeterScale';
import { MultiplierDisplay } from './parts/MultiplierDisplay';
import { CockpitControls } from './parts/CockpitControls';
import type {
  CrashHistoryItem,
  SparkParticle,
  ShardParticle,
  FlightState,
} from './parts/crash-sandbox-types';

export default function FE06CrashTestingSandbox() {
  const [flightState, setFlightState] = useState<FlightState>('IDLE');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [betAmount, setBetAmount] = useState(10.0);
  const [autoCashout, setAutoCashout] = useState<number | null>(2.0);
  const [cashoutGain, setCashoutGain] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState(3.45);
  const [winStreak, setWinStreak] = useState(3);
  const [history, setHistory] = useState<CrashHistoryItem[]>([
    { id: '1', multiplier: 2.14, cashedOutAt: 1.85, win: true },
    { id: '2', multiplier: 1.12, win: false },
    { id: '3', multiplier: 5.6, cashedOutAt: 4.5, win: true },
    { id: '4', multiplier: 12.8, cashedOutAt: 10.0, win: true },
    { id: '5', multiplier: 1.45, win: false },
    { id: '6', multiplier: 3.2, cashedOutAt: 2.0, win: true },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<SparkParticle[]>([]);
  const explosionParticlesRef = useRef<SparkParticle[]>([]);
  const shardsRef = useRef<ShardParticle[]>([]);
  const shockwaveRef = useRef<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    opacity: number;
  } | null>(null);
  const crashPosRef = useRef<{ x: number; y: number; angle: number } | null>(null);
  const cashoutPosRef = useRef<{ x: number; y: number; angle: number; time: number } | null>(null);
  const [shake, setShake] = useState(false);

  // Trigger Spectacular Supernova Crash & Jet Fragmentation ONCE
  const triggerCrashExplosion = useCallback((x: number, y: number) => {
    setShake(true);
    setTimeout(() => setShake(false), 450);

    // 1. Expanding Shockwave
    shockwaveRef.current = { x, y, radius: 8, maxRadius: 160, opacity: 1.0 };

    // 2. Hull Shards of the Jet
    const shards: ShardParticle[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 5.0 + 2.5;
      shards.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 6 + 4,
        life: 1.0,
      });
    }
    shardsRef.current = shards;

    // 3. 75 Fiery Supernova Plasma & Gold Sparks
    const newSparks: SparkParticle[] = [];
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#EF4444', '#FFFDF0', '#FF6B00'];
    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7.5 + 2.0;
      newSparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4.5 + 2.0,
      });
    }
    explosionParticlesRef.current = newSparks;
  }, []);

  // Launch Flight Simulation
  const handleLaunchFlight = useCallback(
    (targetCrash?: number) => {
      if (flightState === 'FLYING') return;

      soundManager.play('chip');
      const finalCrash =
        targetCrash ??
        (Math.random() < 0.35 ? 1.08 + Math.random() * 0.8 : 1.9 + Math.random() * 7.5);
      setCrashPoint(parseFloat(finalCrash.toFixed(2)));
      setFlightState('FLYING');
      setCurrentMultiplier(1.0);
      setCashoutGain(null);
      crashPosRef.current = null;
      cashoutPosRef.current = null;
      setShake(false);
      startTimeRef.current = performance.now();
      particlesRef.current = [];
      explosionParticlesRef.current = [];
      shardsRef.current = [];
      shockwaveRef.current = null;
    },
    [flightState],
  );

  // Cashout Execution
  const handleCashout = useCallback(() => {
    if (flightState !== 'FLYING') return;
    const gain = betAmount * currentMultiplier;
    setCashoutGain(gain);
    setFlightState('CASHED_OUT');
    soundManager.play('win');
    setWinStreak((prev) => prev + 1);

    setHistory((prev) => [
      {
        id: crypto.randomUUID(),
        multiplier: currentMultiplier,
        cashedOutAt: currentMultiplier,
        win: true,
      },
      ...prev.slice(0, 11),
    ]);
  }, [flightState, betAmount, currentMultiplier]);

  // Main Canvas & Flight Loop
  useEffect(() => {
    if (flightState !== 'FLYING' && flightState !== 'CASHED_OUT' && flightState !== 'CRASHED')
      return;

    let active = true;

    const animate = (time: number) => {
      if (!active) return;
      const elapsed = (time - startTimeRef.current) / 1000;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const startX = 65;
      const startY = height - 55;

      // 1. Calculate live progression or freeze at crash
      let currentX = 0;
      let currentY = 0;
      let angle = 0;
      let mult = currentMultiplier;

      if (flightState === 'FLYING') {
        mult = Math.max(1.0, 1.0 + Math.pow(elapsed * 0.45, 2.3) + elapsed * 0.18);
        setCurrentMultiplier(parseFloat(mult.toFixed(2)));

        const progress = Math.min(1.0, elapsed / 8.5);
        currentX = startX + (width - 170) * Math.pow(progress, 0.82);
        currentY = startY - (height - 130) * Math.pow(progress, 1.35);
        angle = Math.atan2(currentY - startY, currentX - startX) * 0.65;

        // Auto Cashout check
        if (autoCashout && mult >= autoCashout) {
          cashoutPosRef.current = { x: currentX, y: currentY, angle, time: elapsed };
          handleCashout();
        }

        // Crash Point check -> EXACT LOCK
        if (mult >= crashPoint) {
          crashPosRef.current = { x: currentX, y: currentY, angle };
          setFlightState('CRASHED');
          setWinStreak(0);
          soundManager.play('crash-launch');
          triggerCrashExplosion(currentX, currentY);
          setHistory((prev) => [
            {
              id: crypto.randomUUID(),
              multiplier: crashPoint,
              win: false,
            },
            ...prev.slice(0, 11),
          ]);
        }
      } else if (flightState === 'CRASHED' && crashPosRef.current) {
        // Locked strictly at crash coordinates
        currentX = crashPosRef.current.x;
        currentY = crashPosRef.current.y;
        angle = crashPosRef.current.angle;
      } else if (flightState === 'CASHED_OUT') {
        const progress = Math.min(1.0, elapsed / 8.5);
        const postCashoutTime = elapsed - (cashoutPosRef.current?.time ?? elapsed);
        currentX = startX + (width - 170) * Math.pow(progress, 0.82) + postCashoutTime * 95;
        currentY = startY - (height - 130) * Math.pow(progress, 1.35) - postCashoutTime * 45;
        angle = Math.atan2(currentY - startY, currentX - startX) * 0.65;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 2. Spawn Jet Exhaust Particles ONLY while actively flying or boosting
      if (flightState === 'FLYING' || flightState === 'CASHED_OUT') {
        particlesRef.current.push({
          x: currentX - Math.cos(angle) * 16,
          y: currentY - Math.sin(angle) * 16,
          vx: -Math.cos(angle) * 2.5 + (Math.random() - 0.5) * 1.5,
          vy: -Math.sin(angle) * 2.5 + (Math.random() - 0.5) * 1.5,
          life: 1.0,
          maxLife: 1.0,
          color: mult >= 5.0 ? '#FFFDF0' : mult >= 2.0 ? '#FFD700' : '#F59E0B',
          size: Math.random() * 3.5 + 1.5,
        });

        // Wingtip Vortices ab 2x
        if (mult >= 2.0 && Math.random() < 0.7) {
          const wingSpan = 18;
          const wx1 = currentX + Math.sin(angle) * wingSpan - Math.cos(angle) * 8;
          const wy1 = currentY - Math.cos(angle) * wingSpan - Math.sin(angle) * 8;
          const wx2 = currentX - Math.sin(angle) * wingSpan - Math.cos(angle) * 8;
          const wy2 = currentY + Math.cos(angle) * wingSpan - Math.sin(angle) * 8;

          particlesRef.current.push(
            {
              x: wx1,
              y: wy1,
              vx: -1.2,
              vy: 0.2,
              life: 0.6,
              maxLife: 0.6,
              color: 'rgba(255, 255, 255, 0.4)',
              size: 1.2,
            },
            {
              x: wx2,
              y: wy2,
              vx: -1.2,
              vy: 0.2,
              life: 0.6,
              maxLife: 0.6,
              color: 'rgba(255, 255, 255, 0.4)',
              size: 1.2,
            },
          );
        }
      }

      // Update & Draw Exhaust Trail
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.85;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 3. Draw Parabola Flight Curve in 24k Gold (STOPPED at currentX / currentY)
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (currentX - startX) * 0.4, startY, currentX, currentY);
      ctx.lineWidth = 4;
      ctx.strokeStyle =
        flightState === 'CRASHED'
          ? 'rgba(239, 68, 68, 0.45)'
          : flightState === 'CASHED_OUT'
            ? 'rgba(16, 185, 129, 0.85)'
            : 'rgba(212, 175, 55, 0.85)';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 4. Draw Pure Vector Supersonic Gold Stealth Jet
      if (flightState === 'FLYING' || flightState === 'CASHED_OUT') {
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(angle);

        // Sonic Boom Aura (ab 5x Multiplikator)
        if (mult >= 5.0) {
          ctx.beginPath();
          ctx.arc(4, 0, 26, -Math.PI / 2, Math.PI / 2);
          ctx.strokeStyle = 'rgba(255, 253, 240, 0.5)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Dynamic Plasma Thruster Flame
        const thrusterFlicker = 0.85 + Math.random() * 0.35;
        const thrusterLength = (mult >= 5.0 ? 32 : 22) * thrusterFlicker;
        const gradThruster = ctx.createLinearGradient(-14, 0, -14 - thrusterLength, 0);
        gradThruster.addColorStop(0, '#FFFFFF');
        gradThruster.addColorStop(0.2, '#60A5FA');
        gradThruster.addColorStop(0.6, '#D4AF37');
        gradThruster.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(-14, -3.5);
        ctx.lineTo(-14 - thrusterLength, 0);
        ctx.lineTo(-14, 3.5);
        ctx.closePath();
        ctx.fillStyle = gradThruster;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Main Stealth Jet Fuselage (Matte Obsidian & 24k Gold Inlays)
        ctx.beginPath();
        ctx.moveTo(22, 0); // Nose
        ctx.lineTo(8, -5);
        ctx.lineTo(-10, -20); // Left Wing
        ctx.lineTo(-12, -7);
        ctx.lineTo(-16, -11); // Left Tail
        ctx.lineTo(-17, 0); // Exhaust
        ctx.lineTo(-16, 11); // Right Tail
        ctx.lineTo(-12, 7);
        ctx.lineTo(-10, 20); // Right Wing
        ctx.lineTo(8, 5);
        ctx.closePath();

        ctx.fillStyle = '#0B0F17';
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#D4AF37';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Gold Inlay Panel Lines
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -12);
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, 12);
        ctx.moveTo(0, 0);
        ctx.lineTo(-14, 0);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.stroke();

        // Cockpit Canopy (Pearl Glass Reflection)
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(5, -3);
        ctx.lineTo(-1, 0);
        ctx.lineTo(5, 3);
        ctx.closePath();
        ctx.fillStyle = 'rgba(235, 245, 255, 0.9)';
        ctx.shadowColor = '#FFF';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Wingtip Strobes
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(-10, -20, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(-10, 20, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (flightState === 'CRASHED') {
        // 5. Draw Expanding Shockwave Ring (Plays Once)
        if (shockwaveRef.current && shockwaveRef.current.opacity > 0) {
          const sw = shockwaveRef.current;
          sw.radius += 4.2;
          sw.opacity -= 0.024;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, sw.opacity * 0.85)})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw & Update Hull Shards
        for (let i = shardsRef.current.length - 1; i >= 0; i--) {
          const s = shardsRef.current[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.1;
          s.rot += s.vRot;
          s.life -= 0.02;
          if (s.life <= 0) {
            shardsRef.current.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);
          ctx.beginPath();
          ctx.moveTo(s.size, 0);
          ctx.lineTo(-s.size, -s.size / 2);
          ctx.lineTo(-s.size / 2, s.size / 2);
          ctx.closePath();
          ctx.fillStyle = '#0B0F17';
          ctx.fill();
          ctx.strokeStyle = `rgba(212, 175, 55, ${s.life})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }

        // Draw & Update Supernova Sparks
        for (let i = explosionParticlesRef.current.length - 1; i >= 0; i--) {
          const ep = explosionParticlesRef.current[i];
          ep.x += ep.vx;
          ep.y += ep.vy;
          ep.vy += 0.08;
          ep.life -= 0.02;
          if (ep.life <= 0) {
            explosionParticlesRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.size * ep.life, 0, Math.PI * 2);
          ctx.fillStyle = ep.color;
          ctx.shadowColor = ep.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = ep.life;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    flightState,
    crashPoint,
    autoCashout,
    handleCashout,
    currentMultiplier,
    triggerCrashExplosion,
  ]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090E',
        color: '#FFFDF0',
        padding: '32px 24px 64px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1140px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header & Sandbox Actions */}
        <SandboxHeader flightState={flightState} onLaunch={handleLaunchFlight} />

        {/* ── THE CRASH STAGE ARENA ── */}
        <FlightStageFrame
          shake={shake}
          flightState={flightState}
          currentMultiplier={currentMultiplier}
        >
          {/* ── TOP HEADER: SUBTLE STREAK & FLIGHT HISTORY ── */}
          <FlightTopRow winStreak={winStreak} history={history} />

          {/* ── CENTRAL STAGE: CANVAS + ALTIMETER + MULTIPLIER ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Left Brass Altimeter Scale */}
            <AltimeterScale currentMultiplier={currentMultiplier} />

            {/* The Live Flight Canvas */}
            <canvas
              ref={canvasRef}
              width={1000}
              height={340}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
              }}
            />

            {/* Big Floating Multiplier Display & Supernova Impact */}
            <MultiplierDisplay
              flightState={flightState}
              currentMultiplier={currentMultiplier}
              crashPoint={crashPoint}
              cashoutGain={cashoutGain}
            />
          </div>

          {/* ── BOTTOM COCKPIT / CASHOUT CONTROLS ── */}
          <CockpitControls
            flightState={flightState}
            betAmount={betAmount}
            currentMultiplier={currentMultiplier}
            onBetAmountChange={setBetAmount}
            autoCashout={autoCashout}
            onAutoCashoutChange={setAutoCashout}
            onCashout={handleCashout}
            onLaunch={() => handleLaunchFlight()}
          />
        </FlightStageFrame>
      </div>
    </div>
  );
}
