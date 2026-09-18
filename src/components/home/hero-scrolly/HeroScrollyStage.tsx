'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCasinoStore } from '@/store/useCasinoStore';
import { soundManager } from '@/lib/casino/sound-manager';
import { FloatingParticles } from '@/components/home/hero-cinematic';
import { HeroHeadlineColumn } from '@/components/home/hero-cinematic/HeroHeadlineColumn';
import { HeroFloatingCosmos } from './HeroFloatingCosmos';
import { HeroMultiplierEditorial } from './HeroMultiplierEditorial';
import { HeroScrollyPortalVisual } from './HeroScrollyPortalVisual';
import { HeroMorphCurtain } from './HeroMorphCurtain';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroScrollyStageProps {
  isMobile: boolean;
}

/**
 * HeroScrollyStage: Phase 6 — 5-Hebel Awwwards Evolution
 * - Hebel 1: Kinetische 3D-Highroller-Multiplikator-Stelen (30%–75% linke Seite)
 * - Hebel 2: Gravitations-Orbits mit Lichtschweif & Z-Tiefe für 4 Satelliten
 * - Hebel 3: Dynamische Kamerafahrt mit Zentrierungs-Drift (x: -14vw) für das Stargate
 * - Hebel 4: Kinetischer Gold-Aurora-Nebel im Tiefenraum
 * - Hebel 5: Parallax-Lift & Gold-Bodennebel in Sektion 2
 */
