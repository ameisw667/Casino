import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Sign In | Casino Royale',
  description: 'Sign in to your Casino Royale account to access provably fair games and your wallet.',
};

export default function Page() {
  return (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', minHeight: '80vh', padding: 'clamp(12px, 5vw, 40px)', background: 'hsla(var(--primary), 0.02)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Willkommen zurück</h1>
      <AuthForm mode="sign-in" />
      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
        Noch kein Konto? <Link href="/sign-up" style={{ color: 'hsl(var(--primary))' }}>Jetzt registrieren</Link>
      </p>
    </div>
  );
}
