import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { backLinkStyle, sandboxLinkStyle, type PreviewDevice } from './shared';

interface SandboxNavbarProps {
  previewDevice: PreviewDevice;
  onSelectPreviewDevice: (device: PreviewDevice) => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export function SandboxNavbar({
  previewDevice,
  onSelectPreviewDevice,
  isSoundMuted,
  onToggleSound,
}: SandboxNavbarProps) {
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
        <Link href="/testing/7.1" style={sandboxLinkStyle}>
          7.1 ModeTabs
        </Link>
        <Link href="/testing/7.2" style={sandboxLinkStyle}>
          7.2 BetInput
        </Link>
        <Link
          href="/testing/brand-showcase"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#34d399',
            textDecoration: 'none',
          }}
        >
          Central Brand Showcase Hub →
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Viewport Device Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#070a10',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            onClick={() => onSelectPreviewDevice('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: previewDevice === 'desktop' ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
              background: previewDevice === 'desktop' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
              color: previewDevice === 'desktop' ? '#e5c158' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            onClick={() => onSelectPreviewDevice('mobile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: previewDevice === 'mobile' ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
              background: previewDevice === 'mobile' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
              color: previewDevice === 'mobile' ? '#e5c158' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Smartphone size={14} /> Mobile (375px)
          </button>
        </div>

        {/* Sound Mute Toggle */}
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
