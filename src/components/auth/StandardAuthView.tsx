'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';
import { AuthField } from './AuthField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { GoogleLogo } from './AuthBrandMarks';
import type { AuthValidationErrors } from './auth-validation';

interface StandardAuthViewProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  honeypotValue: string;
  onHoneypotChange: (value: string) => void;
  validationErrors: AuthValidationErrors;
  isFormReady: boolean;
  isSignUp: boolean;
  loading: boolean;
  loginCooldownSeconds: number;
  hasPasskeySupport: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onForgotPassword: () => void;
  onGoogleSignIn: () => void;
  onPasskeySignIn: () => void;
  onMagicLinkStart: () => void;
}

export function StandardAuthView({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  honeypotValue,
  onHoneypotChange,
  validationErrors,
  isFormReady,
  isSignUp,
  loading,
  loginCooldownSeconds,
  hasPasskeySupport,
  onSubmit,
  onForgotPassword,
  onGoogleSignIn,
  onPasskeySignIn,
  onMagicLinkStart,
}: StandardAuthViewProps) {
  return (
    <div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* 06_1 L3 signup honeypot (V1): off-screen, not display:none — naive bots that fill
            every visible input also fill this one, humans and screen readers never see it.
            Rendered only in sign-up mode; the report is fire-and-forget after a successful
            signup (AuthForm), never blocks the submission itself. */}
        {isSignUp && (
          <input
            type="text"
            name="company_website"
            value={honeypotValue}
            onChange={(event) => onHoneypotChange(event.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              opacity: 0,
            }}
          />
        )}
        <AuthField
          id="auth-email"
          label="E-Mail-Adresse"
          type="email"
          placeholder="name@beispiel.de"
          value={email}
          onChange={onEmailChange}
          autoComplete="email"
          error={email.length > 0 ? validationErrors.email : undefined}
        />
        <AuthField
          id="auth-password"
          label="Passwort"
          type="password"
          placeholder="Dein Passwort"
          value={password}
          onChange={onPasswordChange}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          error={password.length > 0 ? validationErrors.password : undefined}
          disabled={!isSignUp && loginCooldownSeconds > 0}
        />

        {/* Password Strength Meter for Sign-Up */}
        {isSignUp && password.length > 0 && <PasswordStrengthMeter password={password} />}

        {/* Forgot Password Link for Sign-In Mode */}
        {!isSignUp && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
            <button
              type="button"
              onClick={onForgotPassword}
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
            disabled={loading || !isFormReady || (!isSignUp && loginCooldownSeconds > 0)}
            whileHover={
              loading || !isFormReady || (!isSignUp && loginCooldownSeconds > 0)
                ? {}
                : {
                    scale: 1.02,
                    y: -1,
                    boxShadow: '0 0 24px hsla(45,100%,50%,0.6), 0 4px 16px rgba(0,0,0,0.3)',
                  }
            }
            whileTap={
              loading || !isFormReady || (!isSignUp && loginCooldownSeconds > 0)
                ? {}
                : { scale: 0.97 }
            }
            style={{
              marginTop: '4px',
              width: '100%',
              height: '50px',
              borderRadius: '12px',
              border: 'none',
              cursor:
                loading || !isFormReady || (!isSignUp && loginCooldownSeconds > 0)
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: 900,
              fontSize: '0.95rem',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background:
                loading || !isFormReady || (!isSignUp && loginCooldownSeconds > 0)
                  ? 'rgba(255,255,255,0.08)'
                  : 'linear-gradient(135deg, hsl(var(--primary)), hsl(38,100%,42%))',
              color:
                loading || !isFormReady || (!isSignUp && loginCooldownSeconds > 0)
                  ? 'rgba(255,255,255,0.3)'
                  : '#000',
              boxShadow:
                !loading && isFormReady && (isSignUp || loginCooldownSeconds === 0)
                  ? '0 0 12px hsla(45,100%,50%,0.3)'
                  : 'none',
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : !isSignUp && loginCooldownSeconds > 0 ? (
              `Sperre aktiv (${loginCooldownSeconds}s)`
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
        onClick={onGoogleSignIn}
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
          onClick={onMagicLinkStart}
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
          onClick={onPasskeySignIn}
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
  );
}
