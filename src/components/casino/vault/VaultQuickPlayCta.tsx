'use client';
import { motion } from 'framer-motion';
import { Rocket, ArrowUpRight } from 'lucide-react';

interface VaultQuickPlayCtaProps {
  onPlayNow: () => void;
}

export function VaultQuickPlayCta({ onPlayNow }: VaultQuickPlayCtaProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlayNow}
      style={{
        borderRadius: '16px',
        backgroundImage:
          'linear-gradient(100deg, rgba(6,5,3,0.75) 0%, rgba(6,5,3,0.45) 40%, rgba(6,5,3,0.1) 75%), url(/images/vault-playnow-bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(212,175,55,0.35)',
        boxShadow: '0 10px 28px rgba(212,175,55,0.15)',
        padding: '22px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <Rocket size={18} color="#D4AF37" />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            Play Now
          </div>
          <div
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.75)',
              textShadow: '0 1px 6px rgba(0,0,0,0.6)',
            }}
          >
            Crash, Dice, Roulette & more
          </div>
        </div>
      </div>
      <ArrowUpRight
        size={18}
        color="rgba(255,255,255,0.85)"
        style={{ position: 'relative', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}
      />
    </motion.div>
  );
}
