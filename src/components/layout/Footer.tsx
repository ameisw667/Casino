'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCasinoStore } from '@/store/useCasinoStore';
import { FooterClosingPlasma } from './FooterClosingPlasma';

export function Footer() {
  return (
    <footer
      data-testid="casino-footer"
      style={{
        marginTop: 64,
        width: '100%',
        borderTop: '1px solid rgba(212, 175, 55, 0.22)',
        background: '#0B0E14',
        position: 'relative',
        color: '#94A3B8',
        padding: '48px 24px 32px',
        boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.5)',
        zIndex: 10,
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          height: 120,
          pointerEvents: 'none',
          opacity: 0.15,
          filter: 'blur(50px)',
          background: 'radial-gradient(ellipse at top, #D4AF37 0%, transparent 70%)',
        }}
      />

      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Luxury Closing Plasma CTA & Community Anchor */}
        <FooterClosingPlasma />

        {/* Top Tier: Brand Identity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingBottom: 40,
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #D4AF37 0%, #8C6B1B 100%)',
              padding: 2,
              boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#0B0E14',
                borderRadius: 10,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/images/brand-ace-icon.png"
                alt="Casino Royale"
                fill
                sizes="42px"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
          <div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              Casino<span style={{ color: '#D4AF37' }}>Royale</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '0.12em',
                color: 'rgba(212, 175, 55, 0.85)',
              }}
            >
              THE SOVEREIGN CRYPTO HIGH-ROLLER CASINO
            </span>
          </div>
        </div>

        {/* Middle Tier: Quick Navigation Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 28,
            padding: '36px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div>
            <h4
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#FFF',
                fontWeight: 700,
                margin: '0 0 14px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
              Spiele
            </h4>
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: '2.2' }}
            >
              <li>
                <Link href="/games/blackjack" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Blackjack VIP
                </Link>
              </li>
              <li>
                <Link href="/games/roulette" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  European Roulette
                </Link>
              </li>
              <li>
                <Link href="/games/crash" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Rocket Crash
                </Link>
              </li>
              <li>
                <Link href="/games/slots" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Obsidian Slots
                </Link>
              </li>
              <li>
                <Link href="/games/dice" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Classic Dice
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#FFF',
                fontWeight: 700,
                margin: '0 0 14px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
              VIP & Vault
            </h4>
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: '2.2' }}
            >
              <li>
                <Link href="/vault" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  High-Roller Vault
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Leaderboard Podiums
                </Link>
              </li>
              <li>
                <Link href="/stats" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  All-Time Statistiken
                </Link>
              </li>
              <li>
                <Link href="/history" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Transaktions-Historie
                </Link>
              </li>
              <li>
                <button
                  data-testid="footer-open-onboarding"
                  onClick={() => {
                    useCasinoStore.setState({ onboardingDismissed: false });
                    useCasinoStore.getState().setOnboardingStep('WELCOME');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#D4AF37',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  ✦ VIP Feature-Tour
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#FFF',
                fontWeight: 700,
                margin: '0 0 14px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
              Sicherheit & Trust
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: 13,
                lineHeight: '2.2',
                color: '#64748B',
              }}
            >
              <li>
                <span style={{ color: '#CBD5E1' }}>HMAC-SHA256 Engine</span>
              </li>
              <li>
                <span style={{ color: '#CBD5E1' }}>CertiK Verified 2026</span>
              </li>
              <li>
                <span style={{ color: '#CBD5E1' }}>iTech Labs NIST SP 800</span>
              </li>
              <li>
                <span style={{ color: '#CBD5E1' }}>1:1 Liquid Cold-Vault</span>
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#FFF',
                fontWeight: 700,
                margin: '0 0 14px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
              Verantwortung & Recht
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: 13,
                lineHeight: '2.2',
                color: '#64748B',
              }}
            >
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  18+
                </span>
                <span style={{ color: '#94A3B8' }}>Nur für Volljährige</span>
              </li>
              <li>
                <span style={{ color: '#94A3B8' }}>Verantwortungsvolles Spielen</span>
              </li>
              <li>
                <span style={{ color: '#94A3B8' }}>Selbstausschluss & Limits</span>
              </li>
              <li>
                <span style={{ color: '#94A3B8' }}>256-Bit SSL Verschlüsselung</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Copyright & Status Invariant */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 24,
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span>CASINO ROYALE PLATFORM 2026 · ALL SYSTEMS OPERATIONAL</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#94A3B8' }}>PROVABLY FAIR PROTOCOL v2.4</span>
            <span>© 2026 ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
