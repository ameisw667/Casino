import { describe, it, expect } from 'vitest';
import { formatAuthError } from '@/lib/security/form-errors';

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

  it('maps passkey cancellation or timeout (NotAllowedError)', () => {
    expect(formatAuthError('NotAllowedError: The operation was not allowed')).toBe(
      'Die Passkey-Anmeldung wurde abgebrochen oder ist abgelaufen. Bitte versuche es erneut oder nutze dein Passwort.',
    );
    expect(formatAuthError('User cancelled the passkey prompt')).toBe(
      'Die Passkey-Anmeldung wurde abgebrochen oder ist abgelaufen. Bitte versuche es erneut oder nutze dein Passwort.',
    );
  });

  it('maps passkey already registered or invalid state (InvalidStateError)', () => {
    expect(
      formatAuthError('InvalidStateError: The authenticator has already registered a credential'),
    ).toBe('Dieser Passkey ist auf diesem Gerät bereits registriert oder ungültig.');
  });

  it('maps unsupported passkey devices (NotSupportedError)', () => {
    expect(formatAuthError('NotSupportedError: WebAuthn not supported')).toBe(
      'Passkeys werden von diesem Browser oder Gerät nicht unterstützt. Bitte nutze dein Passwort.',
    );
  });

  it('maps passkey security or RP ID domain errors', () => {
    expect(formatAuthError('SecurityError: The RP ID is not valid for this origin')).toBe(
      'Sicherheitsfehler bei der Passkey-Verifikation. Bitte überprüfe die Domain oder nutze dein Passwort.',
    );
  });

  it('maps passkey not found errors', () => {
    expect(formatAuthError('No credentials found for this account')).toBe(
      'Kein passender Passkey auf diesem Gerät gefunden. Bitte melde dich mit deinem Passwort an.',
    );
  });

  it('maps leaked, pwned, or compromised password errors to a helpful German security hint', () => {
    expect(formatAuthError('weak_password: Password is in a list of compromised passwords')).toBe(
      'Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wähle ein sichereres Passwort.',
    );
    expect(formatAuthError('Password has been leaked in a data breach')).toBe(
      'Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wähle ein sichereres Passwort.',
    );
    expect(formatAuthError('pwned_password: This password is pwned')).toBe(
      'Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wähle ein sichereres Passwort.',
    );
  });

  it('maps MFA and TOTP verification errors', () => {
    expect(formatAuthError('invalid_grant: Invalid TOTP code')).toBe(
      'Ungültiger Bestätigungscode. Bitte prüfe die Eingabe in deiner Authenticator-App.',
    );
    expect(formatAuthError('mfa_challenge_failed')).toBe(
      'Ungültiger Bestätigungscode. Bitte prüfe die Eingabe in deiner Authenticator-App.',
    );
    expect(formatAuthError('mfa_factor_not_found')).toBe(
      '2FA-Faktor nicht gefunden oder bereits entfernt.',
    );
    expect(formatAuthError('Factor already verified')).toBe(
      'Dieser 2FA-Faktor ist bereits aktiviert.',
    );
  });

  it('maps identity linking and unlinking errors', () => {
    expect(formatAuthError('identity_already_exists: Identity is already linked to another user')).toBe(
      'Dieses Konto ist bereits mit einem anderen Spielerprofil verknüpft.',
    );
    expect(formatAuthError('cannot_unlink_last_identity')).toBe(
      'Die letzte verbleibende Anmeldemethode kann nicht getrennt werden.',
    );
    expect(formatAuthError('identity_not_found')).toBe(
      'Das angegebene verknüpfte Konto wurde nicht gefunden.',
    );
  });

  it('maps password reset and recovery link errors', () => {
    expect(formatAuthError('same_password: New password should be different')).toBe(
      'Das neue Passwort darf nicht mit deinem bisherigen Passwort identisch sein.',
    );
    expect(formatAuthError('otp_expired: Token has expired')).toBe(
      'Der Wiederherstellungs-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.',
    );
    expect(formatAuthError('invalid otp token')).toBe(
      'Ungültiger Einmal-Code. Bitte prüfe die 6 Ziffern aus deiner E-Mail.',
    );
  });

  it('falls back to a safe generic message if the provider message is unknown', () => {
    expect(formatAuthError('Custom error message')).toBe(
      'Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.',
    );
  });
});
