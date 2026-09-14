'use client';

import React from 'react';
import { AdminKpiParticleHeader } from '@/components/admin/overview/AdminKpiParticleHeader';

export default function TestingAdminKpiPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0E14',
        color: '#fff',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37', margin: 0 }}>
            Executive Admin KPI Suite
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Touchpoint 34 — Cursor-Driven Particle Typography for Gross Wager & Net Margin
          </p>
        </div>

        <AdminKpiParticleHeader
          totalWagered="$1,248,500"
          netProfit="+$384,120"
          activePlayers="1,482"
          systemHealth="99.98%"
        />
      </div>
    </div>
  );
}
