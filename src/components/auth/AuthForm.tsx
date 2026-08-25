'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Magnetic } from '@/components/ui/Magnetic';
import { validateAuthCredentials } from './auth-validation';
import { mapAuthError } from '@/lib/security/form-errors';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { OtpInput } from './OtpInput';

export function formatAuthError(message: string): string {
  return mapAuthError(message).message;
}

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

// Google G SVG Logo — inline, no external dependency
function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Bespoke jeweled crown emblem — gold gradient body, emerald/ruby accent gems
// (echoes the casino's own win/loss color language), diamond sparkle at the peak.
function CrownEmblem() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6412" />
        </linearGradient>
      </defs>
      <path
        d="M6 22 L6 13 L11 17 L16 7 L21 17 L26 13 L26 22 Z"
        fill="url(#crownGoldGrad)"
        stroke="#8A6412"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <rect
        x="6"
        y="22"
        width="20"
        height="4"
        rx="1"
        fill="url(#crownGoldGrad)"
        stroke="#8A6412"
        strokeWidth="0.6"
      />
      <circle cx="6" cy="13" r="1.6" fill="#00e676" />
      <circle cx="26" cy="13" r="1.6" fill="#ff3366" />
      <circle cx="16" cy="7" r="2" fill="#fffbe8" stroke="#D4AF37" strokeWidth="0.4" />
    </svg>
  );
}

