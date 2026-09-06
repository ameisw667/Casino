import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { backLinkStyle } from './shared';

interface SandboxNavbarProps {
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export function SandboxNavbar({ isSoundMuted, onToggleSound }: SandboxNavbarProps) {
  return (
    <nav
      className="qa-route-nav"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: '#0b0f19',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/" style={backLinkStyle}>
          <ArrowLeft size={16} style={{ color: '#d4af37' }} /> Back to Casino Lobby
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
          Casino Royale Central Design System Hub
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link
          href="/testing/7.1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#e5c158',
            textDecoration: 'none',
          }}
        >
          Initiative 7.1 Evaluierung
        </Link>

        <button
          onClick={onToggleSound}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: '#121826',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#e2e8f0',
            cursor: 'pointer',
          }}
        >
          {isSoundMuted ? (
            <>
              <VolumeX size={16} style={{ color: '#f43f5e' }} /> Sound Muted
            </>
          ) : (
            <>
              <Volume2 size={16} style={{ color: '#10b981' }} /> Sound Active
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
