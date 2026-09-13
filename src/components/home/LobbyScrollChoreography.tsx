'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ShieldCheck, Sparkles, Zap, Award, Gem, Lock } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';

interface StoryChapter {
  id: string;
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  metrics: { label: string; value: string }[];
  accentColor: string;
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'haute-salon',
    number: '01',
    badge: 'HAUTE HORLOGERIE STANDARDS',
    title: 'Salon Privé Architecture',
    subtitle: 'Kuratierte High-Limit Tische & VIP-Diskretion',
    description:
      'Erleben Sie kompromisslose Privatsphäre in virtuellen Salon-Suiten. Exklusive Tischeinsätze, personalisierte Rakeback-Ausschüttungen und dezidierte VIP-Hosts für anspruchsvollste High-Roller.',
    icon: Gem,
    metrics: [
      { label: 'Max Bet Limit', value: '100,000 USDT' },
      { label: 'Instant VIP Host', value: '24/7 Priority' },
      { label: 'Tier Status', value: 'Obsidian Royal' },
    ],
    accentColor: '#D4AF37',
  },
  {
    id: 'provably-fair',
    number: '02',
    badge: 'CRYPTOGRAPHIC INTEGRITY',
    title: 'Provably Fair 2.0',
    subtitle: 'Mathematisch verifizierbare Zufallsgenerierung',
    description:
      'Jede Drehung, jeder Kartenwurf und jeder Crash-Multiplikator ist durch HMAC-SHA256 vor Rundenbeginn determiniert und für den Spieler in Echtzeit kryptografisch belegbar.',
    icon: ShieldCheck,
    metrics: [
      { label: 'House Edge', value: 'Ab 1.00%' },
      { label: 'Audit Standard', value: 'iTech / SHA256' },
      { label: 'Proof Delay', value: '0 Millisekunden' },
    ],
    accentColor: '#10B981',
  },
  {
    id: 'zero-block',
    number: '03',
    badge: 'INSTANT LIQUIDITY',
    title: 'Zero-Block Settlement',
    subtitle: 'Verzögerungsfreie Auszahlungen auf Ihre Cold-Wallet',
    description:
      'Keine manuellen Freigabewarteschlangen. Gewinne fließen über hochgradig optimierte Multi-Rail-Transaktionen ohne Reibungsverlust direkt in Ihre persönliche Verwahrung.',
    icon: Zap,
    metrics: [
      { label: 'Auszahlungszeit', value: '< 2.4 Sek.' },
      { label: 'Sicherheits-Lock', value: 'Multi-Sig Vault' },
      { label: 'Rückholquote', value: '99.2% RTP' },
    ],
    accentColor: '#3B82F6',
  },
];

interface LobbyScrollChoreographyProps {
  isMobile?: boolean;
}

