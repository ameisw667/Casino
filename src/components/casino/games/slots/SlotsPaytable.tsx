'use client';

import { Trophy, HelpCircle } from 'lucide-react';

import { SlotSymbol } from '@/components/casino/SlotSymbol';
import { PAYTABLE } from '@/components/casino/games/slots/slots-config';

interface SlotsPaytableProps {
  isMobile: boolean;
  betAmount: number;
}

export function SlotsPaytable({ isMobile, betAmount }: SlotsPaytableProps) {
  return (
    <div
      className="slots-right-paytable obsidian-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '18px',
        borderRadius: '24px',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Paytable Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              <Trophy size={16} color="#FFD700" />
            </div>
            <h3
              style={{
                margin: 0,
                letterSpacing: '0.5px',
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#FFF',
              }}
            >
              PAYTABLE & VALUES
            </h3>
          </div>
        </div>

        {/* Payline Info Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px',
            borderRadius: '10px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '0.68rem',
            color: '#cbd5e1',
          }}
        >
          <HelpCircle size={14} color="#FFD700" style={{ flexShrink: 0 }} />
          <span>
            Wins pay on <strong>Center Line</strong> (Row 2). Multipliers calculate on{' '}
            <strong>${betAmount.toFixed(2)}</strong> bet.
          </span>
        </div>

        {/* Table Header Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '70px 1fr 1fr 1fr' : '105px 1fr 1fr 1fr',
            gap: '4px',
            padding: '4px 6px',
            fontSize: isMobile ? '0.56rem' : '0.62rem',
            fontWeight: 900,
            color: '#64748b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'right',
          }}
        >
          <div style={{ textAlign: 'left' }}>SYMBOL</div>
          <div>3× HIT</div>
          <div>4× HIT</div>
          <div>5× HIT</div>
        </div>

        {/* 8 Symbol Tiers with Authentic SlotSymbol Icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {PAYTABLE.map((item) => (
            <div
              key={item.name}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '70px 1fr 1fr 1fr' : '105px 1fr 1fr 1fr',
                gap: '4px',
                alignItems: 'center',
                padding: '6px 6px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'right',
                fontFamily: 'monospace',
                fontSize: isMobile ? '0.62rem' : '0.74rem',
              }}
            >
              {/* Col 1: Authentic SlotSymbol Icon & Tier */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left',
                  fontFamily: 'sans-serif',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SlotSymbol type={item.symbolKey} size={20} />
                </div>
                <span
                  style={{
                    fontWeight: 900,
                    color: item.color,
                    fontSize: '0.76rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: '0.52rem',
                    fontWeight: 800,
                    padding: '1px 3px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#94a3b8',
                  }}
                >
                  {item.tier}
                </span>
              </div>

              {/* Col 2: 3x Hit */}
              <div
                style={{
                  color: '#cbd5e1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                ${(betAmount * item.mult3).toFixed(2)}
              </div>

              {/* Col 3: 4x Hit */}
              <div
                style={{
                  color: '#cbd5e1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                ${(betAmount * item.mult4).toFixed(2)}
              </div>

              {/* Col 4: 5x Hit */}
              <div
                style={{
                  color: '#4ade80',
                  fontWeight: 900,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                ${(betAmount * item.mult5).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paytable Footer Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '0.68rem',
          fontWeight: 700,
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <span>96.5% THEORETICAL RTP • 5 PAYLINE REELS</span>
      </div>
    </div>
  );
}
