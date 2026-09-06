'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { CanvasMode } from '../_lib/canvasMode';

export function useWebGLRecovery(onContextLost: (mode: CanvasMode) => void): void {
  const { gl, invalidate } = useThree();
  const reported = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      if (!reported.current) {
        reported.current = true;
        onContextLost('disabled');
      }
    };
    const onRestored = (event: Event) => {
      event.preventDefault();
      reported.current = false;
      invalidate();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl, invalidate, onContextLost]);
}
