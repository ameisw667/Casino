import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Sandbox V2 | Casino Royale',
  description:
    'Visual exploration of a playful teal/lime design direction — not the live design system.',
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
