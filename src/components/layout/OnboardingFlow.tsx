'use client';

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { Gift, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';

import Image from 'next/image';
import { StickyScrollTour } from '@/components/casino/onboarding/StickyScrollTour';

/** Einheitlicher, beschrifteter Schließen-Knopf (Option A): identisch in jeder Phase, ein Klick reicht. */
function OnboardingCloseButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: 'none',
        color: 'hsl(var(--text-dim))',
        cursor: 'pointer',
        zIndex: 10,
        fontSize: '0.75rem',
        fontWeight: 800,
      }}
      className="transition-colors hover:text-white"
      aria-label="Onboarding schließen"
    >
      <span>Schließen</span>
      <X size={22} />
    </button>
  );
}

export default function OnboardingFlow() {
  const onboardingStep = useCasinoStore((s) => s.onboardingStep);
  const setOnboardingStep = useCasinoStore((s) => s.setOnboardingStep);
  const dismissOnboarding = useCasinoStore((s) => s.dismissOnboarding);
  const onboardingDismissed = useCasinoStore((s) => s.onboardingDismissed);
  const isMobile = useCasinoStore((s) => s.isMobile);
  const { user, isLoaded } = useSupabaseSession();
  const isSignedIn = !!user;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isBlockingStep =
    onboardingStep === 'WELCOME' || onboardingStep === 'LOGIN' || onboardingStep === 'TOUR_VAULT';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 8. Background Scroll Lock implementation
  useEffect(() => {
    if (isBlockingStep) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBlockingStep]);

  // 7 & 30. Skip login onboarding if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && onboardingStep !== 'NONE' && onboardingStep !== 'COMPLETED' && onboardingStep !== 'WELCOME') {
      setOnboardingStep('COMPLETED');
    }
  }, [isLoaded, isSignedIn, onboardingStep, setOnboardingStep]);

  // Wer das Intro einmal geschlossen hat, wird beim erneuten „Play Now" nicht zur Willkommens-
  // Karte zurückgeblendet, sondern landet direkt im Anmelde-Schritt (Option B, S1).
  useEffect(() => {
    if (onboardingStep === 'WELCOME' && onboardingDismissed) {
      setOnboardingStep('LOGIN');
    }
  }, [onboardingStep, onboardingDismissed, setOnboardingStep]);

  if (!mounted || !isLoaded || !isBlockingStep) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
      {/* Dimmed Background Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
          transition: 'opacity 0.5s ease',
          opacity: onboardingStep === 'TOUR_VAULT' ? 0.3 : 1,
        }}
      />

      {/* Phase 1: WELCOME / VIP FEATURE TOUR (Sticky Scroll Cards) */}
      {onboardingStep === 'WELCOME' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            pointerEvents: 'auto',
          }}
        >
          <StickyScrollTour
            onDismiss={dismissOnboarding}
            onClaim={() => setOnboardingStep('LOGIN')}
            onComplete={() => setOnboardingStep('LOGIN')}
          />
        </div>
      )}

      {/* Phase 2: LOGIN (Real Auth) */}
      {onboardingStep === 'LOGIN' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="glass-card animate-scale-in"
            style={{
              maxWidth: '450px',
              width: '100%',
              padding: '40px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <OnboardingCloseButton onDismiss={dismissOnboarding} />
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '32px' }}>
              ONE-CLICK CLAIM
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link
                href="/sign-up"
                className="btn btn-secondary"
                style={{
                  height: '60px',
                  borderRadius: '16px',
                  background: '#fff',
                  color: 'black',
                  border: 'none',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                  alt="Google"
                  width={20}
                  height={20}
                  style={{ marginRight: '12px' }}
                />{' '}
                SIGN UP WITH GOOGLE
              </Link>
              <div
                style={{
                  margin: '8px 0',
                  fontSize: '0.7rem',
                  color: 'hsl(var(--text-dim))',
                  fontWeight: 800,
                }}
              >
                OR USE YOUR EMAIL
              </div>
              <Link
                href="/sign-up"
                className="btn btn-primary"
                style={{
                  height: '56px',
                  borderRadius: '16px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                CREATE FREE ACCOUNT
              </Link>
            </div>
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                opacity: 0.6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                }}
              >
                <Image src="/images/2026-09-06_icon-security-verified-quantum-gold_v001.png" alt="Kein KYC" width={14} height={14} aria-hidden /> NO KYC
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                }}
              >
                INSTANT PAY
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: TOUR_VAULT (Spotlight) */}
      {onboardingStep === 'TOUR_VAULT' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              pointerEvents: 'auto',
              zIndex: 2,
            }}
          >
            <OnboardingCloseButton onDismiss={dismissOnboarding} />
          </div>

          {/* Custom Spotlight SVG Mask */}
          <div
            style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
            onClick={() => {
              router.push('/vault');
              setOnboardingStep('COMPLETED');
            }}
          >
            <svg width="100%" height="100%">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <circle
                    cx={isMobile ? '50%' : '120'}
                    cy={isMobile ? 'calc(100% - 40px)' : '350'}
                    r="80"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.8)" mask="url(#spotlight-mask)" />
            </svg>
          </div>

          {/* Tooltip Bubble */}
          <div
            style={{
              position: 'absolute',
              left: isMobile ? '50%' : '220px',
              top: isMobile ? 'auto' : '350px',
              bottom: isMobile ? '120px' : 'auto',
              transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
              pointerEvents: 'auto',
            }}
          >
            <div
              className="glass-card animate-bounce-horizontal"
              style={{
                padding: '24px',
                borderRadius: '24px',
                border: '2px solid hsl(var(--primary))',
                width: '280px',
                position: 'relative',
              }}
            >
              {!isMobile && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-12px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                    width: '24px',
                    height: '24px',
                    background: 'hsl(var(--bg-color))',
                    borderLeft: '2px solid hsl(var(--primary))',
                    borderBottom: '2px solid hsl(var(--primary))',
                  }}
                />
              )}
              <h4 style={{ fontWeight: 950, color: 'hsl(var(--primary))', marginBottom: '8px' }}>
                THE REWARDS ARE HERE!
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                Click on the <strong style={{ color: 'hsl(var(--primary))' }}>VAULT</strong> to open
                your reserved welcome case.
              </p>
              <button
                onClick={() => {
                  router.push('/vault');
                  setOnboardingStep('COMPLETED');
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
