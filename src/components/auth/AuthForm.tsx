'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Magnetic } from '@/components/ui/Magnetic';
import { validateAuthCredentials } from './auth-validation';
import { mapAuthError } from '@/lib/security/form-errors';
import { trackAllowedEvent } from '@/lib/analytics/events';

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
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id}
          type={effectiveType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            padding: '13px 16px',
            paddingRight: isPasswordField ? '44px' : '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: focused ? '1.5px solid hsl(45,100%,50%)' : '1.5px solid rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
            boxShadow: focused ? '0 0 0 3px hsla(45,100%,50%,0.12)' : 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {isPasswordField && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              translateY: '-50%',
              background: 'transparent',
              border: 'none',
              color: showPassword ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.18s ease',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ margin: 0, color: 'hsl(0,85%,65%)', fontSize: '0.75rem' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function formatAuthError(message: string): string {
  return mapAuthError(message).message;
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
        setStatus(formatAuthError(error.message));
        setLoading(false);
      }
    } catch {
      setStatus('Die Google-Anmeldung konnte nicht gestartet werden. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  const validationErrors = validateAuthCredentials(email, password);
  const isFormReady = Object.keys(validationErrors).length === 0;
  const isSignUp = mode === 'sign-up';

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
            {isSignUp ? 'Konto erstellen' : 'Willkommen zurück'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            {isSignUp
              ? 'Gib deine Daten ein, um loszulegen.'
              : 'Melde dich an, um weiterzuspielen.'}
          </p>
        </div>

        {/* Form Fields */}
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
            height: '50px',
            borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <GoogleLogo />
          Mit Google fortfahren
        </motion.button>

        {/* Error Notification */}
        {status && (
          <p
            role="alert"
            style={{
              fontSize: '0.8rem',
              color: 'hsl(0,85%,60%)',
              margin: '16px 0 0',
              padding: '10px 14px',
              background: 'hsla(0,85%,60%,0.1)',
              borderRadius: '8px',
              border: '1px solid hsla(0,85%,60%,0.25)',
            }}
          >
            {status}
          </p>
        )}

        {/* Footer Link */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.4)',
            margin: '24px 0 0',
          }}
        >
          {isSignUp ? 'Bereits registriert? ' : 'Noch kein Konto? '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            style={{ color: 'hsl(45,100%,50%)', fontWeight: 700, textDecoration: 'none' }}
          >
            {isSignUp ? 'Anmelden' : 'Jetzt registrieren'}
          </Link>
        </p>
      </div>
    </div>
  );
}
