'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';
import { AuthField } from './AuthField';

interface ForgotPasswordViewProps {
  email: string;
  onEmailChange: (value: string) => void;
  loading: boolean;
  cooldown: number;
  resetEmailSent: boolean;
  onSubmitForgotPassword: (event: React.FormEvent) => void;
  onBackToSignIn: () => void;
}

export function ForgotPasswordView({
  email,
  onEmailChange,
  loading,
  cooldown,
  resetEmailSent,
  onSubmitForgotPassword,
  onBackToSignIn,
}: ForgotPasswordViewProps) {
  return (
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
          <h3
            style={{
              color: '#00e676',
              margin: '0 0 6px',
              fontSize: '0.95rem',
              fontWeight: 800,
            }}
          >
            E-Mail wurde gesendet!
          </h3>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontSize: '0.82rem',
              lineHeight: 1.4,
            }}
          >
            Prüfe dein Postfach für <strong>{email}</strong> und klicke auf den Link, um dein
            Passwort neu zu vergeben.
          </p>
        </motion.div>
      ) : (
        <form
          onSubmit={onSubmitForgotPassword}
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <AuthField
            id="auth-reset-email"
            label="E-Mail-Adresse"
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={onEmailChange}
            autoComplete="email"
          />

          <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
            <motion.button
              id="auth-submit-reset-request"
              type="submit"
              disabled={loading || !email.includes('@') || cooldown > 0}
              whileHover={
                loading || !email.includes('@') || cooldown > 0 ? {} : { scale: 1.02, y: -1 }
              }
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
                color:
                  loading || !email.includes('@') || cooldown > 0
                    ? 'rgba(255,255,255,0.3)'
                    : '#000',
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
          onClick={onBackToSignIn}
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
  );
}
