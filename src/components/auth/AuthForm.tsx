'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { validateAuthCredentials } from './auth-validation';
import { mapAuthError } from '@/lib/security/form-errors';
import { trackAllowedEvent } from '@/lib/analytics/events';
import {
  getStoredCooldownState,
  getRemainingCooldownSeconds,
  recordFailedAttempt,
  resetCooldownState,
  formatCooldownMessage,
  formatWarningMessage,
  type LoginCooldownState,
} from '@/lib/security/login-cooldown';
import { AuthCardHeader } from './AuthCardHeader';
import { AuthStatusBanner } from './AuthStatusBanner';
import { MagicLinkView } from './MagicLinkView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { StandardAuthView } from './StandardAuthView';

export function formatAuthError(message: string): string {
  return mapAuthError(message).message;
}

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

function notifyLoginAudit(
  authMethod: 'password' | 'passkey' | 'google' | 'otp_magic_link',
  status: 'success' | 'failed' = 'success',
) {
  void fetch('/api/user/login-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authMethod, status }),
  }).catch(() => {});
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPasskeySupport] = useState(
    () => typeof window !== 'undefined' && Boolean(window.PublicKeyCredential),
  );
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loginCooldownState, setLoginCooldownState] = useState<LoginCooldownState>(() =>
    getStoredCooldownState(),
  );
  const [loginCooldownSeconds, setLoginCooldownSeconds] = useState(() =>
    getRemainingCooldownSeconds(getStoredCooldownState()),
  );
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (loginCooldownSeconds > 0) {
      const timer = setInterval(() => {
        const remaining = getRemainingCooldownSeconds(loginCooldownState);
        setLoginCooldownSeconds(remaining);
        if (remaining <= 0) {
          setLoginCooldownState(getStoredCooldownState());
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loginCooldownSeconds, loginCooldownState]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSignUp && loginCooldownSeconds > 0) {
      setStatus(formatCooldownMessage(loginCooldownSeconds));
      return;
    }
    const validationErrors = validateAuthCredentials(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setStatus(Object.values(validationErrors)[0] ?? null);
      return;
    }
    setLoading(true);
    setStatus(null);
    const normalizedEmail = email.trim();
    try {
      const { error } =
        mode === 'sign-up'
          ? await supabase.auth.signUp({ email: normalizedEmail, password })
          : await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        if (!isSignUp) {
          const attempt = recordFailedAttempt(loginCooldownState);
          setLoginCooldownState(attempt.newState);
          setLoginCooldownSeconds(attempt.remainingSeconds);
          notifyLoginAudit('password', 'failed');

          if (attempt.isLocked) {
            setStatus(formatCooldownMessage(attempt.remainingSeconds));
          } else {
            setStatus(formatWarningMessage(attempt.failedAttempts));
          }
        } else {
          setStatus(formatAuthError(error.message));
        }
        return;
      }
      if (mode === 'sign-up') {
        void trackAllowedEvent({ name: 'sign_up_completed' });
      } else {
        resetCooldownState();
        setLoginCooldownState({ failedAttempts: 0, lockedUntilMs: null });
        setLoginCooldownSeconds(0);
        notifyLoginAudit('password', 'success');
      }
      router.push('/');
      router.refresh();
    } catch {
      setStatus('Die Anfrage konnte nicht abgeschlossen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setStatus('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });

      if (error) {
        setStatus(formatAuthError(error.message));
        setLoading(false);
        return;
      }

      void trackAllowedEvent({ name: 'password_reset_requested' });
      setResetEmailSent(true);
      setCooldown(60);
    } catch {
      setStatus(
        'Der Wiederherstellungs-Link konnte nicht gesendet werden. Bitte versuche es erneut.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLinkRequest(event?: React.FormEvent) {
    if (event) event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setStatus('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (error) {
        setStatus(formatAuthError(error.message));
        setLoading(false);
        return;
      }
      void trackAllowedEvent({ name: 'magic_link_requested' });
      setMagicLinkSent(true);
      setCooldown(60);
    } catch {
      setStatus('Der Anmeldecode konnte nicht gesendet werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(codeToVerify?: string) {
    const token = (codeToVerify || otpCode).trim();
    if (token.length !== 6) {
      setStatus('Bitte gib den vollständigen 6-stelligen Code ein.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'email',
      });
      if (error) {
        setStatus(formatAuthError(error.message));
        setLoading(false);
        return;
      }
      if (data?.session) {
        void trackAllowedEvent({ name: 'magic_link_sign_in_completed' });
        notifyLoginAudit('otp_magic_link', 'success');
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(formatAuthError(message));
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
        setStatus(formatAuthError(error.message));
        setLoading(false);
      }
    } catch {
      setStatus('Die Google-Anmeldung konnte nicht gestartet werden. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  async function handlePasskeySignIn() {
    setLoading(true);
    setStatus(null);
    try {
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error) {
        setStatus(formatAuthError(error.message));
        setLoading(false);
        return;
      }
      if (data?.session) {
        void trackAllowedEvent({ name: 'passkey_sign_in_completed' });
        notifyLoginAudit('passkey', 'success');
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(formatAuthError(message));
      setLoading(false);
    }
  }

  const validationErrors = validateAuthCredentials(email, password);
  const isFormReady = Object.keys(validationErrors).length === 0;
  const isSignUp = !isForgotPassword && mode === 'sign-up';

  const headerTitle = isForgotPassword
    ? 'Passwort wiederherstellen'
    : isMagicLink
      ? magicLinkSent
        ? 'Code eingeben'
        : 'Passwortlos anmelden'
      : isSignUp
        ? 'Konto erstellen'
        : 'Willkommen zurück';
  const headerSubtitle = isForgotPassword
    ? 'Wir senden dir einen sicheren Link zum Zurücksetzen.'
    : isMagicLink
      ? magicLinkSent
        ? `Wir haben einen 6-stelligen Code an ${email} gesendet.`
        : 'Wir senden dir einen 1-Klick-Link und einen 6-stelligen Code.'
      : isSignUp
        ? 'Gib deine Daten ein, um loszulegen.'
        : 'Melde dich an, um weiterzuspielen.';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
      {/* Main Auth Card Container with Entrance Animation & Improved Contrast */}
      <div
        className="animate-auth-entrance glass-layered glass-edge-gold"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          borderRadius: '20px',
          padding: '40px 36px',
          boxSizing: 'border-box',
        }}
      >
        {/* Sign-In Card Logo / Crown Emblem Badge */}
        <AuthCardHeader title={headerTitle} subtitle={headerSubtitle} />

        {/* Global Error/Status Message */}
        <AuthStatusBanner loginCooldownSeconds={loginCooldownSeconds} status={status} />

        {/* MAGIC LINK & OTP VIEW */}
        {isMagicLink ? (
          <MagicLinkView
            email={email}
            onEmailChange={setEmail}
            loading={loading}
            cooldown={cooldown}
            magicLinkSent={magicLinkSent}
            otpCode={otpCode}
            onOtpCodeChange={setOtpCode}
            onRequestMagicLink={handleMagicLinkRequest}
            onVerifyOtp={handleVerifyOtp}
            onBackToPassword={() => {
              setStatus(null);
              setIsMagicLink(false);
              setMagicLinkSent(false);
              setOtpCode('');
            }}
          />
        ) : isForgotPassword ? (
          <ForgotPasswordView
            email={email}
            onEmailChange={setEmail}
            loading={loading}
            cooldown={cooldown}
            resetEmailSent={resetEmailSent}
            onSubmitForgotPassword={handleForgotPassword}
            onBackToSignIn={() => {
              setStatus(null);
              setIsForgotPassword(false);
            }}
          />
        ) : (
          /* STANDARD SIGN-IN & SIGN-UP VIEW */
          <StandardAuthView
            email={email}
            onEmailChange={setEmail}
            password={password}
            onPasswordChange={setPassword}
            validationErrors={validationErrors}
            isFormReady={isFormReady}
            isSignUp={isSignUp}
            loading={loading}
            loginCooldownSeconds={loginCooldownSeconds}
            hasPasskeySupport={hasPasskeySupport}
            onSubmit={handleSubmit}
            onForgotPassword={() => {
              setStatus(null);
              setIsForgotPassword(true);
            }}
            onGoogleSignIn={handleGoogleSignIn}
            onPasskeySignIn={handlePasskeySignIn}
            onMagicLinkStart={() => {
              setStatus(null);
              setIsMagicLink(true);
              setMagicLinkSent(false);
              setOtpCode('');
            }}
          />
        )}
      </div>
    </div>
  );
}
