'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';
import type { HistoryRow } from './HistoryTableStream';
import { formatFullTime, getGameConfig } from './historyRowFormat';
import type { SessionGroup, HistoryVirtualItem } from './useHistorySessionGroups';
import { useHistoryVirtualList } from './useHistoryVirtualList';
import { useSeenRowIds } from './useSeenRowIds';

interface HistoryTableStreamMobileProps {
  items: HistoryVirtualItem[];
  onSelectRow?: (row: HistoryRow) => void;
}

function MobileSessionHeader({ group }: { group: SessionGroup }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.45)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        borderTopLeftRadius: '14px',
        borderTopRightRadius: '14px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Calendar size={11} color="#D4AF37" />
        <span style={{ fontSize: '0.70rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.9)' }}>
          {group.label}
        </span>
        <span style={{ fontSize: '0.60rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700 }}>
          • {group.totalBets}R
        </span>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.70rem',
          fontWeight: 900,
          color: group.netProfit >= 0 ? '#10b981' : '#ef4444',
          background: group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          padding: '1px 5px',
          borderRadius: '4px',
        }}
      >
        {group.netProfit >= 0 ? '+' : '-'}${Math.abs(group.netProfit).toFixed(2)}
      </span>
    </div>
  );
}

function MobileBetRow({
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
      initial={shouldAnimateIn ? { opacity: 0, y: 3 } : false}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelectRow?.(row)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        cursor: 'pointer',
        background: 'rgba(12, 14, 20, 0.5)',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: 0,
          flex: '1 1 auto',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontWeight: 800,
              color: '#ffffff',
              fontSize: '0.76rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.name}
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatFullTime(row.created_at)}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
          marginLeft: '8px',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 950,
              fontSize: '0.80rem',
              color: isWin ? '#10b981' : '#ef4444',
              whiteSpace: 'nowrap',
            }}
          >
            {isWin ? '+' : '-'}${absAmount.toFixed(2)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.58rem',
              color: isBigMultiplier ? '#FFD700' : 'rgba(255, 255, 255, 0.45)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {multValue}x
          </span>
        </div>
        <ChevronRight size={12} color="#D4AF37" />
      </div>
    </motion.div>
  );
}

export function HistoryTableStreamMobile({ items, onSelectRow }: HistoryTableStreamMobileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { virtualizer, scrollMargin } = useHistoryVirtualList({
    items,
    isMobile: true,
    containerRef,
  });
  const seenRowIds = useSeenRowIds();
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        background:
          'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 12, 16, 0.96) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const item = items[virtualRow.index];
            if (!item) return null;
            const translateY = virtualRow.start - scrollMargin;

            return (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${translateY}px)`,
                }}
              >
                {item.type === 'header' ? (
                  <MobileSessionHeader group={item.group} />
                ) : (
                  <MobileBetRow
                    row={item.row}
                    onSelectRow={onSelectRow}
                    shouldAnimateIn={!seenRowIds.current.has(item.row.id)}
                  />
                )}
                {item.type === 'row' ? seenRowIds.current.add(item.row.id) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
