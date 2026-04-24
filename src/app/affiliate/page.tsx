'use client';

import Image from 'next/image';
import { CircleDollarSign, Users, TrendingUp, Copy } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function AffiliatePage() {
  const { isMobile } = useCasinoStore();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '40px', padding: '0 var(--container-padding)' }}>
      <header style={{ 
        position: 'relative', 
        height: isMobile ? 'auto' : '350px', 
        minHeight: isMobile ? '220px' : '350px',
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: isMobile ? '40px 24px' : '60px',
        border: '1px solid hsla(0,0%,100%,0.05)',
        marginTop: isMobile ? '10px' : '20px'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/affiliate-hero.png" 
            alt="Affiliate Hero" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.5 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsl(var(--bg-color)) 100%), linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)'
              : 'linear-gradient(to right, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        <h1 className="text-gradient" style={{ 
          fontSize: isMobile ? '2.5rem' : '4.5rem', 
          fontWeight: 900, 
          lineHeight: 1,
          textAlign: isMobile ? 'center' : 'left'
        }}>Affiliate <br /> Program</h1>
        <p style={{ 
          color: 'hsl(var(--text-muted))', 
          fontSize: isMobile ? '1rem' : '1.25rem', 
          maxWidth: isMobile ? '100%' : '500px', 
          marginTop: '12px',
          textAlign: isMobile ? 'center' : 'left'
        }}>Invite your friends and build your gaming empire. Earn passive income on every wager.</p>
      </header>

      <div className="grid-cols-auto" style={{ marginBottom: isMobile ? '20px' : '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: isMobile ? '24px' : '32px' }}>
          <CircleDollarSign size={isMobile ? 28 : 32} color="hsl(var(--success))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900 }}>$0.00</h3>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL EARNED</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: isMobile ? '24px' : '32px' }}>
          <Users size={isMobile ? 28 : 32} color="hsl(var(--primary))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900 }}>0</h3>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.05em' }}>REFERRED FRIENDS</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: isMobile ? '24px' : '32px' }}>
          <TrendingUp size={isMobile ? 28 : 32} color="hsl(var(--secondary))" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900 }}>5%</h3>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.05em' }}>COMMISSION RATE</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: isMobile ? '24px' : '32px', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>Your Referral Link</h3>
        <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
          <input className="input mono" readOnly value="https://casino.vibe/ref/user_123" style={{ flex: 1, minHeight: '48px' }} />
          <button className="btn btn-primary" style={{ height: isMobile ? '48px' : 'auto' }}>
            <Copy size={18} /> Copy Link
          </button>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>
          Share this link with your community. You receive a 5% revenue share on the house edge of every bet placed by your referrals.
        </p>
      </div>
    </div>
  );
}
