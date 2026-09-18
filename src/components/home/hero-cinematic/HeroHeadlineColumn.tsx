'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Magnetic } from '@/components/ui/Magnetic';
import { soundManager } from '@/lib/casino/sound-manager';
import { TextRepelHeadline } from './TextRepelHeadline';

interface HeroHeadlineColumnProps {
  isMobile: boolean;
  onBonusActivate: () => void;
}

export function HeroHeadlineColumn({ isMobile, onBonusActivate }: HeroHeadlineColumnProps) {
  return (
    <div
      style={{
        flex: isMobile ? '1 1 auto' : '1 1 540px',
        maxWidth: isMobile ? '100%' : '580px',
        width: '100%',
      }}
    >
      {/* Royale Privé High-Stakes Tag */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background:
            'linear-gradient(135deg, rgba(212, 175, 55, 0.16) 0%, rgba(14, 17, 24, 0.85) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.38)',
          boxShadow: '0 0 16px rgba(212, 175, 55, 0.18)',
          marginBottom: isMobile ? '8px' : '14px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#D4AF37',
            boxShadow: '0 0 8px #D4AF37',
          }}
        />
        <span
          style={{
            fontSize: '0.66rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            color: '#F8E7A2',
            textTransform: 'uppercase',
          }}
        >
          ROYALE PRIVÉ · HIGH ROLLER ECOSYSTEM
        </span>
      </motion.div>

      {/* Main Interactive Text-Repel Headline (Touchpoint 17) */}
      <TextRepelHeadline isMobile={isMobile} />

      {/* Value Proposition Description */}
      <motion.p
        // This copy is a mobile LCP candidate, so it cannot begin transparent.

        style={{
          fontSize: isMobile ? '0.82rem' : '0.98rem',
          color: 'rgba(255, 255, 255, 0.88)',
          lineHeight: isMobile ? 1.35 : 1.45,
          marginBottom: isMobile ? '12px' : '20px',
          fontWeight: 500,
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '100%',
          width: '100%',
        }}
      >
        Erlebe die Zukunft des Online-Casinos: 100% Willkommensbonus, transparenter Provably-Fair
        Algorithmus, instant Auszahlungen und VIP-Rakeback.
      </motion.p>

      {/* VIP Welcome Bonus-Claim Stage (Option 1) */}
      <motion.div
        // Keep the adjacent above-the-fold CTA paintable with the copy.

        style={{ marginBottom: isMobile ? '10px' : '18px' }}
      >
        <div
          style={{
            borderRadius: '16px',
            background:
              'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(18, 18, 24, 0.9) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            padding: isMobile ? '10px 12px' : '10px 14px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            gap: isMobile ? '8px' : '10px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Bonus Code Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
              flex: isMobile ? '1 1 auto' : '0 1 auto',
            }}
          >
            <div
              style={{
                padding: '3px 7px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.60rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 800,
                }}
              >
                CODE:
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#D4AF37',
                  fontWeight: 1000,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              >
                VIPPRO
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.80rem',
                  fontWeight: 1000,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                }}
              >
                100% BONUS <span style={{ color: '#00E701' }}>+$500</span>
              </div>
              <div
                style={{
                  fontSize: '0.62rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                + Instant VIP Rakeback
              </div>
            </div>
          </div>

          {/* Bonus Claim Button */}
          <Magnetic>
            <motion.button
              onClick={onBonusActivate}
              onMouseEnter={() => soundManager.playHover()}
              whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(212, 175, 55, 0.55)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                height: '38px',
                padding: '0 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                color: '#000',
                fontSize: '0.74rem',
                fontWeight: 1000,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                width: isMobile ? '100%' : 'auto',
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/2026-09-06_icon-promo-bonus-quantum-gold_v001.png"
                alt=""
                width={13}
                height={13}
                aria-hidden
              />{' '}
              BONUS AKTIVIEREN
            </motion.button>
          </Magnetic>
        </div>

        {/* Direct Games Sub-Link — Desktop only */}
        {!isMobile && (
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
        )}
      </motion.div>

      {/* Dynamic Trust & Social Proof Bar — Desktop only */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '24px',
            background: 'rgba(14, 17, 24, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
            fontSize: '0.68rem',
            fontWeight: 700,
            maxWidth: '100%',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
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
            <Image
              src="/images/2026-09-06_icon-security-verified-quantum-gold_v001.png"
              alt="Provably Fair"
              width={11}
              height={11}
              aria-hidden
            />
            <span>100% PROVABLY FAIR</span>
          </div>

          {/* Micro-Divider */}
          <div
            style={{
              width: '1px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.12)',
              flexShrink: 0,
            }}
          />

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
                <Image
                  key={i}
                  src="/images/2026-09-06_icon-star-rating-quantum-gold_v001.png"
                  alt=""
                  width={9}
                  height={9}
                  aria-hidden
                />
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
          <div
            style={{
              width: '1px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.12)',
              flexShrink: 0,
            }}
          />

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
            <span>INSTANT AUSZAHLUNG</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
