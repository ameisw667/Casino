import { Metadata } from 'next';
import DigestPreviewClient from './DigestPreviewClient';

export const metadata: Metadata = {
  title: 'Digest Live-Vorschau | Casino Royale Admin',
  description: 'Live-Vorschau des Daily Activity Digests in Echtzeit über Trigger.dev Realtime.',
};

export const dynamic = 'force-dynamic';

export default function DigestPreviewPage() {
  return <DigestPreviewClient />;
}
