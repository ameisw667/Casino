import { Metadata } from 'next';
import AdminEvalsClient from './AdminEvalsClient';

export const metadata: Metadata = {
  title: 'LLM Evals & Telemetrie | Casino Admin',
  description: 'Echtzeit-Telemetrie, P95-Latenzen, Token-Kosten und Nutzer-Zufriedenheitsmetriken des Royale Guides.',
};

export default function AdminEvalsPage() {
  return <AdminEvalsClient />;
}
