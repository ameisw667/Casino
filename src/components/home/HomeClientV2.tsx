'use client';
import { BentoLobbyHome } from '@/components/home/BentoLobbyHome';

/**
 * Bento-Lobby (03-frontend-lobby L6): die alte 7-Sektionen-Komposition
 * (VipLiveStreamRail, LiveHighrollerTickerBar, InteractiveArcadeGrid,
 * ProgressiveJackpotSection, DailyTournamentTeaser, VipProgressTeaser)
 * ist durch die Bento-Mosaik-Komposition ersetzt. Alt-Dateien bleiben im
 * Baum bis zur Ablage-Freigabe; gerendert werden sie nicht mehr.
 */
export function HomeClientV2() {
  return <BentoLobbyHome />;
}
