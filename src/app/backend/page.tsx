'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, LoaderCircle, LockKeyhole, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { VibeMotion } from '@/components/ui/VibeMotion';
import { createClient } from '@/utils/supabase/client';
import styles from './backend.module.css';

export default function BackendPage() {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignUp() {
    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      setStatus(error ? `Fehler: ${error.message}` : 'Konto erstellt. Pr\u00fcfe gegebenenfalls deine Best\u00e4tigungs-E-Mail.');
    } catch {
      setStatus('Die Registrierung konnte nicht abgeschlossen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setStatus(error ? `Fehler: ${error.message}` : null);
    } catch {
      setStatus('Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.');
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/backend`,
        },
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
  async function handleSignOut() {
    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signOut();
      setStatus(error ? `Fehler: ${error.message}` : null);
    } catch {
      setStatus('Die Abmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  const isFormReady = email.length > 0 && password.length > 0;
  const userInitial = session?.user.email?.charAt(0).toUpperCase() ?? 'J';

  return (
    <main className={styles.root}>
      <div aria-hidden="true" className={styles.ambient} />

      <section aria-label="Privater Zugang" className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <LockKeyhole aria-hidden="true" size={20} strokeWidth={2.25} />
          </div>
          <div>
            <p className={styles.brandName}>Casino Royale</p>
            <p className={styles.brandSubline}>Private access</p>
          </div>
        </div>

        {session ? (
          <div className={styles.content}>
            <div>
              <p className={styles.eyebrow}>Zugang aktiv</p>
              <h1 className={styles.title}>{'Sch\u00f6n, dass du da bist, Jan.'}</h1>
              <p className={styles.description}>Deine Supabase-Sitzung ist f\u00fcr diesen Browser aktiv.</p>
            </div>

            <div className={styles.identity}>
              <div className={styles.avatar}>{userInitial}</div>
              <div className={styles.identityText}>
                <p className={styles.identityLabel}>Angemeldet als</p>
                <p className={styles.email}>{session.user.email}</p>
              </div>
              <ShieldCheck aria-label="Sitzung aktiv" className={styles.verifiedIcon} size={20} />
            </div>

            <VibeMotion variant="button">
              <button type="button" onClick={handleSignOut} disabled={loading} className={styles.secondaryButton}>
                {loading ? <LoaderCircle className={styles.spinner} size={18} /> : <LogOut size={18} />}
                Abmelden
              </button>
            </VibeMotion>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); void handleSignIn(); }} className={styles.content}>
            <div>
              <p className={styles.eyebrow}>Interner Bereich</p>
              <h1 className={styles.title}>{'Willkommen zur\u00fcck, Jan.'}</h1>
              <p className={styles.description}>Melde dich mit deinem Supabase-Konto an.</p>
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="backend-email">E-Mail-Adresse</label>
                <input
                  id="backend-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jan@beispiel.de"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="backend-password">Passwort</label>
                <input
                  id="backend-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Dein Passwort"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.socialLogin}>
              <div className={styles.divider} aria-hidden="true"><span>oder</span></div>
              <VibeMotion variant="button">
                <button type="button" onClick={handleGoogleSignIn} disabled={loading} className={styles.googleButton}>
                  <span className={styles.googleMark} aria-hidden="true">G</span>
                  Mit Google fortfahren
                </button>
              </VibeMotion>
            </div>
            <div className={styles.actions}>
              <VibeMotion variant="button">
                <button type="submit" disabled={loading || !isFormReady} className={styles.primaryButton}>
                  {loading ? <LoaderCircle className={styles.spinner} size={18} /> : <ArrowRight size={18} />}
                  Anmelden
                </button>
              </VibeMotion>

              <VibeMotion variant="button">
                <button type="button" onClick={handleSignUp} disabled={loading || !isFormReady} className={styles.secondaryButton}>
                  <UserRound size={18} />
                  Konto erstellen
                </button>
              </VibeMotion>
            </div>
          </form>
        )}

        {status && <p aria-live="polite" className={styles.status}>{status}</p>}
      </section>
    </main>
  );
}