'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { HistoryTableStreamDesktop } from './HistoryTableStreamDesktop';
import { HistoryTableStreamMobile } from './HistoryTableStreamMobile';
import { flattenSessionGroups, groupRowsIntoSessions } from './useHistorySessionGroups';

export interface HistoryRow {
  id: string;
  game: string | null;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

interface HistoryTableStreamProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile?: boolean;
  onSelectRow?: (row: HistoryRow) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

function LoadMoreCTA({
  loadingMore,
  onLoadMore,
}: {
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
      <motion.button
        whileHover={loadingMore ? undefined : { scale: 1.02 }}
        whileTap={loadingMore ? undefined : { scale: 0.98 }}
        onClick={onLoadMore}
        disabled={loadingMore}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          borderRadius: '10px',
          background: loadingMore ? 'rgba(212, 175, 55, 0.06)' : 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          color: loadingMore ? 'rgba(212, 175, 55, 0.55)' : '#D4AF37',
          fontSize: '0.78rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: loadingMore ? 'wait' : 'pointer',
          opacity: loadingMore ? 0.7 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        {loadingMore ? 'Lade …' : 'Mehr laden'}
      </motion.button>
    </div>
  );
}

function HistoryLoadingSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(16, 18, 26, 0.75)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(16px)',
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '46px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        />
      ))}
    </div>
  );
}

function HistoryEmptyState() {
  return (
    <div
      style={{
        padding: '50px 24px',
        textAlign: 'center',
        background:
          'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        style={{
          color: '#D4AF37',
          background: 'rgba(212, 175, 55, 0.08)',
          padding: '14px',
          borderRadius: '50%',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <History size={32} />
      </div>
      <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>
        Keine Wetten im gewählten Filter gefunden
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.45)',
          maxWidth: '340px',
          lineHeight: 1.4,
        }}
      >
        Passe deine Filter an oder starte ein Casino Original, um neue Runden aufzuzeichnen.
      </div>
    </div>
  );
}

export function HistoryTableStream({
  loading,
  rows,
  isMobile = false,
  onSelectRow,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: HistoryTableStreamProps) {
  const items = useMemo(() => flattenSessionGroups(groupRowsIntoSessions(rows)), [rows]);

  if (loading) {
    return <HistoryLoadingSkeleton />;
  }

  if (rows.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : 0 }}>
      {isMobile ? (
        <HistoryTableStreamMobile items={items} onSelectRow={onSelectRow} />
      ) : (
        <HistoryTableStreamDesktop items={items} onSelectRow={onSelectRow} />
      )}
      {hasMore && onLoadMore ? (
        <LoadMoreCTA loadingMore={loadingMore} onLoadMore={onLoadMore} />
      ) : null}
    </div>
  );
}
