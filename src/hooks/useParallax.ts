'use client';
import { useEffect, useState, useRef, useCallback } from 'react';

interface ParallaxPosition {
  x: number;
  y: number;
  layer: number;
}

interface UseParallaxOptions {
  sensitivity?: number;
  smoothing?: number;
  layers?: number[];
}

/**
 * useParallax Hook - Premium multi-layer parallax system
 *
 * Creates smooth, layered parallax effects based on mouse movement.
 * Each layer moves at a different speed for depth perception.
 *
 * @param sensitivity - How strongly the parallax responds (0.01-0.2)
 * @param smoothing - Interpolation factor for smooth animation (0.01-0.5)
 * @param layers - Array of layer indices to track
 *
 * @returns Object with position array and velocity getter
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const {
    sensitivity = 0.08,
    smoothing = 0.1,
    layers = [0, 1, 2, 3]
  } = options;

  const [position, setPosition] = useState<ParallaxPosition[]>(
    layers.map(layer => ({ x: 0, y: 0, layer }))
  );

  const targetPosition = useRef<ParallaxPosition[]>(
    layers.map(layer => ({ x: 0, y: 0, layer }))
  );
  const animationFrameRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Normalized coordinates (-1 to 1)
    const normalizedX = (clientX / innerWidth) * 2 - 1;
    const normalizedY = (clientY / innerHeight) * 2 - 1;

    // Calculate velocity for dynamic effects
    velocity.current = {
      x: clientX - lastMousePos.current.x,
      y: clientY - lastMousePos.current.y
    };
    lastMousePos.current = { x: clientX, y: clientY };

    // Set target positions for each layer
    targetPosition.current = layers.map(layer => ({
      x: normalizedX * sensitivity * (layer + 1) * 20,
      y: normalizedY * sensitivity * (layer + 1) * 20,
      layer
    }));
  }, [sensitivity, layers]);

  // Latest-ref indirection: the RAF loop calls through a ref instead of a
  // self-referencing const, since the recursive `requestAnimationFrame(animate)`
  // pattern trips react-hooks/immutability's "before declared" check. The ref
  // is written inside an effect, never during render (refs are effect-only).
  const animateRef = useRef<() => void>(() => {});

  useEffect(() => {
    animateRef.current = () => {
      setPosition(prev => prev.map((pos, i) => {
        const target = targetPosition.current[i];
        // Smooth interpolation (lerp)
        return {
          x: pos.x + (target.x - pos.x) * smoothing,
          y: pos.y + (target.y - pos.y) * smoothing,
          layer: pos.layer
        };
      }));
      animationFrameRef.current = requestAnimationFrame(() => animateRef.current());
    };
  }, [smoothing]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(() => animateRef.current());

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove]);

  // Get velocity for dynamic effects (blur on fast movement)
  const getVelocity = useCallback(() => {
    return Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
  }, []);

  return { position, getVelocity };
}
