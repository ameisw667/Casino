'use client';

import React, { useRef, useEffect } from 'react';

interface LiquidGoldChromeCanvasProps {
  isMobile?: boolean;
  className?: string;
  intensity?: number;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  varying vec2 v_uv;

  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_intensity;

  // Simplex 2D noise helpers
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Molten heightfield calculation
  float liquidHeight(vec2 p, float t, vec2 m) {
    vec2 uv = p;
    
    // Interactive mouse fluid attraction & ripple
    vec2 mouseDelta = uv - m;
    float mDist = length(mouseDelta);
    float mouseWave = sin(mDist * 18.0 - t * 2.8) * exp(-mDist * 4.5) * 0.18;
    
    // Multi-octave fluid flow (Domain warping)
    float q = snoise(uv * 1.6 + vec2(t * 0.12, t * 0.08));
    float r = snoise(uv * 2.2 + vec2(q, -q) + vec2(-t * 0.15, t * 0.1));
    
    float h = snoise(uv * 1.8 + vec2(r * 1.4, q * 1.2) + vec2(t * 0.05, -t * 0.07));
    h += 0.5 * snoise(uv * 3.6 + vec2(-r, q * 0.8) - vec2(t * 0.1, t * 0.12));
    
    return h * 0.5 + mouseWave;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv;
    p.x *= aspect;

    vec2 m = u_mouse;
    m.x *= aspect;

    float t = u_time * 0.55;

    // Finite difference for surface normal
    float eps = 0.008;
    float hC = liquidHeight(p, t, m);
    float hR = liquidHeight(p + vec2(eps, 0.0), t, m);
    float hU = liquidHeight(p + vec2(0.0, eps), t, m);

    vec3 normal = normalize(vec3((hC - hR) * 2.4, (hC - hU) * 2.4, eps));

    // Light source setup: key warm gold light from top-right + subtle fill light
    vec3 lightDir = normalize(vec3(0.5, 0.7, 0.6));
    vec3 lightDir2 = normalize(vec3(-0.6, -0.4, 0.5));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Diffuse shading
    float diff1 = max(dot(normal, lightDir), 0.0);
    float diff2 = max(dot(normal, lightDir2), 0.0) * 0.4;
    float diff = diff1 + diff2;

    // Specular highlight (Haute Horlogerie polished 24k gold reflection)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

    // Fresnel rim light (Liquid chrome edge sheen)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    // Obsidian & 24k Gold Color Palette
    // Base obsidian vacuum: #07090E to #0E121A
    vec3 obsidianBase = vec3(0.035, 0.043, 0.062);
    // Dark bronze/amber liquid body: #473212
    vec3 liquidBronze = vec3(0.28, 0.19, 0.07);
    // 24k Gold highlight crests: #D4AF37
    vec3 gold24k = vec3(0.831, 0.686, 0.216);
    // Radiant pale gold shine: #FFF3C4
    vec3 goldSpecular = vec3(1.0, 0.95, 0.78);

    // Height-based blending
    float blendVal = smoothstep(-0.4, 0.55, hC);
    vec3 surfaceColor = mix(obsidianBase, liquidBronze, blendVal * 0.75);
    surfaceColor = mix(surfaceColor, gold24k, pow(blendVal, 2.2) * 0.65);

    // Add lighting & specular sheen
    vec3 finalColor = surfaceColor * (0.55 + diff * 0.75);
    finalColor += goldSpecular * spec * 0.55;
    finalColor += gold24k * fresnel * 0.35;

    // Symmetrical vignette to keep center/Bento card zone ultra readable
    vec2 centerOffset = uv - vec2(0.5, 0.4);
    float vignette = 1.0 - dot(centerOffset, centerOffset) * 0.85;
    finalColor *= clamp(vignette, 0.15, 1.0);

    // Global ambient intensity scale
    finalColor *= u_intensity;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const LiquidGoldChromeCanvas: React.FC<LiquidGoldChromeCanvasProps> = ({
  isMobile = false,
  className = '',
  intensity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 1023px)').matches) return;
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', {
        powerPreference: 'low-power',
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
      }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext);

    if (!gl) return;

    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string) => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uIntensityLoc = gl.getUniformLocation(program, 'u_intensity');

    let targetX = 0.5;
    let targetY = 0.5;
    let smoothX = 0.5;
    let smoothY = 0.5;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25) * 0.75;
      const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      const h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = 1.0 - e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId: number;
    const startTime = performance.now();

    const render = () => {
      const elapsed = (performance.now() - startTime) * 0.001;
      const time = prefersReducedMotion ? 1.0 : elapsed;

      smoothX += (targetX - smoothX) * 0.05;
      smoothY += (targetY - smoothY) * 0.05;

      gl.uniform1f(uTimeLoc, time);
      gl.uniform2f(uMouseLoc, smoothX, smoothY);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uIntensityLoc, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    const start = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(render);
    };

    const stop = () => {
      cancelAnimationFrame(animId);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteProgram(program);
    };
  }, [isMobile, intensity]);

  if (
    isMobile ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches)
  ) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};
