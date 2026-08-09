'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Percent, Gem, type LucideIcon } from 'lucide-react';
import type { V2Promo } from './v2-data';

const ART_ICONS: Record<string, LucideIcon> = {
  king: Crown,
  rakeback: Percent,
  rewards: Gem,
};

interface V2PromoCardProps {
  promo: V2Promo;
}

export function V2PromoCard({ promo }: V2PromoCardProps) {
  const Icon = ART_ICONS[promo.id] ?? Gem;

  return (
    <motion.div
      className={`v2-promo-card tone-${promo.tone}`}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className="v2-promo-art" style={{ background: promo.artColor }}>
        <Icon size={48} color="rgba(0,0,0,0.55)" strokeWidth={1.5} />
      </div>
      <h3 className="v2-promo-title">{promo.title}</h3>
      <button type="button" className="v2-btn v2-btn-fill v2-promo-cta">
        {promo.cta}
      </button>
    </motion.div>
  );
}
