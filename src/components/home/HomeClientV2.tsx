'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useCasinoStore } from '@/store/useCasinoStore';
import { VibeMotion } from '@/components/ui/VibeMotion';
import { HeroCinematicShowcase } from '@/components/home/HeroCinematicShowcase';
import { InteractiveArcadeGrid } from '@/components/home/InteractiveArcadeGrid';

const LiveActivityFeedV2 = dynamic(
  () => import('@/components/social/LiveActivityFeedV2').then((mod) => mod.LiveActivityFeedV2),
  { ssr: false },
);
const LobbyAmbientBackground = dynamic(
  () =>
    import('@/components/home/LobbyAmbientBackground').then((mod) => mod.LobbyAmbientBackground),
  { ssr: false },
);
const ProgressiveJackpotSection = dynamic(
  () =>
    import('@/components/home/ProgressiveJackpotSection').then(
      (mod) => mod.ProgressiveJackpotSection,
    ),
  { ssr: false },
);
const DailyTournamentTeaser = dynamic(
  () => import('@/components/home/DailyTournamentTeaser').then((mod) => mod.DailyTournamentTeaser),
  { ssr: false },
);
const VipProgressTeaser = dynamic(
  () => import('@/components/home/VipProgressTeaser').then((mod) => mod.VipProgressTeaser),
  { ssr: false },
);

export function HomeClientV2() {
  const startOnboarding = useCasinoStore((s) => s.startOnboarding);
  const isMobile = useCasinoStore((s) => s.isMobile);
  const allBets = useCasinoStore((s) => s.allBets);

  const liveWithdrawals = allBets
    .filter((b) => b.isWin)
    .slice(0, 5)
    .map((b) => ({ user: b.user, amount: b.payout }));

  return (
    <main
      className="vibe-mesh"
      style={{ paddingBottom: '100px', minHeight: '100vh', position: 'relative' }}
    >
      {/* Global Ambient Background Stack (Liquid Glasswater + Gold Dust + Noise) */}
      <LobbyAmbientBackground />

      {/* 1. Hero Cinematic 3D Showcase */}
      <HeroCinematicShowcase
        isMobile={isMobile}
        startOnboarding={startOnboarding}
        liveWithdrawals={liveWithdrawals}
      />

      <div
        className="container"
        style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}
      >
        {/* 2. Interactive Arcade Game Cards Grid */}
        <VibeMotion variant="reveal" delay={0.2}>
          <InteractiveArcadeGrid isMobile={isMobile} />
        </VibeMotion>

        {/* 3. Progressive Jackpot & Platform Stats Grid */}
        <VibeMotion variant="reveal" delay={0.3}>
          <ProgressiveJackpotSection isMobile={isMobile} />
        </VibeMotion>

        {/* 4. $10,000 Daily Race / Tournament Teaser */}
        <VibeMotion variant="reveal" delay={0.4}>
          <DailyTournamentTeaser isMobile={isMobile} />
        </VibeMotion>

        {/* 5. VIP Tier Roadmap & Rakeback Teaser */}
        <VibeMotion variant="reveal" delay={0.5}>
          <VipProgressTeaser isMobile={isMobile} />
        </VibeMotion>

        {/* 6. Live Activity Feed V2 */}
        <VibeMotion variant="reveal" delay={0.6}>
          <LiveActivityFeedV2 />
        </VibeMotion>
      </div>
    </main>
  );
}
