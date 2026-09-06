import { Metadata } from 'next';
import LobbyBgParallaxSandbox from './LobbyBgParallaxSandbox';

export const metadata: Metadata = {
  title: 'Lobby Background Parallax Sandbox | Casino Royale',
  description:
    'Gegenüberstellung des bisherigen WebGL-Wasser-Hintergrunds (Alt) und des neuen 2.5D-Parallax-Bildhintergrunds (Neu) nach Plan 26.',
};

export default function LobbyBgParallaxPage() {
  return <LobbyBgParallaxSandbox />;
}
