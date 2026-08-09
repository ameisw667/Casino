'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Star, ShieldCheck, Zap, Flame, Play, Sparkles, Coins, Users, Crown } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';
import { soundManager } from '@/lib/casino/sound-manager';
import { useIsNarrowViewport } from '@/hooks/useIsNarrowViewport';
import dynamic from 'next/dynamic';

const WebGlWaterRefractionCanvas = dynamic(
  () =>
    import('@/components/home/WebGlWaterRefractionCanvas').then(
      (m) => m.WebGlWaterRefractionCanvas,
    ),
  { ssr: false },
);

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

interface GameTabConfig {
  id: string;
  name: string;
  badge: string;
  maxPayout: string;
  path: string;
  image: string;
  accentColor: string;
  simType: 'crash' | 'blackjack' | 'dice' | 'roulette' | 'slots';
}

const GAME_TABS: GameTabConfig[] = [
  {
    id: 'crash',
    name: 'CRASH ROCKET',
    badge: 'HOT ORIGINALS',
    maxPayout: '10,000x',
    path: '/games/crash',
    image: '/images/game-crash-new.png',
    accentColor: '#FF4500',
    simType: 'crash',
  },
  {
    id: 'blackjack',
    name: 'VIP BLACKJACK',
    badge: 'HIGH STAKES',
    maxPayout: '2.5x',
    path: '/games/blackjack',
    image: '/images/game-roulette-new.png',
    accentColor: '#D4AF37',
    simType: 'blackjack',
  },
  {
    id: 'dice',
    name: 'ULTIMATE DICE',
    badge: 'PROVABLY FAIR',
    maxPayout: '990x',
    path: '/games/dice',
    image: '/images/game-dice-new.png',
    accentColor: '#00E701',
    simType: 'dice',
  },
  {
    id: 'roulette',
    name: 'ROYALE ROULETTE',
    badge: 'CLASSIC',
    maxPayout: '36x',
    path: '/games/roulette',
    image: '/images/game-roulette-new.png',
    accentColor: '#9370DB',
    simType: 'roulette',
  },
  {
    id: 'slots',
    name: 'NEON 777 SLOTS',
    badge: 'JACKPOT',
    maxPayout: '5,000x',
    path: '/games/slots',
    image: '/images/lucky-777-neon-3d.png',
    accentColor: '#FF007F',
    simType: 'slots',
  },
];

const DEFAULT_TICKER_WINS: Withdrawal[] = [
  {
    user: 'Satoshi_X',
    amount: 1450.0,
    currency: 'BTC',
    game: 'Crash',
    time: '2s ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Satoshi_X',
  },
  {
    user: 'CryptoKing',
    amount: 820.5,
    currency: 'ETH',
    game: 'Blackjack',
    time: '5s ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing',
  },
  {
    user: 'WhaleWatcher',
    amount: 3100.0,
    currency: 'USDT',
    game: 'Slots',
    time: '8s ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WhaleWatcher',
  },
  {
    user: 'LuckyStrike',
    amount: 490.0,
    currency: 'SOL',
    game: 'Dice',
    time: '12s ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuckyStrike',
  },
];

const FLOATING_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (i * 19) % 100,
  y: (i * 29) % 100,
  size: (i % 4) + 2,
  duration: 6 + (i % 5),
  delay: (i % 3) * 0.8,
}));

