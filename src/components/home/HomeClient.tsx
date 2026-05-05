'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Users,
  Target
} from 'lucide-react';
import { 
  HeroSection, 
  FeaturedOffers, 
  TrustBar, 
  DailyBonusLadder, 
  GoldenPath, 
  WeeklyRewards 
} from '@/components/home';
import { LiveActivityFeed } from '@/components/social/LiveActivityFeed';
import { useCasinoStore } from '@/store/useCasinoStore';
const FEATURED_GAMES = [
  { 
    id: 'crash', 
    name: 'CRASH', 
    path: '/games/crash', 
    image: '/images/game-crash-new.png',
    color: '#FF3366',
    tag: 'HOT',
    task: 'Reach 100x multiplier',
    reward: '$250.00',
    difficulty: 'Hard'
  },
  { 
    id: 'dice', 
    name: 'DICE', 
    path: '/games/dice', 
    image: '/images/game-dice-new.png',
    color: '#FFD700',
    tag: 'NEW',
    task: 'Win 10 bets in a row',
    reward: '$50.00',
    difficulty: 'Medium'
  },
  { 
    id: 'roulette', 
    name: 'ROULETTE', 
    path: '/games/roulette', 
    image: '/images/game-roulette-new.png',
    color: '#00E701',
    tag: 'POPULAR',
    task: 'Hit Green 3 times',
    reward: '$500.00',
    difficulty: 'Legendary'
  }
];
export function HomeClient() {
  const { startOnboarding, isMobile, allBets } = useCasinoStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [lastPayoutTime, setLastPayoutTime] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
    setLastPayoutTime(Date.now());
  }, []);
  if (!isLoaded) return null;
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      style={{ paddingBottom: '100px' }}
    >
      <HeroSection 
        startOnboarding={startOnboarding}
        isMobile={isMobile}
        liveWithdrawals={allBets.filter(b => b.isWin).slice(0, 5).map(b => ({ user: b.user, amount: b.payout }))}
      />

      
      <TrustBar totalPaid={2500000} timeToReward="2.5m" />
      <FeaturedOffers featuredGames={FEATURED_GAMES} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '32px', marginTop: '64px' }}>
        <DailyBonusLadder isMobile={isMobile} startOnboarding={startOnboarding} ladderSteps={[]} />
        <WeeklyRewards />
      </div>
      <div style={{ marginTop: '64px' }}>
        <GoldenPath isMobile={isMobile} lastPayoutTime={lastPayoutTime} />
      </div>
      <div style={{ marginTop: '64px' }}>
        <LiveActivityFeed />
      </div>
      
      {/* Trust Badges */}
      <section style={{ 
        marginTop: 'clamp(64px, 10vw, 120px)', 
        padding: 'clamp(24px, 5vw, 64px)', 
        background: 'hsla(var(--bg-card), 0.5)', 
        borderRadius: 'clamp(24px, 4vw, 48px)',
        border: '1px solid hsla(var(--primary), 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'clamp(32px, 5vw, 64px)',
        textAlign: 'center',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'hsla(var(--success), 0.1)', border: '1px solid hsla(var(--success), 0.2)' }}>
            <ShieldCheck size={32} color="hsl(var(--success))" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: '8px' }}>PROVABLY FAIR</div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6 }}>100% Verifiable Outcomes via Cryptographic Seeds</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', border: '1px solid hsla(var(--primary), 0.2)' }}>
            <Zap size={32} color="hsl(var(--primary))" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: '8px' }}>INSTANT PAYOUTS</div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6 }}>Lightning-Fast Withdrawals directly to your Vault</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'hsla(var(--secondary), 0.1)', border: '1px solid hsla(var(--secondary), 0.2)' }}>
            <Users size={32} color="hsl(var(--secondary))" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: '8px' }}>24/7 SUPPORT</div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6 }}>Professional Assistance whenever you need help</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', background: 'hsla(var(--accent), 0.1)', border: '1px solid hsla(var(--accent), 0.2)' }}>
            <Target size={32} color="hsl(var(--accent))" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: '8px' }}>VIP PROGRAM</div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6 }}>Exclusive Perks, Rakeback & Personal Managers</div>
          </div>
        </div>
      </section>

    </motion.main>
  );
}