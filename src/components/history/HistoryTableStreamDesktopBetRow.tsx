import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { HistoryRow } from './HistoryTableStream';
import { DESKTOP_COLUMN_TEMPLATE } from './HistoryTableStreamDesktopHeaders';
import { formatFullTime, getGameConfig } from './historyRowFormat';

export function BetRow({
  row,
  onSelectRow,
  shouldAnimateIn,
}: {
  row: HistoryRow;
  onSelectRow?: (row: HistoryRow) => void;
  shouldAnimateIn: boolean;
}) {
  const isWin = row.amount > 0;
  const cfg = getGameConfig(row.game);
  const absAmount = Math.abs(row.amount);
  const multValue = isWin ? (row.amount / 10 + 1).toFixed(2) : '0.00';
  const isBigMultiplier = isWin && parseFloat(multValue) >= 3.0;

  return (
    <motion.div
      role="row"
      initial={shouldAnimateIn ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelectRow?.(row)}
      style={{
        display: 'grid',
        gridTemplateColumns: DESKTOP_COLUMN_TEMPLATE,
        borderBottom: '1px solid rgba(255, 255, 255, 0.025)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: 'transparent',
        height: '100%',
        boxSizing: 'border-box',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          'linear-gradient(90deg, rgba(212, 175, 55, 0.06) 0%, rgba(212, 175, 55, 0.01) 100%)';
        const indicator = e.currentTarget.querySelector(
          '.history-receipt-indicator',
        ) as HTMLElement | null;
        if (indicator) indicator.style.color = '#D4AF37';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        const indicator = e.currentTarget.querySelector(
          '.history-receipt-indicator',
        ) as HTMLElement | null;
        if (indicator) indicator.style.color = 'rgba(255, 255, 255, 0.35)';
      }}
    >
      <div role="cell" style={{ padding: '12px 18px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: '0.82rem',
                letterSpacing: '-0.01em',
              }}
            >
              {cfg.name}
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.7rem' }}>•</span>
            <span
              style={{
                fontSize: '0.66rem',
                color: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {cfg.category}
            </span>
          </div>
        </div>
      </div>

      <div
        role="cell"
        style={{
          padding: '12px 18px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
        }}
      >
        {formatFullTime(row.created_at)}
      </div>

      <div role="cell" style={{ padding: '12px 18px' }}>
        {isWin ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '6px',
              background: isBigMultiplier
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)'
                : 'rgba(16, 185, 129, 0.12)',
              border: isBigMultiplier
                ? '1px solid rgba(255, 215, 0, 0.5)'
                : '1px solid rgba(16, 185, 129, 0.25)',
              color: isBigMultiplier ? '#FFD700' : '#10b981',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 900,
              fontSize: '0.74rem',
              boxShadow: isBigMultiplier ? '0 0 10px rgba(212, 175, 55, 0.25)' : 'none',
            }}
          >
            {multValue}x
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: 'rgba(239, 68, 68, 0.65)',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          >
            0.00x
          </span>
        )}
      </div>

      <div role="cell" style={{ padding: '12px 18px', textAlign: 'right' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 950,
            fontSize: '0.88rem',
            color: isWin ? '#10b981' : '#ef4444',
            letterSpacing: '-0.01em',
            textShadow: isWin ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none',
          }}
        >
          {isWin ? '+' : '-'}$
          {absAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      <div role="cell" style={{ padding: '12px 18px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.82rem',
          }}
        >
          $
          {row.balance_after.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <div role="cell" style={{ padding: '12px 18px', textAlign: 'right' }}>
        <div
          className="history-receipt-indicator"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontSize: '0.68rem',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
        >
          <Image
            src="/images/2026-09-06_icon-security-verified-quantum-gold_v001.png"
            alt="Quittung"
            width={13}
            height={13}
            aria-hidden
          />
          <span>Quittung</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </motion.div>
  );
}
