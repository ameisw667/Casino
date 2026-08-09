'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Spade,
  TrendingUp,
  Dice5,
  Disc3,
  Cherry,
  Trophy,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { V2Chip } from './V2Chip';
import { V2_RACES } from './v2-data';

interface V2NavLink {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_LINKS: V2NavLink[] = [
  { id: 'home', label: 'Casino', href: '/v2', icon: <Home size={18} /> },
  { id: 'blackjack', label: 'Blackjack', href: '/games/blackjack', icon: <Spade size={18} /> },
  { id: 'crash', label: 'Crash', href: '/games/crash', icon: <TrendingUp size={18} /> },
  { id: 'dice', label: 'Dice', href: '/games/dice', icon: <Dice5 size={18} /> },
  { id: 'roulette', label: 'Roulette', href: '/games/roulette', icon: <Disc3 size={18} /> },
  { id: 'slots', label: 'Slots', href: '/games/slots', icon: <Cherry size={18} /> },
];

interface V2SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  rank: string;
}

export function V2Sidebar({ isOpen, onClose, level, rank }: V2SidebarProps) {
  return (
    <>
      {isOpen && <div className="v2-sidebar-scrim" onClick={onClose} />}
      <aside className={`v2-sidebar${isOpen ? 'is-open' : ''}`}>
        <nav className="v2-nav-group">
          {NAV_LINKS.map((item, i) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <Link href={item.href} className={`v2-nav-item${i === 0 ? 'active' : ''}`}>
                {item.icon}
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <nav className="v2-nav-group">
          <div className="v2-nav-item" style={{ pointerEvents: 'none' }}>
            <Trophy size={18} />
            Leaderboard
          </div>
          {V2_RACES.map((race) => (
            <div key={race.id} className="v2-nav-sub">
              <span>{race.label}</span>
              <V2Chip mono className="v2-chip-day">
                {race.daysLeft} D.
              </V2Chip>
            </div>
          ))}
        </nav>

        <div className="v2-widget">
          <div className="v2-widget-inner">
            <div className="v2-widget-title">
              <Zap size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Chip Rain
            </div>
            <p className="v2-widget-copy">
              Stick around — free chips drop every hour for active players.
            </p>
            <button type="button" className="v2-btn v2-btn-fill v2-promo-cta">
              Claim
            </button>
          </div>
        </div>

        <div className="v2-sidebar-foot">
          <Link href="/affiliate" className="v2-nav-item">
            <Users size={18} />
            Affiliate Program
          </Link>
          <button type="button" className="v2-btn v2-btn-outline" style={{ width: '100%' }}>
            <Wallet size={16} />
            Buy Crypto
          </button>
          <select className="v2-select" defaultValue="en" aria-label="Language">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
          <div className="v2-badge-row">
            <span className="v2-badge-circle" title="Level">
              Lv{level}
            </span>
            <span className="v2-badge-circle" title="Rank">
              {rank.slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
