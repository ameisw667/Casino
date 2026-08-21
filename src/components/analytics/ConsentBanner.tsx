'use client';

import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import {
  type ConsentValue,
  readConsent,
  readConsentServerSnapshot,
  subscribeToConsentChanges,
  writeConsent,
} from '@/lib/analytics/consent';

export function ConsentBanner() {
  const consent = useSyncExternalStore<ConsentValue | null>(
    subscribeToConsentChanges,
    readConsent,
    readConsentServerSnapshot,
  );

  const decide = (value: ConsentValue) => writeConsent(value);

  const visible = consent === null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Datennutzung für Produktverbesserung"
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            flexShrink: 0,
            margin: '0 20px 10px 20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              background: 'hsla(0, 0%, 100%, 0.025)',
              borderRadius: '12px',
              border: '1px solid hsla(45, 100%, 50%, 0.22)',
              boxShadow:
                '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <ShieldCheck size={14} color="#D4AF37" style={{ flexShrink: 0 }} />
              <div
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#D4AF37',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Analytics &amp; Daten
              </div>
            </div>

            <p
              style={{
                fontSize: '0.66rem',
                lineHeight: '1.35',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '0 0 8px 0',
              }}
            >
              Anonyme Nutzungsdaten zur Optimierung (keine Kontodaten).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <motion.button
                type="button"
                onClick={() => decide('denied')}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Ablehnen
              </motion.button>
              <motion.button
                type="button"
                onClick={() => decide('granted')}
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'linear-gradient(135deg, hsl(45, 100%, 50%), hsl(38, 100%, 42%))',
                  border: 'none',
                  color: '#000',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                Zustimmen
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