export function LobbyScrollChoreography({ isMobile = false }: LobbyScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  // Track active chapter based on smooth progress (0 to 1)
  useEffect(() => {
    return smoothProgress.on('change', (val) => {
      if (val < 0.38) {
        setActiveChapterIndex(0);
      } else if (val < 0.68) {
        setActiveChapterIndex(1);
      } else {
        setActiveChapterIndex(2);
      }
    });
  }, [smoothProgress]);

  // Transform layers for parallax depth
  const backgroundY = useTransform(smoothProgress, [0, 1], ['-60px', '60px']);
  const compassRotate = useTransform(smoothProgress, [0, 1], [0, 180]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.3, 0.8, 0.4]);

  return (
    <section
      ref={containerRef}
      data-testid="lobby-scroll-choreography"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1560px',
        margin: '24px auto',
        padding: isMobile ? '24px 12px' : '48px 24px',
        overflow: 'hidden',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(15, 20, 30, 0.85) 0%, rgba(11, 14, 20, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.22)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Background Animated Parallax Elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: isMobile ? '260px' : '480px',
          height: isMobile ? '260px' : '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(11, 14, 20, 0) 70%)',
          y: backgroundY,
          opacity: glowOpacity,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: isMobile ? '220px' : '420px',
          height: isMobile ? '220px' : '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(11, 14, 20, 0) 70%)',
          y: backgroundY,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Decorative Rotating Compass Vector Ring */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '1px dashed rgba(212, 175, 55, 0.15)',
          rotate: compassRotate,
          pointerEvents: 'none',
          display: isMobile ? 'none' : 'block',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#D4AF37',
            boxShadow: '0 0 10px #D4AF37',
          }}
        />
      </motion.div>

      {/* Main Narrative Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginBottom: isMobile ? '24px' : '36px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
          paddingBottom: '20px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} color="#D4AF37" />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#D4AF37',
                textTransform: 'uppercase',
              }}
            >
              Cineastische Storyline
            </span>
          </div>

          <h2
            style={{
              fontSize: isMobile ? '22px' : '32px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#F9FAFB',
              margin: 0,
              fontFamily: 'serif',
            }}
          >
            The Casino Royale Experience
          </h2>
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              color: '#9CA3AF',
              maxWidth: '600px',
            }}
          >
            Synchronisierte Scroll-Choreografie durch unsere architektonischen Pfeiler, Sicherheitsaudits und VIP-Standards.
          </p>
        </div>

        {/* Chapter Stepper Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(11, 14, 20, 0.6)',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {CHAPTERS.map((ch, idx) => {
            const isActive = activeChapterIndex === idx;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapterIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  border: isActive
                    ? '1px solid rgba(212, 175, 55, 0.5)'
                    : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)'
                    : 'transparent',
                  color: isActive ? '#F3F4F6' : '#9CA3AF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: isActive ? '#D4AF37' : '#6B7280',
                  }}
                >
                  {ch.number}
                </span>
                <span>{ch.id.split('-')[0].toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Stage: Active Chapter Showcase with Spring Transition */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
          gap: isMobile ? '24px' : '40px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Narrative Card */}
        <div>
          {CHAPTERS.map((ch, idx) => {
            if (activeChapterIndex !== idx) return null;
            const IconComponent = ch.icon;

            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={springs.standard}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `rgba(${ch.accentColor === '#D4AF37' ? '212, 175, 55' : ch.accentColor === '#10B981' ? '16, 185, 129' : '59, 130, 246'}, 0.15)`,
                      border: `1px solid ${ch.accentColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={20} color={ch.accentColor} />
                  </div>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: ch.accentColor,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {ch.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: isMobile ? '24px' : '34px',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#F9FAFB',
                    margin: '0 0 8px 0',
                    lineHeight: 1.2,
                  }}
                >
                  {ch.title}
                </h3>
                <h4
                  style={{
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 500,
                    color: '#D4AF37',
                    margin: '0 0 16px 0',
                  }}
                >
                  {ch.subtitle}
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#D1D5DB',
                    margin: '0 0 24px 0',
                  }}
                >
                  {ch.description}
                </p>

                {/* Micro Metric Badges */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                  }}
                >
                  {ch.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        background: 'rgba(11, 14, 20, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9CA3AF',
                          marginBottom: '4px',
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: '#F9FAFB',
                        }}
                      >
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Holographic Glass Device Preview */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, rgba(20, 26, 38, 0.9) 0%, rgba(11, 14, 20, 0.95) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '20px' : '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212, 175, 55, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              paddingBottom: '14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9CA3AF' }}>ROYALE_TELEMETRY_ENGINE</span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#D4AF37',
                padding: '2px 8px',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
              }}
            >
              LIVE SYNC
            </span>
          </div>

          {/* Interactive Haute Horlogerie Live Telemetry Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderRadius: '14px',
              background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, rgba(11, 14, 20, 0.6) 80%)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: activeChapterIndex === 0 ? [0, 5, 0] : activeChapterIndex === 1 ? [0, -5, 0] : [0, 0],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(11, 14, 20, 0.9) 100%)',
                  border: '2px solid #D4AF37',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {activeChapterIndex === 0 ? (
                  <Award size={28} color="#D4AF37" />
                ) : activeChapterIndex === 1 ? (
                  <ShieldCheck size={28} color="#10B981" />
                ) : (
                  <Lock size={28} color="#3B82F6" />
                )}
              </motion.div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#F9FAFB',
                    letterSpacing: '0.05em',
                  }}
                >
                  {CHAPTERS[activeChapterIndex].title.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '2px',
                    fontFamily: 'monospace',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Kryptografischer Status: Synchronisiert
                </div>
              </div>
            </div>

            {/* Chapter-specific live telemetry feed */}
            {activeChapterIndex === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>VIP PRIVACY</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#D4AF37', fontFamily: 'monospace' }}>256-Bit TLS + Multi-Sig</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>CONCIERGE</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>24/7 Dedicated Host</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>MAX STAKE</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', fontFamily: 'monospace' }}>100,000 USDT</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>RAKEBACK</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>Tier 5 Maxima</div>
                </div>
              </div>
            )}

            {activeChapterIndex === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>HASH ALGORITHM</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>HMAC-SHA256</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>CLIENT SEED</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#D4AF37', fontFamily: 'monospace' }}>Active & Provable</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>LIVE SEED STREAM</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    0x8a92fbc14...e3b0c44298fc1c149afbf4c8996fb
                  </div>
                </div>
              </div>
            )}

            {activeChapterIndex === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>SETTLEMENT SPEED</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#3B82F6', fontFamily: 'monospace' }}>1.8 Sekunden</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>VAULT COLD STORAGE</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>100% Solvency</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>SETTLEMENT PROTOCOL</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#D4AF37', fontFamily: 'monospace' }}>
                    Zero-Block Atomic Multi-Rail Routing Active
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
