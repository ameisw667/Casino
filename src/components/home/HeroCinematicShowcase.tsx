'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCasinoStore } from '@/store/useCasinoStore';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import { soundManager } from '@/lib/casino/sound-manager';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';
import {
  FloatingParticles,
  HeroHeadlineColumn,
  JackpotPulseCard,
  GameShowcaseCard,
  GAME_TABS,
  type GameTabConfig,
} from './hero-cinematic';

interface Withdrawal {
  user: string;
  amount: number;
  currency?: string;
  game?: string;
  time?: string;
  avatar?: string;
}

interface HeroCinematicShowcaseProps {
  isMobile: boolean;
  startOnboarding: () => void;
  liveWithdrawals?: Withdrawal[];
}

export const HeroCinematicShowcase: React.FC<HeroCinematicShowcaseProps> = ({
  isMobile = false,
  startOnboarding: _startOnboarding,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const addToast = useCasinoStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState<GameTabConfig>(GAME_TABS[0]);

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

  // Live Multiplier Engine States
  const [crashMult, setCrashMult] = useState<number>(1.0);
  const [diceVal, setDiceVal] = useState<number>(24.12);
  const [slotsWon, setSlotsWon] = useState<boolean>(false);
  const { formatted: jackpotFormatted } = useProgressiveJackpot();

  // Scrolly-Telling Hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scrollCardTilt = useTransform(scrollYProgress, [0, 1], [0, 18]);

  // Smooth Spring Parallax 3D
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  const rotateXMouse = useSpring(targetY, { stiffness: 45, damping: 25 });
  const rotateYMouse = useSpring(targetX, { stiffness: 45, damping: 25 });

  const rotateXCombined = useTransform(
    [rotateXMouse, scrollCardTilt],
    ([mX, sTilt]) => (mX as number) + (sTilt as number),
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetX.set((x / (rect.width / 2)) * 14);
      targetY.set(-(y / (rect.height / 2)) * 14);
    },
    [isMobile, targetX, targetY],
  );

  const handleMouseLeave = useCallback(() => {
    targetX.set(0);
    targetY.set(0);
  }, [targetX, targetY]);

  // Live Multiplier Simulation Loop — skipped entirely on mobile: the states
  // it mutates (crashMult/diceVal/slotsWon) are only consumed by the
  // desktop-only holographic card, so on mobile every 800ms tick was a pure
  // re-render with no visible effect. Also pauses on hidden tabs for desktop.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) return;
    if (typeof document === 'undefined') return;
    let timer: ReturnType<typeof setInterval>;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        setCrashMult((prev) => {
          if (prev >= 6.5) return 1.0;
          return parseFloat((prev + Math.random() * 0.45 + 0.05).toFixed(2));
        });
        setDiceVal(parseFloat((Math.random() * 45 + 5).toFixed(2)));
        setSlotsWon(Math.random() > 0.5);
      }, 800);
    };
    const stop = () => clearInterval(timer);
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? 'auto' : '440px',
        overflow: 'hidden',
        background: 'transparent',
        borderRadius: 0,
        border: 'none',
        boxShadow: 'none',
        perspective: 1200,
        marginBottom: '0px',
      }}
    >
      {/* Ambient Floating Light Particles */}
      <FloatingParticles accentColor={activeTab.accentColor} />

      {/* Centered Golden Ratio 1560px 3-Column Layout Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          maxWidth: '1560px',
          margin: '0 auto',
          padding: isMobile ? '24px 16px 28px' : '28px 24px 32px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '24px' : '28px',
        }}
      >
        {/* Column 1 (Left): Headline, CTAs & Trust Metrics */}
        <HeroHeadlineColumn isMobile={isMobile} onBonusActivate={handleBonusActivate} />

        {/* Column 2 (Center): Live Progressive Jackpot Pulse & VIP Radar (Option 1) */}
        {!isMobile && <JackpotPulseCard jackpotFormatted={jackpotFormatted} />}

        {/* Column 3 (Right): Frameless Floating Live Game Showcase Sandbox */}
        {!isMobile && (
          <GameShowcaseCard
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            crashMult={crashMult}
            diceVal={diceVal}
            slotsWon={slotsWon}
            rotateXCombined={rotateXCombined}
            rotateYMouse={rotateYMouse}
          />
        )}
      </div>
    </motion.section>
  );
};
