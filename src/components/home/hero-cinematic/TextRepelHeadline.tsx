'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TextRepelHeadlineProps {
  isMobile: boolean;
}

interface CharOffset {
  x: number;
  y: number;
}

const LINE_1 = 'NEXT LEVEL';
const LINE_2 = 'VIP CASINO.';

export function TextRepelHeadline({ isMobile }: TextRepelHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const [offsets, setOffsets] = useState<Record<string, CharOffset>>({});
  const letterRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLHeadingElement>) => {
      if (isMobile) return;

      const cursorX = e.clientX;
      const cursorY = e.clientY;
      const radius = 90;
      const maxDisplacement = 18;
      const nextOffsets: Record<string, CharOffset> = {};

      letterRefs.current.forEach((el, key) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const dx = charCenterX - cursorX;
        const dy = charCenterY - cursorY;
        const dist = Math.hypot(dx, dy);

        if (dist < radius && dist > 0) {
          const power = Math.pow(1 - dist / radius, 1.6);
          const angle = Math.atan2(dy, dx);
          nextOffsets[key] = {
            x: Math.cos(angle) * power * maxDisplacement,
            y: Math.sin(angle) * power * maxDisplacement,
          };
        } else {
          nextOffsets[key] = { x: 0, y: 0 };
        }
      });

      setOffsets(nextOffsets);
    },
    [isMobile],
  );

  const handlePointerLeave = useCallback(() => {
    setOffsets({});
  }, []);

  const renderChar = (char: string, key: string, isGoldLine: boolean) => {
    if (char === ' ') {
      return (
        <span key={key} style={{ display: 'inline-block', width: '0.3em' }}>
          &nbsp;
        </span>
      );
    }

    const offset = offsets[key] || { x: 0, y: 0 };

    return (
      <motion.span
        key={key}
        ref={(el) => {
          if (el) letterRefs.current.set(key, el);
          else letterRefs.current.delete(key);
        }}
        animate={{
          x: offset.x,
          y: offset.y,
          scale: offset.x !== 0 || offset.y !== 0 ? 1.08 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 24,
          mass: 0.5,
        }}
        style={{
          display: 'inline-block',
          willChange: 'transform',
          userSelect: 'none',
          ...(isGoldLine
            ? {
                background:
                  'linear-gradient(135deg, #FFFFFF 0%, #F8E7A2 25%, #D4AF37 55%, #8B6508 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 25px rgba(212, 175, 55, 0.4)',
              }
            : {
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }),
        }}
      >
        {char}
      </motion.span>
    );
  };

  return (
    <h1
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        fontSize: isMobile ? '2.1rem' : '3.3rem',
        fontWeight: 1000,
        letterSpacing: '-0.03em',
        lineHeight: 1.04,
        margin: 0,
        marginBottom: isMobile ? '10px' : '14px',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'block' }}>
        {LINE_1.split('').map((char, i) => renderChar(char, `l1-${i}`, false))}
      </div>
      <div style={{ display: 'block' }}>
        {LINE_2.split('').map((char, i) => renderChar(char, `l2-${i}`, true))}
      </div>
    </h1>
  );
}
