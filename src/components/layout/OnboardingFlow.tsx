'use client';

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { Gift, ArrowRight, ShieldCheck, Zap, Rocket, Users, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingFlow() {
  const { onboardingStep, setOnboardingStep, isMobile } = useCasinoStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || onboardingStep === 'NONE' || onboardingStep === 'COMPLETED') return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
      
      {/* Dimmed Background Overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(8px)',
        pointerEvents: 'auto',
        transition: 'opacity 0.5s ease',
        opacity: onboardingStep === 'TOUR_VAULT' ? 0.3 : 1
      }} />

      {/* Phase 1: WELCOME */}
      {onboardingStep === 'WELCOME' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'auto' }}>
          <div className="glass-card animate-slide-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '48px 32px', border: '2px solid hsl(var(--primary))', boxShadow: '0 0 50px hsla(var(--primary), 0.3)' }}>
            <div className="case-bounce" style={{ marginBottom: '32px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Gift size={120} color="hsl(var(--primary))" />
                <div style={{ position: 'absolute', top: '-10px', right: '-20px', background: '#fff', color: 'black', padding: '8px 16px', borderRadius: '12px', fontWeight: 950, transform: 'rotate(15deg)', border: '2px solid hsl(var(--primary))' }}>$10.00 FREE</div>
              </div>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>IT'S RESERVED!</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem', marginBottom: '32px' }}>We've reserved your $10.00 Welcome Case. Claim it now and start building your empire.</p>
            <button 
              onClick={() => setOnboardingStep('LOGIN')}
              className="btn btn-primary" 
              style={{ width: '100%', height: '64px', borderRadius: '16px', fontWeight: 950, fontSize: '1.2rem', gap: '12px' }}
            >
              CLAIM MY CASE NOW <ArrowRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: LOGIN (Simulated) */}
      {onboardingStep === 'LOGIN' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'auto' }}>
          <div className="glass-card animate-scale-in" style={{ maxWidth: '450px', width: '100%', padding: '40px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '32px' }}>ONE-CLICK CLAIM</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => setOnboardingStep('TOUR_VAULT')} className="btn btn-secondary" style={{ height: '60px', borderRadius: '16px', background: '#fff', color: 'black', border: 'none', fontWeight: 800 }}>
                <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" style={{ width: '20px', marginRight: '12px' }} /> SIGN UP WITH GOOGLE
              </button>
              <button onClick={() => setOnboardingStep('TOUR_VAULT')} className="btn btn-secondary" style={{ height: '60px', borderRadius: '16px', background: '#5865F2', color: 'white', border: 'none', fontWeight: 800 }}>
                <Users size={20} style={{ marginRight: '12px' }} /> SIGN UP WITH DISCORD
              </button>
              <div style={{ margin: '8px 0', fontSize: '0.7rem', color: 'hsl(var(--text-dim))', fontWeight: 800 }}>OR USE YOUR EMAIL</div>
              <input className="input" placeholder="Enter email address" style={{ height: '56px', borderRadius: '16px' }} />
              <button onClick={() => setOnboardingStep('TOUR_VAULT')} className="btn btn-primary" style={{ height: '56px', borderRadius: '16px', fontWeight: 900 }}>CREATE FREE ACCOUNT</button>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800 }}><ShieldCheck size={14} /> NO KYC</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800 }}><Zap size={14} /> INSTANT PAY</div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: TOUR_VAULT (Spotlight) */}
      {onboardingStep === 'TOUR_VAULT' && (
        <>
          {/* Custom Spotlight SVG Mask */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }} onClick={() => {
            router.push('/vault');
            setOnboardingStep('OPEN_CASE');
          }}>
            <svg width="100%" height="100%">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <circle cx={isMobile ? '50%' : '120'} cy={isMobile ? 'calc(100% - 40px)' : '350'} r="80" fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.8)" mask="url(#spotlight-mask)" />
            </svg>
          </div>

          {/* Tooltip Bubble */}
          <div style={{ 
            position: 'absolute', 
            left: isMobile ? '50%' : '220px', 
            top: isMobile ? 'auto' : '350px',
            bottom: isMobile ? '120px' : 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
            pointerEvents: 'auto'
          }}>
            <div className="glass-card animate-bounce-horizontal" style={{ padding: '24px', borderRadius: '24px', border: '2px solid hsl(var(--primary))', width: '280px', position: 'relative' }}>
              {!isMobile && <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '24px', height: '24px', background: 'hsl(var(--bg-color))', borderLeft: '2px solid hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))' }} />}
              <h4 style={{ fontWeight: 950, color: 'hsl(var(--primary))', marginBottom: '8px' }}>THE REWARDS ARE HERE!</h4>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Click on the <strong style={{color: 'hsl(var(--primary))'}}>VAULT</strong> to open your reserved welcome case.</p>
              <button 
                onClick={() => {
                  router.push('/vault');
                  setOnboardingStep('OPEN_CASE');
                }}
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px', height: '40px', fontSize: '0.8rem' }}
              >
                GO TO VAULT
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce-horizontal {
          0%, 100% { transform: ${isMobile ? 'translateX(-50%) translateY(0)' : 'translateY(-50%) translateX(0)'}; }
          50% { transform: ${isMobile ? 'translateX(-50%) translateY(-10px)' : 'translateY(-50%) translateX(10px)'}; }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 2s infinite;
        }
      `}</style>
    </div>
  );
}
