'use client';
import React from 'react';
import { Star, CheckCircle2, Trophy, Coins, ShieldCheck } from 'lucide-react';

interface Withdrawal {
  user: string;
  amount: number;
  currency?: string;
  time?: string;
  image?: string;
}

interface HeroSectionProps {
  isMobile: boolean;
  startOnboarding: () => void;
  liveWithdrawals: Withdrawal[];
}
import { Magnetic } from '@/components/ui/Magnetic';

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
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 'auto' : '640px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      background: '#000', 
      borderRadius: isMobile ? '0' : 'var(--radius-3xl)',
      marginBottom: 'var(--space-xl)',
      border: isMobile ? 'none' : '1px solid hsla(var(--primary), 0.2)',
      boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)'
    }}>
      {/* Explosive Background Image Layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}>
        <img 
          src="/images/hero_bg.png" 
          alt="Premium Casino Background" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: 1, 
            objectPosition: 'center right',
            maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)'
          }}
        />
      </div>

      {/* Brand-Colored Glow Effect */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          right: '10%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, hsla(var(--primary), 0.2) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 1
        }} />
      )}

      {/* Cinematic Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: isMobile 
          ? 'radial-gradient(circle at top, transparent 0%, rgba(0,0,0,0.8) 80%, #000 100%)'
          : `
            radial-gradient(circle at 15% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 60%, #000 100%),
            linear-gradient(to right, #000 0%, #000 10%, transparent 50%)
          `
      }} />

      {/* Content Container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%',
        padding: isMobile ? '60px var(--space-md)' : '0 80px',
      }}>
        <div style={{ maxWidth: isMobile ? '100%' : '800px' }}>
          {/* Promo Tag */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '10px 18px', 
            background: 'hsla(var(--primary), 0.15)', 
            borderRadius: '12px', 
            color: 'hsl(var(--primary))', 
            fontSize: '0.8rem', 
            fontWeight: 900, 
            marginBottom: '32px',
            border: '1px solid hsla(var(--primary), 0.3)',
            backdropFilter: 'blur(10px)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 0 20px hsla(var(--primary), 0.1)'
          }}>
            <Trophy size={14} fill="currentColor" /> 100% FIRST DEPOSIT BONUS ACTIVE
          </div>

          <h1 style={{ 
            fontSize: isMobile ? 'clamp(2.5rem, 10vw, 3.5rem)' : 'clamp(3.5rem, 7.5vw, 7rem)', 
            fontWeight: 1000, 
            lineHeight: 0.88, 
            letterSpacing: '-0.06em',
            color: '#fff',
            marginBottom: '28px',
            textShadow: '0 20px 60px rgba(0,0,0,1)',
            textTransform: 'uppercase'
          }}>
            THE ULTIMATE <br />
            <span style={{ 
              background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>CRYPTO <br /> CASINO.</span>
          </h1>

          <p style={{ 
            fontSize: isMobile ? '1.1rem' : '1.75rem', 
            color: 'rgba(255,255,255,0.7)', 
            lineHeight: 1.3, 
            marginBottom: '56px',
            fontWeight: 600,
            maxWidth: '650px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            Experience the thrill of high-stakes gaming. Provably fair wins and <span style={{ color: '#fff', fontWeight: 900 }}>Instant Crypto Withdrawals</span>.
          </p>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '32px' }}>
            <Magnetic>
              <button 
                onClick={startOnboarding}
                className="btn btn-primary" 
                style={{ 
                  height: '84px', 
                  padding: '0 64px', 
                  fontSize: '1.4rem', 
                  borderRadius: '20px', 
                  fontWeight: 1000, 
                  textTransform: 'uppercase', 
                  boxShadow: '0 20px 50px hsla(var(--primary), 0.4)',
                  letterSpacing: '0.02em',
                  background: 'hsl(var(--primary))',
                  border: 'none',
                  color: '#000'
                }}
              >
                Play Now
              </button>
            </Magnetic>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', color: '#00b67a' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={22} fill="#00b67a" />)}
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 1000, color: '#fff' }}>4.9/5</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>CURACAO LICENSED</span>
            </div>
          </div>

          {/* Quick Trust Badges */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '100px', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} color="hsl(var(--primary))" />
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>PROVABLY FAIR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Coins size={24} color="hsl(var(--primary))" />
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>CRYPTO READY</span>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', gap: '20px' }}>
                <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029" style={{ height: '24px', filter: 'grayscale(1) brightness(4)' }} alt="BTC" />
                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" style={{ height: '24px', filter: 'grayscale(1) brightness(4)' }} alt="ETH" />
                <img src="https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=029" style={{ height: '24px', filter: 'grayscale(1) brightness(4)' }} alt="LTC" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winners Side Widget */}
      {!isMobile && (
        <div style={{ 
          position: 'absolute',
          right: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '320px',
          borderRadius: '28px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(40px)',
          zIndex: 15,
          boxShadow: '0 40px 100px rgba(0,0,0,1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 1000, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>LATEST WINS</span>
            <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e701', boxShadow: '0 0 15px #00e701' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {liveWithdrawals.slice(0, 4).map((w, i) => (
              <div key={i} className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={w.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${w.user}`} alt="u" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{w.user}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Just won</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 1000, color: 'hsl(var(--primary))' }}>+${Number(w.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '24px', fontSize: '0.75rem', fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', height: '48px', background: 'rgba(255,255,255,0.02)' }}>
            VIEW ALL WINS
          </button>
        </div>
      )}

      {/* Trust Ticker (Bottom) */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: '70px', 
        background: 'linear-gradient(to top, rgba(0,0,0,1), transparent)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 80px',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 1000 }}>
            <CheckCircle2 size={16} color="#00e701" /> LICENSED BY CURACAO
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 1000 }}>
            <CheckCircle2 size={16} color="#00e701" /> $14M+ PAID OUT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 1000 }}>
            <CheckCircle2 size={16} color="#00e701" /> SSL SECURE 256-BIT
          </div>
        </div>
      </div>
    </section>
  );
};