'use client';

import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useCallback, useRef } from 'react';
import type { CanvasMode } from '../_lib/canvasMode';
import type { FieldHandle } from './CrashField';
import { useWebGLRecovery } from './useWebGLRecovery';
import { useParticleProfile } from './useParticleProfile';
import CrashField from './CrashField';

const PARTICLE_SIZE = 3.2;

interface ParticleStageProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  fieldRef: { current: FieldHandle | null };
  onPrimed: () => void;
}

export default function ParticleStage({
  mode,
  onModeChange,
  fieldRef,
  onPrimed,
}: ParticleStageProps) {
  const profile = useParticleProfile();
  const primed = useRef(false);

  const handleContextLost = useCallback(() => onModeChange('disabled'), [onModeChange]);
  const handlePrimed = useCallback(() => {
    if (primed.current) return;
    primed.current = true;
    onPrimed();
  }, [onPrimed]);

  if (!profile) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, profile.dprCap]}
        frameloop={mode === 'static' ? 'demand' : 'always'}
        camera={{ position: [0, 0, 11], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <RecoveryBridge onContextLost={handleContextLost} />
        <CrashField
          ref={(handle) => {
            fieldRef.current = handle;
          }}
          count={profile.count}
          dprCap={profile.dprCap}
          size={PARTICLE_SIZE}
          onPrimed={handlePrimed}
        />
        {profile.bloom ? (
          <EffectComposer>
            <Bloom intensity={0.85} luminanceThreshold={0.32} luminanceSmoothing={0.2} mipmapBlur />
          </EffectComposer>
        ) : null}
      </Canvas>
    </div>
  );
}

function RecoveryBridge({ onContextLost }: { onContextLost: () => void }) {
  useWebGLRecovery(onContextLost);
  return null;
}
