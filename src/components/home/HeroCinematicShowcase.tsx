'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCasinoStore } from '@/store/useCasinoStore';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  Star,
  ShieldCheck,
  Zap,
  Flame,
  Play,
  Sparkles,
  Users,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';
import { soundManager } from '@/lib/casino/sound-manager';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';

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
    image: '/images/game-blackjack-new.png',
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
        <div
          style={{
            flex: isMobile ? '1 1 auto' : '1 1 420px',
            maxWidth: isMobile ? '100%' : '480px',
          }}
        >
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            style={{
              fontSize: isMobile ? 'clamp(2.1rem, 7.5vw, 2.8rem)' : 'clamp(2.6rem, 3.6vw, 3.5rem)',
              fontWeight: 1000,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              marginBottom: '12px',
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

          {/* Value Proposition Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              fontSize: isMobile ? '0.9rem' : '0.98rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.45,
              marginBottom: '20px',
              fontWeight: 500,
              textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            }}
          >
            Erlebe die Zukunft des Online-Casinos: 100% Willkommensbonus, transparenter
            Provably-Fair Algorithmus, instant Auszahlungen und VIP-Rakeback.
          </motion.p>

          {/* VIP Welcome Bonus-Claim Stage (Option 1) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: '18px' }}
          >
            <div
              style={{
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(18, 18, 24, 0.9) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                padding: isMobile ? '12px' : '12px 16px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                justifyContent: isMobile ? 'flex-start' : 'space-between',
                gap: isMobile ? '10px' : '12px',
                backdropFilter: 'blur(16px)',
                boxShadow:
                  '0 10px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
              }}
            >
              {/* Bonus Code Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: 0,
                  flex: isMobile ? '1 1 auto' : '0 0 auto',
                }}
              >
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 800,
                    }}
                  >
                    CODE:
                  </span>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: '#D4AF37',
                      fontWeight: 1000,
                      fontFamily: 'monospace',
                      letterSpacing: '0.06em',
                    }}
                  >
                    VIPPRO
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 1000,
                      color: '#ffffff',
                      lineHeight: 1.1,
                    }}
                  >
                    100% BONUS <span style={{ color: '#00E701' }}>+$500</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 600,
                    }}
                  >
                    + Instant VIP Rakeback
                  </div>
                </div>
              </div>

              {/* Bonus Claim Button */}
              <Magnetic>
                <motion.button
                  onClick={handleBonusActivate}
                  onMouseEnter={() => soundManager.playHover()}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(212, 175, 55, 0.55)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    height: '40px',
                    padding: '0 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                    color: '#000',
                    fontSize: '0.78rem',
                    fontWeight: 1000,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    width: isMobile ? '100%' : 'auto',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={14} fill="#000" /> BONUS AKTIVIEREN
                </motion.button>
              </Magnetic>
            </div>

            {/* Direct Games Sub-Link */}
            <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
              <Link
                href="/games"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  soundManager.playHover();
                  e.currentTarget.style.color = '#D4AF37';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
              >
                <span>Direkt zur Spielhalle (5 Casino Originals)</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>

          {/* Dynamic Trust & Social Proof Bar: Pure Trust Pill (Option 1) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: isMobile ? '4px' : '6px',
              padding: isMobile ? '6px 8px' : '4px 8px',
              borderRadius: '24px',
              background: 'rgba(14, 17, 24, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
              fontSize: '0.68rem',
              fontWeight: 700,
              maxWidth: '100%',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              justifyContent: 'center',
            }}
          >
            {/* Micro-Chip 1: 100% Provably Fair */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '12px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                color: '#D4AF37',
                fontSize: '0.64rem',
                fontWeight: 900,
                letterSpacing: '0.03em',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={11} color="#D4AF37" />
              <span>100% PROVABLY FAIR</span>
            </div>

            {/* Micro-Divider */}
            {!isMobile && (
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Micro-Chip 2: Rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.9)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '1px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={9} fill="#D4AF37" color="#D4AF37" />
                ))}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: '0.67rem',
                }}
              >
                4.9/5
              </span>
              <span
                style={{
                  fontSize: '0.60rem',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontWeight: 800,
                }}
              >
                RATING
              </span>
            </div>

            {/* Micro-Divider */}
            {!isMobile && (
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Micro-Chip 3: Instant Payouts */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '12px',
                background: 'rgba(0, 231, 1, 0.08)',
                border: '1px solid rgba(0, 231, 1, 0.2)',
                color: '#00E701',
                fontSize: '0.64rem',
                fontWeight: 900,
                letterSpacing: '0.03em',
                flexShrink: 0,
              }}
            >
              <Zap size={11} color="#00E701" />
              <span>INSTANT AUSZAHLUNG</span>
            </div>
          </motion.div>
        </div>

        {/* Column 2 (Center): Live Progressive Jackpot Pulse & VIP Radar (Option 1) */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            style={{
              width: '320px',
              flexShrink: 0,
              borderRadius: '18px',
              background:
                'linear-gradient(160deg, rgba(22, 20, 15, 0.85) 0%, rgba(10, 10, 14, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.22)',
              padding: '16px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '275px',
            }}
          >
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={14} color="#D4AF37" />
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    color: '#D4AF37',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  PROGRESSIVE JACKPOT
                </span>
              </div>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00E701',
                  boxShadow: '0 0 8px #00E701',
                }}
              />
            </div>

            {/* Jackpot Live Amount */}
            <div style={{ margin: '10px 0', textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 1000,
                  fontFamily: 'monospace',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #FFF 0%, #D4AF37 60%, #AA7C11 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 16px rgba(212, 175, 55, 0.4))',
                }}
              >
                {jackpotFormatted}
              </div>
              <div
                style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}
              >
                Automatischer Drop bei VIP-Kombination
              </div>
            </div>

            {/* Radar Mini Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  GLOBAL RTP
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#00E701',
                    fontFamily: 'monospace',
                  }}
                >
                  99.2%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  MAX PAYOUT
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#D4AF37',
                    fontFamily: 'monospace',
                  }}
                >
                  10,000x
                </div>
              </div>
            </div>

            {/* Quick Play Launch */}
            <Link href="/games/slots" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#D4AF37',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={12} />
                <span>JACKPOT KNACKEN</span>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Column 3 (Right): Frameless Floating Live Game Showcase Sandbox */}
        {!isMobile && (
          <motion.div
            style={{
              width: '400px',
              flexShrink: 0,
              rotateX: rotateXCombined,
              rotateY: rotateYMouse,
              transformStyle: 'preserve-3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Main Active Holographic Showcase Card (Single Frameless Layer) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                background:
                  'linear-gradient(145deg, rgba(16, 16, 24, 0.7) 0%, rgba(6, 6, 10, 0.85) 100%)',
                backdropFilter: 'blur(24px)',
                padding: '14px',
                boxShadow: `0 20px 60px rgba(0,0,0,0.85), 0 0 35px ${activeTab.accentColor}20`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                transform: 'translateZ(10px)',
              }}
            >
              {/* Top Minimalist Game Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  padding: '4px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  overflowX: 'auto',
                  marginBottom: '10px',
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
                        padding: '6px 4px',
                        borderRadius: '7px',
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
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${activeTab.accentColor}35`,
                    color: activeTab.accentColor,
                    fontSize: '0.68rem',
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
                    gap: '5px',
                    color: '#00E701',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    background: 'rgba(0, 231, 1, 0.08)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 231, 1, 0.15)',
                  }}
                >
                  <Users size={11} /> 1,420 ONLINE
                </div>
              </div>

              {/* Active Game Center Stage (Clickable 1-Click Launch) */}
              <Link
                href={activeTab.path}
                style={{ textDecoration: 'none', display: 'block', outline: 'none' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '175px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Image
                      src={activeTab.image}
                      alt={activeTab.name}
                      fill
                      sizes="400px"
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
                        padding: '12px',
                      }}
                    >
                      {activeTab.simType === 'crash' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Flame size={18} color="#FF4500" />
                          <div>
                            <div
                              style={{
                                fontSize: '0.62rem',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 800,
                              }}
                            >
                              LIVE MULTIPLIKATOR
                            </div>
                            <div
                              style={{
                                fontSize: '1.4rem',
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
                          <Zap size={18} color="#00E701" />
                          <div>
                            <div
                              style={{
                                fontSize: '0.62rem',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 800,
                              }}
                            >
                              TARGET &lt; 50.00
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
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
                          <Crown size={18} color="#D4AF37" />
                          <div>
                            <div
                              style={{
                                fontSize: '0.62rem',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 800,
                              }}
                            >
                              DEALER 18 VS PLAYER 21
                            </div>
                            <div
                              style={{
                                fontSize: '1.15rem',
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
                          <Sparkles size={18} color={activeTab.accentColor} />
                          <div>
                            <div
                              style={{
                                fontSize: '0.62rem',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 800,
                              }}
                            >
                              LIVE STATUS
                            </div>
                            <div
                              style={{
                                fontSize: '1.15rem',
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

                {/* Bottom Meta & Play Launch Trigger */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingTop: '4px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 1000,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {activeTab.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: 600,
                      }}
                    >
                      PROVABLY FAIR · Max {activeTab.maxPayout}
                    </div>
                  </div>

                  <motion.div
                    onMouseEnter={() => soundManager.playHover()}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      height: '34px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${activeTab.accentColor} 0%, #000 160%)`,
                      color: activeTab.id === 'blackjack' ? '#000' : '#fff',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      boxShadow: `0 6px 16px ${activeTab.accentColor}50`,
                    }}
                  >
                    <Play
                      size={12}
                      fill="currentColor"
                      color="currentColor"
                      style={{ flexShrink: 0 }}
                    />
                    <span>PLAY</span>
                  </motion.div>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
