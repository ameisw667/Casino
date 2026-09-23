export {
  advanceAndDrawParticles,
  applyTraumaShake,
  createExplosion,
  createTail,
  setupCanvasForFrame,
  updateAndDrawStarfield,
  type CanvasFrame,
  type ExplosionOptions,
  type StarfieldOptions,
  type TailOptions,
  type TailVariant,
  type TraumaShake,
} from './crash-loop-shared';

export {
  createExplosionParticles,
  createTailParticles,
  getExplosionParticleCount,
  getTailParticleCount,
  getTailParticleLimit,
  type RandomSource,
  type TailOrigin,
  type TailOriginResolver,
} from './particles-physics';

export {
  createDualNozzleOriginResolver,
  createSinglePointOriginResolver,
  getPositionalPan,
  getTailNozzles,
  type NozzlePair,
} from './tail-geometry';

export {
  decayShakeIntensity,
  getExplosionShakeIntensity,
  getShakeOffset,
  isShakeActive,
  type ShakeOffset,
} from './viewport-shake';

export {
  getCanvasBackingSize,
  needsBackingStoreUpdate,
  resolveDevicePixelRatio,
  type CanvasBackingSize,
} from './canvas-frame';
