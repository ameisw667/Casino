import { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthCinematicBackground } from '@/components/auth/AuthCinematicBackground';

export const metadata: Metadata = {
  title: 'Sign In | Casino Royale',
  description:
    'Sign in to your Casino Royale account to access provably fair games and your wallet.',
};

export default function Page() {
  return (
    <div className="auth-page-shell">
      <AuthCinematicBackground />
      <AuthForm mode="sign-in" />
    </div>
  );
}
