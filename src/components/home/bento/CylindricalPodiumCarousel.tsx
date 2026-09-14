'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useSpring, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { resolvePlayerAvatar } from '@/lib/casino/player-avatar';
import { RANK_STYLE } from '../DailyTournamentTeaser';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';

export interface CarouselPodiumSlot {
  rank: number;
  username: string;
  wagered: number;
  accent: string;
  avatarUrl?: string;
  badge?: string;
  prize?: number;
}

interface CylindricalPodiumCarouselProps {
  slots: CarouselPodiumSlot[];
  isMobile: boolean;
}

export const CAROUSEL_PRIZE_BY_RANK: Record<number, number> = {
  1: 5000,
  2: 2500,
  3: 1500,
  4: 600,
  5: 400,
};

const CAROUSEL_SPRING_PHYSICS = {
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

const TILT_SPRING_PHYSICS = {
  stiffness: 340,
  damping: 22,
  mass: 0.6,
};

/**
 * Individual 3D Podium Card with:
 * - 3D Cursor-Gyroskop / Magnetic Tilt (±8°) & specular reflection sheen on focus
 * - 3-Tier Multi-Dimensional Z-Depth Stacking (Chassis, Typography, Avatar/Crown)
 * - Flank Card Quick-Peek (slight straighten, scale lift, "Klicken zum Fokussieren" badge)
 */
interface PodiumCardProps {
  slot: CarouselPodiumSlot;
  index: number;
  isFocused: boolean;
  isRear: boolean;
  x: number;
  z: number;
  baseRotateY: number;
  scale: number;
  opacity: number;
  blurAmount: number;
  zIndex: number;
  cardWidth: number;
  cardHeight: number;
  isMobile: boolean;
  isDragging: boolean;
  onSnap: () => void;
}

const PodiumCard = memo(function PodiumCard({
  slot,
  index,
  isFocused,
  isRear,
  x,
  z,
  baseRotateY,
  scale,
  opacity,
  blurAmount,
  zIndex,
  cardWidth,
  cardHeight,
  isMobile,
  isDragging,
  onSnap,
}: PodiumCardProps) {
  const [isFlankHovered, setIsFlankHovered] = useState(false);
  const [sheenPos, setSheenPos] = useState<{ x: number; y: number } | null>(null);

  // Magnetic Gyroscope Springs for active card
  const tiltX = useSpring(0, TILT_SPRING_PHYSICS);
  const tiltY = useSpring(0, TILT_SPRING_PHYSICS);
  const [springTilt, setSpringTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubX = tiltX.on('change', (v) => setSpringTilt((prev) => ({ ...prev, x: v })));
    const unsubY = tiltY.on('change', (v) => setSpringTilt((prev) => ({ ...prev, y: v })));
    return () => {
      unsubX();
      unsubY();
    };
  }, [tiltX, tiltY]);

  // Pointer move relative to focused card
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFocused || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width; // 0 to 1
    const relY = (e.clientY - rect.top) / rect.height; // 0 to 1

    // Clamped magnetic tilt ±8 degrees
    const targetTiltX = -(relY - 0.5) * 16;
    const targetTiltY = (relX - 0.5) * 16;
    tiltX.set(targetTiltX);
    tiltY.set(targetTiltY);

    setSheenPos({ x: relX * 100, y: relY * 100 });
  };

  const handlePointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    setSheenPos(null);
    setIsFlankHovered(false);
  };

  const isRank1 = slot.rank === 1;
  const avatar = resolvePlayerAvatar(slot.username, slot.avatarUrl);
  const prizeAmount =
    slot.prize ?? CAROUSEL_PRIZE_BY_RANK[slot.rank] ?? (slot.rank <= 5 ? 250 : 100);
  const prizeLabel = `$${prizeAmount.toLocaleString('en-US')}`;

  // Flank card hover adjustments (Quick-Peek)
  const activeScale = isFocused ? scale : isFlankHovered ? scale * 1.05 : scale;
  const activeOpacity = isFocused
    ? opacity
    : isFlankHovered
      ? Math.min(1, opacity + 0.22)
      : opacity;
  // Flank hover straightens slightly towards the viewer (4deg straighter)
  const activeRotateY = isFocused
    ? baseRotateY + springTilt.y
    : isFlankHovered
      ? baseRotateY * 0.75
      : baseRotateY;
  const activeRotateX = isFocused ? springTilt.x : 0;
  const activeBlur = isFocused ? 0 : isFlankHovered ? 0 : blurAmount;

  const cardSurface = isRank1
    ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.22) 0%, rgba(14, 18, 26, 0.97) 100%)'
    : slot.rank === 2
      ? 'linear-gradient(180deg, rgba(192, 192, 192, 0.16) 0%, rgba(14, 18, 26, 0.97) 100%)'
      : slot.rank === 3
        ? 'linear-gradient(180deg, rgba(205, 127, 50, 0.16) 0%, rgba(14, 18, 26, 0.97) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(11, 14, 20, 0.97) 100%)';

  const coronaGlow = isFocused
    ? isRank1
      ? '0 0 26px rgba(212, 175, 55, 0.5), 0 16px 36px rgba(0, 0, 0, 0.9)'
      : '0 0 20px rgba(212, 175, 55, 0.32), 0 12px 30px rgba(0, 0, 0, 0.8)'
    : isFlankHovered
      ? `0 0 18px ${slot.accent}45, 0 10px 24px rgba(0, 0, 0, 0.75)`
      : '0 6px 20px rgba(0, 0, 0, 0.6)';

  return (
    <div
      onClick={() => {
        if (!isFocused) onSnap();
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onMouseEnter={() => {
        if (!isFocused && !isRear) setIsFlankHovered(true);
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${activeRotateY}deg) rotateX(${activeRotateX}deg) scale(${activeScale})`,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        opacity: activeOpacity,
        filter: `blur(${activeBlur}px)`,
        zIndex: isFocused ? 25 : isFlankHovered ? 18 : zIndex,
        pointerEvents: isRear ? 'none' : 'auto',
        borderRadius: '16px',
        padding: isMobile ? '12px 8px 10px' : '14px 10px 12px',
        background: cardSurface,
        border: isFocused
          ? `1.5px solid ${slot.accent || bentoColors.gold}`
          : isFlankHovered
            ? `1px solid ${slot.accent}99`
            : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: coronaGlow,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: isMobile ? '3px' : '4px',
        transition: isDragging
          ? 'none'
          : 'filter 0.22s ease, opacity 0.22s ease, border-color 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: isFocused ? 'default' : 'pointer',
      }}
    >
      {/* Dynamic Specular Reflection Sheen (Layer 1.5) */}
      {isFocused && sheenPos && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            background: `radial-gradient(circle 80px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 235, 160, 0.28) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 80%)`,
            pointerEvents: 'none',
            zIndex: 6,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Flank Quick-Peek Action Badge */}
      {!isFocused && isFlankHovered && !isRear && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            position: 'absolute',
            top: '-11px',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(212, 175, 55, 0.95)',
            color: '#0B0E14',
            fontSize: '0.52rem',
            fontWeight: 950,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.6)',
            zIndex: 12,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <MousePointerClick size={10} strokeWidth={2.5} />
          <span>Fokussieren</span>
        </motion.div>
      )}

      {/* LAYER 3: 24k Rank Crown or Badge (translateZ: 22px) */}
      <div
        style={{
          transform: isFocused ? 'translateZ(22px)' : 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease',
        }}
      >
        {isRank1 ? (
          <Image
            src="/images/2026-09-06_icon-crown-jackpot-quantum-gold_v001.png"
            alt="Platz 1"
            width={isMobile ? 18 : 20}
            height={isMobile ? 18 : 20}
            aria-hidden
            style={{
              position: 'absolute',
              top: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 4px 10px rgba(212, 175, 55, 0.85))',
              zIndex: 8,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '-7px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '1px 7px',
              borderRadius: '999px',
              background: 'rgba(11, 14, 20, 0.94)',
              border: `1px solid ${slot.accent}88`,
              color: slot.accent,
              fontSize: '0.56rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              lineHeight: '1.2',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.7)',
              zIndex: 8,
            }}
          >
            #{slot.rank}
          </div>
        )}
      </div>

      {/* LAYER 3: Avatar Orbit (translateZ: 20px with rich drop shadow) */}
      <div
        style={{
          position: 'relative',
          width: isMobile ? '40px' : '48px',
          height: isMobile ? '40px' : '48px',
          borderRadius: '50%',
          padding: '2px',
          marginTop: '2px',
          background: `linear-gradient(135deg, ${slot.accent} 0%, transparent 100%)`,
          boxShadow: isFocused
            ? `0 0 16px ${slot.accent}75, 0 8px 18px rgba(0,0,0,0.85)`
            : '0 4px 12px rgba(0,0,0,0.6)',
          flexShrink: 0,
          transform: isFocused ? 'translateZ(20px)' : 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#090B10',
          }}
        >
          <Image
            src={avatar.src}
            alt={slot.username}
            fill
            sizes="(max-width: 768px) 40px, 48px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* LAYER 2: Text Elements (translateZ: 10px) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: isMobile ? '2px' : '3px',
          transform: isFocused ? 'translateZ(10px)' : 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Username */}
        <div
          style={{
            fontSize: isMobile ? '0.72rem' : '0.82rem',
            fontWeight: 800,
            color: '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            letterSpacing: '-0.01em',
            marginTop: '1px',
            textShadow: isFocused ? '0 2px 8px rgba(0, 0, 0, 0.8)' : 'none',
          }}
        >
          {slot.username}
        </div>

        {/* Prize Label */}
        <div
          style={{
            ...bentoTypography.dynamicNumber,
            fontSize: isMobile ? '0.82rem' : '0.94rem',
            fontWeight: 950,
            color: bentoColors.emerald,
            whiteSpace: 'nowrap',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.45), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          {prizeLabel}
        </div>

        {/* Wagered */}
        <div
          style={{
            fontSize: isMobile ? '0.56rem' : '0.62rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.55)',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono, monospace)',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          ${slot.wagered.toLocaleString('en-US')}
        </div>
      </div>
    </div>
  );
});

export const CylindricalPodiumCarousel = memo(function CylindricalPodiumCarousel({
  slots,
  isMobile,
}: CylindricalPodiumCarouselProps) {
  const prefersReduced = useReducedMotion();
  const [carouselAngle, setCarouselAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startAngle = useRef(0);
  const lastInteractionTime = useRef(Date.now());

  const count = slots.length;
  const stepAngle = 360 / count;

  // Geometry: Generous headroom & comfortable lateral spacing
  const cardWidth = isMobile ? 120 : 146;
  const cardHeight = isMobile ? 146 : 166;
  const lateralSpread = isMobile ? 116 : 192;
  const depthDrop = isMobile ? 38 : 50;
  const maxTilt = isMobile ? 16 : 22; // Gentle tilt: flank cards face forward and stay 100% legible

  // Spring for smooth rotation and snapping
  const angleSpring = useSpring(0, CAROUSEL_SPRING_PHYSICS);

  useEffect(() => {
    const unsub = angleSpring.on('change', (v) => {
      setCarouselAngle(v);
      const normalized = ((-v % 360) + 360) % 360;
      const idx = Math.round(normalized / stepAngle) % count;
      setActiveIndex(idx);
    });
    return unsub;
  }, [angleSpring, count, stepAngle]);

  // Snap to specific slot index
  const snapToIndex = useCallback(
    (targetIdx: number) => {
      lastInteractionTime.current = Date.now();
      const currentVal = angleSpring.get();
      const targetAngle = -targetIdx * stepAngle;
      const diff = ((((targetAngle - currentVal) % 360) + 540) % 360) - 180;
      angleSpring.set(currentVal + diff);
      soundManager.play('chip');
    },
    [angleSpring, stepAngle],
  );

  const handlePrev = useCallback(() => {
    snapToIndex((activeIndex - 1 + count) % count);
  }, [activeIndex, count, snapToIndex]);

  const handleNext = useCallback(() => {
    snapToIndex((activeIndex + 1) % count);
  }, [activeIndex, count, snapToIndex]);

  // Stepped Showcase Auto-Advance: Rests gracefully on each VIP for 5s, then smooth spring glide
  useEffect(() => {
    if (prefersReduced || isHovered) return;

    const interval = setInterval(() => {
      const idleSeconds = (Date.now() - lastInteractionTime.current) / 1000;
      if (!isDragging.current && idleSeconds > 4.5) {
        const nextIdx = (activeIndex + 1) % count;
        snapToIndex(nextIdx);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, count, isHovered, prefersReduced, snapToIndex]);

  // Pointer drag gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startAngle.current = angleSpring.get();
    lastInteractionTime.current = Date.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    const degDelta = deltaX * (isMobile ? 0.55 : 0.38);
    angleSpring.set(startAngle.current + degDelta);
    lastInteractionTime.current = Date.now();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe ignore
    }

    // Snap to nearest slot
    const currentVal = angleSpring.get();
    const nearestIdx = Math.round(-currentVal / stepAngle);
    const targetAngle = -nearestIdx * stepAngle;
    angleSpring.set(targetAngle);
    soundManager.play('spin');
    lastInteractionTime.current = Date.now();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '238px' : '262px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        perspective: isMobile ? '700px' : '950px',
        perspectiveOrigin: '50% 45%',
        paddingTop: isMobile ? '16px' : '20px',
        paddingBottom: isMobile ? '6px' : '8px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 3D Radial Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          transformStyle: 'preserve-3d',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        {slots.map((slot, index) => {
          const itemBaseAngle = index * stepAngle;
          // Relative angle to viewer [-180, 180]
          const relAngle = ((((carouselAngle + itemBaseAngle + 180) % 360) + 360) % 360) - 180;
          const absDiff = Math.abs(relAngle);
          const rad = (relAngle * Math.PI) / 180;

          // Focus & visual properties
          const isFocused = absDiff < stepAngle / 2;

          // 3D positioning: Elliptical curve with dampened Y-rotation
          const x = Math.sin(rad) * lateralSpread;
          const z = (Math.cos(rad) - 1) * depthDrop;
          // Flank cards face gently toward the viewer (max ~22° tilt)
          const baseRotateY = -Math.sign(relAngle) * Math.min(1, absDiff / 72) * maxTilt;

          // Flank cards remain recognizable & crisp; rear cards fade out completely
          const isRear = absDiff > 90;
          const blurAmount = isFocused ? 0 : 0.6;
          const opacity = isFocused ? 1 : isRear ? 0 : Math.max(0.72, 1 - (absDiff / 90) * 0.28);
          const scale = isFocused ? 1.04 : 0.91;
          const zIndex = isFocused ? 25 : isRear ? 0 : 12;

          return (
            <PodiumCard
              key={`podium-card-${slot.rank}-${slot.username}`}
              slot={slot}
              index={index}
              isFocused={isFocused}
              isRear={isRear}
              x={x}
              z={z}
              baseRotateY={baseRotateY}
              scale={scale}
              opacity={opacity}
              blurAmount={blurAmount}
              zIndex={zIndex}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              isMobile={isMobile}
              isDragging={isDragging.current}
              onSnap={() => snapToIndex(index)}
            />
          );
        })}
      </div>

      {/* Subtle, Minimalist VIP Navigation Slider Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: isMobile ? '6px' : '10px',
          position: 'relative',
          zIndex: 30,
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Vorheriger VIP Platz"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(212, 175, 55, 0.45)',
            borderRadius: '4px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)';
            e.currentTarget.style.transform = 'translateX(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(212, 175, 55, 0.45)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <ChevronLeft size={14} strokeWidth={2.2} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {slots.map((s, idx) => {
            const isDotActive = activeIndex === idx;
            return (
              <button
                key={`dot-${s.rank}`}
                type="button"
                onClick={() => snapToIndex(idx)}
                aria-label={`Gehe zu Platz ${s.rank}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 2px',
                  margin: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: isDotActive ? '14px' : '4px',
                    height: '4px',
                    borderRadius: '999px',
                    background: isDotActive
                      ? 'rgba(212, 175, 55, 0.9)'
                      : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: isDotActive ? '0 0 6px rgba(212, 175, 55, 0.5)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Nächster VIP Platz"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(212, 175, 55, 0.45)',
            borderRadius: '4px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(212, 175, 55, 0.9)';
            e.currentTarget.style.transform = 'translateX(1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(212, 175, 55, 0.45)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <ChevronRight size={14} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
});
