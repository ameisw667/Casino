'use client';

import React from 'react';
import { CheckCircle2, Clock, Star } from 'lucide-react';

interface TrustBarProps {
  totalPaid: number;
  timeToReward: string;
}

export const TrustBar: React.FC<TrustBarProps> = ({ 
  totalPaid = 1245082, 
  timeToReward = '17m 32s' 
}) => {
  return (
    <div style={{ 
      background: 'hsla(var(--primary), 0.1)', 
      borderBottom: '1px solid hsla(var(--primary), 0.2)',
      padding: '12px 0',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="hsl(var(--primary))" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>PAID OUT IN LAST 30 DAYS: <span style={{ color: '#fff' }}>${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="hsl(var(--primary))" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>AVG. TIME TO FIRST REWARD: <span style={{ color: '#fff' }}>{timeToReward}</span></span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="hsl(45, 100%, 50%)" color="hsl(45, 100%, 50%)" />)}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>4.8/5 TRUSTPILOT</span>
        </div>
      </div>
    </div>
  );
};
