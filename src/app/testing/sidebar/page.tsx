import { Metadata } from 'next';
import SidebarOptionsClient from './SidebarOptionsClient';

export const metadata: Metadata = {
  title: 'Royale Guide Sidebar Options | Casino Royale',
  description:
    'Interaktiver Option-Gate-Vergleich: Minimal-Flag + Portal-Reveal (A), Event-Trigger (B) und eigene Guide-Seite (C) — klickbar zum Ausprobieren.',
};

export default function SidebarOptionsPage() {
  return <SidebarOptionsClient />;
}
