'use client';
import React from 'react';
import { Gift } from 'lucide-react';
interface HeroSectionProps {
  isMobile: boolean;
  startOnboarding: () => void;
  liveWithdrawals: any[]; /* eslint-disable-line @typescript-eslint/no-explicit-any */
}
export const HeroSection: React.FC<HeroSectionProps> = ({ 
  isMobile = false, 
  startOnboarding, 
  liveWithdrawals = [
    { user: 'Satoshi', amount: 450.00, currency: 'BTC', time: 'Just now', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { user: 'Vitalik', amount: 120.00, currency: 'ETH', time: '2m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    { user: 'Elon', amount: 15.00, currency: 'DOGE', time: '5m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    { user: 'CZ', amount: 890.00, currency: 'BNB', time: '12m ago', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }
  ] 
}) => {
  return (
    <section style={{ 
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
      gap: 'var(--space-lg)',
      padding: 'var(--space-lg) 0',
      alignItems: 'center'
    }}>

      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: 'var(--space-xs) var(--space-sm)', background: 'hsla(var(--primary), 0.1)', borderRadius: 'var(--radius-lg)', color: 'hsl(var(--primary))', fontSize: 'var(--font-xs)', fontWeight: 800, marginBottom: 'var(--space-md)', border: '1px solid hsla(var(--primary), 0.2)' }}>
          <Gift size={16} /> FREE $10.00 WELCOME CASE FOR NEW USERS
        </div>
        <h1 style={{ 
          fontSize: isMobile ? 'clamp(2.5rem, 10vw, 3.5rem)' : 'var(--font-3xl)', 
          fontWeight: 950, 
          lineHeight: 1.1, 
          marginBottom: 'var(--space-sm)',
          fontFamily: "var(--font-outfit), sans-serif",
          letterSpacing: '-0.04em'
        }}>
          GET PAID FOR <br />
          <span className="text-gradient">PLAYING GAMES.</span>
        </h1>
        <p style={{ fontSize: isMobile ? '1rem' : 'var(--font-lg)', color: 'hsl(var(--text-muted))', lineHeight: 1.6, marginBottom: 'var(--space-md)', maxWidth: '580px', textWrap: 'balance' as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }}>
          Join the #1 provably fair gaming platform. Earn coins and cash out instantly.
        </p>

        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
            <button 
              onClick={startOnboarding}
              className="btn btn-primary" 
              style={{ height: '72px', padding: '0 48px', fontSize: '1.25rem', borderRadius: 'var(--radius-xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em' }}
            >
              OPEN $10.00 FREE CASE
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
              <div style={{ display: 'flex', marginLeft: '-12px' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid hsl(var(--bg-color))', background: 'hsl(var(--surface-raised))', marginLeft: '-12px', overflow: 'hidden' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>
                <span style={{ color: '#fff' }}>14,204</span> users joined today
              </span>
            </div>
          </div>
        </div>
      </div>
      {!isMobile && (
        <div style={{ position: 'relative' }}>
          {/* Animated Background Glow */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '120%', 
            height: '120%', 
            background: 'radial-gradient(circle, hsla(var(--primary), 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0
          }} />
          {/* Hero Banner Container */}
          <div style={{ 
            position: 'relative', 
            borderRadius: '40px', 
            overflow: 'hidden',
            border: '1px solid hsla(var(--primary), 0.2)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            zIndex: 1,
            aspectRatio: '16/10'
          }}>
            <img 
              src="/images/hero-banner-new.png" 
              alt="Casino Royale Experience" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          {/* Floating Stats Overlay */}
          <div className="glass" style={{ 
            position: 'absolute',
            bottom: '-30px',
            right: '-30px',
            borderRadius: '24px', 
            padding: '24px', 
            border: '1px solid hsla(var(--primary), 0.3)',
            zIndex: 2,
            minWidth: '280px',
            background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.95), hsla(var(--bg-color), 0.8))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 900 }}>LIVE WITHDRAWALS</h3>
              <div style={{ padding: '4px 8px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900 }}>LIVE FEED</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {liveWithdrawals.slice(0, 3).map((w, i) => (
                <div key={i} className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', overflow: 'hidden' }}>
                    <img src={w.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${w.user}`} alt="user" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{w.user}</span>
                      <span style={{ fontWeight: 900, color: 'hsl(var(--primary))', fontSize: '0.8rem' }}>${Number(w.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}
    </section>
  );
};