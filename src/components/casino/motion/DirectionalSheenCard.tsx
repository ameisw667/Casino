'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export interface DirectionalSheenCardProps {
  children: React.ReactNode;
  className?: string;
  isMobile?: boolean;
  accentColor?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
}

/**
 * DirectionalSheenCard — Componentry Luxury Hover Transition
 * 
 * Computes an 8-directional vector sheen based on cursor entry angle,
 * projecting a metallic 24k-gold and diamond light beam across the surface.
 */
export function DirectionalSheenCard({
  children,
  className = '',
  isMobile = false,
  accentColor: _accentColor = '#D4AF37',
  onHoverStart,
  onHoverEnd,
  onClick,
}: DirectionalSheenCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [sheenAngle, setSheenAngle] = useState(135);
  const [sheenCoords, setSheenCoords] = useState({ x: 50, y: 50 });

  // Spring physics for smooth tilt
  const mouseX = useSpring(0, { stiffness: 320, damping: 24 });
  const mouseY = useSpring(0, { stiffness: 320, damping: 24 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) - 0.5;
      const normY = (y / rect.height) - 0.5;

      mouseX.set(normX);
      mouseY.set(normY);

      // Angle of light from cursor to center
      const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI) + 90;
      setSheenAngle(angle);
      setSheenCoords({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    },
    [isMobile, mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverStart?.();
  }, [onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    onHoverEnd?.();
  }, [mouseX, mouseY, onHoverEnd]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        position: 'relative',
        perspective: 1200,
        height: '100%',
      }}
      className={className}
    >
      <motion.div
        style={{
          position: 'relative',
          height: '100%',
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: isHovered && !isMobile ? -6 : 0,
          scale: isHovered && !isMobile ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      >
        {/* Holographic Border Glow following Cursor */}
        <div
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: '18px',
            background: isHovered
              ? `radial-gradient(380px circle at ${sheenCoords.x}% ${sheenCoords.y}%, rgba(212, 175, 55, 0.42), rgba(255, 232, 133, 0.2) 25%, transparent 65%)`
              : 'transparent',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'background 0.15s ease',
          }}
        />

        {/* Card Main Body */}
        <div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: '16px',
            background: 'linear-gradient(150deg, rgba(20, 24, 32, 0.92) 0%, rgba(10, 13, 18, 0.98) 100%)',
            border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.55)' : 'rgba(212, 175, 55, 0.22)'}`,
            boxShadow: isHovered
              ? '0 20px 48px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 28px rgba(212, 175, 55, 0.22)'
              : '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
            zIndex: 2,
          }}
        >
          {/* Directional Vector Sheen Highlight Beam */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: isHovered ? 1 : 0,
              background: `linear-gradient(${sheenAngle}deg, transparent 15%, rgba(212, 175, 55, 0.15) 38%, rgba(255, 248, 220, 0.45) 50%, rgba(212, 175, 55, 0.15) 62%, transparent 85%)`,
              mixBlendMode: 'screen',
              transition: 'opacity 0.25s ease',
              zIndex: 10,
            }}
          />

          {/* Subtiler radialer Glanzfokus am Cursor */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: isHovered ? 0.35 : 0,
              background: `radial-gradient(circle at ${sheenCoords.x}% ${sheenCoords.y}%, rgba(255, 255, 255, 0.7) 0%, rgba(212, 175, 55, 0.25) 30%, transparent 60%)`,
              mixBlendMode: 'overlay',
              transition: 'opacity 0.2s ease',
              zIndex: 11,
            }}
          />

          {children}
        </div>
      </motion.div>
    </div>
  );
}
