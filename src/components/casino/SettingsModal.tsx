'use client';

import React from 'react';
import { X, Settings, Volume2, Shield, Eye, EyeOff, Layout } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isMobile } = useCasinoStore();

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 5000, 
      display: 'flex', 
      alignItems: isMobile ? 'flex-end' : 'center', 
      justifyContent: 'center',
      padding: isMobile ? '0' : '20px'
    }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} 
      />
      
      <div className="glass animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
        maxHeight: isMobile ? '90vh' : 'auto',
        overflowY: 'auto', 
        position: 'relative',
        border: '1px solid hsla(0,0%,100%,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: isMobile ? '24px' : '32px', background: 'hsla(0,0%,100%,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '14px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={isMobile ? 20 : 24} />
            </div>
            <div>
              <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>SETTINGS</h2>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Personalize your experience</div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: isMobile ? '24px' : '32px', display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px' }}>
          {/* Privacy Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={18} color="hsl(var(--primary))" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>PRIVACY & SECURITY</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Hide Balance</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Conceal balance in topbar</div>
                </div>
                <button className="btn btn-ghost" style={{ padding: '12px' }}>
                  <EyeOff size={20} />
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Anonymous Betting</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Hide name from public feeds</div>
                </div>
                <div style={{ width: '48px', height: '24px', borderRadius: '12px', background: 'hsl(var(--primary))', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', right: '4px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: 'black' }} />
                </div>
              </div>
            </div>
          </section>

          {/* Localization Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Layout size={18} color="hsl(var(--primary))" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>LOCALIZATION</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '8px', display: 'block' }}>LANGUAGE</label>
                <select className="input" style={{ height: '52px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <option>English (US)</option>
                  <option>German (DE)</option>
                  <option>French (FR)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '8px', display: 'block' }}>ODDS FORMAT</label>
                <select className="input" style={{ height: '52px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <option>Decimal (2.00)</option>
                  <option>Fractional (1/1)</option>
                  <option>American (+100)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div style={{ padding: isMobile ? '24px' : '32px', background: 'hsla(0,0%,100%,0.02)', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '1.1rem' }}>
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}
