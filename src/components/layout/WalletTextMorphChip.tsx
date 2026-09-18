'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { IconBadge } from '@/components/layout/IconBadge';

export type CurrencyMode = 'USD' | 'ETH' | 'BTC' | 'CR';

interface WalletTextMorphChipProps {
  balance: number;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  isMobile: boolean;
}

export function WalletTextMorphChip({
  balance,
  hideBalance,
  onToggleHideBalance,
  isMobile,
}: WalletTextMorphChipProps) {
  const [currency, setCurrency] = useState<CurrencyMode>('USD');
  const [isHovered, setIsHovered] = useState(false);

  const cycleCurrency = () => {
    const modes: CurrencyMode[] = ['USD', 'ETH', 'BTC', 'CR'];
    const nextIdx = (modes.indexOf(currency) + 1) % modes.length;
    setCurrency(modes[nextIdx]);
  };

  const getFormattedValue = (): { symbol: string; value: string; code: CurrencyMode } => {
    if (hideBalance) {
      return { symbol: '', value: '••••••', code: currency };
    }
    switch (currency) {
      case 'ETH':
        return {
          symbol: 'Ξ',
          value: (balance / 3300).toFixed(3),
          code: 'ETH',
        };
      case 'BTC':
        return {
          symbol: '₿',
          value: (balance / 68000).toFixed(4),
          code: 'BTC',
        };
      case 'CR':
        return {
          symbol: '◈',
          value: (balance * 100).toLocaleString('en-US', { maximumFractionDigits: 0 }),
          code: 'CR',
        };
      case 'USD':
      default:
        return {
          symbol: '$',
          value: balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          code: 'USD',
        };
    }
  };

  const { symbol, value, code } = getFormattedValue();
  const fullString = `${symbol}${value}`;

  return (
    <div
      data-testid="wallet-text-morph-chip"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 10,
        padding: isMobile ? '5px 10px 5px 6px' : '4px 10px',
        borderRadius: isMobile ? 9999 : 12,
        background: isMobile
          ? 'linear-gradient(135deg, rgba(20, 24, 34, 0.95) 0%, rgba(11, 14, 20, 0.98) 100%)'
          : isHovered
            ? 'rgba(255, 255, 255, 0.04)'
            : 'transparent',
        border: isMobile
          ? '1px solid rgba(212, 175, 55, 0.3)'
          : '1px solid transparent',
        boxShadow: isMobile
          ? '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.2)'
          : 'none',
        backdropFilter: isMobile ? 'blur(16px)' : undefined,
        WebkitBackdropFilter: isMobile ? 'blur(16px)' : undefined,
        transition: 'background 0.2s ease, border-color 0.2s ease',
        userSelect: 'none',
      }}
    >
      {/* Wallet Icon Button - clicks cycle currency */}
      <button
        onClick={cycleCurrency}
        aria-label={`Währung wechseln (aktuell: ${code})`}
        title="Klicken um Währung zu wechseln (USD, ETH, BTC, CR)"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconBadge tone="gold" size={isMobile ? 22 : 26}>
          <Wallet size={isMobile ? 11 : 13} color="#000" />
        </IconBadge>
      </button>

      {/* Morphing Typography Display */}
      <div
        onClick={cycleCurrency}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          minWidth: isMobile ? 75 : 95,
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {fullString.split('').map((char, index) => (
            <motion.span
              key={`${code}-${index}-${char}`}
              initial={{ opacity: 0, y: -8, scale: 0.85, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, scale: 0.85, filter: 'blur(2px)' }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                mass: 0.8,
                delay: index * 0.012,
              }}
              style={{
                display: 'inline-block',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: isMobile ? '0.9rem' : '1.12rem',
                letterSpacing: '-0.02em',
              }}
            >
              {char}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Currency badge indicator */}
        <span
          style={{
            marginLeft: 4,
            fontSize: 9,
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'rgba(255, 255, 255, 0.65)',
            padding: '1px 5px',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            lineHeight: 1.2,
          }}
        >
          {code}
        </span>
      </div>

      {/* Mini switch hint on hover */}
      {isHovered && !isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, color: '#FFFFFF' }}
          onClick={cycleCurrency}
          aria-label="Währung wechseln"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
        >
          <RefreshCw size={11} />
        </motion.button>
      )}

      {/* Visibility Toggle Eye */}
      <button
        onClick={onToggleHideBalance}
        className="no-mobile-minheight"
        aria-label={hideBalance ? 'Guthaben einblenden' : 'Guthaben ausblenden'}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.35)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
        }}
      >
        {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
}

export default WalletTextMorphChip;
