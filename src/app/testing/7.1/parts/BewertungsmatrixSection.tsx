import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

export function BewertungsmatrixSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
        <h2 style={sectionHeadingStyle}>
          <ShieldCheck size={22} style={{ color: '#d4af37' }} />
          3. Bewertungsmatrix der Präzisions-Nuancen
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
              <th style={{ padding: '16px', color: '#94a3b8' }}>Status Quo (Alt)</th>
              <th style={{ padding: '16px', color: '#d4af37' }}>Variante A1 (Standard Gold)</th>
              <th style={{ padding: '16px', color: '#e5c158' }}>Variante A2 (Muted Champagne) ★</th>
            </tr>
          </thead>
          <tbody style={{ color: '#e2e8f0' }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Farbingensität / Sehkomfort
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Kalt (Slate Blau)</td>
              <td style={{ padding: '16px', color: '#fbbf24', fontWeight: 700 }}>
                Stark / Prägnant
              </td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Optimal Dezent & Edel
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Messerscharfe Gold-Kanten
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Nein</td>
              <td style={{ padding: '16px', color: '#d4af37', fontWeight: 800 }}>
                Ja (`1px solid #d4af37`)
              </td>
              <td style={{ padding: '16px', color: '#e5c158', fontWeight: 800 }}>
                Ja (`1px solid rgba(212,175,55,0.4)`)
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Integration ins Gesamt-Theme
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Abweichend</td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>Gut (Grob)</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Perfekt Harmonisch
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>
                Sound Integration
              </td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Nein</td>
              <td style={{ padding: '16px', color: '#d4af37', fontWeight: 800 }}>
                Ja (&apos;soundManager.play(&apos;click&apos;)&apos;)
              </td>
              <td style={{ padding: '16px', color: '#e5c158', fontWeight: 800 }}>
                Ja (&apos;soundManager.play(&apos;click&apos;)&apos;)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px', fontWeight: 800, color: '#ffffff' }}>Empfehlung</td>
              <td style={{ padding: '16px', color: '#94a3b8' }}>Veraltet</td>
              <td style={{ padding: '16px', color: '#cbd5e1' }}>Gut für CTA-Buttons</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: 800 }}>
                Empfohlen für Controls
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
