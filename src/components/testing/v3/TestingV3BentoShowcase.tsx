'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Flame, ChevronRight } from 'lucide-react';

export function TestingV3BentoShowcase() {
  const games = [
    {
      title: 'Crash Royale',
      badge: 'Live Multiplayer',
      multiplier: '99.4x Max',
      image: '/images/testing-v3/card-back-crash.png',
      href: '/games/crash',
      tagColor: '#10B981',
    },
    {
      title: 'Quantum Blackjack',
      badge: 'High Roller VIP',
      multiplier: '3:2 Natural',
      image: '/images/2026-09-04_hero-blackjack-quantum-gold_v001.png',
      href: '/games/blackjack',
      tagColor: '#D4AF37',
    },
    {
      title: 'Singularity Slots',
      badge: 'Jackpot 10,000x',
      multiplier: '97.2% RTP',
      image: '/images/2026-09-04_hero-slots-quantum-gold_v001.png',
      href: '/games/slots',
      tagColor: '#F59E0B',
    },
  ];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#0B0E14',
        padding: '100px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 20,
      }}
    >
      {/* Glow Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8rem',
                color: '#FFDF73',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Flame className="h-4 w-4 text-amber-400" />
              DESTINATION: QUANTUM VAULT
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Die Live-Spielebühne
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              Kryptografisch nachweisbar fair (SHA-256)
            </span>
          </div>
        </div>

        {/* Bento Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {games.map((g, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'rgba(15, 19, 26, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {/* Card Artwork Banner */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '220px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={g.image}
                  alt={g.title}
                  fill
                  sizes="450px"
                  style={{ objectFit: 'cover' }}
                />
                {/* Floating Tag */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    background: 'rgba(11, 14, 20, 0.85)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${g.tagColor}55`,
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: g.tagColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: g.tagColor,
                    }}
                  />
                  {g.badge}
                </div>
              </div>

              {/* Card Body */}
              <div
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#FFF',
                      marginBottom: '4px',
                    }}
                  >
                    {g.title}
                  </h3>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    MAX POTENZIAL: <span style={{ color: '#FFDF73' }}>{g.multiplier}</span>
                  </div>
                </div>

                <a
                  href={g.href}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFF',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    e.currentTarget.style.color = '#FFDF73';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#FFF';
                  }}
                >
                  SPIEL STARTEN
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
