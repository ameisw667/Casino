'use client';
import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleContainerProps {
  children: React.ReactNode;
  rippleColor?: string;
  rippleDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * RippleContainer - Material design ripple effect on click
 *
 * Creates expanding ripple waves from click position.
 * Works as a wrapper around any clickable content.
 */
export const RippleContainer: React.FC<RippleContainerProps> = ({
  children,
  rippleColor = 'hsla(var(--primary), 0.3)',
  rippleDuration = 600,
  className,
  style,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const createRipple = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = {
        id: Date.now(),
        x,
        y,
        size: 0,
      };

      setRipples((prev) => [...prev, ripple]);

      const maxSize = Math.max(rect.width, rect.height) * 1.5;

      requestAnimationFrame(() => {
        setRipples((prev) => prev.map((r) => (r.id === ripple.id ? { ...r, size: maxSize } : r)));
      });

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, rippleDuration);
    },
    [rippleDuration],
  );

  return (
    <div
      ref={containerRef}
      onClick={createRipple}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: rippleDuration / 1000, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            marginLeft: -ripple.size / 2,
            marginTop: -ripple.size / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rippleColor} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
};
