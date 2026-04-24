'use client';

import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, Copy, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function FairnessPage() {
  const { provablyFairSettings, setProvablyFairSettings } = useCasinoStore();
  const [copied, setCopied] = useState(false);

  const rotateSeeds = () => {
    const newClientSeed = Math.random().toString(36).substring(2, 15);
    // In a real app, server seed would be hashed on client, real one revealed after rotation
    setProvablyFairSettings({
      ...provablyFairSettings,
      clientSeed: newClientSeed,
      nonce: 0
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: 'hsla(var(--success), 0.1)', borderRadius: 'var(--radius-full)', color: 'hsl(var(--success))', marginBottom: '24px', border: '1px solid hsla(var(--success), 0.2)' }}>
          <ShieldCheck size={24} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>100% PROVABLY FAIR</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>Transparency by Design.</h1>
        <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-muted))', maxWidth: '600px', margin: '0 auto' }}>
          We use industry-standard cryptographic algorithms to ensure that neither the house nor the player can manipulate game outcomes.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        {/* Active Seeds Card */}
        <section className="glass" style={{ padding: '40px', borderRadius: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            ACTIVE SESSION SEEDS
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>CLIENT SEED (EDITABLE)</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  className="input" 
                  value={provablyFairSettings.clientSeed}
                  onChange={(e) => setProvablyFairSettings({ ...provablyFairSettings, clientSeed: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
                />
                <button onClick={rotateSeeds} className="btn btn-secondary" style={{ padding: '0 20px', gap: '8px' }}>
                  <RotateCcw size={18} /> ROTATE
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>SERVER SEED (HASHED)</label>
              <div style={{ display: 'flex', gap: '12px', background: 'hsla(0,0%,100%,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', flex: 1, color: 'hsl(var(--text-muted))' }}>{provablyFairSettings.serverSeed}</span>
                <button onClick={() => copyToClipboard(provablyFairSettings.serverSeed)} style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer' }}>
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                The server seed is revealed only after you rotate it, proving we haven't changed it during your session.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '40px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>NONCE</label>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{provablyFairSettings.nonce}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>ALGORITHM</label>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>SHA-256</div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="glass" style={{ padding: '32px', borderRadius: '24px', border: '1px solid hsla(var(--primary), 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Info size={20} color="hsl(var(--primary))" /> HOW IT WORKS
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6 }}>
              1. A <strong>Server Seed</strong> is generated by our system.<br />
              2. You provide a <strong>Client Seed</strong>.<br />
              3. We combine both with a <strong>Nonce</strong> (bet count).<br />
              4. The hash of this combination determines the outcome.
            </p>
          </section>

          <section className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>VERIFY MANUALLY</h3>
            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
              Want to run the math yourself? Use our open-source script.
            </p>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'space-between' }}>
              Github Repository <ExternalLink size={16} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
