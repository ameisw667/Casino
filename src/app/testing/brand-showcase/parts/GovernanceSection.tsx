import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function GovernanceSection() {
  return (
    <section
      style={{
        background:
          'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(11, 15, 24, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#e5c158',
          fontWeight: 800,
          fontSize: '0.9rem',
        }}
      >
        <ShieldCheck size={20} /> LLM & DEVELOPER GOVERNANCE DIRECTIVE:
      </div>
      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
        Vor jedem Bau neuer Spiele oder Refactoring bestehender Control-Panels (Crash, Dice, Slots,
        Roulette, Blackjack)
        <strong> MÜSSEN</strong> die in dieser Showcase vordefinierten Komponenten importiert und
        konsumiert werden. Kein LLM und kein Entwickler darf ad-hoc Inline-Buttons, abweichende
        Sliders oder benutzerdefinierte Tab-Hintergründe erstellen.
      </p>
    </section>
  );
}
