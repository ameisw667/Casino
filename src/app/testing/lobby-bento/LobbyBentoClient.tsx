'use client';

import { BentoLobbyHome } from '@/components/home/BentoLobbyHome';

/**
 * Redesign-Prüfseite für den Bento-Lobby-Umbau. Rendert exakt die
 * Live-Lobby-Komposition (BentoLobbyHome) — die Seite selbst ist leer,
 * die Shell-Ausnahme (MainLayout-Kontext) steuert ClientShell.
 */
export function LobbyBentoClient() {
  return <BentoLobbyHome />;
}
