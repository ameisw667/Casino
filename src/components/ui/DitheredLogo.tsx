'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

interface DitheredLogoProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}

interface LogoParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

const GOLD_PALETTE = [
  '#D4AF37', // 24k classic gold
  '#F3E88A', // Brilliant highlight gold
  '#E6CA65', // Champagne gold
  '#AA8022', // Deep metallic gold
];

export function DitheredLogo({
  src = '/images/brand-ace-icon.png',
  alt = 'Casino Royale Emblem',
  size = 40,
  className = '',
}: DitheredLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const particlesRef = useRef<LogoParticle[]>([]);
  const animIdRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const isSleepingRef = useRef(false);

  const loopRef = useRef<() => void>(() => {});

  useEffect(() => {
    loopRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let maxVelocity = 0;
      const particles = particlesRef.current;
      const springK = 0.08;
      const damping = 0.82;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Spring force towards origin
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        const ax = dx * springK;
        const ay = dy * springK;

        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;

        p.x += p.vx;
        p.y += p.vy;

        const v = Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(dx) + Math.abs(dy);
        if (v > maxVelocity) maxVelocity = v;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.globalAlpha = 1.0;

      // Auto-sleep when settled
      if (maxVelocity < 0.05 && !isHoveredRef.current) {
        isSleepingRef.current = true;
        animIdRef.current = null;
        return;
      }

      animIdRef.current = requestAnimationFrame(() => {
        loopRef.current();
      });
    };
  }, []);

  // Trigger dispersion on hover
  const disperse = useCallback(() => {
    isHoveredRef.current = true;
    isSleepingRef.current = false;

    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const angle = Math.random() * Math.PI * 2;
      const force = 1.2 + Math.random() * 2.8;
      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;
    }

    if (!animIdRef.current) {
      loopRef.current();
    }
  }, []);

  const assemble = useCallback(() => {
    isHoveredRef.current = false;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = size * dpr;
      const height = size * dpr;
      canvas.width = width;
      canvas.height = height;

      // Draw image to offscreen canvas to sample pixel alpha
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, width, height);
      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const newParticles: LogoParticle[] = [];
      const step = 2 * dpr; // sample density

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const alpha = data[idx + 3];

          if (alpha > 45) {
            const colorIdx = Math.floor(Math.random() * GOLD_PALETTE.length);
            newParticles.push({
              x,
              y,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size: 1.5 * dpr,
              color: GOLD_PALETTE[colorIdx],
              alpha: Math.min(alpha / 255, 1.0),
            });
          }
        }
      }

      particlesRef.current = newParticles;
      setIsLoaded(true);

      // Initial render frame
      ctx.clearRect(0, 0, width, height);
      for (const p of newParticles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;
    };

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [src, size]);

  return (
    <div
      onMouseEnter={disperse}
      onMouseLeave={assemble}
      style={{
        width: size,
        height: size,
        position: 'relative',
        cursor: 'pointer',
      }}
      className={`relative inline-block ${className}`}
    >
      {/* Underlying fallback image until canvas samples, or for reduced motion */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size * 2}px`}
        style={{
          objectFit: 'contain',
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
        priority
      />

      {/* Dithered Particle Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: size,
          height: size,
          pointerEvents: 'none',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  );
}
