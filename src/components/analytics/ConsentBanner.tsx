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

const BANNER_TITLE = 'Nutzungsdaten & Analytics';
const BANNER_TEXT =
  'Anonymisierte Messung zur Performance- und Fehleranalyse. Keine Erfassung von Einsätzen, Salden oder E-Mail-Adressen.';

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
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-4 right-4 left-4 z-[60] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#0D0D0E]/95 p-4.5 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(212,175,55,0.08)] backdrop-blur-xl">
            {/* Top ambient highlight */}
            <div className="pointer-events-none absolute -top-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-2xl" />

            <div className="relative flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">{BANNER_TITLE}</h3>
                <span className="text-[11px] font-mono text-[#D4AF37]/80">Opt-in Analytics</span>
              </div>
            </div>

            <p className="relative mt-2.5 text-xs leading-relaxed text-white/70">
              {BANNER_TEXT}
            </p>

            <div className="relative mt-4 flex items-center justify-end gap-2.5 pt-1">
              <motion.button
                type="button"
                onClick={() => decide('denied')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Ablehnen
              </motion.button>
              <motion.button
                type="button"
                onClick={() => decide('granted')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] px-4 py-1.5 text-xs font-semibold text-black shadow-md shadow-[#D4AF37]/20 transition-all hover:brightness-110"
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
