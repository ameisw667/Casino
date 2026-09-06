'use client';

import { Sparkles, X } from 'lucide-react';

interface GuideImagePreviewProps {
  attachedImage: string;
  onRemove: () => void;
}

export function GuideImagePreview({ attachedImage, onRemove }: GuideImagePreviewProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        background: 'rgba(212, 175, 55, 0.08)',
        borderTop: '1px solid rgba(212, 175, 55, 0.25)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '44px',
          height: '44px',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachedImage}
          alt="Preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          type="button"
          aria-label="Remove image"
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: 'rgba(0, 0, 0, 0.75)',
            border: 'none',
            borderRadius: '50%',
            color: '#fff',
            width: '16px',
            height: '16px',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={10} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            color: '#D4AF37',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={11} /> Screenshot angehängt
        </span>
        <span style={{ fontSize: '0.64rem', color: 'hsl(var(--text-muted))' }}>
          Vision-Analyse wird beim Senden ausgeführt
        </span>
      </div>
    </div>
  );
}
