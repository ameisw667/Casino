'use client';

import { motion } from 'framer-motion';

import { SIDEBAR_TOPICS } from '@/components/social/casino-guide/guide-config';

interface GuideSidebarProps {
  isSending: boolean;
  onTopicClick: (query: string) => void;
}

export function GuideSidebar({ isSending, onTopicClick }: GuideSidebarProps) {
  return (
    <aside
      style={{
        width: '240px',
        borderRight: '1px solid hsla(var(--primary), 0.14)',
        background: 'hsla(var(--primary), 0.02)',
        padding: '14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'hsl(var(--primary))',
        }}
      >
        Themen & Schnellzugriff
      </div>

      {SIDEBAR_TOPICS.map((group) => (
        <div key={group.category} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span
            style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              color: 'hsl(var(--text-muted))',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {group.category}
          </span>
          {group.items.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.label}
                type="button"
                whileHover={{ x: 3, backgroundColor: 'hsla(var(--primary), 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTopicClick(item.query)}
                disabled={isSending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  background: 'transparent',
                  color: 'hsl(var(--text-main))',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: isSending ? 'not-allowed' : 'pointer',
                }}
              >
                <IconComponent size={13} color="hsl(var(--primary))" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      ))}

      <div
        style={{
          marginTop: 'auto',
          padding: '10px',
          borderRadius: '10px',
          background: 'hsla(var(--primary), 0.05)',
          border: '1px solid hsla(var(--primary), 0.15)',
          fontSize: '0.64rem',
          color: 'hsl(var(--text-muted))',
          lineHeight: 1.4,
        }}
      >
        <strong
          style={{
            color: 'hsl(var(--primary))',
            display: 'block',
            marginBottom: '2px',
          }}
        >
          Hybrid RAG v2026.08
        </strong>
        Antwortet aus 10 verifizierten Casino-Dokumenten mit Provably-Fair-Garantie.
      </div>
    </aside>
  );
}
