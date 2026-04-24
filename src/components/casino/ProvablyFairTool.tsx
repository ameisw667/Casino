'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Copy, Check } from 'lucide-react';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function ProvablyFairTool() {
  const { isMobile } = useCasinoStore();
  const [serverSeed, setServerSeed] = useState('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  const [clientSeed, setClientSeed] = useState('my-lucky-seed');
  const [nonce, setNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState<{ dice: string; crash: string; slots: number[] }>({ dice: '0.00', crash: '1.00', slots: [0, 0, 0, 0, 0] });

  React.useEffect(() => {
    const calculate = async () => {
      try {
        const outcome = await ProvablyFairEngine.calculateOutcome(serverSeed, clientSeed, nonce);
        const dice = (outcome * 100).toFixed(2);
        const crash = (await ProvablyFairEngine.getCrashMultiplier(serverSeed, clientSeed, nonce)).toFixed(2);
        const slots = await ProvablyFairEngine.getSlotsResult(serverSeed, clientSeed, nonce, 5, 12);
        setResults({ dice, crash, slots });
      } catch (e) {
        console.error(e);
      }
    };
    calculate();
  }, [serverSeed, clientSeed, nonce]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: isMobile ? '20px' : '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '20px' : '24px' }}>
        <ShieldCheck size={isMobile ? 20 : 24} color="hsl(var(--primary))" />
        <h2 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>Provably Fair Verifier</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label 
            style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '6px', display: 'block', letterSpacing: '0.05em' }}
          >
            SERVER SEED (HASHED)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              className="input mono" 
              value={serverSeed} 
              onChange={(e) => setServerSeed(e.target.value)} 
              style={{ fontSize: '0.75rem', flex: 1, minHeight: '44px' }}
            />
            <button className="btn btn-secondary" style={{ padding: '8px', width: '44px', height: '44px' }} onClick={() => copyToClipboard(serverSeed)}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label 
            style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '6px', display: 'block', letterSpacing: '0.05em' }}
          >
            CLIENT SEED
          </label>
          <input 
            className="input" 
            value={clientSeed} 
            onChange={(e) => setClientSeed(e.target.value)} 
            style={{ minHeight: '44px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '6px', display: 'block', letterSpacing: '0.05em' }}>NONCE</label>
            <input 
              type="number" 
              className="input" 
              value={nonce} 
              onChange={(e) => setNonce(parseInt(e.target.value) || 0)} 
              style={{ minHeight: '44px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ width: '100%', height: '44px', fontSize: '0.85rem' }} onClick={() => setNonce(n => n + 1)}>
              <RefreshCw size={14} /> Increment
            </button>
          </div>
        </div>

        <div className="glass" style={{ marginTop: '8px', padding: isMobile ? '16px' : '20px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-muted))', marginBottom: '12px', letterSpacing: '0.1em' }}>VERIFIED OUTCOMES</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
            <div className="card" style={{ padding: '12px', background: 'hsla(0,0%,100%,0.02)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>DICE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900 }} className="text-gradient">{results.dice}</div>
            </div>
            <div className="card" style={{ padding: '12px', background: 'hsla(0,0%,100%,0.02)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>CRASH</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900 }} className="text-gradient">{results.crash}x</div>
            </div>
            <div className="card" style={{ padding: '12px', background: 'hsla(0,0%,100%,0.02)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>SLOTS</div>
              <div style={{ fontSize: isMobile ? '0.9rem' : '0.8rem', fontWeight: 900, whiteSpace: 'nowrap' }} className="text-gradient">
                {results.slots.join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
