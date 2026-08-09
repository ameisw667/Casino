'use client';

import { LobbyAmbientBackground } from '@/components/home/LobbyAmbientBackground';

/**
 * Full-bleed cinematic Liquid-Gold layer for /sign-in and /sign-up.
 * Desktop (>=1024px): reuses the homepage's proven ambient canvas + 2 slow orbs.
 * Mobile (<1024px): LobbyAmbientBackground self-disables — a static CSS
 * fallback keeps the page from going background-less there.
 */
export function AuthCinematicBackground() {
  return (
    <div className="auth-cinematic-bg" aria-hidden="true">
      <LobbyAmbientBackground showSpotlight={false} />
      <div className="auth-orb auth-orb-gold" />
      <div className="auth-orb auth-orb-dark" />
      <div className="auth-cinematic-mobile-fallback" />
    </div>
  );
}
