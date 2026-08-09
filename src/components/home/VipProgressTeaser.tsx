'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

const RankBenefitsModal = dynamic(() => import('@/components/casino/RankBenefitsModal'), {
  ssr: false,
});

interface VipTier {
  name: string;
  wager: string;
  rakeback: string;
  image: string;
  accent: string;
}

const VIP_TIERS: VipTier[] = [
  {
    name: 'BRONZE',
    wager: '$0',
    rakeback: '5% Rakeback',
    image: '/images/vip-bronze-3d.png',
    accent: '#CD7F32',
  },
  {
    name: 'SILVER',
    wager: '$10,000',
    rakeback: '8% Rakeback',
    image: '/images/vip-silver-3d.png',
    accent: '#C0C0C0',
  },
  {
    name: 'GOLD',
    wager: '$50,000',
    rakeback: '12% Rakeback + VIP Host',
    image: '/images/vip-gold-3d.png',
    accent: '#D4AF37',
  },
  {
    name: 'PLATINUM',
    wager: '$250,000',
    rakeback: '18% Rakeback + Daily Bonus',
    image: '/images/vip-platinum-3d.png',
    accent: '#E5E4E2',
  },
  {
    name: 'DIAMOND',
    wager: '$1,000,000',
    rakeback: '25% Custom Rakeback',
    image: '/images/vip-diamond-3d.png',
    accent: '#b9f2ff',
  },
];

export const VipProgressTeaser: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [showRankModal, setShowRankModal] = useState(false);

  return (
    <section style={{ marginBottom: '60px' }}>
      <div
        style={{
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(24, 18, 28, 0.78) 0%, rgba(10, 10, 14, 0.88) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.18), 0 12px 32px rgba(0, 0, 0, 0.7)',
          padding: isMobile ? '24px 18px' : '36px 36px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#D4AF37',
                fontSize: '0.75rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}
            >
              <Crown size={14} /> EXKLUSIVER VIP CLUB
            </div>
            <h2
              style={{
                fontSize: isMobile ? '1.6rem' : '2.2rem',
                fontWeight: 1000,
                color: '#fff',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              LEVEL UP & RAKEBACK BELOHNUNGEN
            </h2>
          </div>

          <motion.button
            onClick={() => {
              soundManager.playClick();
              setShowRankModal(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
              color: '#000',
              fontSize: '0.85rem',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
            }}
          >
            ALLE VIP STUFEN ANSEHEN
          </motion.button>
        </div>

        {/* Tier Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: '16px',
          }}
        >
          {VIP_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                borderRadius: '16px',
                background: 'rgba(15, 15, 20, 0.8)',
                border: `1px solid ${tier.accent}40`,
                padding: '20px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px',
                  marginBottom: '12px',
                }}
              >
                <Image
                  src={tier.image}
                  alt={tier.name}
                  fill
                  sizes="100px"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 1000,
                    color: tier.accent,
                    letterSpacing: '0.05em',
                    marginBottom: '2px',
                  }}
                >
                  {tier.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  Wager: {tier.wager}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#fff',
                    background: 'rgba(255, 255, 255, 0.06)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {tier.rakeback}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showRankModal && (
        <RankBenefitsModal isOpen={showRankModal} onClose={() => setShowRankModal(false)} />
      )}
    </section>
  );
};
