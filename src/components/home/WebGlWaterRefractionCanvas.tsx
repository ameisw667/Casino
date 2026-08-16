'use client';
import React, { useRef, useEffect } from 'react';

interface WebGlWaterRefractionCanvasProps {
  isMobile?: boolean;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;

  void main() {
    // 100% Full-Width Aspect-Ratio Object-Fit Cover Mapping (16:9 texture)
    vec2 ratio = vec2(
      min((u_resolution.x / u_resolution.y) / (16.0 / 9.0), 1.0),
      min((u_resolution.y / u_resolution.x) / (9.0 / 16.0), 1.0)
    );
    vec2 st = vec2(
      v_uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      v_uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    
    vec2 mouse = u_mouse * 0.5 + 0.5;
    mouse.y = 1.0 - mouse.y;
    
    float dist = distance(st, mouse);
    
    // Calm Luxury Obsidian Satin Dynamics (Smooth, wide-angle silk waves)
    float wave1 = sin(st.x * 6.0 + u_time * 0.6) * cos(st.y * 5.0 + u_time * 0.5) * 0.0022;
    float wave2 = sin(st.x * 8.0 - u_time * 0.8) * sin(st.y * 7.0 + u_time * 0.7) * 0.0012;
    
    // Refined Fluid Mouse Refraction Impulse (Gentle, elegant displacement without warping)
    float mouseDistort = exp(-dist * 5.5) * sin(dist * 12.0 - u_time * 1.8) * 0.0038;
    
    vec2 waterOffset = vec2(wave1 + mouseDistort, wave2 + mouseDistort * 0.85);
    
    vec4 texColor = texture2D(u_texture, st + waterOffset);
    
    // Subtle Gold Specular Shimmer
    float caustic = sin((st.x + waterOffset.x) * 14.0 + u_time * 0.9) * 
                    cos((st.y + waterOffset.y) * 14.0 + u_time * 0.9);
    caustic = pow(max(0.0, caustic), 3.0) * 0.02;
    
    vec3 finalColor = texColor.rgb + vec3(caustic * 0.9, caustic * 0.8, caustic * 0.5);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const WebGlWaterRefractionCanvas: React.FC<WebGlWaterRefractionCanvasProps> = ({
  isMobile = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Sync device gate: bail on mobile BEFORE any WebGL init. The store-driven
    // `isMobile` flips asynchronously after the first render (MainLayout effect),
    // so without this guard the effect would boot a full WebGL context on the
    // very first paint of every mobile visit before the store catches up.
    if (window.matchMedia('(max-width: 1023px)').matches) return;
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl') ||
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

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
    const uTexLoc = gl.getUniformLocation(program, 'u_texture');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');

    const texture = gl.createTexture();
    const image = new window.Image();
    image.src = '/images/hero_vip_artwork.jpg';

    let isTextureLoaded = false;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      isTextureLoaded = true;
    };

    let targetX = 0;
    let targetY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      const h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      targetX = x * 2 - 1;
      targetY = -(y * 2 - 1);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      const time = (performance.now() - startTime) * 0.001;

      smoothX += (targetX - smoothX) * 0.08;
      smoothY += (targetY - smoothY) * 0.08;

      gl.uniform1f(uTimeLoc, time);
      gl.uniform2f(uMouseLoc, smoothX, smoothY);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);

      if (isTextureLoaded) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

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

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      gl.deleteProgram(program);
      gl.deleteTexture(texture);
    };
  }, [isMobile]);

  if (
    isMobile ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches)
  ) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
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
