'use client';
import { useRef } from 'react';
import type { HistoryRow } from './HistoryTableStream';
import { BetRow } from './HistoryTableStreamDesktopBetRow';
import { DesktopHeaderRow, SessionHeaderRow } from './HistoryTableStreamDesktopHeaders';
import type { HistoryVirtualItem } from './useHistorySessionGroups';
import { useHistoryVirtualList } from './useHistoryVirtualList';
import { useSeenRowIds } from './useSeenRowIds';

interface HistoryTableStreamDesktopProps {
  items: HistoryVirtualItem[];
  onSelectRow?: (row: HistoryRow) => void;
}

export function HistoryTableStreamDesktop({ items, onSelectRow }: HistoryTableStreamDesktopProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { virtualizer, scrollMargin } = useHistoryVirtualList({
    items,
    isMobile: false,
    containerRef,
  });
  const seenRowIds = useSeenRowIds();
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        background:
          'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 12, 16, 0.96) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      <DesktopHeaderRow />
      <div ref={containerRef} role="table" style={{ position: 'relative', width: '100%' }}>
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
                  <SessionHeaderRow group={item.group} />
                ) : (
                  <BetRow
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
