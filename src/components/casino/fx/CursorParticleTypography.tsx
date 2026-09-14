'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface CursorParticleTypographyProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  subtleRepulsion?: boolean;
  maxDisplacement?: number;
  repulsionRadius?: number;
  repulsionForce?: number;
  stiffness?: number;
  damping?: number;
  ambientFlakes?: boolean;
  ambientCount?: number;
  palette?: string[];
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  seoSemantic?: boolean;
  triggerExplosion?: boolean;
  onExplosionComplete?: () => void;
  isMobile?: boolean;
}

const DEFAULT_GOLD_PALETTE = [
  '#FFEBAA', // 24k Highlight
  '#F5D77F', // Liquid Gold
  '#D4AF37', // Pure Gold
  '#AA771C', // Deep Bronze
  '#FFFFFF', // Diamond Shimmer
];

// Layout of Float32Array per particle:
// 0: x, 1: y, 2: vx, 3: vy, 4: originX, 5: originY, 6: size, 7: alpha, 8: colorIndex
const FLOATS_PER_PARTICLE = 9;

export function CursorParticleTypography({
  text,
  fontSize = 48,
  fontFamily = "var(--font-heading, 'Cinzel', serif)",
  fontWeight = 900,
  subtleRepulsion = false,
  maxDisplacement = 18,
  repulsionRadius = 60,
  repulsionForce = 4.5,
  stiffness = 0.045,
  damping = 0.88,
  ambientFlakes = false,
  ambientCount = 40,
  palette = DEFAULT_GOLD_PALETTE,
  className = '',
  style = {},
  as = 'div',
  seoSemantic = true,
  triggerExplosion = false,
  onExplosionComplete,
  isMobile = false,
}: CursorParticleTypographyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Float32Array | null>(null);
  const particleCountRef = useRef<number>(0);
  const isSettledRef = useRef<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: -9999,
    y: -9999,
    isHovering: false,
  });

  const prefersReducedMotion = Boolean(useReducedMotion());

  // Glyph Particle Generation
  const sampleGlyphPoints = useCallback(
    (w: number, h: number, _dpr: number) => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      offCtx.clearRect(0, 0, w, h);
      offCtx.fillStyle = '#FFFFFF';
      let resolvedFont = fontFamily;
      if (resolvedFont.includes('var(')) {
        resolvedFont = resolvedFont
          .replace(/var\([^,]+,\s*([^)]+)\)/g, '$1')
          .replace(/var\([^)]+\)/g, 'sans-serif');
      }
      offCtx.font = `${fontWeight} ${fontSize}px ${resolvedFont}`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, w / 2, h / 2);

      const imgData = offCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample step: larger step for large text or mobile to preserve 60-120fps
      const step = fontSize > 64 ? 4 : fontSize > 36 ? 3 : 2;
      const points: { x: number; y: number; alpha: number }[] = [];

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4;
          const alpha = data[idx + 3];
          if (alpha > 48) {
            points.push({ x, y, alpha: alpha / 255 });
          }
        }
      }

      const totalCount = points.length + (ambientFlakes ? ambientCount : 0);
      particleCountRef.current = totalCount;
      const buffer = new Float32Array(totalCount * FLOATS_PER_PARTICLE);

      const centerX = w / 2;
      const centerY = h / 2;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const offset = i * FLOATS_PER_PARTICLE;

        // Origin coords
        buffer[offset + 4] = p.x;
        buffer[offset + 5] = p.y;

        // Current coords
        if (triggerExplosion) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * Math.max(w, h) * 0.45;
          buffer[offset + 0] = centerX + Math.cos(angle) * dist;
          buffer[offset + 1] = centerY + Math.sin(angle) * dist;
          buffer[offset + 2] = (Math.random() - 0.5) * 8;
          buffer[offset + 3] = (Math.random() - 0.5) * 8;
        } else {
          buffer[offset + 0] = p.x;
          buffer[offset + 1] = p.y;
          buffer[offset + 2] = 0;
          buffer[offset + 3] = 0;
        }

        buffer[offset + 6] = Math.random() < 0.2 ? step * 0.9 : step * 0.65; // size
        buffer[offset + 7] = p.alpha; // base alpha
        buffer[offset + 8] = Math.floor(Math.random() * palette.length); // colorIndex
      }

      // Optional ambient flakes
      if (ambientFlakes) {
        for (let j = 0; j < ambientCount; j++) {
          const i = points.length + j;
          const offset = i * FLOATS_PER_PARTICLE;
          const randX = Math.random() * w;
          const randY = Math.random() * h;
          buffer[offset + 0] = randX;
          buffer[offset + 1] = randY;
          buffer[offset + 2] = (Math.random() - 0.5) * 0.8;
          buffer[offset + 3] = -0.3 - Math.random() * 0.5;
          buffer[offset + 4] = randX;
          buffer[offset + 5] = randY;
          buffer[offset + 6] = 1 + Math.random() * 2;
          buffer[offset + 7] = 0.25 + Math.random() * 0.5;
          buffer[offset + 8] = Math.floor(Math.random() * palette.length);
        }
      }

      particlesRef.current = buffer;
      isSettledRef.current = false;
    },
    [
      text,
      fontSize,
      fontFamily,
      fontWeight,
      triggerExplosion,
      ambientFlakes,
      ambientCount,
      palette.length,
    ],
  );

  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || fontSize * 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateDimensions = () => {
      if (!container || !canvas) return;
      width = container.clientWidth || 300;
      height = container.clientHeight || Math.round(fontSize * 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sampleGlyphPoints(width, height, dpr);
      if (animFrameRef.current === null && typeof loop === 'function') {
        isSettledRef.current = false;
        loop();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    let isTabVisible = true;
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isSettledRef.current) {
        isSettledRef.current = false;
        loop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isHovering: true,
      };
      if (isSettledRef.current) {
        isSettledRef.current = false;
        loop();
      }
    };

    const onPointerLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });

    let explosionTimeout: NodeJS.Timeout | null = null;
    if (triggerExplosion && onExplosionComplete) {
      explosionTimeout = setTimeout(() => {
        onExplosionComplete();
      }, 700);
    }

    const radiusSq = repulsionRadius * repulsionRadius;

    // Simulation Loop
    function loop() {
      if (!isTabVisible || !ctx) return;

      const particles = particlesRef.current;
      const count = particleCountRef.current;
      if (!particles || count === 0) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      let totalKineticEnergy = 0;

      for (let i = 0; i < count; i++) {
        const off = i * FLOATS_PER_PARTICLE;
        let x = particles[off + 0];
        let y = particles[off + 1];
        let vx = particles[off + 2];
        let vy = particles[off + 3];
        const ox = particles[off + 4];
        const oy = particles[off + 5];
        const size = particles[off + 6];
        const alpha = particles[off + 7];
        const colIdx = particles[off + 8];

        // 1. Spring physics pulling towards origin
        const dxOrigin = ox - x;
        const dyOrigin = oy - y;
        const ax = dxOrigin * stiffness;
        const ay = dyOrigin * stiffness;

        vx = (vx + ax) * damping;
        vy = (vy + ay) * damping;

        // 2. Cursor repulsion
        if (mouse.isHovering) {
          const dxMouse = x - mouse.x;
          const dyMouse = y - mouse.y;
          const distSq = dxMouse * dxMouse + dyMouse * dyMouse;

          if (distSq < radiusSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / repulsionRadius) * repulsionForce;
            vx += (dxMouse / dist) * force;
            vy += (dyMouse / dist) * force;
          }
        }

        // 3. Cap displacement if subtle mode
        if (subtleRepulsion) {
          const curDx = x + vx - ox;
          const curDy = y + vy - oy;
          const curDist = Math.hypot(curDx, curDy);
          if (curDist > maxDisplacement) {
            const ratio = maxDisplacement / curDist;
            x = ox + curDx * ratio;
            y = oy + curDy * ratio;
            vx *= 0.5;
            vy *= 0.5;
          } else {
            x += vx;
            y += vy;
          }
        } else {
          x += vx;
          y += vy;
        }

        // Store back
        particles[off + 0] = x;
        particles[off + 1] = y;
        particles[off + 2] = vx;
        particles[off + 3] = vy;

        totalKineticEnergy += Math.abs(vx) + Math.abs(vy) + Math.abs(dxOrigin) + Math.abs(dyOrigin);

        // Render point
        ctx.fillStyle = palette[colIdx % palette.length];
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;

      // Autopause check: if cursor not hovering and particles are settled
      if (!mouse.isHovering && totalKineticEnergy < count * 0.04) {
        isSettledRef.current = true;
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    }

    updateDimensions();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (explosionTimeout) clearTimeout(explosionTimeout);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [
    fontSize,
    fontFamily,
    fontWeight,
    subtleRepulsion,
    maxDisplacement,
    repulsionRadius,
    repulsionForce,
    stiffness,
    damping,
    palette,
    triggerExplosion,
    onExplosionComplete,
    prefersReducedMotion,
    isMobile,
    sampleGlyphPoints,
  ]);

  const Tag = as;

  // Fallback for Mobile / Reduced Motion: High quality CSS gradient typography
  if (prefersReducedMotion || isMobile) {
    return (
      <Tag
        className={className}
        style={{
          margin: 0,
          fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight,
          background: 'linear-gradient(135deg, #FFEBAA 0%, #D4AF37 55%, #AA771C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 10px rgba(212, 175, 55, 0.4))',
          ...style,
        }}
      >
        {text}
      </Tag>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block cursor-pointer select-none ${className}`}
      style={{
        minHeight: `${Math.round(fontSize * 1.35)}px`,
        width: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        ...style,
      }}
    >
      {/* 1. SEO & A11y Semantic Tag (Invisible to screen, 100% Crawlable) */}
      {seoSemantic && (
        <Tag
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          {text}
        </Tag>
      )}

      {/* 2. Hardware-Accelerated High-DPR Particle Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: 'block',
          width: '100%',
          height: `${Math.round(fontSize * 1.35)}px`,
          pointerEvents: 'auto',
        }}
      />
    </div>
  );
}

export default CursorParticleTypography;
