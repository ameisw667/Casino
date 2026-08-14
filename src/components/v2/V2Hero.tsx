'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck,
  Crown,
  UserPlus,
  Star,
  Coins,
  CreditCard,
  Landmark,
  Wallet,
} from 'lucide-react';
import { V2WheelArt } from './V2WheelArt';

const PAY_ICONS = [Star, Coins, CreditCard, Landmark, Wallet, ShieldCheck, Crown, UserPlus];

export function V2Hero() {
  return (
    <section className="v2-hero">
      <div>
        <span className="v2-eyebrow">
          <Star size={12} fill="currentColor" /> New · Instant Play
        </span>

        <motion.h1
          className="v2-h1"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.span
            className="v2-h1-line"
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
          >
            Zero Friction.
          </motion.span>
          <motion.span
            className="v2-h1-line"
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
          >
            All Action.
          </motion.span>
        </motion.h1>

        <div className="v2-trust-row">
          <div className="v2-trust-item">
            <ShieldCheck size={18} color="hsl(var(--v2-cyan))" />
            Highest rebate in online gaming
          </div>
          <div className="v2-trust-item">
            <Crown size={18} color="hsl(var(--v2-gold))" />
            Elite VIP perks for high rollers
          </div>
        </div>

        <p className="v2-highlight">Earn up to 62.5% rakeback on every bet.</p>

        <div className="v2-cta-row">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <Link href="/sign-up" className="v2-btn v2-btn-fill">
              <UserPlus size={18} />
              Register Now
            </Link>
          </motion.div>
          <Link href="/games" className="v2-btn v2-btn-ghost">
            <span>Start playing now →</span>
          </Link>
        </div>

        <div className="v2-pay-strip">
          {PAY_ICONS.map((Icon, i) => (
            <span key={i} className="v2-pay-tile">
              <Icon size={16} />
            </span>
          ))}
        </div>
      </div>

      <V2WheelArt />
    </section>
  );
}
