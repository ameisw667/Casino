'use client';
import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const WebGlWaterRefractionCanvas = dynamic(
  () =>
    import('@/components/home/WebGlWaterRefractionCanvas').then(
      (m) => m.WebGlWaterRefractionCanvas,
    ),
  { ssr: false },
);

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

interface TrailSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

interface LobbyAmbientBackgroundProps {
  /** Mouse-following radial-gradient "spotlight" layer + cursor particle repulsion. Default true (homepage behavior unchanged). */
  showSpotlight?: boolean;
}

export function LobbyAmbientBackground({ showSpotlight = true }: LobbyAmbientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const webGlWrapperRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
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
      prevX: width / 2,
      prevY: height / 2,
      isHovered: false,
    };

    // Scroll parallax tracking
    let targetScrollY = window.scrollY || 0;
    let smoothScrollY = targetScrollY;

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Option 3: Cursor-Glow-Trail sparks pool
    const trailSparks: TrailSpark[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;

      // Emit subtle golden comet sparks on mouse movement
      const moveDistSq =
        (mouse.targetX - mouse.prevX) * (mouse.targetX - mouse.prevX) +
        (mouse.targetY - mouse.prevY) * (mouse.targetY - mouse.prevY);

      if (moveDistSq > 16 && trailSparks.length < 24) {
        trailSparks.push({
          x: mouse.targetX + (Math.random() - 0.5) * 6,
          y: mouse.targetY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.2,
          size: Math.random() * 2 + 1.2,
          alpha: 0.65,
          decay: Math.random() * 0.025 + 0.025,
        });
        mouse.prevX = mouse.targetX;
        mouse.prevY = mouse.targetY;
      }

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
    const particleCount = prefersReducedMotion ? 15 : 35;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const maxAlpha = Math.random() * 0.35 + 0.12;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.3 - 0.08, // Float upward gently
        size: Math.random() * 2.2 + 1,
        alpha: Math.random() * maxAlpha,
        maxAlpha,
        speed: Math.random() * 0.008 + 0.004,
      });
    }

    // Option 4: Reactive Game-Hover Spotlight Color Lerp
    let currentR = 212;
    let currentG = 175;
    let currentB = 55;

    // Animation Loop
    const render = () => {
      // Option 2: Multi-Layer Parallax Lerp
      if (!prefersReducedMotion) {
        smoothScrollY += (targetScrollY - smoothScrollY) * 0.08;
        if (webGlWrapperRef.current) {
          webGlWrapperRef.current.style.transform = `translateY(${-smoothScrollY * 0.06}px) scale(1.03)`;
        }
        if (canvasWrapperRef.current) {
          canvasWrapperRef.current.style.transform = `translateY(${-smoothScrollY * 0.18}px)`;
        }
      }

      // Lerp mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Option 4: Check hover accent and lerp spotlight RGB
      let targetR = 212;
      let targetG = 175;
      let targetB = 55;

      const hoverAccent = document.documentElement.style.getPropertyValue('--lobby-hover-accent');
      if (hoverAccent) {
        if (hoverAccent.includes('#FF5722') || hoverAccent.includes('255, 87, 34')) {
          targetR = 255;
          targetG = 110;
          targetB = 40;
        } else if (hoverAccent.includes('#00E701') || hoverAccent.includes('0, 231, 1')) {
          targetR = 40;
          targetG = 220;
          targetB = 90;
        } else if (hoverAccent.includes('#00B0FF') || hoverAccent.includes('0, 176, 255')) {
          targetR = 30;
          targetG = 160;
          targetB = 255;
        } else if (hoverAccent.includes('#E91E63') || hoverAccent.includes('233, 30, 99')) {
          targetR = 240;
          targetG = 50;
          targetB = 110;
        }
      }

      currentR += (targetR - currentR) * 0.06;
      currentG += (targetG - currentG) * 0.06;
      currentB += (targetB - currentB) * 0.06;

      container.style.setProperty(
        '--spotlight-color',
        `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, 0.045)`,
      );

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
            if (dist < 120 && dist > 0) {
              const force = (120 - dist) / 120;
              p.x += (dx / dist) * force * 1.0;
              p.y += (dy / dist) * force * 1.0;
            }
          }

          // Wrap boundaries
          if (p.y < -10) p.y = height + 10;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, ${p.alpha})`;
        ctx.shadowBlur = p.size * 2.5;
        ctx.shadowColor = `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, 0.5)`;
        ctx.fill();
      }

      // Option 3: Draw Cursor-Glow-Trail Sparks
      if (!prefersReducedMotion) {
        for (let i = trailSparks.length - 1; i >= 0; i--) {
          const spark = trailSparks[i];
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.alpha -= spark.decay;

          if (spark.alpha <= 0) {
            trailSparks.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, ${spark.alpha})`;
          ctx.shadowBlur = spark.size * 4;
          ctx.shadowColor = `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, 0.7)`;
          ctx.fill();
        }
      }

      // Reset shadow blur for next frame
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('scroll', handleScroll);
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
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* 1. Global WebGL Organic Fluid Water Refraction Canvas (with Parallax Layer 0) */}
      <div
        ref={webGlWrapperRef}
        style={{
          position: 'absolute',
          inset: '-4%',
          width: '108%',
          height: '108%',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      >
        <WebGlWaterRefractionCanvas isMobile={false} />
      </div>

      {/* 2. Scrolly Depth Dimm Scrim (Full-Width Symmetrical Vignette & Vertical Scrolly Depth) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(5, 5, 8, 0.45) 75%, rgba(5, 5, 8, 0.85) 100%),
            linear-gradient(to bottom, rgba(5, 5, 8, 0.12) 0%, rgba(5, 5, 8, 0.4) 40%, rgba(5, 5, 8, 0.94) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Dynamic Liquid Glasswater Spotlight Layer */}
      {showSpotlight && (
        <div
          className="liquid-spotlight-layer"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(
                700px circle at var(--mouse-x, 50%) var(--mouse-y, 300px),
                var(--spotlight-color, rgba(212, 175, 55, 0.04)) 0%,
                transparent 70%
              )
            `,
            transition: 'background 0.05s ease-out',
          }}
        />
      )}

      {/* 4. Ambient Gold Dust Particle & Cursor Trail Canvas (with Parallax Layer 1) */}
      <div
        ref={canvasWrapperRef}
        style={{
          position: 'absolute',
          inset: '-6%',
          width: '112%',
          height: '112%',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* 5. Subtle Noise Texture Overlay (Banding Prevention) */}
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
