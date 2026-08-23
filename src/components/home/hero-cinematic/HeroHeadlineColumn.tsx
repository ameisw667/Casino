'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';
import { soundManager } from '@/lib/casino/sound-manager';

interface HeroHeadlineColumnProps {
  isMobile: boolean;
  onBonusActivate: () => void;
}

export function HeroHeadlineColumn({ isMobile, onBonusActivate }: HeroHeadlineColumnProps) {
  return (
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
        Erlebe die Zukunft des Online-Casinos: 100% Willkommensbonus, transparenter Provably-Fair
        Algorithmus, instant Auszahlungen und VIP-Rakeback.
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
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
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
              onClick={onBonusActivate}
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
  );
}
