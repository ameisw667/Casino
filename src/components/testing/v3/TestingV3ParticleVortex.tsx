'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  angle: number;
  distFromCenter: number;
  speed: number;
  depth: number;
}

interface TestingV3ParticleVortexProps {
  progressRef: React.RefObject<number>;
  mouseXRef: React.RefObject<number>;
  mouseYRef: React.RefObject<number>;
}

const GOLD_PALETTE = [
  '#FFDF73', // Bright Starlight Gold
  '#D4AF37', // 24k Pure Gold
  '#F59E0B', // Amber Flame
  '#FFEAA7', // Champagne Sparkle
  '#FFFFFF', // Starlight White
];

export function TestingV3ParticleVortex({
  progressRef,
  mouseXRef,
  mouseYRef,
}: TestingV3ParticleVortexProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = 180;
    const particles: Particle[] = [];

    const initParticles = () => {
      particles.length = 0;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Distribute uniformly across radius
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * (Math.max(width, height) * 0.65);
        const depth = 0.3 + Math.random() * 1.5; // Depth multiplier
        const baseRadius = (0.8 + Math.random() * 2.2) * depth;

        particles.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          originX: cx + Math.cos(angle) * dist,
          originY: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: baseRadius,
          baseRadius,
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
          alpha: 0.2 + Math.random() * 0.7,
          baseAlpha: 0.2 + Math.random() * 0.7,
          angle,
          distFromCenter: dist,
          speed: 0.002 + Math.random() * 0.008,
          depth,
        });
      }
    };

    initParticles();

    // Render loop driven by progressRef and spring physics
    const render = () => {
      const p = progressRef.current ?? 0;
      const mx = (mouseXRef.current ?? 0) * 40;
      const my = (mouseYRef.current ?? 0) * 40;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + mx * 0.2;
      const cy = height / 2 + my * 0.2;

      // Phase 1 (0.0 - 0.35): Ambient Drifting Gold Dust
      // Phase 2 (0.35 - 0.75): Gravitational Inward Spiral Vortex
      // Phase 3 (0.75 - 1.00): Supernova Corona Expansion Burst

      const isSpiral = p >= 0.35 && p < 0.75;
      const spiralProgress = isSpiral ? (p - 0.35) / 0.4 : p >= 0.75 ? 1 : 0;
      const isBurst = p >= 0.75;
      const burstProgress = isBurst ? (p - 0.75) / 0.25 : 0;

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        if (isBurst) {
          // Phase 3: Blast outward rapidly with golden corona flash
          const burstDist = pt.distFromCenter + burstProgress * (Math.max(width, height) * 0.9);
          pt.angle += (pt.speed * 4) / pt.depth;
          pt.x = cx + Math.cos(pt.angle) * burstDist;
          pt.y = cy + Math.sin(pt.angle) * burstDist;
          pt.radius = pt.baseRadius * (1 + burstProgress * 2.5);
          pt.alpha = pt.baseAlpha * Math.max(0, 1 - burstProgress * 0.85);
        } else if (isSpiral) {
          // Phase 2: Inward spiral suction towards singularity core
          const suctionDist = Math.max(15, pt.distFromCenter * (1 - spiralProgress * 0.85));
          const angularAcc = 1 + spiralProgress * 6.5; // Accelerate rotation speed
          pt.angle += pt.speed * angularAcc;
          pt.x = cx + Math.cos(pt.angle) * suctionDist;
          pt.y = cy + Math.sin(pt.angle) * suctionDist;
          pt.radius = pt.baseRadius * (1 + spiralProgress * 0.6);
          pt.alpha = Math.min(1, pt.baseAlpha * (1 + spiralProgress * 0.8));
        } else {
          // Phase 1: Ambient float responding smoothly to cursor tilt
          pt.x += pt.vx + mx * 0.05 * pt.depth;
          pt.y += pt.vy + my * 0.05 * pt.depth;
          pt.angle += pt.speed * 0.5;

          // Gentle bounds bounce
          if (pt.x < -50) pt.x = width + 50;
          if (pt.x > width + 50) pt.x = -50;
          if (pt.y < -50) pt.y = height + 50;
          if (pt.y > height + 50) pt.y = -50;

          pt.radius = pt.baseRadius;
          pt.alpha = pt.baseAlpha;
        }

        // Render individual glowing particle with soft radial bloom
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = pt.radius * 6;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [progressRef, mouseXRef, mouseYRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
}
