'use client';

import { useEffect, useState, type RefObject } from 'react';
import dynamic from 'next/dynamic';

const HeroScrollyDesktopPortalVisual = dynamic(() => import('./HeroScrollyDesktopPortalVisual'), {
  ssr: false,
});

interface HeroScrollyPortalVisualProps {
  isMobile: boolean;
  portalRef?: RefObject<HTMLDivElement | null>;
  cardRef?: RefObject<HTMLDivElement | null>;
  sealRef?: RefObject<HTMLDivElement | null>;
  orbitClusterRef?: RefObject<HTMLDivElement | null>;
  onEnhancedPortalReady?: () => void;
}

function MobilePortalInitial({
  isMobile,
  portalRef,
}: Pick<HeroScrollyPortalVisualProps, 'isMobile' | 'portalRef'>) {
  return (
    <div
      ref={portalRef}
      className="hero-scrolly-portal-initial"
      style={{
        position: 'relative',
        width: isMobile ? '100%' : '380px',
        maxWidth: '100%',
        height: isMobile ? '340px' : '460px',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        borderRadius: '32px',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        background:
          'radial-gradient(circle at 50% 38%, rgba(212, 175, 55, 0.22), transparent 34%), linear-gradient(145deg, rgba(28, 31, 42, 0.96), rgba(7, 9, 14, 0.98))',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 24px 54px rgba(0, 0, 0, 0.48)',
      }}
    >
      <div
        aria-hidden
        style={{
          width: isMobile ? '174px' : '224px',
          height: isMobile ? '244px' : '314px',
          display: 'grid',
          placeItems: 'center',
          border: '2px solid rgba(248, 231, 162, 0.76)',
          borderRadius: '24px',
          color: '#F8E7A2',
          fontSize: isMobile ? '5.4rem' : '7.2rem',
          fontFamily: 'Georgia, serif',
          fontWeight: 900,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(212,175,55,0.14))',
          boxShadow: '0 0 0 11px rgba(212, 175, 55, 0.08), 0 20px 40px rgba(0, 0, 0, 0.52)',
        }}
      >
        A♠
      </div>
      <span
        style={{
          position: 'absolute',
          bottom: '20px',
          padding: '6px 12px',
          borderRadius: '999px',
          border: '1px solid rgba(212, 175, 55, 0.38)',
          background: 'rgba(7, 9, 14, 0.72)',
          color: '#D4AF37',
          fontSize: '0.64rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
        }}
      >
        PROVABLY FAIR
      </span>
    </div>
  );
}

export function HeroScrollyPortalVisual({
  isMobile,
  portalRef,
  cardRef,
  sealRef,
  orbitClusterRef,
  onEnhancedPortalReady,
}: HeroScrollyPortalVisualProps) {
  const [shouldRenderDesktopPortal, setShouldRenderDesktopPortal] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const updatePortalMode = () => setShouldRenderDesktopPortal(desktopQuery.matches);
    updatePortalMode();
    desktopQuery.addEventListener('change', updatePortalMode);
    return () => desktopQuery.removeEventListener('change', updatePortalMode);
  }, []);

  if (!shouldRenderDesktopPortal) {
    return <MobilePortalInitial isMobile={isMobile} portalRef={portalRef} />;
  }

  return (
    <HeroScrollyDesktopPortalVisual
      isMobile={isMobile}
      portalRef={portalRef}
      cardRef={cardRef}
      sealRef={sealRef}
      orbitClusterRef={orbitClusterRef}
      onReady={onEnhancedPortalReady}
    />
  );
}
