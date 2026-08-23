'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function TutorialModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="obsidian-glass"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '32px',
          borderRadius: '24px',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Sparkles size={28} color="#FFD700" />
        </div>
        <h2
          style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#FFD700',
            letterSpacing: '1px',
            marginBottom: '16px',
          }}
        >
          CRASH FLIGHT RULES
        </h2>
        <div
          style={{
            textAlign: 'left',
            color: '#94a3b8',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#FFD700', fontWeight: 900 }}>01.</span>
            <span>Set your wager and launch before the rocket begins its ascent.</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#FFD700', fontWeight: 900 }}>02.</span>
            <span>Watch the multiplier skyrocket from 1.00x into deep space in real-time.</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ color: '#10b981', fontWeight: 900 }}>03.</span>
            <span>
              Hit <strong style={{ color: '#4ade80' }}>CASHOUT</strong> before the rocket explodes
              to lock in your multiplied payout!
            </span>
          </div>
        </div>
        <button
          className="gold-btn"
          style={{
            marginTop: '28px',
            width: '100%',
            height: '50px',
            borderRadius: '14px',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          READY TO FLY
        </button>
      </div>
    </div>
  );
}
