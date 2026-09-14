'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { HeroScrollyStage } from '@/components/home/hero-scrolly/HeroScrollyStage';
import { ArcadeHeroCell, BentoArcadeDeferredCells } from '@/components/home/bento/BentoArcadeCells';
import { bentoRootVars } from '@/components/home/bento/bento-lobby-tokens';

const LiveHighlightStream = dynamic(
  () =>
    import('@/components/home/bento/LiveHighlightStream').then((mod) => mod.LiveHighlightStream),
  { ssr: false },
);
const BentoJackpotCell = dynamic(
  () => import('@/components/home/bento/BentoJackpotCells').then((mod) => mod.BentoJackpotCell),
  { ssr: false },
);
const PlatformStatsCell = dynamic(
  () => import('@/components/home/bento/BentoJackpotCells').then((mod) => mod.PlatformStatsCell),
  { ssr: false },
);
const TournamentPodiumStrip = dynamic(
  () => import('@/components/home/bento/BentoStripCells').then((mod) => mod.TournamentPodiumStrip),
  { ssr: false },
);
const VipTimelineStrip = dynamic(
  () => import('@/components/home/bento/BentoStripCells').then((mod) => mod.VipTimelineStrip),
  { ssr: false },
);
const LobbyAmbientBackground = dynamic(
  () =>
    import('@/components/home/LobbyAmbientBackground').then((mod) => mod.LobbyAmbientBackground),
  { ssr: false },
);
const LiveActivityFeedV2 = dynamic(
  () => import('@/components/social/LiveActivityFeedV2').then((mod) => mod.LiveActivityFeedV2),
  { ssr: false },
);

/**
 * Bento-Mosaic-Grid: Desktop/Mobile teilen sich dieselbe 4-Spalten-Matrix;
 * Zellen spannen sich selbst (Hero 2x2, Satelliten 1x1, Stream 2x2,
 * Jackpot/Stats je 2x1, Streifen full-span). Bei <=1023px kollabiert die
 * Matrix auf 2 Spalten und jede Mehrfach-Zelle auf 2 Spalten Span, der
 * DOM-Stack entspricht der Mobile-Reihenfolge aus 03-frontend-lobby §5.3.
 */
const MOBILE_BREAKPOINT = '(max-width: 1023px)';

function subscribeToMobileViewport(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

function getMobileFirstServerSnapshot() {
  return true;
}

function mosaicGridStyle(isMobile: boolean): React.CSSProperties {
  return {
    position: 'relative',
    zIndex: 5,
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
    gridAutoRows: 'minmax(140px, auto)',
    gridAutoFlow: 'row dense',
    gap: isMobile ? '10px' : '16px',
    maxWidth: '1560px',
    margin: isMobile ? '0 auto' : '-60px auto 0',
    padding: isMobile ? '0 10px 32px' : '0 24px 48px',
  };
}

/**
 * Bento-Lobby-Komposition (03-frontend-lobby L6): Hero + Mosaik-Zellen +
 * eigenständiger Live-Activity-Feed. Geteilt zwischen der Live-Lobby
 * (HomeClientV2) und der Test-/Redesignseite (/testing/lobby-bento).
 */
export function BentoLobbyHome() {
  // Render mobile during SSR and the hydration pass; the actual media query then promotes
  // wider viewports without shifting the mobile first paint.
  const isMobile = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getMobileFirstServerSnapshot,
  );
  const [shouldRenderDeferredContent, setShouldRenderDeferredContent] = useState(false);

  useEffect(() => {
    void trackAllowedEvent({ name: 'landing_viewed' });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      const revealAfterScroll = () => setShouldRenderDeferredContent(true);
      window.addEventListener('scroll', revealAfterScroll, { once: true, passive: true });
      return () => window.removeEventListener('scroll', revealAfterScroll);
    }

    const scheduleIdleCallback = window.requestIdleCallback;
    if (typeof scheduleIdleCallback === 'function') {
      const idleCallbackId = scheduleIdleCallback(() => setShouldRenderDeferredContent(true), {
        timeout: 3_000,
      });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timer = window.setTimeout(() => setShouldRenderDeferredContent(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main
      className="vibe-mesh"
      style={{
        ...(bentoRootVars as React.CSSProperties),
        paddingBottom: '80px',
        minHeight: '100dvh',
        position: 'relative',
      }}
    >
      {shouldRenderDeferredContent && <LobbyAmbientBackground backgroundVariant="parallax" />}

      {/* Awwwards-Level GSAP Scrollytelling Hero Stage (Seamless Morph into Bento) */}
      <HeroScrollyStage isMobile={isMobile} />

      {/* Bento-Mosaik (alles unterhalb des Heroes) */}
      <div style={mosaicGridStyle(isMobile)}>
        <ArcadeHeroCell isMobile={isMobile} />
        {shouldRenderDeferredContent && <BentoArcadeDeferredCells isMobile={isMobile} />}
        {/* Unified Live Stage (2/3) & Live Progressive Jackpot (1/3) Row (full width 1 / -1) */}
        {shouldRenderDeferredContent && (
          <div
            style={{
              gridColumn: '1 / -1',
              gridRow: 'span 1',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: isMobile ? '10px' : '16px',
              alignItems: 'stretch',
            }}
          >
            {/* Live-Auszahlungen 3D Spiral Stage (2/3 width) */}
            <div
              style={{
                gridColumn: isMobile ? 'span 1' : 'span 8',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minWidth: 0,
              }}
            >
              <LiveHighlightStream />
            </div>

            {/* Live Progressive Jackpot (1/3 width) */}
            <div
              style={{
                gridColumn: isMobile ? 'span 1' : 'span 4',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minWidth: 0,
              }}
            >
              <BentoJackpotCell isMobile={isMobile} />
            </div>
          </div>
        )}

        {/* Platform Trust Stats: Frameless directly on canvas background across 1 / -1 */}
        {shouldRenderDeferredContent && <PlatformStatsCell isMobile={isMobile} />}

        {/* Tägliches Turnier with full Leaderboard Podium Avatars */}
        {shouldRenderDeferredContent && <TournamentPodiumStrip isMobile={isMobile} />}
        {shouldRenderDeferredContent && <VipTimelineStrip isMobile={isMobile} />}
      </div>

      {/* Live Activity Feed bleibt eigenständig outside the mosaic (echte Daten);
          gleiche Maximalbreite wie das Mosaik, damit er Mittig ausgerichtet ist. */}
      <div
        style={{
          width: '100%',
          maxWidth: '1560px',
          margin: '0 auto',
          padding: isMobile ? '0 10px' : '0 24px',
        }}
      >
        {shouldRenderDeferredContent && <LiveActivityFeedV2 isMobile={isMobile} />}
      </div>
    </main>
  );
}
