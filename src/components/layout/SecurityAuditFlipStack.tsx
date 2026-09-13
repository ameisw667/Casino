'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Award, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

export interface AuditCaseStudy {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  rating: string;
  date: string;
  description: string;
  highlights: string[];
  certId: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  accentColor: string;
}

const AUDIT_CASES: AuditCaseStudy[] = [
  {
    id: 'certik',
    title: 'CertiK Security Audit',
    subtitle: 'Smart Contract & Vault Architecture',
    badge: 'GRADE AAA',
    rating: '99.8 / 100',
    date: 'Q1 2026 Verified',
    description: 'Vollständige formale Verifikation aller Vault-Locks, Reentrancy-Guards und Settlement-RPCs ohne kritische Schwachstellen.',
    highlights: ['Zero Critical Findings', 'Formal Math Verification', 'Multi-Sig Emergency Pausing'],
    certId: 'CK-2026-CR-9981',
    icon: ShieldCheck,
    accentColor: '#D4AF37',
  },
  {
    id: 'provably-fair',
    title: 'Provably Fair WebCrypto',
    subtitle: 'HMAC-SHA256 Deterministic Engine',
    badge: '100% UNMANIPULIERBAR',
    rating: 'SHA-256 Validated',
    date: 'Real-Time Merkle Proof',
    description: 'Jedes Rundenergebnis ist vorab kryptografisch durch Server-Seed, Client-Seed und Nonce determiniert und unabhängig nachprüfbar.',
    highlights: ['Hash Pre-Commitment', 'Entropy Control', 'Instant On-Chain Verifier'],
    certId: 'PF-RFC-6234-CASINO',
    icon: Lock,
    accentColor: '#10B981',
  },
  {
    id: 'itech-labs',
    title: 'iTech Labs RNG Certification',
    subtitle: 'NIST SP 800-22 Randomness Compliance',
    badge: 'CERTIFIED RNG',
    rating: 'Statistical Pass',
    date: '2026 Compliance Audit',
    description: 'Empirische Analyse von über 100 Millionen Zufallsrunden. Gleichverteilung und Unkorreliertheit statistisch zertifiziert.',
    highlights: ['NIST Statistical Suite', 'Dieharder Passed', 'Sub-Ms Entropy Refresh'],
    certId: 'ITL-RN-2026-088',
    icon: Award,
    accentColor: '#F59E0B',
  },
  {
    id: 'solvency',
    title: '1:1 Instant Payout Reserve',
    subtitle: 'Real-Time Liquidity & Solvency Audit',
    badge: 'SOLVENCY 100%',
    rating: '100% Gedeckt',
    date: 'Live Cold-Vault Proof',
    description: 'Spielerguthaben und Jackpot-Pools werden 1:1 in getrennten Cold-Vaults hinterlegt. Automatisierte Sofortauszahlungen ohne Haltefristen.',
    highlights: ['Segregated Vaults', 'Automated Cashout', 'Real-Time Merkle Trees'],
    certId: 'SLV-2026-VAULT-01',
    icon: CheckCircle2,
    accentColor: '#60A5FA',
  },
];

