'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

export function JackpotPulseCard({ jackpotFormatted }: { jackpotFormatted: string }) {
  return (
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
        <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
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
          <div style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.5)' }}>GLOBAL RTP</div>
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
          <div style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.5)' }}>MAX PAYOUT</div>
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
  );
}
