'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCasinoStore } from '@/store/useCasinoStore';
import { soundManager } from '@/lib/casino/sound-manager';
import { FloatingParticles } from '@/components/home/hero-cinematic';
import { HeroHeadlineColumn } from '@/components/home/hero-cinematic/HeroHeadlineColumn';
import { HeroScrollyPortalVisual } from './HeroScrollyPortalVisual';
import { HeroCenterCinema } from './HeroCenterCinema';
import { HeroMorphCurtain } from './HeroMorphCurtain';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroScrollyStageProps {
  isMobile: boolean;
}

/**
 * HeroScrollyStage: Awwwards-caliber Scrollytelling Hero section.
 * - Desktop: Sticky scroll track (140vh) with GSAP ScrollTrigger scrub,
 *   avoiding React 19 DOM reparenting issues (no pin-spacer).
 *   3D portal expansion, live cinema theater, headline depth-drift, and seamless morph transition into Section 2.
 * - Mobile: Fluid, unpinned responsive stage with full text visibility and zero cutoff.
 */
export function HeroScrollyStage({ isMobile }: HeroScrollyStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headlineColRef = useRef<HTMLDivElement>(null);
  const cinemaRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const [isDesktopPortalReady, setIsDesktopPortalReady] = useState(false);
  const handleDesktopPortalReady = useCallback(() => setIsDesktopPortalReady(true), []);

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

      // 1. Headline Column: depth blur, slight scale down and gentle upward drift
      if (headlineColRef.current) {
        tl.to(
          headlineColRef.current,
          {
            y: -70,
            opacity: 0,
            scale: 0.95,
            filter: 'blur(10px)',
            ease: 'power2.out',
            duration: 0.55,
          },
          0,
        );
      }

      // 2. Center Cinema: scale down and fade gracefully
      if (cinemaRef.current) {
        tl.to(
          cinemaRef.current,
          {
            y: -50,
            opacity: 0,
            scale: 0.92,
            filter: 'blur(10px)',
            ease: 'power2.out',
            duration: 0.55,
          },
          0,
        );
      }

      // 3. Royal Stargate Seal: rotates faster and flares outward
      if (sealRef.current) {
        tl.to(
          sealRef.current,
          {
            scale: 1.45,
            rotation: '+=90',
            opacity: 0.95,
            ease: 'power1.out',
            duration: 1,
          },
          0,
        );
      }

      // 4. 3D Quantum Ace Card: flies forward in 3D camera space towards the user
      if (cardRef.current) {
        tl.to(
          cardRef.current,
          {
            scale: 1.35,
            y: -20,
            filter:
              'drop-shadow(0 35px 60px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 50px rgba(212, 175, 55, 0.7))',
            ease: 'power2.out',
            duration: 0.75,
          },
          0,
        );
      }

      // 5. Luminous Gold Mist: expands softly
      if (fogRef.current) {
        tl.to(
          fogRef.current,
          {
            opacity: 1,
            scaleY: 1.8,
            y: -30,
            ease: 'power2.inOut',
            duration: 0.6,
          },
          0.35,
        );
      }

      // 6. Seamless Morph: Dissolve portal and sticky stage as Section 2 emerges
      if (portalRef.current) {
        tl.to(
          portalRef.current,
          {
            scale: 1.5,
            opacity: 0,
            filter: 'blur(16px)',
            ease: 'power2.in',
            duration: 0.3,
          },
          0.7,
        );
      }

      if (stickyRef.current) {
        tl.to(
          stickyRef.current,
          {
            opacity: 0,
            ease: 'power1.in',
            duration: 0.2,
          },
          0.8,
        );
      }
    }, trackRef);

    return () => ctx.revert();
  }, [isMobile, isDesktopPortalReady]);

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 'auto' : '140vh',
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
        {/* Ambient Floating Light Particles */}
        <FloatingParticles accentColor="#D4AF37" />

        {/* Main 3-Part Hero Stage Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            maxWidth: '1560px',
            width: '100%',
            margin: '0 auto',
            padding: isMobile ? '16px 16px 40px' : '20px 24px 44px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '20px' : '28px',
            overflow: 'visible',
          }}
        >
          {/* Left Column: Headline, CTAs, VIP Bonus Code & Trust Pills */}
          <div
            ref={headlineColRef}
            style={{
              width: isMobile ? '100%' : 'auto',
              flex: isMobile ? '1 1 auto' : '1 1 480px',
              maxWidth: isMobile ? '100%' : '520px',
            }}
          >
            <HeroHeadlineColumn isMobile={isMobile} onBonusActivate={handleBonusActivate} />
          </div>

          {/* Center Column: Luxury Live Highroller Cinema Theater Capsule */}
          {!isMobile && <HeroCenterCinema isMobile={isMobile} cinemaRef={cinemaRef} />}

          {/* Right Column: 3D Royal Stargate & Quantum Ace Card Portal */}
          <HeroScrollyPortalVisual
            isMobile={isMobile}
            portalRef={portalRef}
            cardRef={cardRef}
            sealRef={sealRef}
          />
        </div>

        {/* Bottom Morph Curtain: Soft Gold Light Veil into Section 2 */}
        <HeroMorphCurtain curtainRef={curtainRef} fogRef={fogRef} />
      </section>
    </div>
  );
}
