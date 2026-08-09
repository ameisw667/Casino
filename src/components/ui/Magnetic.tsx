'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Magnetic Wrapper - A premium interaction that "pulls" the element towards the cursor.
 *
 * Used for primary buttons and game tiles to make the UI feel reactive.
 */
interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.5,
  className,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    setPosition({ x: deltaX * strength, y: deltaY * strength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ display: 'inline-block', ...style }}
    >
      {children}
    </motion.div>
  );
};
