import { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthCinematicBackground } from '@/components/auth/AuthCinematicBackground';

export const metadata: Metadata = {
  title: 'Sign Up | Casino Royale',
  description: 'Create a Casino Royale account and get started with provably fair gaming.',
};

export default function Page() {
  return (
    <div className="auth-page-shell">
      <AuthCinematicBackground />
      <AuthForm mode="sign-up" />
    </div>
  );
}
