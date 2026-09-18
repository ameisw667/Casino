'use client';

import React, { useRef, useEffect } from 'react';
import type { CrashStatus } from './crash-helpers';

interface CrashPixelCanvasProps {
  status: CrashStatus;
  isMobile: boolean;
}

interface Pixel {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  goldFactor: number;
  speed: number;
}

export function CrashPixelCanvas({ status, isMobile }: CrashPixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const statusRef = useRef<CrashStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initPixels();
    };
    window.addEventListener('resize', handleResize);

    // Pixel matrix grid
    const spacing = isMobile ? 32 : 24;
    let pixels: Pixel[] = [];

    const initPixels = () => {
      pixels = [];
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing + (Math.random() * 4 - 2);
          const y = r * spacing + (Math.random() * 4 - 2);
          const baseAlpha = 0.08 + Math.random() * 0.22;
          pixels.push({
            x,
            y,
            baseX: x,
            baseY: y,
            size: isMobile ? 1.5 : 2,
            alpha: baseAlpha,
            baseAlpha,
            goldFactor: Math.random(),
            speed: 0.8 + Math.random() * 1.5,
          });
        }
      }
    };

    initPixels();

    // Mouse interactive handlers
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Shockwave impulse
      for (const p of pixels) {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (1 - dist / 180) * 35;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force;
          p.y += Math.sin(angle) * force;
          p.alpha = 0.95;
        }
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('click', onClick);

    // Animation Loop
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const st = statusRef.current;
      const isRunning = st === 'RUNNING';
      const isCrashed = st === 'CRASHED';

      const mouse = mouseRef.current;

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];

        // Cosmic drift or rocket acceleration
        if (isRunning) {
          p.x -= p.speed * 2.2;
          p.y += p.speed * 1.4;
          if (p.x < 0) p.x = width;
          if (p.y > height) p.y = 0;
        } else {
          // Subtle organic float
          p.x += Math.sin(time + i) * 0.15;
          p.y += Math.cos(time + i * 0.8) * 0.15;
        }

        // Mouse repel physics
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const force = (1 - dist / 90) * 12;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force;
            p.y += Math.sin(angle) * force;
            p.alpha = Math.min(1, p.alpha + 0.3);
          }
        }

        // Spring back to base position when not running
        if (!isRunning) {
          p.x += (p.baseX - p.x) * 0.04;
          p.y += (p.baseY - p.y) * 0.04;
          p.alpha += (p.baseAlpha - p.alpha) * 0.03;
        }

        // Color styling according to crash status
        if (isCrashed) {
          ctx.fillStyle = `rgba(255, 60, 40, ${p.alpha * 0.85})`;
        } else if (isRunning) {
          // Escalating 24k gold stipple
          ctx.fillStyle = `rgba(212, 175, 55, ${Math.min(0.9, p.alpha * 1.5)})`;
        } else {
          // Deep obsidian gold
          const r = 212;
          const g = 175;
          const b = 55;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.6})`;
        }

        // Draw square cyber pixel
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}
