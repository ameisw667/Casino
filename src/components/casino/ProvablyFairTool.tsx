'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Copy, Check } from 'lucide-react';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';

export default function ProvablyFairTool() {
  const [serverSeed, setServerSeed] = useState('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
  const [clientSeed, setClientSeed] = useState('my-lucky-seed');
  const [nonce, setNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState({ dice: '0.00', crash: '1.00' });

  React.useEffect(() => {
    const calculate = async () => {
      try {
        const outcome = await ProvablyFairEngine.calculateOutcome(serverSeed, clientSeed, nonce);
        const dice = (outcome * 100).toFixed(2);
        const crash = (await ProvablyFairEngine.getCrashMultiplier(serverSeed, clientSeed, nonce)).toFixed(2);
        setResults({ dice, crash });
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
    <div className="glass-card" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ShieldCheck size={24} color="hsl(var(--primary))" />
        <h2 style={{ margin: 0 }}>Provably Fair Verifier</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '4px', display: 'block' }}>SERVER SEED</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              className="input mono" 
              value={serverSeed} 
              onChange={(e) => setServerSeed(e.target.value)} 
              style={{ fontSize: '0.8rem' }}
            />
            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => copyToClipboard(serverSeed)}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '4px', display: 'block' }}>CLIENT SEED</label>
          <input 
            className="input" 
            value={clientSeed} 
            onChange={(e) => setClientSeed(e.target.value)} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '4px', display: 'block' }}>NONCE</label>
            <input 
              type="number" 
              className="input" 
              value={nonce} 
              onChange={(e) => setNonce(parseInt(e.target.value) || 0)} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setNonce(n => n + 1)}>
              <RefreshCw size={16} /> Increment
            </button>
          </div>
        </div>

        <div className="glass" style={{ marginTop: '12px', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>VERIFIED OUTCOMES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>DICE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }} className="text-gradient">{results.dice}</div>
            </div>
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>CRASH</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }} className="text-gradient">{results.crash}x</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
