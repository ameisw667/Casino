'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';
import { OtpInput } from './OtpInput';
import { AuthField } from './AuthField';

interface MagicLinkViewProps {
  email: string;
  onEmailChange: (value: string) => void;
  loading: boolean;
  cooldown: number;
  magicLinkSent: boolean;
  otpCode: string;
  onOtpCodeChange: (value: string) => void;
  onRequestMagicLink: (event?: React.FormEvent) => void;
  onVerifyOtp: (code?: string) => void;
  onBackToPassword: () => void;
}

export function MagicLinkView({
  email,
  onEmailChange,
  loading,
  cooldown,
  magicLinkSent,
  otpCode,
  onOtpCodeChange,
  onRequestMagicLink,
  onVerifyOtp,
  onBackToPassword,
}: MagicLinkViewProps) {
  return (
    <div>
      {!magicLinkSent ? (
        <form
          onSubmit={onRequestMagicLink}
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <AuthField
            id="auth-magic-email"
            label="E-Mail-Adresse"
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={onEmailChange}
            autoComplete="email"
          />

          <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
            <motion.button
              id="auth-submit-magic-request"
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
              onChange={onOtpCodeChange}
              onComplete={(code) => onVerifyOtp(code)}
              disabled={loading}
            />
          </div>

          <Magnetic strength={0.3} style={{ display: 'block', width: '100%' }}>
            <motion.button
              id="auth-submit-verify-otp"
              type="button"
              onClick={() => onVerifyOtp()}
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Einmal-Code bestätigen'}
            </motion.button>
          </Magnetic>

          {/* Resend Code Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => onRequestMagicLink()}
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
          onClick={onBackToPassword}
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
  );
}
