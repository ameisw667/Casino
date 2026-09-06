import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

export function BewertungsmatrixSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
        <h2 style={sectionHeadingStyle}>
          <ShieldCheck size={22} style={{ color: '#d4af37' }} />
          3. Bewertungsmatrix der High-Contrast Optionen
        </h2>
      </div>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0b0e14',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
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
              <th style={{ padding: '16px', color: '#94a3b8' }}>Option 1-b (Baseline)</th>
              <th style={{ padding: '16px', color: '#fef08a' }}>
                Option 1-b1 (High-Contrast Solid) ★
              </th>
              <th style={{ padding: '16px', color: '#e5c158' }}>Option 1-b2 (Inverted Metallic)</th>
            </tr>
          </thead>
          <tbody style={{ color: '#e2e8f0' }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Harmonie mit 7.1 & 7.2 Standards
              </td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>100% Identisch</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>100% Identisch</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>100% Identisch</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Kontrastverhältnis (Lesbarkeit)
              </td>
              <td style={{ padding: '16px', color: '#fb7185' }}>Mäßig</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Maximal (WCAG AAA 14:1)
              </td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Maximal (Stark Invertiert)
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                VIP Ästhetik & Haptik
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Etwas Blass</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Strenge VIP Autorität
              </td>
              <td style={{ padding: '16px', color: '#e5c158' }}>Sehr Präsent</td>
            </tr>
            <tr>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Empfohlener Einsatzbereich
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Veraltet</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Haupt-CTA für alle Casino-Spiele
              </td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>
                Alternative für Inverted Trigger
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