export function SecurityAuditFlipStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % AUDIT_CASES.length);
  };

  const currentAudit = AUDIT_CASES[activeIndex];
  const IconComponent = currentAudit.icon;

  return (
    <div
      data-testid="security-audit-flip-stack"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        borderRadius: 16,
        padding: '24px 26px',
        background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.96) 0%, rgba(11, 14, 20, 0.98) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(212, 175, 55, 0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient gold aura */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0.18,
          filter: 'blur(50px)',
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
        }}
      />

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 16,
          marginBottom: 18,
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 10,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck style={{ width: 20, height: 20, color: '#D4AF37' }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#F8FAFC',
                textTransform: 'uppercase',
                fontFamily: 'ui-monospace, monospace',
                margin: 0,
              }}
            >
              Audit & Trust Stack
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, marginTop: 2 }}>
              Verifizierte Sicherheits- und Auszahlungs-Zertifikate
            </p>
          </div>
        </div>

        {/* Stack Counter & Interactive Flip Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              color: '#D4AF37',
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              fontWeight: 600,
            }}
          >
            {activeIndex + 1} / {AUDIT_CASES.length}
          </span>
          <button
            onClick={handleNext}
            aria-label="Nächstes Audit umblättern"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#D4AF37',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            <span>Blättern</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Stack Container */}
      <div
        style={{
          position: 'relative',
          minHeight: 220,
          perspective: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Visual Background Cards (Depth Stack) */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 0,
            height: 180,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(15, 23, 42, 0.4)',
            pointerEvents: 'none',
            transform: 'translateY(12px) scale(0.92)',
            opacity: 0.4,
            filter: 'blur(1px)',
            transition: 'all 0.3s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 8,
            right: 8,
            bottom: 2,
            height: 190,
            borderRadius: 12,
            border: '1px solid rgba(212, 175, 55, 0.12)',
            background: 'rgba(15, 20, 30, 0.75)',
            pointerEvents: 'none',
            transform: 'translateY(6px) scale(0.96)',
            opacity: 0.7,
            transition: 'all 0.3s ease',
          }}
        />

        {/* Active Animated Flip Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentAudit.id}
            custom={direction}
            initial={{
              opacity: 0,
              y: direction > 0 ? 25 : -25,
              rotateX: direction > 0 ? -10 : 10,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 350,
                damping: 26,
              },
            }}
            exit={{
              opacity: 0,
              y: direction > 0 ? -25 : 25,
              rotateX: direction > 0 ? 12 : -12,
              scale: 0.92,
              transition: { duration: 0.18 },
            }}
            onClick={handleNext}
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              cursor: 'pointer',
              borderRadius: 12,
              padding: '18px 20px',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: 'rgba(11, 14, 20, 0.92)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              userSelect: 'none',
            }}
          >
            {/* Top row: Icon, Title & Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${currentAudit.accentColor}18`,
                    border: `1px solid ${currentAudit.accentColor}45`,
                  }}
                >
                  <IconComponent style={{ width: 18, height: 18, color: currentAudit.accentColor }} />
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {currentAudit.title}
                  </h4>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'ui-monospace, monospace',
                      color: '#94A3B8',
                    }}
                  >
                    {currentAudit.subtitle}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontFamily: 'ui-monospace, monospace',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    backgroundColor: `${currentAudit.accentColor}20`,
                    border: `1px solid ${currentAudit.accentColor}55`,
                    color: currentAudit.accentColor,
                  }}
                >
                  {currentAudit.badge}
                </span>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'ui-monospace, monospace',
                    color: '#94A3B8',
                    marginTop: 3,
                  }}
                >
                  {currentAudit.rating}
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 12,
                color: '#CBD5E1',
                lineHeight: 1.55,
                margin: '0 0 14px 0',
              }}
            >
              {currentAudit.description}
            </p>

            {/* Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: 12,
              }}
            >
              {currentAudit.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: '#E2E8F0',
                  }}
                >
                  <CheckCircle2 style={{ width: 13, height: 13, color: '#10B981', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Info Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: 11,
                fontFamily: 'ui-monospace, monospace',
                color: '#64748B',
              }}
            >
              <span style={{ color: 'rgba(212, 175, 55, 0.9)' }}>Cert-ID: {currentAudit.certId}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8' }}>
                Klicken zum Umblättern
                <ChevronRight style={{ width: 12, height: 12 }} />
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 16,
          paddingTop: 8,
          borderTop: '1px solid rgba(212, 175, 55, 0.1)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {AUDIT_CASES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > activeIndex ? 1 : -1);
              setActiveIndex(idx);
            }}
            aria-label={`Gehe zu Audit ${idx + 1}`}
            style={{
              height: 5,
              width: idx === activeIndex ? 24 : 6,
              borderRadius: 3,
              backgroundColor: idx === activeIndex ? '#D4AF37' : 'rgba(212, 175, 55, 0.25)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
