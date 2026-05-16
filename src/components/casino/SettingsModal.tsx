import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, EyeOff, Layout, Volume2, VolumeX, Eye } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useModalKeyboard } from '@/hooks/useModalKeyboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const isMobile = useCasinoStore(s => s.isMobile);
  const soundEnabled = useCasinoStore(s => s.soundEnabled);
  const soundVolume = useCasinoStore(s => s.soundVolume);
  const hideBalance = useCasinoStore(s => s.hideBalance);
  const anonymousBetting = useCasinoStore(s => s.anonymousBetting);
  const language = useCasinoStore(s => s.language);
  const oddsFormat = useCasinoStore(s => s.oddsFormat);
  const updateSettings = useCasinoStore(s => s.updateSettings);
  const addToast = useCasinoStore(s => s.addToast);
  
  // Universal ESC-key handling
  useModalKeyboard(onClose, isOpen);

  // Local state for all settings to allow "Save Changes" vs "Cancel" pattern
  // Logic-Architect: Initialize directly from props since parent uses conditional rendering
  const [localLang, setLocalLang] = useState(language || 'en');
  const [localOdds, setLocalOdds] = useState(oddsFormat || 'decimal');
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled ?? true);
  const [localSoundVolume, setLocalSoundVolume] = useState(soundVolume ?? 0.5);
  const [localHideBalance, setLocalHideBalance] = useState(hideBalance ?? false);
  const [localAnonymousBetting, setLocalAnonymousBetting] = useState(anonymousBetting ?? false);

  // Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      language: localLang,
      oddsFormat: localOdds,
      soundEnabled: localSoundEnabled,
      soundVolume: localSoundVolume,
      hideBalance: localHideBalance,
      anonymousBetting: localAnonymousBetting
    });
    addToast('Settings updated successfully', 'success');
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 5000, 
        display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center',
        padding: isMobile ? '0' : '20px'
      }}
    >
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
              <h2 id="settings-heading" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>SETTINGS</h2>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Personalize your experience</div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }} aria-label="Close Settings">
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
                <button 
                  onClick={() => setLocalHideBalance(!localHideBalance)}
                  className="btn btn-ghost" 
                  style={{ padding: '12px', color: localHideBalance ? 'hsl(var(--primary))' : 'inherit' }}
                >
                  {localHideBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Anonymous Betting</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Hide name from public feeds</div>
                </div>
                <div 
                  onClick={() => setLocalAnonymousBetting(!localAnonymousBetting)}
                  style={{ 
                    width: '48px', 
                    height: '24px', 
                    borderRadius: '12px', 
                    background: localAnonymousBetting ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.1)', 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    left: localAnonymousBetting ? '28px' : '4px', 
                    top: '4px', 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    background: localAnonymousBetting ? 'black' : 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            </div>
          </section>

          {/* Audio Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Volume2 size={18} color="hsl(var(--primary))" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>AUDIO & SOUND</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sound Effects</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Toggle all game sounds</div>
                </div>
                <div 
                  onClick={() => setLocalSoundEnabled(!localSoundEnabled)}
                  style={{ 
                    width: '48px', 
                    height: '24px', 
                    borderRadius: '12px', 
                    background: localSoundEnabled ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.1)', 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    left: localSoundEnabled ? '28px' : '4px', 
                    top: '4px', 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    background: localSoundEnabled ? 'black' : 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>VOLUME</label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{Math.round(localSoundVolume * 100)}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {localSoundVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={localSoundVolume}
                    onChange={(e) => setLocalSoundVolume(parseFloat(e.target.value))}
                    style={{ 
                      flex: 1, 
                      height: '6px', 
                      borderRadius: '3px', 
                      appearance: 'none', 
                      background: `linear-gradient(to right, hsl(var(--primary)) ${localSoundVolume * 100}%, hsla(0,0%,100%,0.1) ${localSoundVolume * 100}%)`,
                      outline: 'none',
                      cursor: 'pointer'
                    }} 
                  />
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
                <select 
                  value={localLang}
                  onChange={(e) => setLocalLang(e.target.value)}
                  className="input" 
                  style={{ height: '52px', fontSize: '0.9rem', fontWeight: 600, background: 'hsla(var(--bg-color), 0.5)', width: '100%', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '0 16px', color: '#fff' }}
                >
                  <option value="en">English (US)</option>
                  <option value="de">German (DE)</option>
                  <option value="fr">French (FR)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', marginBottom: '8px', display: 'block' }}>ODDS FORMAT</label>
                <select 
                  value={localOdds}
                  onChange={(e) => setLocalOdds(e.target.value)}
                  className="input" 
                  style={{ height: '52px', fontSize: '0.9rem', fontWeight: 600, background: 'hsla(var(--bg-color), 0.5)', width: '100%', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '0 16px', color: '#fff' }}
                >
                  <option value="decimal">Decimal (2.00)</option>
                  <option value="fractional">Fractional (1/1)</option>
                  <option value="american">American (+100)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div style={{ padding: isMobile ? '24px' : '32px', background: 'hsla(0,0%,100%,0.02)', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <button 
            onClick={handleSave}
            className="btn btn-primary" 
            style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 900 }}
          >
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}