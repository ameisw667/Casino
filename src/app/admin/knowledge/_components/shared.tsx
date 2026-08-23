import type React from 'react';

export interface GuideDoc {
  id: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  version?: string;
  is_active: boolean;
  updated_at: string;
}

export const TOPICS = [
  'blackjack',
  'crash',
  'dice',
  'roulette',
  'slots',
  'navigation',
  'commands',
  'economy',
  'vip_stats',
  'other',
] as const;

export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '0.65rem 0.85rem',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export interface KnowledgeFormState {
  id: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string;
  isActive: boolean;
}

export interface SubmitMsg {
  kind: 'ok' | 'err';
  text: string;
}

export function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...style }}>
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
