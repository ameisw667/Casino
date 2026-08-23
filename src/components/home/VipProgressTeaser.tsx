'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
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
  isCurrent?: boolean;
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
    isCurrent: true,
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
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto 64px',
        padding: '0 8px',
      }}
    >
      {/* Floating Section Header (No Outer Box) */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#D4AF37',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            <Crown size={13} />
            <span>EXKLUSIVER VIP CLUB</span>
          </div>
          <h2
            style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 1000,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            LEVEL UP & RAKEBACK ROADMAP
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
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
            color: '#000',
            fontSize: '0.82rem',
            fontWeight: 900,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>ALLE VIP STUFEN ANSEHEN</span>
          <ChevronRight size={14} />
        </motion.button>
      </div>

      {/* Horizontal VIP Timeline Track (Frameless & Organic) */}
      <div
        style={{
          position: 'relative',
          padding: isMobile ? '16px 0' : '24px 0',
        }}
      >
        {/* Continuous Background Timeline Line */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              top: '58px',
              left: '8%',
              right: '8%',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.08)',
              zIndex: 1,
            }}
          >
            {/* Active Unlocked Progress Beam (Bronze to Silver) */}
            <div
              style={{
                width: '28%',
                height: '100%',
                background: 'linear-gradient(90deg, #CD7F32 0%, #C0C0C0 70%, #D4AF37 100%)',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
              }}
            />
          </div>
        )}

        {/* 5 Interconnected Timeline Nodes */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: isMobile ? '20px' : '16px',
          }}
        >
          {VIP_TIERS.map((tier, idx) => {
            const isHovered = hoveredTier === tier.name;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                onMouseEnter={() => {
                  soundManager.playHover();
                  setHoveredTier(tier.name);
                }}
                onMouseLeave={() => setHoveredTier(null)}
                whileHover={{ y: -6 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                {/* Node Ring with 3D Icon */}
                <div
                  style={{
                    position: 'relative',
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    padding: '4px',
                    background: tier.isCurrent
                      ? `radial-gradient(circle, ${tier.accent} 0%, rgba(10, 10, 15, 0.9) 100%)`
                      : 'rgba(20, 20, 28, 0.85)',
                    border: `2px solid ${tier.isCurrent ? tier.accent : isHovered ? tier.accent : 'rgba(255, 255, 255, 0.12)'}`,
                    boxShadow:
                      tier.isCurrent || isHovered
                        ? `0 0 25px ${tier.accent}50, 0 8px 24px rgba(0, 0, 0, 0.7)`
                        : '0 8px 20px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(16px)',
                    marginBottom: '14px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={tier.image}
                      alt={tier.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>

                  {/* Current Status Pin */}
                  {tier.isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: tier.accent,
                        color: '#000',
                        fontSize: '0.58rem',
                        fontWeight: 1000,
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        boxShadow: `0 2px 8px ${tier.accent}60`,
                      }}
                    >
                      AKTIV
                    </div>
                  )}
                </div>

                {/* Tier Title */}
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 1000,
                    color: tier.isCurrent ? '#fff' : tier.accent,
                    letterSpacing: '0.04em',
                    marginBottom: '2px',
                  }}
                >
                  {tier.name}
                </div>

                {/* Wager Milestone */}
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    marginBottom: '6px',
                  }}
                >
                  Wager: {tier.wager}
                </div>

                {/* Rakeback Tag */}
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: tier.accent,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${tier.accent}30`,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tier.rakeback}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {showRankModal && (
        <RankBenefitsModal isOpen={showRankModal} onClose={() => setShowRankModal(false)} />
      )}
    </section>
  );
};
