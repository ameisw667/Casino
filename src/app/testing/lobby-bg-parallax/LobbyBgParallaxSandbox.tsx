'use client';

import { useState } from 'react';
import { LobbyAmbientBackground } from '@/components/home/LobbyAmbientBackground';

type BackgroundVariant = 'webgl' | 'parallax';

const VARIANT_LABELS: Record<BackgroundVariant, string> = {
  webgl: 'Alt — WebGL-Wasser (bisheriger Live-Zustand)',
  parallax: 'Neu — 2.5D-Parallax (Plan 26)',
};

/**
 * Bare-sandbox preview for Plan 26 (Option C). Shows the ambient background
 * behind representative demo content and lets Jan toggle between the current
 * WebGL backdrop and the new parallax backdrop on the same screen.
 */
export default function LobbyBgParallaxSandbox() {
  const [variant, setVariant] = useState<BackgroundVariant>('parallax');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <LobbyAmbientBackground backgroundVariant={variant} />

      <div className="relative z-[5] mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Lobby-Hintergrund: Vorher/Nachher</h1>

        <p className="max-w-xl text-sm text-white/60">
          Bewege die Maus über die Fläche und scrolle: Beide Varianten reagieren auf Mausdrift,
          Scroll-Parallax, Spotlight und Goldstaub. Unterschieden wird nur die unterste Bildebene.
        </p>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
            {(Object.keys(VARIANT_LABELS) as BackgroundVariant[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setVariant(key)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  variant === key
                    ? 'bg-[#D4AF37] font-medium text-[#0B0E14]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {VARIANT_LABELS[key]}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/40">Aktive Variante: {VARIANT_LABELS[variant]}</span>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('casino:lobby-hover-wave', {
                    detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
                  }),
                )
              }
              className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Welle testen
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('casino:lobby-big-win'))}
              className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 hover:bg-white/5"
            >
              Komet testen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
