import { Calendar } from 'lucide-react';
import type { SessionGroup } from './useHistorySessionGroups';

export const DESKTOP_COLUMN_TEMPLATE = '1.6fr 1fr 0.9fr 1fr 1fr 0.9fr';

export function DesktopHeaderRow() {
  return (
    <div
      role="row"
      style={{
        display: 'grid',
        gridTemplateColumns: DESKTOP_COLUMN_TEMPLATE,
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(0, 0, 0, 0.35)',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.64rem',
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <div role="columnheader" style={{ padding: '14px 18px' }}>
        Spiel & Kategorie
      </div>
      <div role="columnheader" style={{ padding: '14px 18px' }}>
        Zeitpunkt
      </div>
      <div role="columnheader" style={{ padding: '14px 18px' }}>
        Multiplikator
      </div>
      <div role="columnheader" style={{ padding: '14px 18px', textAlign: 'right' }}>
        Ergebnis / Profit
      </div>
      <div role="columnheader" style={{ padding: '14px 18px', textAlign: 'right' }}>
        Kontostand Danach
      </div>
      <div role="columnheader" style={{ padding: '14px 18px', textAlign: 'right' }}>
        Quittung
      </div>
    </div>
  );
}

export function SessionHeaderRow({ group }: { group: SessionGroup }) {
  return (
    <div
      role="row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        background: 'rgba(0, 0, 0, 0.45)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div role="cell" style={{ padding: '8px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={12} color="#D4AF37" />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.85)',
                letterSpacing: '0.02em',
              }}
            >
              {group.label}
            </span>
            <span
              style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700 }}
            >
              • {group.totalBets} {group.totalBets === 1 ? 'Runde' : 'Runden'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700 }}
            >
              Sitzungs-Netto:
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.72rem',
                fontWeight: 900,
                color: group.netProfit >= 0 ? '#10b981' : '#ef4444',
                background:
                  group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${group.netProfit >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              {group.netProfit >= 0 ? '+' : '-'}${Math.abs(group.netProfit).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
