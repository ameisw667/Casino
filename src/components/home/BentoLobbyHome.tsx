'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCasinoStore } from '@/store/useCasinoStore';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { HeroCinematicShowcase } from '@/components/home/HeroCinematicShowcase';
import { BentoArcadeGroup } from '@/components/home/bento/BentoArcadeCells';
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
    margin: '0 auto',
    padding: isMobile ? '0 10px 32px' : '0 24px 48px',
  };
}

/**
 * Bento-Lobby-Komposition (03-frontend-lobby L6): Hero + Mosaik-Zellen +
 * eigenständiger Live-Activity-Feed. Geteilt zwischen der Live-Lobby
 * (HomeClientV2) und der Test-/Redesignseite (/testing/lobby-bento).
 */
export function BentoLobbyHome() {
  const startOnboarding = useCasinoStore((s) => s.startOnboarding);
  const allBets = useCasinoStore((s) => s.allBets);
  // ClientShell-Ausnahme: /testing/lobby-bento läuft im MainLayout-Shell-Kontext,
  // deshalb identisch zur echten Lobby (HomeClientV2) der store-Breakpoint.
  const isMobile = useCasinoStore((s) => s.isMobile);

  const liveWithdrawals = allBets
    .filter((b) => b.isWin)
    .slice(0, 5)
    .map((b) => ({ user: b.user, amount: b.payout }));

  useEffect(() => {
    void trackAllowedEvent({ name: 'landing_viewed' });
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
      <LobbyAmbientBackground backgroundVariant="parallax" />

      {/* Hero bleibt strukturell unverändert (bereits asymmetrisch, 3-Spalten) */}
      <HeroCinematicShowcase
        isMobile={isMobile}
        startOnboarding={startOnboarding}
        liveWithdrawals={liveWithdrawals}
      />

      {/* Bento-Mosaik (alles unterhalb des Heroes) */}
      <div style={mosaicGridStyle(isMobile)}>
        <BentoArcadeGroup isMobile={isMobile} />
        {/* Column-Richtung: GlassSurface ist sonst ein Flex-Child, das auf
            Content-Breite schrumpft — so füllt die Zelle die volle 2er-Spanne. */}
        <div
          style={{
            gridColumn: 'span 2',
            gridRow: 'span 2',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}
        >
          <LiveHighlightStream />
        </div>
        <BentoJackpotCell isMobile={isMobile} />
        <PlatformStatsCell isMobile={isMobile} />
        <TournamentPodiumStrip isMobile={isMobile} />
        <VipTimelineStrip isMobile={isMobile} />
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
        <LiveActivityFeedV2 isMobile={isMobile} />
      </div>
    </main>
  );
}
