import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
