'use client';

import React from 'react';
import { CircleDollarSign, Users, TrendingUp, Copy } from 'lucide-react';

export default function AffiliatePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>Affiliate Program</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Invite your friends and earn a percentage of every bet they place.</p>
      </header>

      <div className="grid-cols-auto" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <CircleDollarSign size={32} color="hsl(var(--success))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '2rem' }}>$0.00</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>TOTAL EARNED</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <Users size={32} color="hsl(var(--primary))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '2rem' }}>0</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>REFERRED FRIENDS</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <TrendingUp size={32} color="hsl(var(--secondary))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '2rem' }}>5%</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>COMMISSION RATE</p>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Your Referral Link</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input className="input mono" readOnly value="https://casino.vibe/ref/user_123" />
          <button className="btn btn-primary">
            <Copy size={18} /> Copy
          </button>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
          Share this link with your community. You receive a 5% revenue share on the house edge of every bet placed by your referrals.
        </p>
      </div>
    </div>
  );
}
