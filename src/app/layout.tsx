import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/auth/ClientProviders';
import ClientShell from '@/components/layout/ClientShell';

// Prevent static prerendering — the proxy middleware reads/refreshes the Supabase session per request
export const dynamic = 'force-dynamic';

// IBM Plex — single-family terminal system (Sans for UI/body, Mono for numbers/multipliers).
// Variables consumed via var(--font-inter) / var(--font-mono) across globals.css + components.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://casino-royale.vibe'),
  title: {
    default: 'Casino Royale | Premium Provably Fair Gaming',
    template: '%s | Casino Royale',
  },

  description:
    "The world's most transparent gaming ecosystem. Powered by deep-learning security and the fastest crypto rails in existence. Provably fair, instant payouts, and premium 3D gaming.",
  keywords: ['casino', 'crypto', 'gambling', 'provably fair', 'next.js', 'premium gaming'],
  authors: [{ name: 'Antigravity Team' }],
  openGraph: {
    title: 'Casino Royale | Premium Provably Fair Gaming',
    description: 'The next generation of online gambling with a high-fidelity interface.',
    url: 'https://casino-royale.vibe',
    siteName: 'Casino Royale',
    images: [
      {
        url: '/images/hero-banner-new.png',
        width: 1200,
        height: 630,
        alt: 'Casino Royale Hero',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casino Royale | Premium Provably Fair Gaming',
    description: "Experience the world's most transparent gaming ecosystem.",
    images: ['/images/hero-banner-new.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
  viewportFit: 'cover',
};

import { createClient } from '@/utils/supabase/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialUser = user;
  } catch {
    initialUser = null;
  }

  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body style={{ fontFamily: 'var(--font-inter), sans-serif', background: '#000' }}>
        <ClientProviders initialUser={initialUser}>
          <ClientShell>{children}</ClientShell>
        </ClientProviders>
      </body>
    </html>
  );
}
