import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import ClientShell from "@/components/layout/ClientShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL('https://casino-royale.vibe'),
  title: {
    default: "Casino Royale | Premium Provably Fair Gaming",
    template: "%s | Casino Royale"
  },

  description: "The world's most transparent gaming ecosystem. Powered by deep-learning security and the fastest crypto rails in existence. Provably fair, instant payouts, and premium 3D gaming.",
  keywords: ["casino", "crypto", "gambling", "provably fair", "next.js", "premium gaming"],
  authors: [{ name: "Antigravity Team" }],
  openGraph: {
    title: "Casino Royale | Premium Provably Fair Gaming",
    description: "The next generation of online gambling with a high-fidelity interface.",
    url: "https://casino-royale.vibe",
    siteName: "Casino Royale",
    images: [
      {
        url: "/images/hero-banner-new.png",
        width: 1200,
        height: 630,
        alt: "Casino Royale Hero",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casino Royale | Premium Provably Fair Gaming",
    description: "Experience the world's most transparent gaming ecosystem.",
    images: ["/images/hero-banner-new.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
      variables: { 
        colorPrimary: '#FFD700',
        colorBackground: '#0a0a0a',
        colorText: '#ffffff',
        colorTextSecondary: '#ffffff',
        colorInputBackground: 'rgba(255, 255, 255, 0.05)',
        colorInputText: '#ffffff',
        borderRadius: '16px',
      },
      elements: {
        card: { 
          borderRadius: '24px', 
          border: '1px solid hsla(45, 100%, 50%, 0.2)',
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)'
        },
        userButtonPopoverCard: {
          borderRadius: '20px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        },
        userButtonPopoverMain: {
          background: '#ffffff',
        },
        userButtonPopoverScrollBox: {
          background: '#ffffff',
        },
        userButtonPopoverActionButton: {
          padding: '14px 16px',
          transition: 'all 0.2s ease',
          background: '#ffffff',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.05)',
          }
        },
        userButtonPopoverActionButtonIcon: {
          color: '#000000',
        },
        userButtonPopoverActionButtonText: {
          fontWeight: '600',
          fontSize: '0.95rem',
          color: '#000000'
        },
        userButtonPopoverFooter: {
          background: '#ffffff',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '12px'
        },
        userPreviewMainIdentifier: {
          fontWeight: '700',
          color: '#000000'
        },
        userPreviewSecondaryIdentifier: {
          color: '#6b7280',
          opacity: 1,
          fontWeight: '500'
        },
        formButtonPrimary: { 
          borderRadius: '12px', 
          textTransform: 'uppercase', 
          fontWeight: '900',
          letterSpacing: '0.1em',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#000',
          border: 'none',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.5)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        }
      }
    }}>
      <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`} data-scroll-behavior="smooth">
        <body style={{ fontFamily: 'var(--font-inter), sans-serif', background: '#000' }}>
          <ClientShell>
            {children}
          </ClientShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
