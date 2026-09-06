'use client';

import { ArrowUp, Image as ImageIcon, Mic } from 'lucide-react';

interface ChatInputCapsuleProps {
  draft: string;
  personaLabel: string;
  onDraftChange: (text: string) => void;
  onSubmit: () => void;
}

export function ChatInputCapsule({
  draft,
  personaLabel,
  onDraftChange,
  onSubmit,
}: ChatInputCapsuleProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{
        padding: '14px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background:
          'linear-gradient(180deg, rgba(12, 16, 26, 0.75) 0%, rgba(8, 10, 16, 0.95) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '16px',
          background: 'rgba(20, 26, 38, 0.80)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), inset 0 1px 1.5px rgba(255, 255, 255, 0.18)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Top Info Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#D4AF37',
                boxShadow: '0 0 8px rgba(212, 175, 55, 0.7)',
              }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.02em',
              }}
            >
              Royale Copilot{' '}
              <strong style={{ color: '#D4AF37', fontWeight: 800 }}>• {personaLabel}</strong>
            </span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Enter ↵ zum Senden</span>
        </div>

        {/* Main Input Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            title="Screenshot oder Bild anhängen"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <ImageIcon size={16} />
          </button>

          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Frage zu Blackjack, Quoten, Hausvorteil oder Strategie stellen..."
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              background: 'transparent',
              color: '#FFFFFF',
              outline: 'none',
              padding: '6px 4px',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              lineHeight: 1.5,
            }}
          />

          <button
            type="button"
            title="Spracheingabe"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <Mic size={16} />
          </button>

          <button
            type="submit"
            disabled={!draft.trim()}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              border: 'none',
              borderRadius: '10px',
              background: draft.trim()
                ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              color: draft.trim() ? '#000000' : '#64748b',
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
              opacity: draft.trim() ? 1 : 0.5,
              boxShadow: draft.trim() ? '0 0 16px rgba(212, 175, 55, 0.5)' : 'none',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </form>
  );
}
