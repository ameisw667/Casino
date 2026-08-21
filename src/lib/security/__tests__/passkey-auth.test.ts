import { describe, it, expect } from 'vitest';
import { mapAuthError, APP_ERROR_CODES } from '../form-errors';
import { trackAllowedEvent, type AllowedAnalyticsEvent } from '@/lib/analytics/events';

describe('Passkey Auth & Security Contract', () => {
  describe('WebAuthn Error Mapping', () => {
    it('maps user cancellation and timeout to SAFE_AUTH_MESSAGES.passkeyNotAllowed', () => {
      const err1 = mapAuthError(
        'NotAllowedError: The operation either timed out or was not allowed',
      );
      expect(err1.code).toBe(APP_ERROR_CODES.AUTHENTICATION_FAILED);
      expect(err1.message).toBe(
        'Die Passkey-Anmeldung wurde abgebrochen oder ist abgelaufen. Bitte versuche es erneut oder nutze dein Passwort.',
      );

      const err2 = mapAuthError('user cancelled prompt');
      expect(err2.code).toBe(APP_ERROR_CODES.AUTHENTICATION_FAILED);
      expect(err2.message).toBe(
        'Die Passkey-Anmeldung wurde abgebrochen oder ist abgelaufen. Bitte versuche es erneut oder nutze dein Passwort.',
      );
    });

    it('maps already registered passkey to SAFE_AUTH_MESSAGES.passkeyInvalidState', () => {
      const err = mapAuthError('InvalidStateError: Credential already exists');
      expect(err.code).toBe(APP_ERROR_CODES.CONFLICT);
      expect(err.message).toBe(
        'Dieser Passkey ist auf diesem Gerät bereits registriert oder ungültig.',
      );
    });

    it('maps unsupported devices to SAFE_AUTH_MESSAGES.passkeyNotSupported', () => {
      const err = mapAuthError('NotSupportedError: WebAuthn is not supported');
      expect(err.code).toBe(APP_ERROR_CODES.SERVICE_UNAVAILABLE);
      expect(err.message).toBe(
        'Passkeys werden von diesem Browser oder Gerät nicht unterstützt. Bitte nutze dein Passwort.',
      );
    });

    it('maps domain / RP ID mismatch to SAFE_AUTH_MESSAGES.passkeySecurity', () => {
      const err = mapAuthError(
        'SecurityError: The origin is not allowed to make this request for RP ID',
      );
      expect(err.code).toBe(APP_ERROR_CODES.AUTHENTICATION_FAILED);
      expect(err.message).toBe(
        'Sicherheitsfehler bei der Passkey-Verifikation. Bitte überprüfe die Domain oder nutze dein Passwort.',
      );
    });

    it('maps missing credentials to SAFE_AUTH_MESSAGES.passkeyNotFound', () => {
      const err = mapAuthError('No credentials available on this device');
      expect(err.code).toBe(APP_ERROR_CODES.AUTHENTICATION_FAILED);
      expect(err.message).toBe(
        'Kein passender Passkey auf diesem Gerät gefunden. Bitte melde dich mit deinem Passwort an.',
      );
    });
  });

  describe('Analytics Event Allowlist Integration', () => {
    it('accepts passkey_sign_in_completed without errors', async () => {
      await expect(
        trackAllowedEvent({ name: 'passkey_sign_in_completed' }),
      ).resolves.toBeUndefined();
    });

    it('accepts passkey_registered without errors', async () => {
      await expect(trackAllowedEvent({ name: 'passkey_registered' })).resolves.toBeUndefined();
    });

    it('rejects invalid passkey event properties (strict schema enforcement)', async () => {
      await expect(
        trackAllowedEvent({
          name: 'passkey_registered',
          extraProperty: 'not_allowed',
        } as unknown as AllowedAnalyticsEvent),
      ).resolves.toBeUndefined();
    });
  });
});
