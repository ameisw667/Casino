'use client';

import { RotateCcw } from 'lucide-react';

export function HeaderInfoBar({ onReset }: { onReset: () => void }) {
  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto 20px',
        padding: '14px 20px',
        borderRadius: '14px',
        background: 'rgba(18, 22, 34, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.10rem', fontWeight: 800, color: '#D4AF37', margin: 0 }}>
          🏛️ Royale Guide — Finale Design-Vorschau
        </h1>
        <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 0' }}>
          High-End Obsidian Glassmorphism • Spekulare Lichtkante • Reine Charakternamen ohne
          Unterschrift
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#E2E8F0',
          fontSize: '0.72rem',
          cursor: 'pointer',
        }}
      >
        <RotateCcw size={12} /> Reset
      </button>
    </div>
  );
}
