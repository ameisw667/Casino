'use client';

import React from 'react';
import { MousePointerClick, Gamepad2, Wallet, CircleDollarSign, ChevronRight, Clock } from 'lucide-react';

interface GoldenPathProps {
  isMobile: boolean;
  lastPayoutTime: number;
}

export const GoldenPath: React.FC<GoldenPathProps> = ({ 
  isMobile = false, 
  lastPayoutTime = 45 
}) => {
  return (
    <section style={{ padding: '100px 0', borderTop: '1px solid hsla(0,0%,100%,0.05)', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '0.1em' }}>QUICK START GUIDE</div>
        <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>THE GOLDEN PATH</h2>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>From registration to your first payout in record time.</p>
      </div>
      
      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '32px', position: 'relative', zIndex: 1 }}>
          {[
            { 
              step: 1, 
              title: 'REGISTER', 
              desc: 'One-click signup with Google, Apple or Discord. Ready in seconds.', 
              icon: MousePointerClick,
              time: '15 SEC',
              proof: '14,204 Nutzer heute beigetreten'
            },
            { 
              step: 2, 
              title: 'PLAY & EARN', 
              desc: 'Play provably fair games. Every round earns you valuable coins.', 
              icon: Gamepad2,
              time: '2 MIN',
              proof: 'Über 1.2 Mio. Quests diese Woche'
            },
            { 
              step: 3, 
              title: 'INSTANT CASH', 
              desc: 'Withdraw your winnings to PayPal or Crypto. No wait time.', 
              icon: Wallet,
              time: 'INSTANT',
              proof: `Auszahlung vor ${lastPayoutTime}s ($45.00 via PayPal)`
            }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass group hover:scale-105 transition-all duration-500" style={{ 
                padding: '48px 32px', 
                borderRadius: '40px', 
                textAlign: 'center', 
                position: 'relative',
                border: '1px solid hsla(0,0%,100%,0.05)',
                background: 'linear-gradient(180deg, hsla(0,0%,100%,0.03) 0%, transparent 100%)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                {!isMobile && i < 2 && (
                  <div style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'hsla(var(--primary), 0.3)' }}>
                    <ChevronRight size={32} />
                  </div>
                )}

                <div style={{ 
                  position: 'absolute', 
                  top: '24px', 
                  right: '24px', 
                  padding: '6px 12px', 
                  background: 'hsla(var(--success), 0.1)', 
                  color: 'hsl(var(--success))', 
                  borderRadius: '10px', 
                  fontSize: '0.65rem', 
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid hsla(var(--success), 0.2)'
                }}>
                  <Clock size={12} /> {s.time}
                </div>

                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '32px', 
                  background: 'linear-gradient(135deg, hsla(var(--primary), 0.2), hsla(var(--primary), 0.05))', 
                  color: 'hsl(var(--primary))', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 32px',
                  boxShadow: '0 20px 40px hsla(var(--primary), 0.1)',
                  position: 'relative',
                  border: '1px solid hsla(var(--primary), 0.2)'
                }}>
                  <Icon size={48} />
                  
                  {s.step === 2 && (
                    <div className="coin-float-container">
                      {[1, 2, 3, 4, 5].map(j => (
                        <div key={j} className={`coin-particle coin-${j}`}>
                          <CircleDollarSign size={20} fill="hsl(var(--primary))" color="black" />
                        </div>
                      ))}
                    </div>
                  )}

                  {s.step === 3 && (
                    <div className="payment-fan-container">
                      {[
                        { color: '#0070ba', label: 'P' },
                        { color: '#f7931a', label: 'B' },
                        { color: '#ff9900', label: 'A' }
                      ].map((p, j) => (
                        <div key={j} className={`payment-card fan-${j}`} style={{ background: p.color }}>
                          {p.label}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-12px', 
                    right: '-12px', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '14px', 
                    background: 'hsl(var(--primary))', 
                    color: 'black', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 950, 
                    fontSize: '1.2rem',
                    border: '4px solid hsl(var(--bg-color))',
                    zIndex: 10,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}>
                    {s.step}
                  </div>
                </div>

                <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em', color: '#fff' }}>{s.title}</h4>
                <p style={{ color: 'hsl(var(--text-muted))', lineHeight: 1.6, fontSize: '1rem', marginBottom: '28px', minHeight: '4.8em' }}>{s.desc}</p>
                
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  color: 'hsl(var(--primary))', 
                  padding: '10px 20px', 
                  background: 'hsla(var(--primary), 0.08)', 
                  borderRadius: '14px', 
                  display: 'inline-block',
                  border: '1px solid hsla(var(--primary), 0.15)'
                }}>
                  {s.proof}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .coin-float-container, .payment-fan-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 5;
        }

        .glass.group:hover .coin-float-container,
        .glass.group:hover .payment-fan-container {
          opacity: 1;
        }

        .coin-particle {
          position: absolute;
          left: 50%;
          top: 50%;
        }
        @keyframes floatCoin {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
        }
        .coin-1 { --tx: -50px; --ty: -40px; animation: floatCoin 1.5s infinite 0.1s; }
        .coin-2 { --tx: 50px; --ty: -30px; animation: floatCoin 1.5s infinite 0.3s; }
        .coin-3 { --tx: -30px; --ty: -60px; animation: floatCoin 1.5s infinite 0.5s; }
        .coin-4 { --tx: 40px; --ty: -50px; animation: floatCoin 1.5s infinite 0.7s; }
        .coin-5 { --tx: 0px; --ty: -70px; animation: floatCoin 1.5s infinite 0.9s; }

        .payment-card {
          position: absolute;
          width: 32px;
          height: 40px;
          border-radius: 6px;
          top: 50%;
          left: 50%;
          display: flex;
          alignItems: center;
          justifyContent: center;
          font-weight: 900;
          font-size: 14px;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          transform-origin: bottom center;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          margin-left: -16px;
          margin-top: -45px;
        }
        .glass.group:hover .fan-0 { transform: rotate(-25deg) translate(-30px, -10px); }
        .glass.group:hover .fan-1 { transform: rotate(0deg) translate(0, -20px); }
        .glass.group:hover .fan-2 { transform: rotate(25deg) translate(30px, -10px); }
      `}</style>
    </section>
  );
};
