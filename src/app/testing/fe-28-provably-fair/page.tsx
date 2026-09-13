'use client';

import React from 'react';
import { ProvablyFairModal } from '@/components/casino/ProvablyFairModal';

export default function ProvablyFairTestingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0E14' }}>
      <ProvablyFairModal
        isOpen={true}
        onClose={() => {}}
        initialServerSeed="a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0"
        initialClientSeed="highroller-client-seed-2026"
        initialNonce={42}
      />
    </div>
  );
}
