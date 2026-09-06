import React from 'react';

interface ComponentSectionHeaderProps {
  kicker: string;
  title: string;
  kickerColor: string;
  badge: string;
}

export function ComponentSectionHeader({
  kicker,
  title,
  kickerColor,
  badge,
}: ComponentSectionHeaderProps) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: kickerColor,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {kicker}
          </span>
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '4px 0 0 0',
            }}
          >
            {title}
          </h2>
        </div>
        {badge && (
          <span
            style={{
              padding: '4px 12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 800,
              borderRadius: '8px',
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
