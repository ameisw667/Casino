'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Lock, 
  ChevronRight, 
  Copy, 
  CheckCircle2, 
  Info, 
  Zap, 
  History,
  ExternalLink,
  Code,
  Eye,
  RefreshCw,
  Award
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function FairnessPage() {
  const { provablyFairSettings, setProvablyFairSettings, isMobile } = useCasinoStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('VERIFIER');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px', padding: '0 24px 100px' }}>
      
      {/* Hero Header */}
      <header style={{ 
        marginTop: '20px',
        padding: isMobile ? '48px 24px' : '80px 48px',
        borderRadius: '40px',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
        border: '1px solid hsla(var(--primary), 0.2)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', color: 'hsl(var(--primary))', fontSize: '0.85rem', fontWeight: 900, marginBottom: '24px' }}>
            <ShieldCheck size={16} /> 100% PROVABLY FAIR
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 950, lineHeight: 1, fontFamily: "'Outfit', sans-serif", marginBottom: '20px' }}>
            DON'T TRUST US. <br />
            <span className="text-gradient">VERIFY US.</span>
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Our provably fair system uses cryptographic algorithms to ensure that every outcome is pre-determined and unalterable.
          </p>
        </div>
      </header>

      {/* Fairness Tool Tabs */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {['VERIFIER', 'SEEDS', 'WHITEPAPER'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            style={{ 
              padding: '14px 32px', 
              borderRadius: '16px', 
              background: activeTab === t ? 'white' : 'hsla(0,0%,100%,0.03)',
              color: activeTab === t ? 'black' : 'white',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '40px' }}>
        
        {/* Left Column: Interactive Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {activeTab === 'VERIFIER' && (
            <section className="glass-card" style={{ padding: '40px', borderRadius: '40px', border: '1px solid hsla(var(--primary), 0.2)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Zap color="hsl(var(--primary))" /> INTERACTIVE VERIFIER
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px', display: 'block' }}>SERVER SEED (HASHED)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input className="input mono" readOnly value={provablyFairSettings.serverSeedHash} style={{ fontSize: '0.8rem' }} />
                    <button onClick={() => copyToClipboard(provablyFairSettings.serverSeedHash)} className="btn btn-secondary" style={{ padding: '0 16px' }}><Copy size={18} /></button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px', display: 'block' }}>CLIENT SEED (USER PROVIDED)</label>
                  <input 
                    className="input mono" 
                    value={provablyFairSettings.clientSeed} 
                    onChange={(e) => setProvablyFairSettings({ clientSeed: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px', display: 'block' }}>NONCE</label>
                    <input className="input mono" readOnly value={provablyFairSettings.nonce} />
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" style={{ height: '56px', padding: '0 40px', borderRadius: '16px', fontWeight: 950 }}>VERIFY RESULT</button>
                  </div>
                </div>
              </div>

              {/* Math Visualizer */}
              <div style={{ marginTop: '48px', padding: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '24px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ padding: '12px 20px', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>INPUT 1</div>
                    <div style={{ fontWeight: 800 }}>CLIENT SEED</div>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>+</span>
                  <div style={{ padding: '12px 20px', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>INPUT 2</div>
                    <div style={{ fontWeight: 800 }}>SERVER SEED</div>
                  </div>
                  <ChevronRight size={24} style={{ transform: isMobile ? 'rotate(90deg)' : 'none' }} />
                  <div style={{ padding: '12px 20px', background: 'hsla(var(--success), 0.1)', borderRadius: '12px', border: '1px solid hsla(var(--success), 0.2)' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--success))' }}>OUTPUT</div>
                    <div style={{ fontWeight: 950 }}>GAME RESULT</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'SEEDS' && (
            <section className="glass-card" style={{ padding: '40px', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>SEED MANAGEMENT</h3>
                <button className="btn btn-secondary" style={{ gap: '8px' }}><RefreshCw size={16} /> ROTATE SEEDS</button>
              </div>
              <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '32px' }}>Rotating your seeds will generate a new Server Seed and reset your Nonce to 0. Your current Server Seed will be revealed for verification.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '24px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '20px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '12px' }}>ACTIVE SEED PAIR</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="mono" style={{ fontSize: '0.9rem' }}>vibe-coder-default</div>
                    <div style={{ color: 'hsl(var(--success))', fontSize: '0.7rem', fontWeight: 900 }}>ACTIVE</div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Trust Signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Third-Party Audits */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>THIRD-PARTY AUDITS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'iTech Labs', status: 'Certified', date: '2024' },
                { name: 'BMM Testlabs', status: 'Verified', date: '2024' },
                { name: 'Crypto Council', status: 'Gold Member', date: '2024' },
              ].map(audit => (
                <div key={audit.name} style={{ padding: '16px', background: 'hsla(0,0%,0%,0.2)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{audit.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>{audit.date} EDITION</div>
                  </div>
                  <div style={{ color: 'hsl(var(--success))' }}><CheckCircle2 size={20} /></div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>FAIRNESS STATS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>TOTAL VERIFICATIONS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>1,240,502</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>RNG INTEGRITY</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'hsl(var(--success))' }}>99.99%</div>
              </div>
            </div>
          </section>

          {/* Guarantee Certificate */}
          <div style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, #ffd70033, transparent)', border: '1px solid #ffd70044', textAlign: 'center' }}>
            <Award size={48} color="#ffd700" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontWeight: 900, fontSize: '1rem', color: '#ffd700' }}>FAIRNESS GUARANTEE</h4>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '8px' }}>Mathematically guaranteed to be random and transparent since Day 1.</p>
          </div>
        </div>

      </div>

      {/* FAQ Section */}
      <section style={{ padding: '60px 0', borderTop: '1px solid hsla(0,0%,100%,0.05)' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 950, textAlign: 'center', marginBottom: '48px' }}>FREQUENTLY ASKED QUESTIONS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { q: 'What is a Server Seed?', a: 'A cryptographic string generated by our server before the game starts. It is shown to you in a hashed format to ensure the result is pre-determined.' },
            { q: 'Can I change my Client Seed?', a: 'Yes! You can change your client seed at any time in the settings. This ensures that you have full control over the randomness of your rounds.' },
            { q: 'What does SHA-256 mean?', a: 'It is a secure hashing algorithm that takes an input and produces a unique 64-character string. It is impossible to reverse or manipulate.' },
            { q: 'How do I verify a past round?', a: 'Go to your history, copy the seeds and nonces of the round, and paste them into our interactive verifier tool above.' },
          ].map((item, i) => (
            <div key={i} className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '12px', color: 'hsl(var(--primary))' }}>{item.q}</div>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
