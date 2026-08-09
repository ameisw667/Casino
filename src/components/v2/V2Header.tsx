'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, ChevronDown, MessageCircle, Trophy, UserPlus } from 'lucide-react';
import { V2Chip } from './V2Chip';

interface V2HeaderProps {
  balance: number;
  onToggleSidebar: () => void;
}

export function V2Header({ balance, onToggleSidebar }: V2HeaderProps) {
  return (
    <header className="v2-header">
      <button
        type="button"
        className="v2-icon-btn v2-hamburger"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      <div className="v2-logo">
        CASINO <b>ROYALE</b>
      </div>

      <V2Chip mono className="v2-hide-mobile">
        RYL {balance.toFixed(2)}
      </V2Chip>

      <V2Chip icon={<Trophy size={14} />} promo className="v2-hide-mobile">
        King of the Table · 200,000 pool
      </V2Chip>

      <div className="v2-header-spacer" />

      <div className="v2-header-actions">
        <button type="button" className="v2-icon-btn v2-hide-mobile" aria-label="Search">
          <Search size={16} />
        </button>

        <V2Chip mono className="v2-hide-mobile">
          ${balance.toFixed(2)}
          <ChevronDown size={14} />
        </V2Chip>

        <motion.button
          type="button"
          className="v2-btn v2-btn-fill"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          Deposit
        </motion.button>

        <button type="button" className="v2-btn v2-btn-outline v2-hide-mobile">
          Withdraw
        </button>

        <div className="v2-avatar v2-hide-mobile">
          <span className="v2-avatar-dot">
            <UserPlus size={14} />
          </span>
          <span className="v2-avatar-name">Guest</span>
        </div>

        <button type="button" className="v2-icon-btn" aria-label="Chat">
          <MessageCircle size={16} />
        </button>
      </div>
    </header>
  );
}
