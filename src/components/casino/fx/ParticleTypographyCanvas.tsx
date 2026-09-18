'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  shimmerSpeed: number;
  shimmerPhase: number;
  isSparkle: boolean;
}

const GOLD_PALETTE = [
  '#D4AF37', // 24k Gold
  '#F5D77F', // Liquid Gold Highlight
  '#FFF7D6', // Champagne Gold
  '#FFFFFF', // Diamond &sparkle
  '#E6B800', // Deep Gold
  '#C59B27', // Antique Gold
];

export interface ParticleTypographyCanvasProps {
  isMobile?: boolean;
  className?: string;
}

export function ParticleTypographyCanvas({
  isMobile = false,
  className = '',
}: ParticleTypographyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let mouseX = -9999;
    let mouseY = -9999;
    let isHovering = false;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = true;
    };

    const onPointerLeave = () => {
      isHovering = false;
      mouseX = -9999;
      mouseY = -9999;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const count = isMobile ? 360 : 800;
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const dist = 30 + Math.random() * Math.max(width, height) * 0.45;
      const initialX = centerX + Math.cos(angle) * (20 + Math.random() * 60);
      const initialY = centerY + Math.sin(angle) * (20 + Math.random() * 60);

      particles.push({
        x: initialX,
        y: initialY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4) - 1.2,
        originX: centerX + Math.cos(angle) * dist,
        originY: centerY + Math.sin(angle) * dist,
        size: Math.random() < 0.12 ? 3 + Math.random() * 2.2 : 1 + Math.random() * 2,
        color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        alpha: 0.2 + Math.random() * 0.8,
        baseAlpha: 0.35 + Math.random() * 0.6,
        shimmerSpeed: 1.5 + Math.random() * 3,
        shimmerPhase: Math.random() * Math.PI * 2,
        isSparkle: Math.random() < 0.15,
      });
    }

    const repelRadius = isMobile ? 90 : 140;
    const repelRadiusSq = repelRadius * repelRadius;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (isHovering) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < repelRadiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / repelRadius) * 4.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vy -= 0.035;

        p.x += p.vx + Math.sin(time + p.shimmerPhase) * 0.4;
        p.y += p.vy + Math.cos(time * 0.8 + p.shimmerPhase) * 0.3;

        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.vy = -Math.random() * 2;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        const shimmer = Math.sin(time * p.shimmerSpeed + p.shimmerPhase);
        const currentAlpha = Math.max(0.1, Math.min(1, p.baseAlpha + shimmer * 0.35));

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        if (p.isSparkle) {
          const s = p.size * (1 + shimmer * 0.3);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s * 1.5);
          ctx.lineTo(p.x + s * 0.5, p.y);
          ctx.lineTo(p.x, p.y + s * 1.5);
          ctx.lineTo(p.x - s * 0.5, p.y);
          ctx.closePath();
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          if (p.size > 2.2) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
          }
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [isMobile]);


  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
