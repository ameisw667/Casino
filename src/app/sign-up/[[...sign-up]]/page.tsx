import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Sign Up | Casino Royale',
  description: 'Create a Casino Royale account and get started with provably fair gaming.',
};

export default function Page() {
  return (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', minHeight: '80vh', padding: 'clamp(12px, 5vw, 40px)', background: 'hsla(var(--primary), 0.02)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Konto erstellen</h1>
      <AuthForm mode="sign-up" />
      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
        Bereits registriert? <Link href="/sign-in" style={{ color: 'hsl(var(--primary))' }}>Anmelden</Link>
      </p>
    </div>
  );
}
