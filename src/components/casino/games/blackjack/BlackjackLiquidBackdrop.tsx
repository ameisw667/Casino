'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface BlackjackLiquidBackdropProps {
  theme?: 'emerald' | 'obsidian' | 'burgundy';
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VERTEX_SHADER_SRC = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform vec3 uGoldColor;

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.12;

  // Domain warping for slow, heavy silk velvet liquid
  vec2 q = vec2(
    sin(uv.x * 2.8 + t * 0.6) * cos(uv.y * 2.2 + t * 0.4),
    cos(uv.x * 2.2 - t * 0.5) * sin(uv.y * 2.6 - t * 0.5)
  );

  vec2 r = vec2(
    sin(uv.x * 3.5 + q.x * 1.8 + t * 0.3),
    cos(uv.y * 3.5 + q.y * 1.8 + t * 0.25)
  );

  float flow = 0.5 + 0.5 * sin((uv.x + r.x * 0.25) * 3.14159 + t * 0.8);
  float goldDust = smoothstep(0.74, 0.79, sin(uv.x * 4.5 + uv.y * 3.8 + q.y * 2.8 + t * 0.5));

  vec3 col = mix(uBaseColor, uAccentColor, flow * 0.55);
  col = mix(col, uGoldColor, goldDust * 0.24);

  // Soft vignette
  float dist = length(uv - 0.5);
  float vig = smoothstep(1.15, 0.18, dist);
  col *= vig;

  gl_FragColor = vec4(col, 0.65);
}
`;

export function BlackjackLiquidBackdrop({
  theme = 'emerald',
  opacity = 0.45,
  className = '',
  style = {},
}: BlackjackLiquidBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = useReducedMotion();
  const isReduced = Boolean(prefersReduced);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isReduced) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        (canvas.getContext('webgl', {
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        }) as WebGLRenderingContext) ||
        (canvas.getContext('experimental-webgl', { alpha: true }) as WebGLRenderingContext);
    } catch {
      return;
    }

    if (!gl) {
      return;
    }

    // Compile helper
    const createShader = (type: number, src: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vert || !frag) {
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    // Quad geometry (full screen clip)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResLoc = gl.getUniformLocation(program, 'uResolution');
    const uBaseLoc = gl.getUniformLocation(program, 'uBaseColor');
    const uAccentLoc = gl.getUniformLocation(program, 'uAccentColor');
    const uGoldLoc = gl.getUniformLocation(program, 'uGoldColor');

    // Theme color palettes
    const palette =
      theme === 'emerald'
        ? {
            base: [0.03, 0.12, 0.07],
            accent: [0.06, 0.22, 0.14],
            gold: [0.83, 0.69, 0.22],
          }
        : theme === 'burgundy'
          ? {
              base: [0.15, 0.03, 0.05],
              accent: [0.26, 0.06, 0.09],
              gold: [0.83, 0.69, 0.22],
            }
          : {
              base: [0.05, 0.06, 0.08],
              accent: [0.09, 0.11, 0.14],
              gold: [0.83, 0.69, 0.22],
            };

    gl.uniform3f(uBaseLoc, palette.base[0], palette.base[1], palette.base[2]);
    gl.uniform3f(uAccentLoc, palette.accent[0], palette.accent[1], palette.accent[2]);
    gl.uniform3f(uGoldLoc, palette.gold[0], palette.gold[1], palette.gold[2]);

    let animationFrameId: number;
    let lastTime = performance.now();
    let totalTime = 0;
    const targetFpsInterval = 1000 / 30; // Max 30 FPS for minimal GPU budget (< 3% GPU)

    // Resize handler (render buffer at downscaled resolution for velvety blur + high perf)
    const handleResize = () => {
      if (!canvas || !gl) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(rect.width * 0.5 * dpr);
      const height = Math.floor(rect.height * 0.5 * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = Math.max(16, width);
        canvas.height = Math.max(16, height);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const delta = now - lastTime;
      if (delta >= targetFpsInterval) {
        lastTime = now - (delta % targetFpsInterval);
        totalTime += delta * 0.001;
        if (gl && uTimeLoc) {
          gl.uniform1f(uTimeLoc, totalTime);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [theme, isReduced]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      {/* 1. Base CSS Radial velvet fallback */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
          background:
            theme === 'emerald'
              ? 'radial-gradient(ellipse at 50% 30%, rgba(15, 56, 38, 0.4) 0%, rgba(10, 41, 27, 0.25) 60%, transparent 100%)'
              : 'radial-gradient(ellipse at 50% 30%, rgba(22, 24, 29, 0.4) 0%, transparent 100%)',
        }}
      />

      {/* 2. WebGL Liquid canvas */}
      {!isReduced && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity,
            mixBlendMode: 'screen',
            filter: 'blur(12px)',
          }}
        />
      )}
    </div>
  );
}
