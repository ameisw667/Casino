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
    vec2 st = v_uv;
    
    vec2 mouse = u_mouse * 0.5 + 0.5;
    mouse.y = 1.0 - mouse.y;
    
    float dist = distance(st, mouse);
    
    // Organic Fluid Water Surface Physics
    float wave1 = sin(st.x * 14.0 + u_time * 1.6) * cos(st.y * 12.0 + u_time * 1.3) * 0.007;
    float wave2 = sin(st.x * 22.0 - u_time * 2.2) * sin(st.y * 20.0 + u_time * 1.9) * 0.0035;
    
    // Smooth Water Refraction Impulse (Zero dots, zero stroked circles)
    float mouseDistort = exp(-dist * 3.8) * sin(dist * 26.0 - u_time * 4.8) * 0.014;
    
    vec2 waterOffset = vec2(wave1 + mouseDistort, wave2 + mouseDistort * 0.85);
    
    vec4 texColor = texture2D(u_texture, st + waterOffset);
    
    // Subtle Liquid Specular Shimmer
    float caustic = sin((st.x + waterOffset.x) * 28.0 + u_time * 2.2) * 
                    cos((st.y + waterOffset.y) * 28.0 + u_time * 2.2);
    caustic = pow(max(0.0, caustic), 3.0) * 0.07;
    
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
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.parentElement.clientWidth * dpr;
      canvas.height = canvas.parentElement.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x >= -0.2 && x <= 1.2 && y >= -0.2 && y <= 1.2) {
        targetX = x * 2 - 1;
        targetY = -(y * 2 - 1);
      }
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

      if (isTextureLoaded) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTexLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
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
