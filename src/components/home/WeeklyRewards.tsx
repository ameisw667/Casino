'use client';
import React from 'react';
import Image from 'next/image';
export const WeeklyRewards: React.FC = () => {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="glass" style={{ 
        borderRadius: '40px', 
        overflow: 'hidden', 
        border: '1px solid hsla(var(--primary), 0.3)',
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background Visual */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image 
            src="/images/weekly-rewards-v2.png" 
            alt="Weekly Rewards" 
            fill 
            sizes="100vw"
            style={{ objectFit: 'cover', opacity: 0.6 }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, hsla(var(--bg-color), 1) 30%, transparent 80%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '60px', maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'hsl(var(--primary))', color: 'black', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950, marginBottom: '24px', letterSpacing: '0.1em' }}>LIMITED TIME OFFER</div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 950, lineHeight: 1.1, marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>
            WEEKLY <br />
            <span className="text-gradient">REWARD DROP.</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6, marginBottom: '40px' }}>
            Wager $500 or more this week to enter the $10,000 Grand Prize draw. Every bet counts towards your entry!
          </p>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <button className="btn btn-primary" style={{ height: '60px', padding: '0 32px', borderRadius: '14px', fontWeight: 800 }}>
              ENTER DRAW NOW
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.1em' }}>ENDS IN</span>
                <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>04d : 12h : 42m</span>
            </div>
          </div>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                <span>YOUR PROGRESS</span>
                <span style={{ color: 'hsl(var(--primary))' }}>$142.50 / $500.00</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', background: 'hsl(var(--primary))', boxShadow: '0 0 15px hsla(var(--primary), 0.5)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};