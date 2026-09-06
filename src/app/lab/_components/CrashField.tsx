'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MorphField } from '../_lib/morphField';
import { buildChaosField, PLANE_HALF_HEIGHT, PLANE_HALF_WIDTH } from '../_lib/shapeTargets';
import { crashFieldVert } from './shaders/crashField.vert';
import { crashFieldFrag, GOLD_RGB, RED_RGB, WHITE_RGB } from './shaders/crashField.frag';

export interface FieldHandle {
  setTargetData(name: string, positions: Float32Array): void;
  driftTo(name: string): void;
  setPointerStrength(strength: number): void;
  setWager(active: boolean, momentum: number): void;
  pulseCashOut(): void;
  flashBust(): void;
}

export interface CrashFieldProps {
  count: number;
  dprCap: number;
  size: number;
  onPrimed?: () => void;
}

const POINTER_LERP = 0.16;
const STRENGTH_LERP = 0.08;
const ENERGY_DECAY_PER_S = 1.8;
const BUST_DECAY_PER_S = 1.1;
const POINTER_FORCE_BASE = 1.5;
const WAGER_POINTER_FORCE = 0.6;

const CrashField = forwardRef<FieldHandle, CrashFieldProps>(function CrashField(
  { count, dprCap, size, onPrimed },
  ref,
) {
  const targets = useRef(new Map<string, Float32Array>());
  const currentName = useRef('chaos');

  const pointer = useRef({ worldX: 0, worldY: 0, ndcX: 0, ndcY: 0, inited: false });
  const strength = useRef(0);
  const wager = useRef({ active: false, momentum: 0 });
  const energy = useRef(0);
  const bust = useRef(0);

  const rand = useMemo(() => {
    let state = (count * 2654435761) >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, [count]);

  const morph = useMemo(() => new MorphField(buildChaosField(count, rand)), [count, rand]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i += 1) seeds[i] = rand();
    g.setAttribute('position', new THREE.BufferAttribute(morph.sourceTarget, 3));
    g.setAttribute('aSource', new THREE.BufferAttribute(morph.sourceTarget, 3));
    g.setAttribute('aTarget', new THREE.BufferAttribute(morph.activeTarget, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    return g;
  }, [count, morph, rand]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: crashFieldVert,
        fragmentShader: crashFieldFrag,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uDrift: { value: 0.55 },
          uPointer: { value: new THREE.Vector3(0, 0, 0) },
          uPointerStrength: { value: 0 },
          uHold: { value: 0 },
          uEnergy: { value: 0 },
          uBust: { value: 0 },
          uMomentum: { value: 0 },
          uSize: { value: size },
          uPixelRatio: { value: Math.min(dprCap, 2) },
          uGold: { value: new THREE.Color(GOLD_RGB[0], GOLD_RGB[1], GOLD_RGB[2]) },
          uWhite: { value: new THREE.Color(WHITE_RGB[0], WHITE_RGB[1], WHITE_RGB[2]) },
          uRed: { value: new THREE.Color(RED_RGB[0], RED_RGB[1], RED_RGB[2]) },
        },
      }),
    [dprCap, size],
  );

  useEffect(() => {
    targets.current.set('chaos', new Float32Array(morph.activeTarget));
    onPrimed?.();
  }, [morph, onPrimed]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Pointer-Tracking global (Canvas ist pointer-events:none, nur Story interagiert).
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.ndcX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ndcY = -((event.clientY / window.innerHeight) * 2 - 1);
      if (!pointer.current.inited) {
        pointer.current.worldX = pointer.current.ndcX * PLANE_HALF_WIDTH * 1.05;
        pointer.current.worldY = pointer.current.ndcY * PLANE_HALF_HEIGHT;
        pointer.current.inited = true;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setTargetData(name, positions) {
        targets.current.set(name, positions);
        if (name === currentName.current) morph.beginMorphTo(positions);
      },
      driftTo(name) {
        const next = targets.current.get(name);
        if (!next) return;
        currentName.current = name;
        morph.beginMorphTo(next);
      },
      setPointerStrength(value) {
        strength.current = value;
      },
      setWager(active, momentum) {
        wager.current.active = active;
        wager.current.momentum = momentum;
      },
      pulseCashOut() {
        energy.current = 1;
      },
      flashBust() {
        bust.current = 1;
        wager.current.momentum = 0;
        wager.current.active = false;
      },
    }),
    [morph],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const uniforms = material.uniforms;
    uniforms.uTime.value += delta;

    const advanced = morph.advance(delta);
    uniforms.uMorph.value = advanced.morph;
    if (advanced.needsUpload) {
      const sourceAttr = geometry.getAttribute('aSource') as THREE.BufferAttribute;
      const targetAttr = geometry.getAttribute('aTarget') as THREE.BufferAttribute;
      sourceAttr.needsUpdate = true;
      targetAttr.needsUpdate = true;
    }

    const uPointer = uniforms.uPointer.value as THREE.Vector3;
    const targetX = pointer.current.ndcX * PLANE_HALF_WIDTH * 1.05;
    const targetY = pointer.current.ndcY * PLANE_HALF_HEIGHT;
    uPointer.x += (targetX - uPointer.x) * POINTER_LERP;
    uPointer.y += (targetY - uPointer.y) * POINTER_LERP;

    energy.current = Math.max(0, energy.current - delta * ENERGY_DECAY_PER_S);
    bust.current = Math.max(0, bust.current - delta * BUST_DECAY_PER_S);

    const desiredStrength =
      (wager.current.active ? WAGER_POINTER_FORCE : POINTER_FORCE_BASE) *
      (0.9 + strength.current * 1.4);
    uniforms.uPointerStrength.value +=
      (desiredStrength - uniforms.uPointerStrength.value) * STRENGTH_LERP;

    uniforms.uHold.value = wager.current.active
      ? 0.55 + 0.45 * Math.min(1, wager.current.momentum)
      : 0;
    uniforms.uMomentum.value = wager.current.active ? Math.min(1, wager.current.momentum) : 0;
    uniforms.uEnergy.value = energy.current;
    uniforms.uBust.value = bust.current;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
});

export default CrashField;
