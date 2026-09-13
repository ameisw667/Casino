'use client';

import React from 'react';
import RankBenefitsModal from '@/components/casino/RankBenefitsModal';

export default function VipTiersTestingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0E14' }}>
      <RankBenefitsModal isOpen={true} onClose={() => {}} />
    </div>
  );
}
