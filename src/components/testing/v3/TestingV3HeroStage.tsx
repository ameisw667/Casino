'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';
import { TestingV3PortalCamera } from './TestingV3PortalCamera';
import { TestingV3ParticleVortex } from './TestingV3ParticleVortex';
import { TestingV3ShaderWarp } from './TestingV3ShaderWarp';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function TestingV3HeroStage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic values tracked for Particle Vortex and Shader Warp
  const progressRef = useRef(0);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const isFlippedRef = useRef(false);

  const [scrollPct, setScrollPct] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Smooth mouse tilt spring physics for interactive 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springRotateX = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const springRotateY = useSpring(mouseX, { stiffness: 60, damping: 20 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const normY = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      mouseX.set(normX * 18);
      mouseY.set(-normY * 18);
      mouseXRef.current = normX;
      mouseYRef.current = normY;
    },
    [mouseX, mouseY],
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    mouseXRef.current = 0;
    mouseYRef.current = 0;
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!trackRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            progressRef.current = p;
            setScrollPct(Math.round(p * 100));

            // Sync isFlipped flag smoothly around the 60% mark
            if (p >= 0.6 && !isFlippedRef.current) {
              isFlippedRef.current = true;
              setIsFlipped(true);
            } else if (p < 0.6 && isFlippedRef.current) {
              isFlippedRef.current = false;
              setIsFlipped(false);
            }
          },
        },
      });

      // =========================================================================
      // 1. Headline & Copy Fade Out & Ascend (0.0 -> 0.35)
      // =========================================================================
      if (headlineRef.current) {
        tl.to(
          headlineRef.current,
          {
            y: -90,
            opacity: 0,
            scale: 0.94,
            filter: 'blur(14px)',
            ease: 'power2.out',
            duration: 0.35,
          },
          0,
        );
      }

      // =========================================================================
      // 2. Portal Camera Container Centering (0.0 -> 0.45)
      // Smoothly shifts the right column to the absolute center of the viewport
      // =========================================================================
      if (portalContainerRef.current) {
        tl.to(
          portalContainerRef.current,
          {
            xPercent: -26,
            ease: 'power2.inOut',
            duration: 0.45,
          },
          0,
        );
      }

      // =========================================================================
      // 3. Layer 0 (Nebula): Deep Warp Expansion & Cosmic Atmosphere
      // =========================================================================
      if (nebulaRef.current) {
        tl.to(
          nebulaRef.current,
          {
            scale: 1.25,
            z: -250,
            opacity: 0.95,
            filter: 'brightness(1.2) contrast(1.1)',
            ease: 'power1.inOut',
            duration: 1,
          },
          0,
        );
      }

      // =========================================================================
      // 4. Layer 1 (Stargate Ring): Continuous Spin & Radiant Solar Corona
      // =========================================================================
      if (ringRef.current) {
        tl.to(
          ringRef.current,
          {
            scale: 1.35,
            rotation: '+=220',
            z: -40,
            opacity: 1,
            filter: 'drop-shadow(0 0 65px rgba(255, 223, 115, 0.75))',
            ease: 'power1.inOut',
            duration: 1,
          },
          0,
        );
      }

      // =========================================================================
      // 5. Layer 2 (Vortex Core): Singularity Core Expansion
      // =========================================================================
      if (coreRef.current) {
        tl.to(
          coreRef.current,
          {
            scale: 1.28,
            z: 40,
            opacity: 1,
            ease: 'power2.inOut',
            duration: 1,
          },
          0,
        );
      }

      // =========================================================================
      // 6. Layer 3 (Quantum Ace 180° Flip & Showcase Morph)
      // Phase 1 (0.0 -> 0.40): Frameless Floating Ace rises & focuses
      // Phase 2 (0.42 -> 0.58): 180° Y-rotation flipping into VIP Games & Showcase Deck
      // Phase 3 (0.58 -> 1.00): Majestic hold in the center stage through all showcase phases
      // =========================================================================
      if (cardRef.current) {
        tl.to(
          cardRef.current,
          {
            scale: 1.08,
            z: 50,
            ease: 'power1.out',
            duration: 0.38,
          },
          0,
        );

        tl.to(
          cardRef.current,
          {
            rotateY: 180,
            scale: 1.15,
            z: 80,
            ease: 'power2.inOut',
            duration: 0.22,
          },
          0.42,
        );
      }

      // Splitter Chips Orbit and Expansion
      if (chipsRef.current) {
        tl.to(
          chipsRef.current,
          {
            scale: 1.25,
            rotation: '+=60',
            opacity: 0.95,
            duration: 0.8,
            ease: 'power1.out',
          },
          0,
        );
      }
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={trackRef}
      data-scrolly-track="v3-hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '350vh', // 350vh Multi-stage Werbevideo Scrollytelling Track
        background: '#0B0E14',
      }}
    >
      {/* Dynamic SVG Filter Defs for Gravitational Lens Warp */}
      <TestingV3ShaderWarp />

      {/* Sticky Camera Viewport */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Interactive Canvas Particle Vortex Layer */}
        <TestingV3ParticleVortex
          progressRef={progressRef}
          mouseXRef={mouseXRef}
          mouseYRef={mouseYRef}
        />

        {/* Top Floating HUD: Telemetry & Quality Assurance Badges */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '32px',
            right: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(11, 14, 20, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#D4AF37',
                boxShadow: '0 0 10px #D4AF37',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#FFDF73',
                letterSpacing: '0.08em',
              }}
            >
              CASINO ROYALE · V3 LABORATORY PROTOTYPE
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                background: 'rgba(11, 14, 20, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.72rem',
                color: '#10B981',
                fontWeight: 700,
              }}
            >
              SCROLL PROGRESS: {scrollPct}%
            </div>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                background: 'rgba(11, 14, 20, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                backdropFilter: 'blur(12px)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.72rem',
                color: '#FFDF73',
                fontWeight: 700,
              }}
            >
              AWWWARDS PROTOTYPE
            </div>
          </div>
        </div>

        {/* Central Stage Layout: Split between Copy Narrative & 3D Depth Portal */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1440px',
            padding: '0 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            alignItems: 'center',
            gap: '40px',
            zIndex: 20,
          }}
        >
          {/* Left Column: Asymmetrical Editorial Narrative */}
          <div
            ref={headlineRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '560px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                width: 'fit-content',
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: '#FFDF73',
                  textTransform: 'uppercase',
                }}
              >
                PROVABLY FAIR 3.0 ECOSYSTEM
              </span>
            </div>

            <motion.h1
              whileHover={{ scale: 1.025, x: 6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.4rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                textShadow: '0 4px 24px rgba(0,0,0,0.85)',
                cursor: 'default',
                position: 'relative',
              }}
            >
              DAS QUANTUM <br />
              <motion.span
                whileHover={{
                  textShadow: '0 0 35px rgba(255, 223, 115, 0.9), 0 0 65px rgba(212, 175, 55, 0.6)',
                }}
                style={{
                  display: 'inline-block',
                  background:
                    'linear-gradient(135deg, #FFF9D2 0%, #FFDF73 35%, #D4AF37 70%, #996515 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transition: 'text-shadow 0.3s ease',
                }}
              >
                SINGULARITÄTS
              </motion.span>
              <br />
              PORTAL.
            </motion.h1>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.72)',
                maxWidth: '480px',
              }}
            >
              Erlebe kryptografisch verifizierte Spiele in unübertroffener 3D-Präzision. Scrolle
              tiefer, um den Gravitationswirbel zu durchqueren und nahtlos in die Live-Arena
              einzutauchen.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px' }}>
              <button
                onClick={() =>
                  window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' })
                }
                style={{
                  padding: '16px 28px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                  border: 'none',
                  color: '#0B0E14',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 12px 32px rgba(212, 175, 55, 0.35)',
                  transition: 'transform 0.2s ease',
                }}
              >
                PORTAL DURCHQUEREN
                <ArrowRight className="h-4 w-4" />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.78rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>100% Zero-Wallet Safe</span>
              </div>
            </div>
          </div>

          {/* Right Column: 2.5D Deep Parallax Portal Camera */}
          <div
            ref={portalContainerRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              willChange: 'transform',
            }}
          >
            <TestingV3PortalCamera
              nebulaRef={nebulaRef}
              ringRef={ringRef}
              coreRef={coreRef}
              cardRef={cardRef}
              chipsRef={chipsRef}
              rotateX={springRotateX}
              rotateY={springRotateY}
              isFlipped={isFlipped}
              scrollProgress={scrollPct / 100}
            />
          </div>
        </div>

        {/* Bottom Soft Scroll Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 30,
            opacity: Math.max(0, 1 - scrollPct / 30),
            transition: 'opacity 0.3s ease',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.68rem',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.15em',
            }}
          >
            SCROLL TO ENTER HYPERSPACE
          </span>
          <div
            style={{
              width: '2px',
              height: '24px',
              background: 'linear-gradient(to bottom, #D4AF37, transparent)',
              animation: 'bounce 1.8s infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}
