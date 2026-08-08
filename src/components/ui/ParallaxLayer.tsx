'use client';
import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  layer?: 0 | 1 | 2 | 3;
  sensitivity?: number;
  className?: string;
  style?: React.CSSProperties;
  enableTilt?: boolean;
}

/**
 * ParallaxLayer - Premium 3D parallax wrapper component
 *
 * Wraps any content with mouse-reactive parallax movement.
 * Higher layers move faster for depth perception.
 *
 * @param layer - Depth level (0=background, 3=foreground)
 * @param sensitivity - Movement multiplier (0.1-1.0)
 * @param enableTilt - Adds 3D tilt effect on mouse movement
 *
 * @example
 * ```tsx
 * <ParallaxLayer layer={2} sensitivity={0.5} enableTilt>
 *   <Card />
 * </ParallaxLayer>
 * ```
 */
export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  layer = 0,
  sensitivity = 0.5,
  className,
  style,
  enableTilt = false,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2 * sensitivity * (layer + 1);
      const y = (e.clientY / innerHeight - 0.5) * 2 * sensitivity * (layer + 1);

      mouseX.set(x);
      mouseY.set(y);

      if (enableTilt) {
        rotateX.set(-y * 2);
        rotateY.set(x * 2);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [layer, sensitivity, mouseX, mouseY, enableTilt, rotateX, rotateY]);

  return (
    <motion.div
      className={className}
      style={{
        x: smoothX,
        y: smoothY,
        rotateX: enableTilt ? rotateX : undefined,
        rotateY: enableTilt ? rotateY : undefined,
        transformStyle: enableTilt ? 'preserve-3d' : undefined,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};
