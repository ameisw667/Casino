'use client';
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  speed: number;
}

interface LobbyAmbientBackgroundProps {
  /** Mouse-following radial-gradient "spotlight" layer + cursor particle repulsion. Default true (homepage behavior unchanged). */
  showSpotlight?: boolean;
}

export function LobbyAmbientBackground({ showSpotlight = true }: LobbyAmbientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Mobile/strong-reduction gate: the ambient gold-dust canvas + global
    // mousemove listener are pure overhead on touch devices (no mouse ever
    // fires). Stop the whole effect — no rAF loop, no listeners — on mobile.
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    // Mouse coordinates tracking with lerp for smooth motion
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;

      // Update CSS variables for CSS-based spotlight / liquid glass refraction
      container.style.setProperty('--mouse-x', `${mouse.targetX}px`);
      container.style.setProperty('--mouse-y', `${mouse.targetY}px`);
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    if (showSpotlight) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle initialization (Gold dust)
    const particleCount = prefersReducedMotion ? 15 : 40;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const maxAlpha = Math.random() * 0.4 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1, // Float upward gently
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * maxAlpha,
        maxAlpha,
        speed: Math.random() * 0.01 + 0.005,
      });
    }

    // Animation Loop
    const render = () => {
      // Lerp mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Draw Gold Dust Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Pulse opacity
          p.alpha += p.speed;
          if (p.alpha > p.maxAlpha || p.alpha < 0.05) {
            p.speed = -p.speed;
          }

          // Gentle repulsion from cursor
          if (mouse.isHovered) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140 && dist > 0) {
              const force = (140 - dist) / 140;
              p.x += (dx / dist) * force * 1.2;
              p.y += (dy / dist) * force * 1.2;
            }
          }

          // Wrap boundaries
          if (p.y < -10) p.y = height + 10;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        ctx.fill();
      }

      // Reset shadow blur for next frame
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showSpotlight]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* 1. Dynamic Liquid Glasswater Spotlight Layer */}
      {showSpotlight && (
        <div
          className="liquid-spotlight-layer"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(
                650px circle at var(--mouse-x, 50%) var(--mouse-y, 300px),
                hsla(45, 100%, 50%, 0.08) 0%,
                hsla(280, 80%, 40%, 0.04) 40%,
                transparent 75%
              )
            `,
            transition: 'background 0.05s ease-out',
          }}
        />
      )}

      {/* 2. Ambient Gold Dust Particle Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* 3. Subtle Noise Texture Overlay (Banding Prevention) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