// Input Field Component with Password Visibility Toggle (No Float / Hover Shift Bug)
function AuthField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  autoComplete?: string;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.75)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </label>

      {/* Input container with CSS classes for hover & focus states */}
      <div
        className="auth-input-wrapper"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '12px',
          background: isFocused ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.04)',
          border: error
            ? '1px solid rgba(255, 51, 102, 0.6)'
            : isFocused
              ? '1px solid rgba(212, 175, 55, 0.8)'
              : '1px solid var(--glass-border)',
          boxShadow: error
            ? '0 0 12px rgba(255, 51, 102, 0.2)'
            : isFocused
              ? '0 0 16px rgba(212, 175, 55, 0.25)'
              : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
        }}
      >
        <input
          id={id}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{
            width: '100%',
            height: '46px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: isPasswordField ? '0 44px 0 14px' : '0 14px',
            color: '#FFFFFF',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />

        {/* Password visibility toggle button inside input box */}
        {isPasswordField && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: showPassword ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Inline Field Validation Error Message */}
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: '#ff3366',
            fontWeight: 600,
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
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
  const [hasPasskeySupport] = useState(() => typeof window !== 'undefined' && Boolean(window.PublicKeyCredential));
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
        setStatus(formatAuthError(error.message));
        return;
      }
      if (mode === 'sign-up') {
        void trackAllowedEvent({ name: 'sign_up_completed' });
      } else {
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
      setStatus('Der Wiederherstellungs-Link konnte nicht gesendet werden. Bitte versuche es erneut.');
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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="auth-emblem-shine"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, hsl(45,100%,50%), hsl(38,100%,40%))',
              boxShadow: '0 0 20px hsla(45,100%,50%,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CrownEmblem />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              margin: '0 0 8px',
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            {isForgotPassword
              ? 'Passwort wiederherstellen'
              : isMagicLink
                ? magicLinkSent
                  ? 'Code eingeben'
                  : 'Passwortlos anmelden'
                : isSignUp
                  ? 'Konto erstellen'
                  : 'Willkommen zurück'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            {isForgotPassword
              ? 'Wir senden dir einen sicheren Link zum Zurücksetzen.'
              : isMagicLink
                ? magicLinkSent
                  ? `Wir haben einen 6-stelligen Code an ${email} gesendet.`
                  : 'Wir senden dir einen 1-Klick-Link und einen 6-stelligen Code.'
                : isSignUp
                  ? 'Gib deine Daten ein, um loszulegen.'
                  : 'Melde dich an, um weiterzuspielen.'}
          </p>
        </div>

        {/* Global Error/Status Message */}
        {status && (
          <div
            role="alert"
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 51, 102, 0.1)',
              border: '1px solid rgba(255, 51, 102, 0.3)',
              color: '#ff6688',
              fontSize: '0.85rem',
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            {status}
          </div>
        )}

        {/* MAGIC LINK & OTP VIEW */}
        {isMagicLink ? (
          <div>
            {!magicLinkSent ? (
              <form onSubmit={handleMagicLinkRequest} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <AuthField
                  id="auth-magic-email"
                  label="E-Mail-Adresse"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />

                <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
                  <motion.button
                    id="auth-submit-magic-request"
                    type="submit"
                    disabled={loading || !email.includes('@') || cooldown > 0}
                    whileHover={loading || !email.includes('@') || cooldown > 0 ? {} : { scale: 1.02, y: -1 }}
                    whileTap={loading || !email.includes('@') || cooldown > 0 ? {} : { scale: 0.97 }}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: loading || !email.includes('@') || cooldown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background:
                        loading || !email.includes('@') || cooldown > 0
                          ? 'rgba(255,255,255,0.08)'
                          : 'linear-gradient(135deg, hsl(var(--primary)), hsl(38,100%,42%))',
                      color: loading || !email.includes('@') || cooldown > 0 ? 'rgba(255,255,255,0.3)' : '#000',
                    }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : cooldown > 0 ? (
                      `Erneut anfordern in ${cooldown}s`
                    ) : (
                      'Code & Magic Link anfordern'
                    )}
                  </motion.button>
                </Magnetic>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <OtpInput
                    value={otpCode}
                    onChange={setOtpCode}
                    onComplete={(code) => handleVerifyOtp(code)}
                    disabled={loading}
                  />
                </div>

                <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
                  <motion.button
                    id="auth-submit-verify-otp"
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otpCode.length !== 6}
                    whileHover={loading || otpCode.length !== 6 ? {} : { scale: 1.02, y: -1 }}
                    whileTap={loading || otpCode.length !== 6 ? {} : { scale: 0.97 }}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: loading || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background:
                        loading || otpCode.length !== 6
                          ? 'rgba(255,255,255,0.08)'
                          : 'linear-gradient(135deg, hsl(var(--primary)), hsl(38,100%,42%))',
                      color: loading || otpCode.length !== 6 ? 'rgba(255,255,255,0.3)' : '#000',
                    }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      'Einmal-Code bestätigen'
                    )}
                  </motion.button>
                </Magnetic>

                {/* Resend Code Button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    disabled={loading || cooldown > 0}
                    onClick={() => handleMagicLinkRequest()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: cooldown > 0 ? 'rgba(255,255,255,0.35)' : 'hsl(var(--primary))',
                      fontSize: '0.8rem',
                      cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {cooldown > 0 ? `Neuen Code anfordern in ${cooldown}s` : 'Neuen Code zusenden'}
                  </button>
                </div>
              </div>
            )}

            {/* Back button to standard login */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setStatus(null);
                  setIsMagicLink(false);
                  setMagicLinkSent(false);
                  setOtpCode('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} />
                Zurück zur Passwort-Anmeldung
              </button>
            </div>
          </div>
        ) : isForgotPassword ? (
          <div>
            {resetEmailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '20px 16px',
                  borderRadius: '12px',
                  background: 'rgba(0, 230, 118, 0.08)',
                  border: '1px solid rgba(0, 230, 118, 0.3)',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <CheckCircle2 size={32} color="#00e676" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ color: '#00e676', margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 800 }}>
                  E-Mail wurde gesendet!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.82rem', lineHeight: 1.4 }}>
                  Prüfe dein Postfach für <strong>{email}</strong> und klicke auf den Link, um dein Passwort neu zu vergeben.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <AuthField
                  id="auth-reset-email"
                  label="E-Mail-Adresse"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />

                <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
                  <motion.button
                    id="auth-submit-reset-request"
                    type="submit"
                    disabled={loading || !email.includes('@') || cooldown > 0}
                    whileHover={loading || !email.includes('@') || cooldown > 0 ? {} : { scale: 1.02, y: -1 }}
                    whileTap={loading || !email.includes('@') || cooldown > 0 ? {} : { scale: 0.97 }}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: loading || !email.includes('@') || cooldown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background:
                        loading || !email.includes('@') || cooldown > 0
                          ? 'rgba(255,255,255,0.08)'
                          : 'linear-gradient(135deg, hsl(var(--primary)), hsl(38,100%,42%))',
                      color: loading || !email.includes('@') || cooldown > 0 ? 'rgba(255,255,255,0.3)' : '#000',
                    }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : cooldown > 0 ? (
                      `Erneut senden in ${cooldown}s`
                    ) : (
                      'Reset-Link anfordern'
                    )}
                  </motion.button>
                </Magnetic>
              </form>
            )}

            {/* Back to sign in button */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setStatus(null);
                  setIsForgotPassword(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} />
                Zurück zur Anmeldung
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD SIGN-IN & SIGN-UP VIEW */
          <div>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              <AuthField
                id="auth-email"
                label="E-Mail-Adresse"
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                error={email.length > 0 ? validationErrors.email : undefined}
              />
              <AuthField
                id="auth-password"
                label="Passwort"
                type="password"
                placeholder="Dein Passwort"
                value={password}
                onChange={setPassword}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                error={password.length > 0 ? validationErrors.password : undefined}
              />

              {/* Password Strength Meter for Sign-Up */}
              {isSignUp && password.length > 0 && (
                <PasswordStrengthMeter password={password} />
              )}

              {/* Forgot Password Link for Sign-In Mode */}
              {!isSignUp && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus(null);
                      setIsForgotPassword(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'hsl(var(--primary))',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      padding: '2px 0',
                      fontWeight: 600,
                    }}
                  >
                    Passwort vergessen?
                  </button>
                </div>
              )}

              {/* Submit Button with Animated Spinner Loader */}
              <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
                <motion.button
                  id={isSignUp ? 'auth-submit-signup' : 'auth-submit-signin'}
                  type="submit"
                  disabled={loading || !isFormReady}
                  whileHover={
                    loading || !isFormReady
                      ? {}
                      : {
                          scale: 1.02,
                          y: -1,
                          boxShadow: '0 0 24px hsla(45,100%,50%,0.6), 0 4px 16px rgba(0,0,0,0.3)',
                        }
                  }
                  whileTap={loading || !isFormReady ? {} : { scale: 0.97 }}
                  style={{
                    marginTop: '4px',
                    width: '100%',
                    height: '50px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading || !isFormReady ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background:
                      loading || !isFormReady
                        ? 'rgba(255,255,255,0.08)'
                        : 'linear-gradient(135deg, hsl(var(--primary)), hsl(38,100%,42%))',
                    color: loading || !isFormReady ? 'rgba(255,255,255,0.3)' : '#000',
                    boxShadow: !loading && isFormReady ? '0 0 12px hsla(45,100%,50%,0.3)' : 'none',
                  }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isSignUp ? (
                    'Konto erstellen'
                  ) : (
                    'Anmelden'
                  )}
                </motion.button>
              </Magnetic>
            </form>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '24px 0',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              ODER
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Google Button */}
            <motion.button
              id="auth-google-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              whileHover={
                loading
                  ? {}
                  : {
                      scale: 1.01,
                      background: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.35)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    }
              }
              whileTap={loading ? {} : { scale: 0.98 }}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '10px',
                transition: 'all 0.15s ease',
              }}
            >
              <GoogleLogo />
              Mit Google fortfahren
            </motion.button>

            {/* Magic Link / OTP Button */}
            {!isSignUp && (
              <motion.button
                id="auth-magic-link-btn"
                type="button"
                onClick={() => {
                  setStatus(null);
                  setIsMagicLink(true);
                  setMagicLinkSent(false);
                  setOtpCode('');
                }}
                disabled={loading}
                whileHover={
                  loading
                    ? {}
                    : {
                        scale: 1.01,
                        background: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.35)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }
                }
                whileTap={loading ? {} : { scale: 0.98 }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Mail size={18} color="hsl(var(--primary))" />
                Ohne Passwort anmelden (E-Mail-Code)
              </motion.button>
            )}

            {/* Passkey Button */}
            {hasPasskeySupport && (
              <motion.button
                id="auth-passkey-btn"
                type="button"
                onClick={handlePasskeySignIn}
                disabled={loading}
                whileHover={
                  loading
                    ? {}
                    : {
                        scale: 1.01,
                        background: 'rgba(212, 175, 55, 0.08)',
                        borderColor: 'rgba(212, 175, 55, 0.4)',
                        boxShadow: '0 4px 16px rgba(212, 175, 55, 0.15)',
                      }
                }
                whileTap={loading ? {} : { scale: 0.98 }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <KeyRound size={18} color="hsl(var(--primary))" />
                Mit Passkey anmelden
              </motion.button>
            )}

            {/* Footer Navigation Link between Sign-In & Sign-Up */}
            <div
              style={{
                marginTop: '28px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {isSignUp ? (
                <>
                  Bereits ein Konto?{' '}
                  <Link
                    href="/sign-in"
                    style={{
                      color: 'hsl(var(--primary))',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Anmelden
                  </Link>
                </>
              ) : (
                <>
                  Noch kein Konto?{' '}
                  <Link
                    href="/sign-up"
                    style={{
                      color: 'hsl(var(--primary))',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Jetzt registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
