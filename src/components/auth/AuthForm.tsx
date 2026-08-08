'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const { error } = mode === 'sign-up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setStatus(`Fehler: ${error.message}`);
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setStatus('Die Anfrage konnte nicht abgeschlossen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
      });
      if (error) {
        setStatus(`Fehler: ${error.message}`);
        setLoading(false);
      }
    } catch {
      setStatus('Die Google-Anmeldung konnte nicht gestartet werden. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  const isFormReady = email.length > 0 && password.length > 0;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="auth-email" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>E-Mail-Adresse</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          placeholder="name@beispiel.de"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="glass-card"
          style={{ padding: '12px 16px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', border: '1px solid hsla(0,0%,100%,0.1)', color: '#fff' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="auth-password" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Passwort</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          placeholder="Dein Passwort"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="glass-card"
          style={{ padding: '12px 16px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', border: '1px solid hsla(0,0%,100%,0.1)', color: '#fff' }}
        />
      </div>

      <button type="submit" disabled={loading || !isFormReady} className="btn btn-primary" style={{ height: '48px', borderRadius: '12px', fontWeight: 800 }}>
        {mode === 'sign-up' ? 'Konto erstellen' : 'Anmelden'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--text-dim))', fontSize: '0.75rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'hsla(0,0%,100%,0.1)' }} />
        oder
        <div style={{ flex: 1, height: '1px', background: 'hsla(0,0%,100%,0.1)' }} />
      </div>

      <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="btn btn-secondary" style={{ height: '48px', borderRadius: '12px', fontWeight: 700 }}>
        Mit Google fortfahren
      </button>

      {status && <p role="alert" style={{ fontSize: '0.8rem', color: 'hsl(var(--error))', margin: 0 }}>{status}</p>}
    </form>
  );
}
