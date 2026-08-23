'use client';

import { MicOff } from 'lucide-react';

interface GuideVoiceErrorBannerProps {
  message: string;
}

export function GuideVoiceErrorBanner({ message }: GuideVoiceErrorBannerProps) {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: 'rgba(239, 68, 68, 0.15)',
        borderTop: '1px solid rgba(239, 68, 68, 0.5)',
        color: '#fca5a5',
        fontSize: '0.72rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <MicOff size={13} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}
