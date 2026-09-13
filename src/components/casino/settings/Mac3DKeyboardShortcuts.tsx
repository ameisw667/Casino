'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';

interface KeyConfig {
  id: string;
  label: string;
  subLabel?: string;
  actionDesc?: string;
  width?: number; // flex basis or relative span
  isSpecial?: boolean;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1: Function / Numbers
  [
    { id: 'Escape', label: 'ESC', actionDesc: 'Schließen', width: 1.2, isSpecial: true },
    { id: '1', label: '1', subLabel: 'Lobby', actionDesc: 'Zur Hauptlobby' },
    { id: '2', label: '2', subLabel: 'Games', actionDesc: 'Alle Spiele' },
    { id: '3', label: '3', subLabel: 'History', actionDesc: 'Transaktionen' },
    { id: '4', label: '4', subLabel: 'Top', actionDesc: 'Leaderboard' },
    { id: '5', label: '5', subLabel: 'Vault', actionDesc: 'VIP Vault' },
    { id: '6', label: '6', subLabel: 'Stats', actionDesc: 'Statistiken' },
    { id: 'Backspace', label: 'DELETE', width: 1.5, isSpecial: true },
  ],
  // Row 2: Letters / QWERTY
  [
    { id: 'Tab', label: 'TAB', width: 1.3, isSpecial: true },
    { id: 'q', label: 'Q' },
    { id: 'w', label: 'W' },
    { id: 'e', label: 'E' },
    { id: 'r', label: 'R' },
    { id: 't', label: 'T' },
    { id: 'y', label: 'Y' },
    { id: 'u', label: 'U' },
    { id: 'i', label: 'I' },
    { id: 'o', label: 'O' },
    { id: 'p', label: 'P' },
  ],
  // Row 3: Middle Row
  [
    { id: 'CapsLock', label: 'CAPS', width: 1.5, isSpecial: true },
    { id: 'a', label: 'A' },
    { id: 's', label: 'S' },
    { id: 'd', label: 'D' },
    { id: 'f', label: 'F' },
    { id: 'g', label: 'G' },
    { id: 'h', label: 'H' },
    { id: 'j', label: 'J' },
    { id: 'k', label: 'K' },
    { id: 'l', label: 'L' },
    { id: 'Enter', label: 'RETURN', width: 1.7, isSpecial: true },
  ],
  // Row 4: Bottom Letters & Settings
  [
    { id: 'Shift', label: 'SHIFT', width: 2.0, isSpecial: true },
    { id: 'z', label: 'Z' },
    { id: 'x', label: 'X' },
    { id: 'c', label: 'C' },
    { id: 'v', label: 'V' },
    { id: 'b', label: 'B' },
    { id: 'n', label: 'N' },
    { id: 'm', label: 'M' },
    { id: ',', label: ',', subLabel: 'Opt', actionDesc: 'Settings Menü' },
    { id: 'ShiftRight', label: 'SHIFT', width: 2.0, isSpecial: true },
  ],
  // Row 5: Modifier / Spacebar
  [
    { id: 'Control', label: 'CONTROL', width: 1.3, isSpecial: true },
    { id: 'Alt', label: 'OPTION', width: 1.2, isSpecial: true },
    { id: 'Meta', label: 'COMMAND ⌘', width: 1.4, isSpecial: true },
    { id: ' ', label: 'SPACEBAR — BET / SPIN / ACTION', width: 6.0, actionDesc: 'Schnellwette / Drehen', isSpecial: true },
    { id: 'MetaRight', label: '⌘', width: 1.3, isSpecial: true },
    { id: '?', label: '?', subLabel: 'Help', actionDesc: 'Shortcuts Übersicht' },
  ],
];

interface Mac3DKeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateKey?: (key: string) => void;
}

