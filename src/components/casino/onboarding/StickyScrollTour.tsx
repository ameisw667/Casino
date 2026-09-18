'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap, Crown, ShieldCheck, ChevronRight, ChevronLeft, ArrowRight, X } from 'lucide-react';

export interface TourCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  highlight: string;
  perks: string[];
  accentColor: string;
}

const TOUR_CARDS: TourCard[] = [
  {
    id: 'welcome',
    badge: 'ROYAL WILLKOMMEN',
    title: 'Exklusiver $10 Welcome Vault',
    subtitle: 'Kein KYC · Sofort aktiviert',
    description: 'Dein persönlicher Begrüßungs-Tresor steht bereit. Starte sofort ohne Einzahlung und sichere dir 100% Match bis zu $500 auf deine erste VIP-Aufladung.',
    icon: Gift,
    highlight: '$10.00 SOFORT-GUTHABEN',
    perks: ['Sofort spielbar auf allen Games', 'Keine versteckten Umsatzknebel', 'Freie Spielwahl (Dice, Crash, BJ)'],
    accentColor: '#D4AF37',
  },
  {
    id: 'rakeback',
    badge: 'LIFETIME BENEFIT',
    title: 'Instant High-Roller Rakeback',
    subtitle: 'Bis zu 15% automatischer Cash-Rückfluss',
    description: 'Jede einzelne Wette zählt — völlig unabhängig von Gewinn oder Verlust. Rakeback wird atomar berechnet und steht jederzeit zum Sofortabheben bereit.',
    icon: Zap,
    highlight: 'ECHTGELD STATT BONUSPUNKTE',
    perks: ['Auszahlung in Echtzeit', 'Wöchentlicher Boost-Zuschlag', 'Automatische Stufenaufstiege'],
    accentColor: '#10B981',
  },
  {
    id: 'concierge',
    badge: 'PRIVATE SOVEREIGNTY',
    title: '24/7 VIP Host & Instant Cashouts',
    subtitle: 'Under-60s Blockchain Settlement',
    description: 'Keine künstlichen Auszahlungsfristen. Gewinne verlassen unsere Cold-Vaults innerhalb von Sekunden direkt in deine private Wallet.',
    icon: Crown,
    highlight: '< 60 SEKUNDEN AUSZAHLUNGEN',
    perks: ['Dedizierter VIP-Concierge', 'Keine täglichen Abhebelimits', 'Priorisierte Transaktionen'],
    accentColor: '#F59E0B',
  },
  {
    id: 'fairness',
    badge: 'KRYPTOGRAFISCHE TRANSPARENZ',
    title: '100% Provably Fair Algorithmus',
    subtitle: 'HMAC-SHA256 Mathematik statt blindes Vertrauen',
    description: 'Jeder Wurf, Spin und Crash ist vor Rundenstart kryptografisch besiegelt. Überprüfe jedes einzelne Ergebnis unabhängig im On-Chain-Verifier.',
    icon: ShieldCheck,
    highlight: 'UNMANIPULIERBARER CODE',
    perks: ['Server- & Client-Seed Verifikation', 'Zertifiziert durch iTech Labs & CertiK', 'Offener Verifikations-Rechner'],
    accentColor: '#60A5FA',
  },
];

interface StickyScrollTourProps {
  onComplete?: () => void;
  onDismiss?: () => void;
  onClaim?: () => void;
}

export function StickyScrollTour({ onComplete, onDismiss, onClaim }: StickyScrollTourProps) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < TOUR_CARDS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else if (onClaim) {
      onClaim();
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const currentCard = TOUR_CARDS[activeStep];
  const isLast = activeStep === TOUR_CARDS.length - 1;

  return (
    <div
      data-testid="sticky-scroll-tour"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 620,
        margin: '0 auto',
        borderRadius: 20,
        padding: '32px 32px 28px',
        background: 'linear-gradient(160deg, rgba(17, 22, 34, 0.98) 0%, rgba(10, 13, 20, 0.99) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(212, 175, 55, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background gold glow */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0.15,
          filter: 'blur(60px)',
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
        }}
      />

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 800,
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.08em',
              color: '#FFF',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            VIP Feature Tour
          </h3>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Casino Royale Privileges</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              color: '#D4AF37',
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              fontWeight: 700,
            }}
          >
            Schritt {activeStep + 1} von {TOUR_CARDS.length}
          </span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Tour schließen"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
                borderRadius: 6,
                transition: 'color 0.2s',
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Scroll 3D Cards Stack Container */}
      <div
        style={{
          position: 'relative',
          minHeight: 280,
          perspective: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        {/* Layered Depth Cards underneath */}
        {TOUR_CARDS.map((card, idx) => {
          if (idx <= activeStep) return null;
          const offset = idx - activeStep;
          if (offset > 2) return null;
          return (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: 10 * offset,
                right: 10 * offset,
                bottom: 0,
                height: 250 - offset * 12,
                borderRadius: 14,
                background: 'rgba(15, 20, 30, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.12)',
                transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.04})`,
                opacity: 0.6 / offset,
                pointerEvents: 'none',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}

        {/* Active Animated Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 30, scale: 0.95, rotateX: -8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -25, scale: 0.94, rotateX: 10 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              borderRadius: 16,
              padding: '24px',
              background: 'rgba(11, 14, 20, 0.96)',
              border: `1px solid ${currentCard.accentColor}55`,
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Top row: Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                  background: `${currentCard.accentColor}18`,
                  border: `1px solid ${currentCard.accentColor}45`,
                  color: currentCard.accentColor,
                }}
              >
                {currentCard.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h4
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#FFF',
                margin: '0 0 4px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {currentCard.title}
            </h4>
            <div style={{ fontSize: 12, color: currentCard.accentColor, fontWeight: 600, marginBottom: 12 }}>
              {currentCard.subtitle}
            </div>

            {/* Description */}
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              {currentCard.description}
            </p>

            {/* Highlight Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>BENEFIT:</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: '#F8FAFC' }}>
                {currentCard.highlight}
              </span>
            </div>

            {/* Perks bullets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
              {currentCard.perks.map((perk, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: '#CBD5E1',
                  }}
                >
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: currentCard.accentColor }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perk}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Step Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {TOUR_CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              aria-label={`Gehe zu Tour-Schritt ${idx + 1}`}
              style={{
                height: 5,
                width: idx === activeStep ? 24 : 6,
                borderRadius: 3,
                backgroundColor: idx === activeStep ? '#D4AF37' : 'rgba(212, 175, 55, 0.25)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeStep > 0 && (
            <button
              onClick={handlePrev}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
              Zurück
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              background: isLast
                ? 'linear-gradient(135deg, #D4AF37 0%, #8C6B1B 100%)'
                : 'rgba(212, 175, 55, 0.2)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              color: isLast ? '#0B0E14' : '#D4AF37',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: isLast ? '0 4px 14px rgba(212, 175, 55, 0.3)' : 'none',
            }}
          >
            {isLast ? (
              <>
                <span>BONUS BEANSPRUCHEN</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </>
            ) : (
              <>
                <span>WEITER</span>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StickyScrollTour;
