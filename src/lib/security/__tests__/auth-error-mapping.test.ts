import { describe, it, expect } from 'vitest';
import { formatAuthError } from '@/components/auth/AuthForm';

describe('formatAuthError', () => {
  it('maps invalid api key to helpful German configuration error', () => {
    expect(formatAuthError('Invalid API key')).toBe(
      'Konfigurationsfehler: Der API-Schlüssel ist ungültig oder abgelaufen. Bitte versuche es später erneut.',
    );
    expect(formatAuthError('invalid api key provided')).toBe(
      'Konfigurationsfehler: Der API-Schlüssel ist ungültig oder abgelaufen. Bitte versuche es später erneut.',
    );
  });

  it('maps already registered user to login hint', () => {
    expect(formatAuthError('User already registered')).toBe(
      'Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich an.',
    );
  });

  it('maps invalid login credentials', () => {
    expect(formatAuthError('Invalid login credentials')).toBe(
      'Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail-Adresse und dein Passwort.',
    );
  });

  it('maps password length constraints', () => {
    expect(formatAuthError('Password should be at least 6 characters')).toBe(
      'Das Passwort muss mindestens 6 Zeichen lang sein.',
    );
  });

  it('maps email confirmation errors', () => {
    expect(formatAuthError('Email not confirmed')).toBe(
      'Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfe dein Postfach.',
    );
  });

  it('maps rate limit messages', () => {
    expect(formatAuthError('Email rate limit exceeded')).toBe(
      'Zu viele Versuche. Bitte warte einen kurzen Moment und versuche es erneut.',
    );
    expect(formatAuthError('Too many requests')).toBe(
      'Zu viele Versuche. Bitte warte einen kurzen Moment und versuche es erneut.',
    );
  });

  it('maps network failures', () => {
    expect(formatAuthError('Failed to fetch')).toBe(
      'Netzwerkfehler: Verbindung zum Server konnte nicht hergestellt werden.',
    );
  });

  it('falls back to raw error prefix if message is unknown', () => {
    expect(formatAuthError('Custom error message')).toBe('Fehler: Custom error message');
  });
});
