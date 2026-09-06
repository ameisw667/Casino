import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

export function BewertungsmatrixSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
        <h2 style={sectionHeadingStyle}>
          <ShieldCheck size={22} style={{ color: '#d4af37' }} /> 3. Bewertungsmatrix der Colorway
          Varianten
        </h2>
      </div>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0b0e14',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#121826',
                color: '#cbd5e1',
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <th style={{ padding: '16px' }}>Kriterium</th>
              <th style={{ padding: '16px', color: '#e5c158' }}>Option 1-b1 (Obsidian Gold) ★</th>
              <th style={{ padding: '16px', color: '#34d399' }}>Option 1-b (Baseline Emerald)</th>
              <th style={{ padding: '16px', color: '#38bdf8' }}>Option 1-b2 (Platinum Ice)</th>
            </tr>
          </thead>
          <tbody style={{ color: '#e2e8f0' }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Harmonie mit Brand System (7.1–7.3)
              </td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                100% Perfekt (Gold VIP)
              </td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>Mäßig (Grüne Abweichung)</td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>Mäßig (Blaue Abweichung)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
