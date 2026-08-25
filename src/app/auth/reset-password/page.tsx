'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Magnetic } from '@/components/ui/Magnetic';
import { formatAuthError } from '@/components/auth/AuthForm';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

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
        <linearGradient id="crownGoldGradReset" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6412" />
        </linearGradient>
      </defs>
      <path
        d="M6 22 L6 13 L11 17 L16 7 L21 17 L26 13 L26 22 Z"
        fill="url(#crownGoldGradReset)"
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
        fill="url(#crownGoldGradReset)"
        stroke="#8A6412"
        strokeWidth="0.6"
      />
      <circle cx="6" cy="13" r="1.6" fill="#00e676" />
      <circle cx="26" cy="13" r="1.6" fill="#ff3366" />
      <circle cx="16" cy="7" r="2" fill="#fffbe8" stroke="#D4AF37" strokeWidth="0.4" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function checkRecoverySession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setHasSession(true);
        } else {
          setHasSession(false);
        }
      } catch {
        setHasSession(false);
      } finally {
        setCheckingSession(false);
      }
    }
    void checkRecoverySession();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus(formatAuthError(error.message));
        setLoading(false);
        return;
      }

      void trackAllowedEvent({ name: 'password_reset_completed' });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch {
      setStatus('Das Passwort konnte nicht aktualisiert werden. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  const isFormValid = password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword;

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
        background: '#0B0E14',
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
        <div
          className="glass-layered glass-edge-gold"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            borderRadius: '20px',
            padding: '40px 36px',
            boxSizing: 'border-box',
          }}
        >
          {/* Emblem Badge */}
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
                fontSize: '1.65rem',
                fontWeight: 900,
                margin: '0 0 8px',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Neues Passwort vergeben
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Wähle ein neues, sicheres Passwort für dein Casino-Konto.
            </p>
          </div>

          {checkingSession ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <Loader2 className="animate-spin" size={28} style={{ color: 'hsl(var(--primary))' }} />
            </div>
          ) : isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(0, 230, 118, 0.1)',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={36} color="#00e676" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#00e676', margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>
                Passwort erfolgreich gespeichert!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem' }}>
                Du wirst direkt ins Casino weitergeleitet…
              </p>
            </motion.div>
          ) : !hasSession ? (
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(255, 51, 102, 0.08)',
                border: '1px solid rgba(255, 51, 102, 0.25)',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={32} color="#ff3366" style={{ margin: '0 auto 10px' }} />
              <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 16px', fontSize: '0.9rem' }}>
                Kein gültiger Wiederherstellungs-Link gefunden oder der Link ist abgelaufen.
              </p>
              <Link
                href="/sign-in"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'hsl(var(--primary))',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                Zurück zur Anmeldung
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {status && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 51, 102, 0.1)',
                    border: '1px solid rgba(255, 51, 102, 0.3)',
                    color: '#ff6688',
                    fontSize: '0.85rem',
                  }}
                >
                  {status}
                </div>
              )}

              {/* Password Field 1 */}
              <div>
                <label
                  htmlFor="auth-new-password"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}
                >
                  Neues Passwort
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--glass-border)',
                      padding: '0 42px 0 14px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <PasswordStrengthMeter password={password} />
                )}
              </div>

              {/* Password Field 2 */}
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}
                >
                  Passwort bestätigen
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--glass-border)',
                      padding: '0 42px 0 14px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Magnetic strength={0.3} style={{ display: 'block', width: '100%', marginTop: '6px' }}>
                <motion.button
                  id="auth-submit-reset-password"
                  type="submit"
                  disabled={loading || !isFormValid}
                  whileHover={loading || !isFormValid ? {} : { scale: 1.02, y: -1 }}
                  whileTap={loading || !isFormValid ? {} : { scale: 0.97 }}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background:
                      loading || !isFormValid
                        ? 'rgba(255,255,255,0.08)'
                        : 'linear-gradient(135deg, hsl(var(--primary)), hsl(38,100%,42%))',
                    color: loading || !isFormValid ? 'rgba(255,255,255,0.3)' : '#000',
                  }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <KeyRound size={18} />
                      Passwort speichern & weiter
                    </>
                  )}
                </motion.button>
              </Magnetic>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
