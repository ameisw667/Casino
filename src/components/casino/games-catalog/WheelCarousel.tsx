'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, animate, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { CrashPixelCanvas } from '@/components/casino/games/crash/CrashPixelCanvas';
import type { GameMeta } from '@/app/games/_components/config';

const LiquidGoldChromeCanvas = dynamic(
  () => import('@/components/home/shaders/LiquidGoldChromeCanvas').then((m) => m.LiquidGoldChromeCanvas),
  { ssr: false },
);

interface WheelCarouselProps {
  games: readonly GameMeta[];
  isMobile: boolean;
}

const RADIUS = 420; // 3D cylinder depth
const ITEM_WIDTH = 260;
const ITEM_HEIGHT = 280;

export function WheelCarousel({ games, isMobile }: WheelCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalItems = games.length;
  const angleStep = 360 / Math.max(totalItems, 5);
  const prefersReducedMotion = useReducedMotion();
  const showPixelCanvas = !isMobile && !prefersReducedMotion;

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Soft, luxurious spring motion values (nicht aggressiv, geschmeidiges Gleiten)
  const rawAngle = useMotionValue(0);
  const smoothAngle = useSpring(rawAngle, {
    stiffness: 140,
    damping: 22,
    mass: 0.7,
  });

  const rotateTo = useCallback(
    (targetIndex: number) => {
      const normalizedCurrent = Math.round(-rawAngle.get() / angleStep);
      let diff = targetIndex - (((normalizedCurrent % totalItems) + totalItems) % totalItems);
      if (diff > totalItems / 2) diff -= totalItems;
      if (diff < -totalItems / 2) diff += totalItems;

      const targetAngle = -(normalizedCurrent + diff) * angleStep;
      soundManager.playClick();
      animate(rawAngle, targetAngle, {
        type: 'spring',
        stiffness: 140,
        damping: 22,
        mass: 0.7,
      });
      setActiveIndex(targetIndex);
    },
    [angleStep, rawAngle, totalItems],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - lastXRef.current;
    if (Math.abs(e.clientX - startXRef.current) > 5) {
      hasDraggedRef.current = true;
    }
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 10);
    velocityRef.current = (dx / dt) * 1000;
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    // Freie, nicht-aggressive Drehung
    rawAngle.set(rawAngle.get() + dx * 0.18);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Sanfte Trägheit gedämpft auf max +-45 Grad
    const inertia = Math.max(Math.min(velocityRef.current * 0.025, 45), -45);
    const projectedAngle = rawAngle.get() + inertia;
    const nearestIdx = Math.round(-projectedAngle / angleStep);
    const normIdx = ((nearestIdx % totalItems) + totalItems) % totalItems;
    rotateTo(normIdx);
  };

  const prev = () => {
    const nextIdx = (activeIndex - 1 + totalItems) % totalItems;
    rotateTo(nextIdx);
  };

  const next = () => {
    const nextIdx = (activeIndex + 1) % totalItems;
    rotateTo(nextIdx);
  };

  // Keyboard navigation when hovered
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Wheel listener for smooth cylinder scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        const delta = e.deltaX || e.deltaY;
        rawAngle.set(rawAngle.get() - delta * 0.2);
        const currentIdx = Math.round(-rawAngle.get() / angleStep);
        const normIdx = ((currentIdx % totalItems) + totalItems) % totalItems;
        if (normIdx !== activeIndex) {
          soundManager.playHover();
          setActiveIndex(normIdx);
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex, angleStep, rawAngle, totalItems]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '20px',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.1) 0%, rgba(11, 14, 20, 0.95) 75%)',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.3)',
        padding: isMobile ? '14px 10px 16px' : '18px 24px 22px',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      aria-label="3D Featured Games Carousel"
    >
      {/* Hintergrund-Layer A: Liquid Chrome WebGL-Shader (Obsidian & 24k Gold) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          isolation: 'isolate',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <LiquidGoldChromeCanvas isMobile={isMobile} intensity={0.2} />
      </div>

      {/* Hintergrund-Layer B: reaktives Gold-Pixel-Gitter (idle) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          isolation: 'isolate',
        }}
      >
        {showPixelCanvas && <CrashPixelCanvas status="IDLE" isMobile={isMobile} />}
      </div>

      {/* Hintergrund-Layer C: dunkler Scrim für Kartenlesbarkeit über beiden Canvas-Layern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 45%, rgba(11, 14, 20, 0.55) 0%, rgba(11, 14, 20, 0.85) 100%)',
        }}
      />

      {/* Hintergrund-Layer D: subtiler, neutral-weißer CSS-Lichtsheen (kein Gold, kein JS-Loop) */}
      <div
        className="wheel-sheen"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-30%',
          width: '60%',
          height: '140%',
          zIndex: 3,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          background:
            'linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.10) 45%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.10) 55%, transparent 100%)',
        }}
      />
      <style>{`
        @keyframes wheelSheenSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          15% { opacity: 0.5; }
          50% { opacity: 0.7; }
          85% { opacity: 0.3; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .wheel-sheen {
          animation: wheelSheenSweep 9s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wheel-sheen { animation: none; opacity: 0; }
        }
      `}</style>

      {/* Content-Layer: immer über allen Hintergrund-Layern */}
      <div style={{ position: 'relative', zIndex: 4 }}>
      {/* Ambient Top Glow Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          opacity: 0.6,
        }}
      />

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '8px' : '14px',
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#D4AF37',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              FEATURED 3D SPOTLIGHT
            </div>
            <div
              style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Cylinder Selection Reel
            </div>
          </div>
        </div>

        {/* Arrow Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={prev}
            aria-label="Vorheriges Spiel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#D4AF37',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Nächstes Spiel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#D4AF37',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 3D Cylinder Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          height: isMobile ? '250px' : '290px',
          width: '100%',
          perspective: isMobile ? '800px' : '1100px',
          perspectiveOrigin: '50% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: `${ITEM_WIDTH}px`,
            height: `${ITEM_HEIGHT}px`,
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {games.map((game, index) => {
            return (
              <WheelCard
                key={game.id}
                game={game}
                index={index}
                totalItems={totalItems}
                angleStep={angleStep}
                smoothAngle={smoothAngle}
                radius={isMobile ? 280 : RADIUS}
                isActive={index === activeIndex}
                onSelect={() => {
                  if (!hasDraggedRef.current) {
                    rotateTo(index);
                  }
                }}
                isMobile={isMobile}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Pagination Dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '8px',
        }}
      >
        {games.map((g, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => rotateTo(i)}
              aria-label={`Gehe zu Spiel ${g.name}`}
              style={{
                width: isActive ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: isActive
                  ? 'linear-gradient(90deg, #D4AF37 0%, #FFF5C0 100%)'
                  : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
              }}
            />
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ──── Isolated 3D Cylinder Card ────
function WheelCard({
  game,
  index,
  totalItems: _totalItems,
  angleStep,
  smoothAngle,
  radius,
  isActive,
  onSelect,
  isMobile: _isMobile,
}: {
  game: GameMeta;
  index: number;
  totalItems: number;
  angleStep: number;
  smoothAngle: ReturnType<typeof useSpring>;
  radius: number;
  isActive: boolean;
  onSelect: () => void;
  isMobile: boolean;
}) {
  const Icon = game.icon;

  // Transform rotation & position along cylinder circumference
  const transform = useTransform(smoothAngle, (rot) => {
    const cardAngle = rot + index * angleStep;
    const rad = (cardAngle * Math.PI) / 180;
    const x = Math.sin(rad) * radius;
    const z = Math.cos(rad) * radius - radius;
    const rotateY = cardAngle;

    return `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg)`;
  });

  const opacity = useTransform(smoothAngle, (rot) => {
    const cardAngle = ((((rot + index * angleStep) % 360) + 540) % 360) - 180;
    const dist = Math.abs(cardAngle);
    if (dist > 95) return 0; // Cull back faces
    return Math.max(0.15, 1 - dist / 110);
  });

  const scale = useTransform(smoothAngle, (rot) => {
    const cardAngle = ((((rot + index * angleStep) % 360) + 540) % 360) - 180;
    const dist = Math.abs(cardAngle);
    return Math.max(0.75, 1 - dist / 300);
  });

  return (
    <motion.div
      onClick={onSelect}
      style={{
        position: 'absolute',
        width: `${ITEM_WIDTH}px`,
        height: `${ITEM_HEIGHT}px`,
        transform,
        opacity,
        scale,
        transformStyle: 'preserve-3d',
        borderRadius: '16px',
        background: 'linear-gradient(155deg, rgba(26, 26, 36, 0.95) 0%, rgba(12, 14, 20, 0.98) 100%)',
        border: isActive ? '1px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: isActive
          ? '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 24px rgba(212, 175, 55, 0.35)'
          : '0 8px 24px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        overflow: 'hidden',
        willChange: 'transform, opacity',
      }}
    >
      {/* Artwork Header */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '130px',
          overflow: 'hidden',
          background: '#0B0E14',
        }}
      >
        <Image
          src={game.preview}
          alt={game.name}
          fill
          sizes="(max-width: 768px) 240px, 280px"
          style={{
            objectFit: 'cover',
            filter: isActive ? 'none' : 'brightness(0.7) contrast(1.1)',
            transition: 'filter 0.3s ease',
          }}
          priority={index < 3}
        />
        {/* Gradient Mask */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(12, 14, 20, 1) 0%, rgba(12, 14, 20, 0.2) 60%, transparent 100%)',
          }}
        />

        {/* Category Badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(11, 14, 20, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#D4AF37',
            fontSize: '0.55rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}
        >
          {game.category}
        </div>

        {/* Max Reward Pill */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            fontSize: '0.58rem',
            fontWeight: 800,
            fontFamily: 'monospace',
          }}
        >
          {game.reward}
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '150px',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              <Icon size={14} color={game.accentColor || '#D4AF37'} />
            </div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {game.name}
            </h3>
          </div>

          <p
            style={{
              fontSize: '0.7rem',
              lineHeight: 1.35,
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {game.desc}
          </p>
        </div>

        {/* Action Button / Link */}
        <div style={{ marginTop: '10px' }}>
          {isActive ? (
            <Link
              href={game.path}
              onClick={() => soundManager.play('bet')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '9px 0',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #18140a 0%, #100d06 100%)',
                border: '1.5px solid #e5c158',
                color: '#fef08a',
                fontSize: '0.75rem',
                fontWeight: 900,
                textDecoration: 'none',
                letterSpacing: '0.04em',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(212, 175, 55, 0.15)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Play size={13} fill="currentColor" />
              PLAY NOW
            </Link>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '8px 0',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              Select
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
