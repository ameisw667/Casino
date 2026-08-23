import { describe, expect, it } from 'vitest';
import { formatAuthError } from '@/components/auth/AuthForm';
import { validateAuthCredentials } from '@/components/auth/auth-validation';

describe('Password Reset & Recovery Flow', () => {
  it('validates password minimum length (6 chars)', () => {
    const errorsShort = validateAuthCredentials('test@example.com', '123');
    expect(errorsShort.password).toBe('Das Passwort muss mindestens 6 Zeichen lang sein.');

    const errorsValid = validateAuthCredentials('test@example.com', 'ValidPass123!');
    expect(errorsValid.password).toBeUndefined();
  });

  it('maps Supabase recovery error codes to German user-safe messages', () => {
    expect(formatAuthError('same_password: New password should be different from old')).toBe(
      'Das neue Passwort darf nicht mit deinem bisherigen Passwort identisch sein.',
    );

    expect(formatAuthError('otp_expired: The recovery token has expired')).toBe(
      'Der Wiederherstellungs-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.',
    );

    expect(formatAuthError('rate_limit: Too many requests')).toBe(
      'Zu viele Versuche. Bitte warte einen kurzen Moment und versuche es erneut.',
    );
  });

  it('validates email format before requesting reset link', () => {
    const invalidEmailErrors = validateAuthCredentials('invalid-email', 'ValidPass123!');
    expect(invalidEmailErrors.email).toBe('Bitte gib eine gültige E-Mail-Adresse ein.');

    const validEmailErrors = validateAuthCredentials('jan@casino.de', 'ValidPass123!');
    expect(validEmailErrors.email).toBeUndefined();
  });
});
