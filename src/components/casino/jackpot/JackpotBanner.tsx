'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { JackpotLetterCascade } from './JackpotLetterCascade';
import { LetterCascade } from '@/components/casino/typography/LetterCascade';

interface JackpotBannerProps {
  headline?: string;
  amountFormatted?: string;
  subtitle?: string;
  isCompact?: boolean;
}

export function JackpotBanner({
  headline = 'PROGRESSIVE JACKPOT',
  amountFormatted = '$1,085.58',
  subtitle = 'Automatischer Drop bei VIP-Kombination',
  isCompact = false,
}: JackpotBannerProps) {
  return (
    <div
      data-testid="jackpot-banner"
      style={{
        position: 'relative',
        borderRadius: 14,
        padding: isCompact ? '8px 12px' : '14px 18px',
        background: 'linear-gradient(150deg, rgba(22, 20, 15, 0.9) 0%, rgba(10, 10, 14, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.25)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
      }}
    >
      {/* Top Banner Row with Crown and Letter Cascade */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Crown style={{ width: 13, height: 13, color: '#D4AF37' }} />
          </div>

          <div
            style={{
              fontSize: isCompact ? 11 : 13,
              fontWeight: 900,
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <JackpotLetterCascade text={headline} />
          </div>
        </div>

        {/* Pulsing live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }}
          />
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#10B981', fontWeight: 700 }}>
            LIVE
          </span>
        </div>
      </div>

      {!isCompact && (
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <LetterCascade
              value={amountFormatted}
              direction="rtl"
              staggerDelay={0.035}
              stiffness={340}
              damping={22}
              colorScheme="gold"
              fontSize={isCompact ? '1.25rem' : '1.85rem'}
              isMobile={isCompact}
            />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.45)', marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}

export default JackpotBanner;
