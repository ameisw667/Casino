'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Send, ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export interface FooterClosingPlasmaProps {
  className?: string;
}

export function FooterClosingPlasma({ className = '' }: FooterClosingPlasmaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const prefersReducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || !isVisible) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = Math.round((container.clientWidth || 1200) / 2));
    let height = (canvas.height = Math.round((container.clientHeight || 220) / 2));
    let t = 0;

    const handleResize = () => {
      if (!canvas || !container) return;
      width = canvas.width = Math.round((container.clientWidth || 1200) / 2);
      height = canvas.height = Math.round((container.clientHeight || 220) / 2);
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      t += 0.015;
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      // Atmospheric Luxury Gold Plasma equation
      const step = 2;
      for (let y = 0; y < height; y += step) {
        const ny = y / height;
        for (let x = 0; x < width; x += step) {
          const nx = x / width;

          // Multi-frequency sinusoidal interference
          const v1 = Math.sin(nx * 4.5 + t);
          const v2 = Math.sin(4.5 * (nx * Math.sin(t / 2.2) + ny * Math.cos(t / 2.8)) + t * 0.8);
          const cx = nx - 0.5 + 0.3 * Math.sin(t / 3.2);
          const cy = ny - 0.5 + 0.3 * Math.cos(t / 2.5);
          const v3 = Math.sin(Math.sqrt(cx * cx + cy * cy + 0.01) * 7.5 + t * 1.2);
          const val = (v1 + v2 + v3 + 3) / 6; // 0.0 to 1.0

          // Deep Obsidian (#0B0E14) to Liquid Gold (#D4AF37) to Shimmer (#FFF1B8)
          let r = 11;
          let g = 14;
          let b = 20;

          if (val > 0.2) {
            const factor = Math.min(1, (val - 0.2) / 0.8);
            r = Math.floor(11 + factor * 201); // Up to 212
            g = Math.floor(14 + factor * 161); // Up to 175
            b = Math.floor(20 + factor * 35); // Up to 55

            if (factor > 0.65) {
              const peak = (factor - 0.65) / 0.35;
              r = Math.min(255, Math.floor(r + peak * 43));
              g = Math.min(255, Math.floor(g + peak * 66));
              b = Math.min(255, Math.floor(b + peak * 120));
            }
          }

          // Gentle horizontal fade on edges
          const edgeFade = Math.pow(Math.sin(nx * Math.PI), 0.7);
          const finalR = Math.floor(r * edgeFade);
          const finalG = Math.floor(g * edgeFade);
          const finalB = Math.floor(b * edgeFade);

          // Fill step x step block
          for (let dy = 0; dy < step && y + dy < height; dy++) {
            for (let dx = 0; dx < step && x + dx < width; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              data[idx + 0] = finalR;
              data[idx + 1] = finalG;
              data[idx + 2] = finalB;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      data-testid="footer-closing-plasma"
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        marginBottom: '36px',
        borderRadius: '24px',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        background: '#0B0E14',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(212, 175, 55, 0.35)',
      }}
    >
      {/* Background Plasma Canvas / Fallback */}
      {prefersReducedMotion ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.25) 0%, #0B0E14 75%)',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.75,
            filter: 'blur(16px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Atmospheric dark vignettes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(11, 14, 20, 0.6) 0%, rgba(11, 14, 20, 0.2) 50%, rgba(11, 14, 20, 0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Foreground Content: VIP Community & Sovereign Seal */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '40px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#D4AF37',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            <Sparkles size={13} />
            <span>Sovereign Syndicate · Monte-Carlo VIP Protocol</span>
          </div>

          <h3
            style={{
              fontSize: 'clamp(1.3rem, 3vw, 1.85rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            Trete dem exklusiven <span style={{ color: '#D4AF37' }}>High-Roller Club</span> bei
          </h3>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'rgba(255, 255, 255, 0.65)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Echtzeit-Auszahlungen in unter 4 Sekunden, wöchentliches VIP-Rakeback ohne
            Umsatzbedingungen und 100% kryptografisch verifizierbare Provably-Fair-Mathematik.
          </p>
        </div>

        {/* CTA Interaction Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/vault"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)',
              color: '#0B0E14',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <ShieldCheck size={16} />
            <span>VIP Vault betreten</span>
            <ArrowRight size={14} />
          </Link>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            <Send size={15} color="#D4AF37" />
            <span>High-Roller Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
