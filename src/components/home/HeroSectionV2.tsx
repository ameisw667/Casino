'use client';
import React, { useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';

interface Withdrawal {
  user: string;
  amount: number;
  currency?: string;
  time?: string;
  image?: string;
}

interface HeroSectionV2Props {
  isMobile: boolean;
  startOnboarding: () => void;
  liveWithdrawals: Withdrawal[];
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// Module-level constant: computed once at import time, not during render or
// in an effect+setState (react-hooks/purity forbids Math.random() in both —
// even useMemo/useEffect are still considered "render-coupled" by the compiler).
// Purely decorative background particles; identical across mounts is fine.
const FLOATING_PARTICLES: FloatingParticle[] = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
}));

function FloatingParticles() {
  const particles = FLOATING_PARTICLES;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'hsla(var(--primary), 0.6)',
            boxShadow: `0 0 ${p.size * 3}px hsla(var(--primary), 0.3)`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
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
  );
}

function WinnerCard({ withdrawal, index }: { withdrawal: Withdrawal; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 200, damping: 25 }}
      whileHover={{ scale: 1.03, x: -4 }}
      style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'default' }}
    >
      <motion.div
        style={{
          width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
        }}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      >
        <img src={withdrawal.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${withdrawal.user}`} alt="u" style={{ width: '100%', height: '100%' }} />
      </motion.div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{withdrawal.user}</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Just won</div>
      </div>
      <motion.div
        style={{ fontSize: '1rem', fontWeight: 1000, color: 'hsl(var(--primary))' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2 + index * 0.15, type: 'spring', stiffness: 400, damping: 15 }}
      >
        +${Number(withdrawal.amount).toFixed(2)}
      </motion.div>
    </motion.div>
  );
}

export const HeroSectionV2: React.FC<HeroSectionV2Props> = ({
  isMobile = false,
  startOnboarding,
  liveWithdrawals = [
    { user: 'Satoshi', amount: 450.00, currency: 'BTC', time: 'Just now', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { user: 'Vitalik', amount: 120.00, currency: 'ETH', time: '2m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    { user: 'Elon', amount: 15.00, currency: 'DOGE', time: '5m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    { user: 'CZ', amount: 890.00, currency: 'BNB', time: '12m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
  ],
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.6]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  }, [isMobile, mouseX, mouseY]);

  const titleWords = ['THE', 'ULTIMATE'];
  const subtitleWords = ['CRYPTO', 'CASINO.'];

  return (
    <motion.section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? 'auto' : '520px',
        maxHeight: isMobile ? 'none' : '580px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        background: '#000',
        borderRadius: isMobile ? '0' : 'var(--radius-3xl)',
        marginBottom: '24px',
        border: isMobile ? 'none' : '1px solid hsla(var(--primary), 0.2)',
        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
      }}
    >
      {/* Parallax Background - new image with soft fade */}
      <motion.div style={{ position: 'absolute', inset: '-10%', zIndex: 0, y: bgY, x: smoothX, scale: 1.15 }}>
        <Image
          src="/images/hero_bg_v2.jpg"
          alt="Premium Casino Background"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            maskImage: 'radial-gradient(ellipse 90% 80% at 60% 50%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 60% 50%, black 30%, transparent 75%)',
          }}
        />
      </motion.div>

      {/* Animated Glow Orb */}
      {!isMobile && (
        <motion.div
          style={{
            position: 'absolute', right: '15%', top: '30%',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, hsla(var(--primary), 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)', zIndex: 1,
            x: smoothX, y: smoothY,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <FloatingParticles />

      {/* Cinematic Vignette - smooth fade to black on all edges */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: isMobile
          ? 'radial-gradient(ellipse at center top, transparent 0%, rgba(0,0,0,0.7) 70%, #000 100%)'
          : `radial-gradient(ellipse at 40% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 55%, #000 90%),
             linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.9) 100%),
             linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.8) 100%)`,
      }} />

      {/* Scroll Darken Overlay */}
      <motion.div style={{ position: 'absolute', inset: 0, zIndex: 3, background: '#000', opacity: overlayOpacity, pointerEvents: 'none' }} />

      {/* Content */}
      <motion.div style={{ position: 'relative', zIndex: 10, width: '100%', padding: isMobile ? '40px var(--space-md)' : '0 80px', y: contentY }}>
        <div style={{ maxWidth: isMobile ? '100%' : '700px' }}>
          {/* Promo Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '8px 16px', background: 'hsla(var(--primary), 0.15)',
              borderRadius: '10px', color: 'hsl(var(--primary))',
              fontSize: '0.75rem', fontWeight: 900, marginBottom: '24px',
              border: '1px solid hsla(var(--primary), 0.3)',
              backdropFilter: 'blur(10px)', textTransform: 'uppercase',
              letterSpacing: '0.1em', boxShadow: '0 0 20px hsla(var(--primary), 0.1)',
            }}
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Trophy size={14} fill="currentColor" />
            </motion.div>
            100% FIRST DEPOSIT BONUS ACTIVE
          </motion.div>

          {/* Animated Title - more compact */}
          <h1 style={{
            fontSize: isMobile ? 'clamp(2.2rem, 9vw, 3rem)' : 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: 1000, lineHeight: 0.9, letterSpacing: '-0.06em',
            color: '#fff', marginBottom: '20px',
            textShadow: '0 20px 60px rgba(0,0,0,1)', textTransform: 'uppercase',
          }}>
            <div style={{ overflow: 'hidden' }}>
              {titleWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: '120%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'inline-block', marginRight: '0.3em' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div style={{ overflow: 'hidden' }}>
              {subtitleWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: '120%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block', marginRight: '0.3em',
                    background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,0.4) 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
            style={{
              fontSize: isMobile ? '1rem' : '1.4rem',
              color: 'rgba(255,255,255,0.65)', lineHeight: 1.35,
              marginBottom: '36px', fontWeight: 600, maxWidth: '550px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Provably fair gaming with{' '}
            <motion.span
              style={{ color: '#fff', fontWeight: 900 }}
              whileHover={{ textShadow: '0 0 20px hsla(var(--primary), 0.5)' }}
            >
              Instant Crypto Withdrawals
            </motion.span>.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '24px' }}
          >
            <Magnetic>
              <motion.button
                onClick={startOnboarding}
                className="btn btn-primary"
                whileHover={{ scale: 1.05, boxShadow: '0 25px 60px hsla(var(--primary), 0.5)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  height: '68px', padding: '0 52px', fontSize: '1.2rem',
                  borderRadius: '18px', fontWeight: 1000, textTransform: 'uppercase',
                  boxShadow: '0 20px 50px hsla(var(--primary), 0.4)',
                  letterSpacing: '0.02em', background: 'hsl(var(--primary))',
                  border: 'none', color: '#000', position: 'relative', overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>Play Now</span>
              </motion.button>
            </Magnetic>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', color: '#00b67a' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 1.2 + i * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Star size={18} fill="#00b67a" />
                    </motion.div>
                  ))}
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 1000, color: '#fff' }}>4.9/5</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>TRUSTPILOT VERIFIED</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Winners Side Widget */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150, damping: 20 }}
          whileHover={{ y: -4 }}
          style={{
            position: 'absolute', right: '40px', top: '50%',
            transform: 'translateY(-50%)', width: '300px',
            borderRadius: '24px', padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(40px)',
            zIndex: 15, boxShadow: '0 40px 100px rgba(0,0,0,1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 1000, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>LATEST WINS</span>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e701', boxShadow: '0 0 15px #00e701' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {liveWithdrawals.slice(0, 4).map((w, i) => (
              <WinnerCard key={i} withdrawal={w} index={i} />
            ))}
          </div>
          <motion.button
            className="btn btn-ghost"
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', marginTop: '20px', fontSize: '0.7rem',
              fontWeight: 900, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', height: '42px', background: 'rgba(255,255,255,0.02)',
            }}
          >
            VIEW ALL WINS
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  );
};