export function Mac3DKeyboardShortcuts({
  isOpen,
  onClose,
  onSimulateKey,
}: Mac3DKeyboardShortcutsProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set(['1', ' ']));
  const [isMac] = useState(() =>
    typeof window !== 'undefined' ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) : true,
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setPressedKeys((prev) => new Set(prev).add(key).add(e.key).add(e.code));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      next.delete(e.key);
      next.delete(e.code);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, handleKeyDown, handleKeyUp]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-testid="mac-keyboard-shortcuts-modal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Main 3D Stage Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={springs.standard}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '920px',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #131722 0%, #0B0E14 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)',
              padding: '28px',
              color: '#F9FAFB',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(11, 14, 20, 0.8) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.25)',
                  }}
                >
                  <Keyboard size={22} color="#D4AF37" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#F9FAFB' }}>
                      Mac 3D Mechanical Cheat-Sheet
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#D4AF37',
                        background: 'rgba(212, 175, 55, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                      }}
                    >
                      {isMac ? 'APPLE MAC KEYMAP' : 'PC / WIN KEYMAP'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9CA3AF' }}>
                    Drücken Sie eine Taste auf Ihrer Tastatur oder klicken Sie eine Taste an, um die haptische Ausleuchtung zu testen.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Schließen"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 3D Physical Keyboard Chassis */}
            <div
              style={{
                perspective: '1200px',
                display: 'flex',
                justifyContent: 'center',
                padding: '10px 0 24px',
              }}
            >
              <div
                style={{
                  transform: 'rotateX(14deg)',
                  transformStyle: 'preserve-3d',
                  background: 'linear-gradient(180deg, #1C2230 0%, #10141D 100%)',
                  borderRadius: '18px',
                  border: '1px solid rgba(212, 175, 55, 0.28)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {KEYBOARD_ROWS.map((row, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      display: 'flex',
                      gap: '6px',
                      width: '100%',
                    }}
                  >
                    {row.map((k) => {
                      const isPressed =
                        pressedKeys.has(k.id.toLowerCase()) ||
                        pressedKeys.has(k.id) ||
                        (k.id === 'Meta' && (pressedKeys.has('meta') || pressedKeys.has('control'))) ||
                        (k.id === ' ' && pressedKeys.has(' '));

                      const hasAction = Boolean(k.actionDesc);

                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => {
                            if (onSimulateKey) onSimulateKey(k.id);
                            setPressedKeys((prev) => {
                              const next = new Set(prev);
                              next.add(k.id.toLowerCase());
                              setTimeout(() => {
                                setPressedKeys((p) => {
                                  const n = new Set(p);
                                  n.delete(k.id.toLowerCase());
                                  return n;
                                });
                              }, 300);
                              return next;
                            });
                          }}
                          style={{
                            flex: k.width ?? 1,
                            minWidth: 0,
                            height: '46px',
                            borderRadius: '8px',
                            background: isPressed
                              ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.15) 100%)'
                              : hasAction
                              ? 'linear-gradient(180deg, #2A3346 0%, #1A202C 100%)'
                              : 'linear-gradient(180deg, #222A38 0%, #151A24 100%)',
                            border: isPressed
                              ? '1px solid #D4AF37'
                              : hasAction
                              ? '1px solid rgba(212, 175, 55, 0.45)'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: isPressed
                              ? '0 0 16px rgba(212, 175, 55, 0.6), inset 0 2px 4px rgba(0,0,0,0.5)'
                              : hasAction
                              ? '0 3px 0 #0B0E14, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                              : '0 3px 0 #080A0F, 0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                            transform: isPressed ? 'translateY(3px)' : 'translateY(0)',
                            transition: 'all 0.08s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px 4px',
                            position: 'relative',
                            userSelect: 'none',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: k.label.length > 3 ? '10px' : '13px',
                              fontWeight: 700,
                              color: isPressed ? '#FFFFFF' : hasAction ? '#D4AF37' : '#E5E7EB',
                              letterSpacing: '0.02em',
                              textShadow: isPressed ? '0 0 8px #D4AF37' : 'none',
                            }}
                          >
                            {k.label}
                          </span>
                          {k.subLabel && (
                            <span
                              style={{
                                fontSize: '8px',
                                color: isPressed ? '#F9FAFB' : '#9CA3AF',
                                textTransform: 'uppercase',
                                marginTop: '1px',
                              }}
                            >
                              {k.subLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Cheat-Sheet Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '20px',
              }}
            >
              <div
                style={{
                  background: 'rgba(11, 14, 20, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#D4AF37', fontSize: '13px' }}>1 — 6</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Floor Navigation</span>
                </div>
                <div style={{ fontSize: '12px', color: '#E5E7EB' }}>
                  Sofortiger Etagenwechsel: Lobby (1), Spiele (2), Vault (5).
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(11, 14, 20, 0.6)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#10B981', fontSize: '13px' }}>SPACE</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Action Trigger</span>
                </div>
                <div style={{ fontSize: '12px', color: '#E5E7EB' }}>
                  Löst in Spielen die Wette, den Spin oder den Crash-Einsatz aus.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(11, 14, 20, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#D4AF37', fontSize: '13px' }}>,</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Settings</span>
                </div>
                <div style={{ fontSize: '12px', color: '#E5E7EB' }}>
                  Öffnet Sound- und Sicherheits-Präferenzen jederzeit.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(11, 14, 20, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#3B82F6', fontSize: '13px' }}>?</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Hilfe-HUD</span>
                </div>
                <div style={{ fontSize: '12px', color: '#E5E7EB' }}>
                  Blendet dieses interaktive 3D-Keyboard ein & aus.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