export const HeroCinematicShowcase: React.FC<HeroCinematicShowcaseProps> = ({
  isMobile = false,
  startOnboarding,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isNarrowViewport = useIsNarrowViewport();
  const [activeTab, setActiveTab] = useState<GameTabConfig>(GAME_TABS[0]);
  const [tickerIndex, setTickerIndex] = useState<number>(0);

  // Live Multiplier Engine States
  const [crashMult, setCrashMult] = useState<number>(1.0);
  const [diceVal, setDiceVal] = useState<number>(24.12);
  const [slotsWon, setSlotsWon] = useState<boolean>(false);

  // Scrolly-Telling Hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scrollDarkOverlay = useTransform(scrollYProgress, [0, 0.8], [0, 0.6]);
  const scrollCardTilt = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const scrollBgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.0]);

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

  // Live Ticker Interval — pauses when the tab is hidden so backgrounded
  // visits stop driving setState/re-render churn. Optics unchanged while visible.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let timer: ReturnType<typeof setInterval>;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % DEFAULT_TICKER_WINS.length);
      }, 3500);
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

  const activeWin = DEFAULT_TICKER_WINS[tickerIndex];

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
        minHeight: isMobile ? 'auto' : '620px',
        overflow: 'hidden',
        background: '#040406',
        borderRadius: isMobile ? '0' : '28px',
        border: `1px solid ${activeTab.accentColor}30`,
        boxShadow: `0 30px 90px -20px rgba(0, 0, 0, 0.95), 0 0 50px ${activeTab.accentColor}10`,
        perspective: 1200,
        marginBottom: '40px',
        transition: 'border 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Deep Dark Obsidian VIP Background Layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          scale: scrollBgScale,
        }}
      >
        <Image
          src="/images/hero_vip_artwork.jpg"
          alt="VIP Casino Background"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.9,
            filter: 'contrast(1.15) brightness(0.85)',
          }}
        />
        {/* Scrim Overlay for Perfect Text Contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
            linear-gradient(to right, #040406 0%, rgba(4,4,6,0.85) 45%, rgba(4,4,6,0.5) 75%, rgba(4,4,6,0.85) 100%),
            linear-gradient(to bottom, rgba(4,4,6,0.3) 0%, #040406 100%)
          `,
            transition: 'background 0.5s ease',
          }}
        />
      </motion.div>

      {/* WebGL Smooth Fluid Water Refraction Shader — the component itself
          already renders null below the 1023px breakpoint (matchMedia guard
          inside WebGlWaterRefractionCanvas), so skipping the mount here too
          is a pure bytes-saving change with 0 visual difference: not
          mounting it never fetches its next/dynamic chunk on narrow
          viewports instead of fetching-then-discarding it. */}
      {!isNarrowViewport && <WebGlWaterRefractionCanvas isMobile={isMobile} />}

      {/* Scrolly-Telling Darken Overlay Fade */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: '#040406',
          opacity: scrollDarkOverlay,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Floating Light Particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        {FLOATING_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: activeTab.accentColor,
              boxShadow: `0 0 12px ${activeTab.accentColor}`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.85, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Right Column: 3D Holographic Card Stack */}
      {!isMobile && (
        <motion.div
          style={{
            position: 'absolute',
            right: '4%',
            top: '50%',
            translateY: '-50%',
            rotateX: rotateXCombined,
            rotateY: rotateYMouse,
            transformStyle: 'preserve-3d',
            zIndex: 4,
            width: '460px',
            height: '490px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Stack Layer 3 */}
          <div
            style={{
              position: 'absolute',
              width: '390px',
              height: '420px',
              borderRadius: '24px',
              background: 'rgba(15, 15, 20, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transform: 'translateZ(-60px) translateY(24px) scale(0.88)',
              filter: 'blur(3px)',
              pointerEvents: 'none',
            }}
          />

          {/* Stack Layer 2 */}
          <div
            style={{
              position: 'absolute',
              width: '420px',
              height: '450px',
              borderRadius: '24px',
              background: 'rgba(20, 20, 26, 0.7)',
              border: `1px solid ${activeTab.accentColor}30`,
              transform: 'translateZ(-30px) translateY(12px) scale(0.94)',
              filter: 'blur(1px)',
              pointerEvents: 'none',
            }}
          />

          {/* Main Active Holographic Showcase Card */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              border: `1px solid ${activeTab.accentColor}60`,
              background:
                'linear-gradient(145deg, rgba(22, 22, 30, 0.92) 0%, rgba(10, 10, 15, 0.98) 100%)',
              backdropFilter: 'blur(24px)',
              padding: '20px',
              boxShadow: `0 30px 80px rgba(0,0,0,0.9), 0 0 50px ${activeTab.accentColor}30`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              transform: 'translateZ(10px)',
            }}
          >
            {/* Top Interactive Game Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflowX: 'auto',
              }}
            >
              {GAME_TABS.map((tab) => {
                const isActive = activeTab.id === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTab(tab);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: isActive ? tab.accentColor : 'transparent',
                      color: isActive ? '#000' : 'rgba(255, 255, 255, 0.65)',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.id.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Live Card Header Badges */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
              }}
            >
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${activeTab.accentColor}40`,
                  color: activeTab.accentColor,
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                }}
              >
                {activeTab.badge}
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#00E701',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  background: 'rgba(0, 231, 1, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 231, 1, 0.2)',
                }}
              >
                <Users size={12} /> 1,420 ONLINE
              </div>
            </div>

            {/* Active Game Center Stage */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  margin: '8px 0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={activeTab.image}
                  alt={activeTab.name}
                  fill
                  sizes="450px"
                  style={{ objectFit: 'cover' }}
                />

                {/* Live Simulation Overlay Badge */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '16px',
                  }}
                >
                  {activeTab.simType === 'crash' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Flame size={20} color="#FF4500" />
                      <div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 800,
                          }}
                        >
                          LIVE MULTIPLIKATOR
                        </div>
                        <div
                          style={{
                            fontSize: '1.6rem',
                            fontWeight: 1000,
                            color: '#FF4500',
                            fontFamily: 'monospace',
                            lineHeight: 1,
                          }}
                        >
                          {crashMult.toFixed(2)}x
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab.simType === 'dice' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={20} color="#00E701" />
                      <div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 800,
                          }}
                        >
                          TARGET &lt; 50.00
                        </div>
                        <div
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 1000,
                            color: '#00E701',
                            fontFamily: 'monospace',
                            lineHeight: 1,
                          }}
                        >
                          ROLL: {diceVal} (WIN)
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab.simType === 'blackjack' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Crown size={20} color="#D4AF37" />
                      <div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 800,
                          }}
                        >
                          DEALER 18 VS PLAYER 21
                        </div>
                        <div
                          style={{
                            fontSize: '1.3rem',
                            fontWeight: 1000,
                            color: '#D4AF37',
                            fontFamily: 'monospace',
                            lineHeight: 1,
                          }}
                        >
                          BLACKJACK WIN!
                        </div>
                      </div>
                    </div>
                  )}

                  {(activeTab.simType === 'slots' || activeTab.simType === 'roulette') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Sparkles size={20} color={activeTab.accentColor} />
                      <div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 800,
                          }}
                        >
                          LIVE STATUS
                        </div>
                        <div
                          style={{
                            fontSize: '1.3rem',
                            fontWeight: 1000,
                            color: activeTab.accentColor,
                            fontFamily: 'monospace',
                            lineHeight: 1,
                          }}
                        >
                          {slotsWon ? '7-7-7 WIN 100x!' : 'SPINNING...'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Meta & Play Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 1000,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {activeTab.name}
                </div>
                <div
                  style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}
                >
                  PROVABLY FAIR · Max {activeTab.maxPayout}
                </div>
              </div>

              <Link href={activeTab.path} style={{ textDecoration: 'none', outline: 'none' }}>
                <motion.button
                  onMouseEnter={() => soundManager.playHover()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    height: '44px',
                    padding: '0 20px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${activeTab.accentColor} 0%, #000 160%)`,
                    color: activeTab.id === 'blackjack' ? '#000' : '#fff',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: `0 8px 20px ${activeTab.accentColor}50`,
                    textDecoration: 'none',
                    outline: 'none',
                  }}
                >
                  <Play
                    size={14}
                    fill="currentColor"
                    color="currentColor"
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ textDecoration: 'none', borderBottom: 'none' }}>PLAY</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Left Column: Headline & Action CTAs (with High Contrast Scrim Background) */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          padding: isMobile ? '40px 20px' : '56px 64px',
          maxWidth: isMobile ? '100%' : '620px',
        }}
      >
        {/* Deposit Bonus Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            background: 'rgba(212, 175, 55, 0.14)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '12px',
            color: '#D4AF37',
            fontSize: '0.8rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Sparkles size={16} color="#D4AF37" />
          <span>100% MATCH BONUS ($100 → $200 + 50 SPINS)</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: isMobile ? 'clamp(2.4rem, 9vw, 3.5rem)' : 'clamp(3.2rem, 5.5vw, 4.6rem)',
            fontWeight: 1000,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            color: '#ffffff',
            marginBottom: '20px',
            textTransform: 'uppercase',
            textShadow: '0 4px 20px rgba(0,0,0,0.9)',
          }}
        >
          NEXT LEVEL <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #FFF 0%, #D4AF37 50%, #997517 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))',
            }}
          >
            VIP CASINO.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: 'rgba(255, 255, 255, 0.88)',
            lineHeight: 1.45,
            marginBottom: '36px',
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          }}
        >
          Erlebe die Zukunft des Online-Casinos: Transparenter Provably-Fair Algorithmus, instant
          Auszahlungen und exklusiver VIP-Rakeback.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '18px',
            marginBottom: '40px',
          }}
        >
          <Magnetic>
            <motion.button
              onClick={startOnboarding}
              onMouseEnter={() => soundManager.playHover()}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                height: '58px',
                padding: '0 38px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                color: '#000',
                fontSize: '1.05rem',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 15px 35px rgba(212, 175, 55, 0.35)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              <Zap size={18} fill="#000" /> JETZT SPIELEN
            </motion.button>
          </Magnetic>

          <Link
            href="/games/crash"
            style={{ width: isMobile ? '100%' : 'auto', textDecoration: 'none' }}
          >
            <motion.button
              onMouseEnter={() => soundManager.playHover()}
              whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                height: '58px',
                padding: '0 28px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backdropFilter: 'blur(10px)',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              SPIELE ENTDECKEN
            </motion.button>
          </Link>
        </motion.div>

        {/* Bottom Trust & Live High-Roller Ticker Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '16px' : '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
          }}
        >
          {/* Animated Real-time Live Win Ticker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 231, 1, 0.08)',
              border: '1px solid rgba(0, 231, 1, 0.2)',
              padding: '6px 12px',
              borderRadius: '10px',
            }}
          >
            <Coins size={16} color="#00E701" />
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#00E701' }}>
              ⚡ {activeWin.user} +${activeWin.amount.toFixed(2)} ({activeWin.game})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#D4AF37" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>
              PROVABLY FAIR
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', color: '#00b67a' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill="#00b67a" />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff' }}>4.9/5</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
