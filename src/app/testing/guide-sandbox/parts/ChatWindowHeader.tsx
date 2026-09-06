'use client';

import { Maximize2, X } from 'lucide-react';
import { GUIDE_PERSONAS, PERSONA_META, type GuidePersona } from '@/lib/casino/chat-guide/personas';

interface ChatWindowHeaderProps {
  activePersona: GuidePersona;
  onSelectPersona: (persona: GuidePersona) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function ChatWindowHeader({
  activePersona,
  onSelectPersona,
  onToggleExpanded,
}: ChatWindowHeaderProps) {
  const activeMeta = PERSONA_META[activePersona];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.25) 100%)',
      }}
    >
      {/* Links: Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div
          style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid #D4AF37',
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
            flexShrink: 0,
            background: '#0B0E14',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span
            style={{ fontSize: '16px', lineHeight: 1 }}
            role="img"
            aria-label={activeMeta.label}
          >
            {activeMeta.emoji}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ fontSize: '0.90rem', letterSpacing: '0.02em', color: '#ffffff' }}>
            Royale Guide
          </strong>
          <span
            style={{
              fontSize: '0.55rem',
              lineHeight: 1,
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'rgba(212, 175, 55, 0.16)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#D4AF37',
              fontWeight: 800,
            }}
          >
            AI
          </span>
        </div>
      </div>

      {/* Mitte: Persona Switcher */}
      <div
        role="radiogroup"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 6px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
        }}
      >
        {GUIDE_PERSONAS.map((p) => {
          const meta = PERSONA_META[p];
          const isSelected = activePersona === p;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onSelectPersona(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px 6px 8px',
                borderRadius: '9px',
                border: isSelected ? '1px solid #FFD700' : '1px solid transparent',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.06) 100%)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isSelected
                  ? '0 2px 10px rgba(0, 0, 0, 0.4), 0 0 12px rgba(212, 175, 55, 0.3)'
                  : 'none',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: isSelected
                    ? '1.5px solid #FFD700'
                    : '1px solid rgba(255, 255, 255, 0.25)',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <span
                  style={{ fontSize: '13px', lineHeight: 1 }}
                  role="img"
                  aria-label={meta.label}
                >
                  {meta.emoji}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 500,
                  color: isSelected ? '#FFD700' : '#CBD5E1',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rechts: Fenster-Aktionen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onToggleExpanded}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '28px',
            height: '28px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '7px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <Maximize2 size={13} />
        </button>
        <button
          type="button"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '28px',
            height: '28px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '7px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
