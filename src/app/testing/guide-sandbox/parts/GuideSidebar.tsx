'use client';

import { motion } from 'framer-motion';
import { SIDEBAR_TOPICS } from '@/components/social/casino-guide/guide-config';

interface GuideSidebarProps {
  onPickTopic: (query: string) => void;
}

export function GuideSidebar({ onPickTopic }: GuideSidebarProps) {
  return (
    <aside
      style={{
        width: '240px',
        borderRight: '1px solid hsla(var(--primary), 0.12)',
        background: 'hsla(var(--primary), 0.02)',
        padding: '14px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: '0.64rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'hsl(var(--primary))',
          paddingLeft: '6px',
        }}
      >
        Themen &amp; Schnellzugriff
      </div>

      {SIDEBAR_TOPICS.map((group) => (
        <div key={group.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '0.60rem',
              fontWeight: 700,
              color: 'hsl(var(--text-muted))',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '2px 6px',
            }}
          >
            {group.category}
          </span>

          {group.items.map((item) => (
            <motion.button
              key={item.label}
              type="button"
              whileHover={{
                x: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPickTopic(item.query)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: 'transparent',
                color: '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '3px',
                    height: '11px',
                    borderRadius: '2px',
                    background: 'rgba(212, 175, 55, 0.45)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    color: '#E2E8F0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      ))}

      {/* Ultra-Subtle RAG status footer */}
      <div
        style={{
          marginTop: 'auto',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.7,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 4px #10b981',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '0.60rem', color: 'hsl(var(--text-muted))' }}>
          RAG v2026.08 active
        </span>
      </div>
    </aside>
  );
}
