'use client';
import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { useCasinoStore } from '@/store/useCasinoStore';
import { VibeMotion } from '@/components/ui/VibeMotion';

const LiveActivityFeedV2 = dynamic(() => import('@/components/social/LiveActivityFeedV2').then(mod => mod.LiveActivityFeedV2), { ssr: false });

export function HomeClientV2() {
  const startOnboarding = useCasinoStore(s => s.startOnboarding);
  const isMobile = useCasinoStore(s => s.isMobile);
  const allBets = useCasinoStore(s => s.allBets);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="vibe-mesh"
      style={{ paddingBottom: '100px', minHeight: '100vh' }}
    >
      {/* Hero - compact, no duplicate trust elements */}
      <HeroSection
        startOnboarding={startOnboarding}
        isMobile={isMobile}
        liveWithdrawals={allBets.filter(b => b.isWin).slice(0, 5).map(b => ({ user: b.user, amount: b.payout }))}
      />

      <div className="container">
        {/* Live Activity Feed - throttled to max 1 update per minute */}
        <VibeMotion variant="reveal" delay={0.3} style={{ marginTop: '48px' }}>
          <LiveActivityFeedV2 />
        </VibeMotion>
      </div>
    </motion.main>
  );
}
