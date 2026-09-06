import { Metadata } from 'next';
import { LobbyBentoClient } from './LobbyBentoClient';

export const metadata: Metadata = {
  title: 'Lobby Bento Redesign (Testing) | Casino Royale',
  description:
    'Testing-Sandbox für den Editorial-Bento-Lobby-Overhaul: identische Funktionalität, isolierte Route — Live-Variante bleibt unangetastet.',
};

export default function LobbyBentoPage() {
  return <LobbyBentoClient />;
}
