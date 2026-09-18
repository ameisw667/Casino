'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VaultPrismBackdropProps {
  isMobile?: boolean;
}

export function VaultPrismBackdrop({ isMobile = false }: VaultPrismBackdropProps) {
  return (
    <div
      data-testid="vault-prism-backdrop"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* ─── Layer 1: Primary Rotating Prism Refraction Beams ─── */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.08, 1],
        }}
        transition={{
          rotate: { duration: 45, repeat: Infinity, ease: 'linear' },
          scale: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          top: '-25%',
          left: '-20%',
          width: isMobile ? '140%' : '140%',
          height: isMobile ? '120%' : '140%',
          background: `conic-gradient(
            from 180deg at 50% 50%,
            rgba(212, 175, 55, 0.18) 0deg,
            rgba(16, 185, 129, 0.12) 60deg,
            rgba(6, 182, 212, 0.14) 120deg,
            rgba(139, 92, 246, 0.15) 180deg,
            rgba(239, 68, 68, 0.12) 240deg,
            rgba(212, 175, 55, 0.20) 320deg,
            rgba(212, 175, 55, 0.18) 360deg
          )`,
          filter: 'blur(80px)',
          opacity: 0.85,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      />

      {/* ─── Layer 2: Secondary Counter-Rotating Chromatic Caustic ─── */}
      <motion.div
        animate={{
          rotate: [360, 0],
          x: ['-5%', '5%', '-5%'],
          y: ['-3%', '3%', '-3%'],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: isMobile ? '120%' : '130%',
          height: isMobile ? '110%' : '130%',
          background: `radial-gradient(
            ellipse at 60% 40%,
            rgba(212, 175, 55, 0.22) 0%,
            rgba(139, 92, 246, 0.12) 35%,
            rgba(6, 182, 212, 0.08) 60%,
            rgba(11, 14, 20, 0) 80%
          )`,
          filter: 'blur(70px)',
          opacity: 0.75,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      />

      {/* ─── Layer 3: Sparkling Diamond Refraction Points (High-Roller Glints) ─── */}
      {[
        { top: '12%', left: '18%', delay: 0, duration: 3.5, size: 16 },
        { top: '24%', right: '22%', delay: 1.2, duration: 4.2, size: 22 },
        { top: '48%', left: '8%', delay: 2.0, duration: 3.8, size: 14 },
        { top: '65%', right: '14%', delay: 0.8, duration: 4.5, size: 20 },
        { top: '82%', left: '26%', delay: 2.5, duration: 3.2, size: 18 },
      ].map((glint, idx) => (
        <motion.div
          key={idx}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            scale: [0.85, 1.25, 0.85],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: glint.duration,
            delay: glint.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: glint.top,
            left: glint.left,
            right: glint.right,
            width: `${glint.size}px`,
            height: `${glint.size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Diamond SVG Glint Star */}
          <svg
            width={glint.size}
            height={glint.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
              fill="url(#goldDiamondGradient)"
              opacity="0.9"
            />
            <defs>
              <linearGradient id="goldDiamondGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF2B2" />
                <stop offset="0.5" stopColor="#D4AF37" />
                <stop offset="1" stopColor="#997A15" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* ─── Layer 4: Deep Obsidian Vignette Overlay (WCAG AAA Foreground Contrast) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 25%, rgba(11, 14, 20, 0.45) 0%, rgba(11, 14, 20, 0.82) 65%, #0B0E14 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
