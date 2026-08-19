'use client';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCasinoStore } from '@/store/useCasinoStore';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { VibeMotion } from '@/components/ui/VibeMotion';
import { HeroCinematicShowcase } from '@/components/home/HeroCinematicShowcase';
import { LiveHighrollerTickerBar } from '@/components/home/LiveHighrollerTickerBar';
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
const VipLiveStreamRail = dynamic(
  () => import('@/components/home/VipLiveStreamRail').then((mod) => mod.VipLiveStreamRail),
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

  useEffect(() => {
    void trackAllowedEvent({ name: 'landing_viewed' });
  }, []);

  return (
    <main
      className="vibe-mesh"
      style={{ paddingBottom: '80px', minHeight: '100vh', position: 'relative' }}
    >
      {/* Global Ambient Background Stack (Liquid Glasswater + Gold Dust + Noise) */}
      <LobbyAmbientBackground />

      {/* Option 3: Collapsible VIP Live Stream Right Rail */}
      <VipLiveStreamRail />

      {/* 1. Hero Cinematic 3D Showcase (Option 1: 3-Column Architecture on 1560px Canvas) */}
      <HeroCinematicShowcase
        isMobile={isMobile}
        startOnboarding={startOnboarding}
        liveWithdrawals={liveWithdrawals}
      />

      {/* 2. Live Highroller & Payout Ticker Bar */}
      <VibeMotion variant="reveal" delay={0.15}>
        <LiveHighrollerTickerBar />
      </VibeMotion>

      <div
        className="container"
        style={{ width: '100%', maxWidth: '1560px', margin: '0 auto', padding: '0 24px' }}
      >
        {/* 3. Interactive Arcade Game Cards Grid (Option 2: 5-Column Scaled Layout on 1560px) */}
        <VibeMotion variant="reveal" delay={0.2}>
          <InteractiveArcadeGrid isMobile={isMobile} />
        </VibeMotion>

        {/* 4. Progressive Jackpot & Platform Stats Grid */}
        <VibeMotion variant="reveal" delay={0.3}>
          <ProgressiveJackpotSection isMobile={isMobile} />
        </VibeMotion>

        {/* 5. $10,000 Daily Race / Tournament Teaser */}
        <VibeMotion variant="reveal" delay={0.4}>
          <DailyTournamentTeaser isMobile={isMobile} />
        </VibeMotion>

        {/* 6. VIP Tier Roadmap & Rakeback Teaser */}
        <VibeMotion variant="reveal" delay={0.5}>
          <VipProgressTeaser isMobile={isMobile} />
        </VibeMotion>

        {/* 7. Live Activity Feed V2 */}
        <VibeMotion variant="reveal" delay={0.6}>
          <LiveActivityFeedV2 />
        </VibeMotion>
      </div>
    </main>
  );
}