export function HeroScrollyStage({ isMobile }: HeroScrollyStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headlineColRef = useRef<HTMLDivElement>(null);
  const portalZoneRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);

  // Hebel 1: 3D-Highroller Stelen Refs
  const editorialRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLSpanElement>(null);
  const cashoutRef = useRef<HTMLSpanElement>(null);
  const rtpRef = useRef<HTMLSpanElement>(null);

  // 3D-Spatial Satellites
  const cosmosRef = useRef<HTMLDivElement>(null);
  const magicianRef = useRef<HTMLDivElement>(null);
  const jetRef = useRef<HTMLDivElement>(null);
  const diceRef = useRef<HTMLDivElement>(null);
  const luckySevenRef = useRef<HTMLDivElement>(null);

  const [portalReady, setPortalReady] = useState(false);
  const handlePortalReady = useCallback(() => {
    setPortalReady(true);
  }, []);

  const router = useRouter();
  const addToast = useCasinoStore((s) => s.addToast);

  const handleBonusActivate = async () => {
    soundManager.playClick();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText('VIPPRO');
        addToast('Code VIPPRO kopiert! Leite weiter zum Vault...', 'info');
      }
    } catch {
      // ignore clipboard error
    }
    router.push('/vault?code=VIPPRO');
  };

  useEffect(() => {
    if (isMobile || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const scroller = trackRef.current?.closest('#main-scroll-container') || undefined;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // 1. Initial Left Headline Column: Stays visible & drifts gently, then fades cleanly at 18%-32%
      if (headlineColRef.current) {
        tl.to(
          headlineColRef.current,
          {
            y: -50,
            scale: 0.96,
            ease: 'power1.out',
            duration: 0.22,
          },
          0,
        );

        tl.to(
          headlineColRef.current,
          {
            y: -80,
            opacity: 0,
            filter: 'blur(14px)',
            ease: 'power2.in',
            duration: 0.12,
          },
          0.18,
        );
      }

      // 2. Hebel 1: Kinetische 3D-Highroller Multiplikator-Stelen (28% - 68% linke Seite)
      if (editorialRef.current) {
        // Rise and shine into view between 26% and 42%
        tl.fromTo(
          editorialRef.current,
          {
            opacity: 0,
            y: 70,
            scale: 0.9,
            filter: 'blur(12px)',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            ease: 'power2.out',
            duration: 0.2,
          },
          0.26,
        );

        // Counter scrubbing for numbers: 500x multiplier counter effect (26% bis 60%)
        if (multiplierRef.current) {
          const countObj = { val: 100 };
          tl.to(
            countObj,
            {
              val: 500,
              ease: 'power1.out',
              duration: 0.32,
              onUpdate: () => {
                if (multiplierRef.current) {
                  multiplierRef.current.innerText = Math.round(countObj.val).toString();
                }
              },
            },
            0.26,
          );
        }

        // Dissolve steles as we transition towards Section 2 (78% - 92%)
        tl.to(
          editorialRef.current,
          {
            opacity: 0,
            y: -50,
            filter: 'blur(18px)',
            ease: 'power2.in',
            duration: 0.14,
          },
          0.78,
        );
      }

      // 3. Spatial 3D Cosmos Satellites with non-linear cosmic escape trajectories:
      // Satellit 1: Magier (über der H1)
      if (magicianRef.current) {
        tl.to(
          magicianRef.current,
          {
            y: -110,
            x: 60,
            scale: 1.22,
            rotation: 15,
            ease: 'power2.out',
            duration: 0.8,
          },
          0,
        );
        tl.to(
          magicianRef.current,
          {
            opacity: 0,
            filter: 'blur(16px)',
            ease: 'power2.in',
            duration: 0.15,
          },
          0.8,
        );
      }

      // Satellit 2: Crash Quantum Jet (mittig oben)
      if (jetRef.current) {
        tl.to(
          jetRef.current,
          {
            x: 180,
            y: -120,
            scale: 1.35,
            rotation: -28,
            z: 180,
            ease: 'power2.out',
            duration: 0.8,
          },
          0,
        );
        tl.to(
          jetRef.current,
          {
            opacity: 0,
            filter: 'blur(16px)',
            ease: 'power2.in',
            duration: 0.15,
          },
          0.8,
        );
      }

      // Satellit 3: Quantum Gold Würfel (rechts oben)
      if (diceRef.current) {
        tl.to(
          diceRef.current,
          {
            y: -100,
            x: 70,
            scale: 1.25,
            rotation: '+=320',
            ease: 'power2.out',
            duration: 0.8,
          },
          0,
        );
        tl.to(
          diceRef.current,
          {
            opacity: 0,
            filter: 'blur(16px)',
            ease: 'power2.in',
            duration: 0.15,
          },
          0.8,
        );
      }

      // Satellit 4: 3D Lucky Seven & Dice (Flanke rechts)
      if (luckySevenRef.current) {
        tl.to(
          luckySevenRef.current,
          {
            y: -80,
            x: -40,
            scale: 1.22,
            rotation: -24,
            ease: 'power2.out',
            duration: 0.8,
          },
          0,
        );
        tl.to(
          luckySevenRef.current,
          {
            opacity: 0,
            filter: 'blur(16px)',
            ease: 'power2.in',
            duration: 0.15,
          },
          0.8,
        );
      }

      // 4. Hebel 3: Dynamische Kamerafahrt mit Zentrierungs-Drift für den gesamten Portal-Container!
      if (portalZoneRef.current) {
        tl.to(
          portalZoneRef.current,
          {
            x: '-14vw',
            ease: 'power1.inOut',
            duration: 0.8,
          },
          0.15,
        );
      }

      // 5. Right Monumental Stargate Seal: Dreht sich wie ein mächtiges Tresorrad um die Z-Achse
      if (sealRef.current) {
        tl.to(
          sealRef.current,
          {
            scale: 1.85,
            rotation: '+=420',
            ease: 'power1.inOut',
            duration: 0.82,
          },
          0,
        );
        tl.to(
          sealRef.current,
          {
            opacity: 0,
            filter: 'blur(20px)',
            ease: 'power2.in',
            duration: 0.16,
          },
          0.82,
        );
      }

      // 6. Portal Anchor: Zoomt vorwärts
      if (portalRef.current) {
        tl.to(
          portalRef.current,
          {
            scale: 1.25,
            z: 100,
            ease: 'power1.out',
            duration: 0.82,
          },
          0,
        );

        // Soft dissolve into Section 2
        tl.to(
          portalRef.current,
          {
            scale: 1.4,
            opacity: 0,
            filter: 'blur(18px)',
            ease: 'power2.in',
            duration: 0.16,
          },
          0.82,
        );
      }

      // 7. 3D Quantum Ace Card: Flies forward towards the viewer with heavy depth shadow
      if (cardRef.current) {
        tl.to(
          cardRef.current,
          {
            scale: 1.5,
            y: -25,
            filter:
              'drop-shadow(0 40px 80px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 60px rgba(212, 175, 55, 0.85))',
            ease: 'power2.out',
            duration: 0.75,
          },
          0,
        );
        tl.to(
          cardRef.current,
          {
            opacity: 0,
            filter: 'blur(20px)',
            ease: 'power2.in',
            duration: 0.22,
          },
          0.75,
        );
      }

      // 8. Hebel 4 & 5: Luminous Gold Mist Diffusion & Soft atmospheric morphing
      if (fogRef.current) {
        tl.to(
          fogRef.current,
          {
            opacity: 1,
            scaleY: 2.4,
            y: -50,
            ease: 'power2.inOut',
            duration: 0.35,
          },
          0.45,
        );
      }

      // 9. Sticky Stage Fade Out into Bento Section 2 (fließender Übergang bei 88%-100%)
      if (stickyRef.current) {
        tl.to(
          stickyRef.current,
          {
            opacity: 0,
            ease: 'power2.in',
            duration: 0.12,
          },
          0.88,
        );
      }
    }, trackRef);

    return () => ctx.revert();
  }, [isMobile, portalReady]);

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 'auto' : '135vh',
        zIndex: 6,
      }}
    >
      <section
        ref={stickyRef}
        style={{
          position: isMobile ? 'relative' : 'sticky',
          top: 0,
          width: '100%',
          height: isMobile ? 'auto' : '100vh',
          maxHeight: isMobile ? 'none' : '900px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'transparent',
          overflow: 'visible',
        }}
      >
        {/* Hebel 4: Kinetische Gold-Aurora & Ambient Floating Light Particles */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            width: '90vw',
            maxWidth: '1200px',
            height: '650px',
            transform: 'translate(-50%, -30%)',
            background:
              'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(212, 175, 55, 0.14) 0%, rgba(212, 175, 55, 0.03) 55%, transparent 80%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <FloatingParticles accentColor="#D4AF37" />

        {/* Hebel 2: 3D-Floating Cosmos Satellites across the entire stage */}
        <HeroFloatingCosmos
          isMobile={isMobile}
          magicianRef={magicianRef}
          jetRef={jetRef}
          diceRef={diceRef}
          luckySevenRef={luckySevenRef}
          containerRef={cosmosRef}
        />

        {/* Main Organic Hero Stage Container (Asymmetric Dual-Zone) */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            maxWidth: '1560px',
            width: '100%',
            margin: '0 auto',
            padding: isMobile ? '16px 16px 40px' : '20px 32px 48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '24px' : '48px',
            overflow: 'visible',
          }}
        >
          {/* Left Zone: Primary Headline & Bonus Container AND Hebel 1 Stelen */}
          <div
            style={{
              position: 'relative',
              width: isMobile ? '100%' : 'auto',
              flex: isMobile ? '1 1 auto' : '1 1 580px',
              maxWidth: isMobile ? '100%' : '640px',
              overflow: 'visible',
            }}
          >
            <div ref={headlineColRef}>
              <HeroHeadlineColumn isMobile={isMobile} onBonusActivate={handleBonusActivate} />
            </div>

            {/* Hebel 1: Kinetische Highroller-Multiplikator-Stelen (Awwwards-Editorial) */}
            {!isMobile && (
              <HeroMultiplierEditorial
                containerRef={editorialRef}
                multiplierRef={multiplierRef}
                cashoutRef={cashoutRef}
                rtpRef={rtpRef}
              />
            )}
          </div>

          {/* Right Zone: Monumental 3D Royal Stargate & Quantum Ace Card mit Hebel 3 Kamerafahrt */}
          <div
            ref={portalZoneRef}
            style={{
              position: 'relative',
              flex: isMobile ? '1 1 auto' : '1 1 520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-end',
              overflow: 'visible',
              willChange: 'transform',
            }}
          >
            <HeroScrollyPortalVisual
              isMobile={isMobile}
              portalRef={portalRef}
              cardRef={cardRef}
              sealRef={sealRef}
              onEnhancedPortalReady={handlePortalReady}
            />
          </div>
        </div>

        {/* Hebel 5: Bottom Morph Curtain: Soft Gold Light Veil into Section 2 */}
        <HeroMorphCurtain curtainRef={curtainRef} fogRef={fogRef} />
      </section>
    </div>
  );
}
