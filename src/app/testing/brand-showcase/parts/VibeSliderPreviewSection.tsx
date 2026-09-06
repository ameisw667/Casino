import React from 'react';
import { richtlinienListStyle } from './shared';

interface VibeSliderPreviewSectionProps {
  sliderValue: number;
  onSliderValueChange: (value: number) => void;
}

export function VibeSliderPreviewSection({
  sliderValue,
  onSliderValueChange,
}: VibeSliderPreviewSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: '#e5c158',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Initiative 7.4 · Vorschau Standard
        </span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
          &lt;VibeSlider /&gt; — Brand Range & Dice Slider
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Live Mockup VibeSlider */}
        <div
          style={{
            background: '#0b0e14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#94a3b8',
                fontFamily: 'var(--font-mono)',
              }}
            >
              DICE ROLL SLIDER (VALUE: {sliderValue})
            </span>
          </div>

          {/* Slider Track Representation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                position: 'relative',
                height: '14px',
                borderRadius: '9999px',
                background: `linear-gradient(90deg, #f43f5e ${sliderValue}%, #10b981 ${sliderValue}%)`,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <input
                type="range"
                min="1"
                max="99"
                value={sliderValue}
                onChange={(e) => onSliderValueChange(parseInt(e.target.value))}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${sliderValue}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  background: '#131a26',
                  border: '2px solid #d4af37',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Contract Description 7.4 */}
        <div
          style={{
            background: '#0b0e14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#e5c158', fontSize: '0.85rem' }}>
            7.4 Design-Richtlinien:
          </div>
          <ul style={richtlinienListStyle}>
            <li>Dual-Gradient Track (Rot für Verlustbereich, Smaragd-Grün für Gewinnbereich).</li>
            <li>
              Glassmorphic Metallic-Handle (`#131a26`) mit messerscharfer Gold-Umrandung
              (`#d4af37`).
            </li>
            <li>Sanftes Dragging und Haptik-Feedback beim Ziehen.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
