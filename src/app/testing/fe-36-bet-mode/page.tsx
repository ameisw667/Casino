'use client';

import React, { useState } from 'react';
import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';

export default function TestingBetModePage() {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0E14',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '28px',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(17, 24, 39, 0.7) 0%, rgba(11, 14, 20, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#D4AF37',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Wager Mode Controller
          </span>
          <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
            3D Perspective Flip
          </span>
        </div>

        <BetModeTabs mode={mode} onModeChange={setMode} />

        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          Active Selection: <strong style={{ color: '#fff' }}>{mode.toUpperCase()}</strong>
        </div>
      </div>
    </div>
  );
}
