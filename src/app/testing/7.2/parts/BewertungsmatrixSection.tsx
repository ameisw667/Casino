import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

export function BewertungsmatrixSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
        <h2 style={sectionHeadingStyle}>
          <ShieldCheck size={22} style={{ color: '#d4af37' }} />
          3. Bewertungsmatrix der Header-Nuancen
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
              <th style={{ padding: '16px', color: '#94a3b8' }}>Option 1-b (Plain Header)</th>
              <th style={{ padding: '16px', color: '#e5c158' }}>Option 2-b (Clean Sans)</th>
              <th style={{ padding: '16px', color: '#34d399' }}>Option 2-c (Seamless Box) ★</th>
            </tr>
          </thead>
          <tbody style={{ color: '#e2e8f0' }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Header-Ästhetik & Balance-Integration
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Mäßig</td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>Gut (Geführt)</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Perfekt (Single-Box Seamless)
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Sehkomfort & Typografie
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Redundant ($ doppelt)</td>
              <td style={{ padding: '16px', color: '#e5c158' }}>Sauber</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Maximaler VIP Komfort
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Harmonie mit 7.1 &lt;BetModeTabs /&gt;
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>100% Identisch</td>
              <td style={{ padding: '16px', color: '#e5c158' }}>100% Identisch</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>100% Identisch</td>
            </tr>
            <tr>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Empfohlener Einsatzbereich
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Veraltet</td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>Standard</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Haupt-Standard für alle Spiele
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
