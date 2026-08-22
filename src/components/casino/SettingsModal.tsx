'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ShieldCheck,
  Bell,
  X,
  Sparkles,
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import TelegramLinkSection from './TelegramLinkSection';
import PasskeyManagementSection from './PasskeyManagementSection';
import MfaManagementSection from './MfaManagementSection';
import LinkedAccountsSection from './LinkedAccountsSection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'audio' | 'security' | 'notifications';
}

type TabKey = 'audio' | 'security' | 'notifications';

export default function SettingsModal({
  isOpen,
  onClose,
  defaultTab = 'security',
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const soundEnabled = useCasinoStore((s) => s.soundEnabled ?? true);
  const soundVolume = useCasinoStore((s) => s.soundVolume ?? 0.5);
  const hideBalance = useCasinoStore((s) => s.hideBalance ?? false);
  const updateSettings = useCasinoStore((s) => s.updateSettings);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '740px',
              minHeight: '480px',
              maxHeight: '88vh',
              background: 'hsl(var(--bg-color, 0 0% 7%))',
              borderRadius: '20px',
              border: '1px solid hsla(var(--primary), 0.3)',
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 32px hsla(var(--primary), 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid hsla(var(--primary), 0.15)',
                background: 'linear-gradient(90deg, hsla(var(--primary), 0.08) 0%, transparent 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 12px hsla(var(--primary), 0.4)',
                  }}
                >
                  <Sliders size={16} color="#000" />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: 'hsl(var(--text-main))',
                      margin: 0,
                    }}
                  >
                    EINSTELLUNGEN
                  </h2>
                  <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', margin: 0 }}>
                    Verwalte Audio, Sicherheit & Login-Methoden
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Schließen"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'hsla(0, 0%, 100%, 0.05)',
                  border: '1px solid hsla(0, 0%, 100%, 0.1)',
                  color: 'hsl(var(--text-muted))',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
              {/* Left Tabs */}
              <div
                style={{
                  width: '210px',
                  background: 'hsla(0, 0%, 0%, 0.25)',
                  borderRight: '1px solid hsla(0, 0%, 100%, 0.06)',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      activeTab === 'audio'
                        ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.04) 100%)'
                        : 'transparent',
                    color: activeTab === 'audio' ? '#D4AF37' : 'hsl(var(--text-muted))',
                    borderLeft: activeTab === 'audio' ? '3px solid #D4AF37' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  <Volume2 size={15} />
                  Audio & Anzeige
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      activeTab === 'security'
                        ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.04) 100%)'
                        : 'transparent',
                    color: activeTab === 'security' ? '#D4AF37' : 'hsl(var(--text-muted))',
                    borderLeft: activeTab === 'security' ? '3px solid #D4AF37' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  <ShieldCheck size={15} />
                  Sicherheit & Login
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      activeTab === 'notifications'
                        ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.04) 100%)'
                        : 'transparent',
                    color: activeTab === 'notifications' ? '#D4AF37' : 'hsl(var(--text-muted))',
                    borderLeft: activeTab === 'notifications' ? '3px solid #D4AF37' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  <Bell size={15} />
                  Benachrichtigungen
                </button>
              </div>

              {/* Right Content */}
              <div
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {activeTab === 'audio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'hsl(var(--primary))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      Sound & Lautstärke
                    </h3>

                    {/* Sound Mute Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'hsla(0, 0%, 100%, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {soundEnabled ? (
                          <Volume2 size={16} color="hsl(var(--primary))" />
                        ) : (
                          <VolumeX size={16} color="hsl(var(--text-muted))" />
                        )}
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
                            Sound-Effekte
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                            Spielgeräusche und Gewinnsignale
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
                        style={{
                          width: '40px',
                          height: '22px',
                          borderRadius: '11px',
                          background: soundEnabled ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.12)',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          padding: 0,
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: soundEnabled ? '21px' : '3px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: soundEnabled ? '#000' : '#fff',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </button>
                    </div>

                    {/* Volume Slider */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '12px 14px',
                        background: 'hsla(0, 0%, 100%, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
                          Lautstärke
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: 'hsl(var(--primary))',
                          }}
                        >
                          {Math.round(soundVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={soundVolume}
                        onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                        style={{
                          width: '100%',
                          accentColor: 'hsl(var(--primary))',
                          cursor: 'pointer',
                        }}
                      />
                    </div>

                    {/* Hide Balance Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'hsla(0, 0%, 100%, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {hideBalance ? (
                          <EyeOff size={16} color="hsl(var(--primary))" />
                        ) : (
                          <Eye size={16} color="hsl(var(--text-muted))" />
                        )}
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
                            Guthaben verbergen
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                            Maskiert Kontostand für Privatsphäre
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateSettings({ hideBalance: !hideBalance })}
                        style={{
                          width: '40px',
                          height: '22px',
                          borderRadius: '11px',
                          background: hideBalance ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.12)',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          padding: 0,
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: hideBalance ? '21px' : '3px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: hideBalance ? '#000' : '#fff',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'hsl(var(--primary))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      Sicherheit & Login-Methoden
                    </h3>

                    {/* Linked Accounts (Google, Email) */}
                    <div
                      style={{
                        background: 'hsla(0, 0%, 100%, 0.02)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.05)',
                      }}
                    >
                      <LinkedAccountsSection />
                    </div>

                    {/* Passkeys */}
                    <div
                      style={{
                        background: 'hsla(0, 0%, 100%, 0.02)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.05)',
                      }}
                    >
                      <PasskeyManagementSection />
                    </div>

                    {/* 2FA TOTP */}
                    <div
                      style={{
                        background: 'hsla(0, 0%, 100%, 0.02)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.05)',
                      }}
                    >
                      <MfaManagementSection />
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'hsl(var(--primary))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      Telegram & Benachrichtigungen
                    </h3>

                    <div
                      style={{
                        background: 'hsla(0, 0%, 100%, 0.02)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid hsla(0, 0%, 100%, 0.05)',
                      }}
                    >
                      <TelegramLinkSection />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
