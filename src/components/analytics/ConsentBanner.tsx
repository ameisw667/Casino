'use client';

import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type ConsentValue,
  readConsent,
  readConsentServerSnapshot,
  subscribeToConsentChanges,
  writeConsent,
} from '@/lib/analytics/consent';

// Copy draft from worldmap/05_2.9_PostHog_Analytics.md §14 — Claude-Entwurf, nicht rechtlich
// geprüft. Jan gibt die finale Fassung frei (§11.3 / Go-Live-Gate §9b).
const BANNER_TITLE = 'Nutzungsdaten für Produktverbesserung';
const BANNER_TEXT =
  'Wir möchten anonymisiert messen, wie diese Seite genutzt wird — z. B. welche Seite dich hierher geführt hat oder ob die Anmeldung reibungslos funktioniert —, um sie gezielt zu verbessern. Dafür nutzen wir PostHog. Es werden niemals Einsätze, Kontostand oder deine E-Mail-Adresse erfasst. Du kannst deine Zustimmung jederzeit widerrufen.';

export function ConsentBanner() {
  // useSyncExternalStore: server + first client paint both use readConsentServerSnapshot()
  // (always null) so they match exactly, then React re-reads the real localStorage value via
  // readConsent() once hydrated — no flash based on a guess, no synchronous setState-in-effect
  // (05_2.9_PostHog_Analytics.md §3.1 SSR note).
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <p className="mb-1 font-semibold text-white">{BANNER_TITLE}</p>
            <p className="mb-4 text-sm leading-relaxed text-white/70">{BANNER_TEXT}</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <motion.button
                type="button"
                onClick={() => decide('denied')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
              >
                Ablehnen
              </motion.button>
              <motion.button
                type="button"
                onClick={() => decide('granted')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border border-[#D4AF37]/60 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-[#D4AF37]/10"
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
