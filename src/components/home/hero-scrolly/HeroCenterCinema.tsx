'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface HeroCenterCinemaProps {
  isMobile: boolean;
  cinemaRef?: React.RefObject<HTMLDivElement | null>;
}

const HIGHLIGHT_CLIPS = [
  {
    title: 'CRASH ROCKET',
    tag: 'ORIGINALS',
    multiplier: '84.20x',
    user: 'Max_Highroller',
    win: '+$42,100',
    color: '#FF6B00',
    accentGrad: 'from-orange-500/20 via-amber-500/10 to-transparent',
  },
  {
    title: 'ROYAL ROULETTE',
    tag: 'LIVE TABLE',
    multiplier: '36.00x',
    user: 'GoldFinger_99',
    win: '+$18,000',
    color: '#D4AF37',
    accentGrad: 'from-yellow-500/20 via-amber-500/10 to-transparent',
  },
  {
    title: 'VIP BLACKJACK',
    tag: 'HIGH STAKES',
    multiplier: '2.50x',
    user: 'CyberBaron',
    win: '+$12,500',
    color: '#00E701',
    accentGrad: 'from-emerald-500/20 via-green-500/10 to-transparent',
  },
];

export function HeroCenterCinema({ isMobile, cinemaRef }: HeroCenterCinemaProps) {
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-cycle highlights every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveClipIndex((prev) => (prev + 1) % HIGHLIGHT_CLIPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Ambient soundwave / particle motion canvas inside video viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = (canvas.width = canvas.offsetWidth || 340);
      const h = (canvas.height = canvas.offsetHeight || 200);

      ctx.clearRect(0, 0, w, h);

      // Draw dynamic audio/quantum waveform
      const currentClip = HIGHLIGHT_CLIPS[activeClipIndex];
      const bars = 28;
      const barWidth = (w - 40) / bars;

      for (let i = 0; i < bars; i++) {
        const x = 20 + i * barWidth;
        const freq = Math.sin(t * 2 + i * 0.35) * Math.cos(t * 1.5 + i * 0.2);
        const barHeight = Math.max(8, Math.abs(freq) * (h * 0.45));
        const y = h / 2 - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.5, currentClip.color);
        grad.addColorStop(1, 'rgba(212, 175, 55, 0.1)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, Math.max(3, barWidth - 3), barHeight, 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeClipIndex]);

  const clip = HIGHLIGHT_CLIPS[activeClipIndex];

  if (isMobile) {
    return null; // Keep mobile focused and vertical without visual clutter
  }

  return (
    <div
      ref={cinemaRef}
      style={{
        position: 'relative',
        flex: '0 0 320px',
        width: '320px',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 5,
      }}
    >
      {/* Outer Volumetric Underglow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '240px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.03) 60%, transparent 80%)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main Luxury Curved Theater Capsule */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '20px',
          background:
            'linear-gradient(160deg, rgba(18, 22, 32, 0.85) 0%, rgba(11, 14, 20, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow:
            '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          padding: '12px',
        }}
      >
        {/* Top Header Bar inside Theater */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#00E701',
                boxShadow: '0 0 10px #00E701',
              }}
            />
            <span
              style={{
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              LIVE HIGHROLLER FEED
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(212, 175, 55, 0.12)',
                color: '#D4AF37',
                fontWeight: 800,
              }}
            >
              4K 60FPS
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsMuted(!isMuted);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title={isMuted ? 'Ton an' : 'Stumm'}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} color="#D4AF37" />}
            </button>
          </div>
        </div>

        {/* Video / Animated Simulation Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '160px',
            borderRadius: '12px',
            background: '#05070A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Audio / Energy Waveform Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.9,
            }}
          />

          {/* CRT / Holographic Scanline Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          />

          {/* Center Dynamic HUD Info */}
          <motion.div
            key={clip.title}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'relative',
              zIndex: 3,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.75)',
                border: `1px solid ${clip.color}`,
                fontSize: '0.62rem',
                fontWeight: 900,
                color: clip.color,
                letterSpacing: '0.05em',
              }}
            >
              <Flame size={10} />
              <span>{clip.tag}</span>
            </div>

            <div
              style={{
                fontSize: '1.4rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 1000,
                color: '#ffffff',
                textShadow: `0 0 20px ${clip.color}`,
                lineHeight: 1.1,
                marginTop: '4px',
              }}
            >
              {clip.multiplier}
            </div>

            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#00E701',
                textShadow: '0 0 10px rgba(0, 231, 1, 0.6)',
              }}
            >
              {clip.win} by {clip.user}
            </div>
          </motion.div>

          {/* Play Icon Corner Pulse */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={10} color="#D4AF37" style={{ marginLeft: '1px' }} />
          </div>
        </div>

        {/* Bottom Ticker & Provably Fair Proof */}
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 6px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            fontSize: '0.64rem',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} color="#00E701" />
            <span style={{ fontWeight: 800 }}>RTP 99.4% VERIFIED</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D4AF37' }}>
            <Sparkles size={11} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
              SEED #74F9A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
