import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  APP_ERROR_CODES,
  apiErrorResponse,
  getApiErrorCode,
  getApiErrorMessage,
  mapAuthError,
  zodErrorToFieldErrors,
} from '@/lib/security/form-errors';

describe('Error Contract Core', () => {
  it('exposes stable codes and the minimal structured error shape', async () => {
    const response = apiErrorResponse(
      APP_ERROR_CODES.VALIDATION_FAILED,
      'Die Eingaben konnten nicht verarbeitet werden.',
      400,
      {
        fieldErrors: { email: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        requestId: 'request-123',
      },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Die Eingaben konnten nicht verarbeitet werden.',
        fieldErrors: { email: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        requestId: 'request-123',
      },
    });
  });

  it('converts Zod issues to safe single field messages', () => {
    const parsed = z
      .object({
        email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
        password: z.string().min(6, 'Das Passwort ist zu kurz.'),
      })
      .safeParse({ email: 'invalid', password: '' });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(zodErrorToFieldErrors(parsed.error)).toEqual({
      email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      password: 'Das Passwort ist zu kurz.',
    });
  });

  it('uses a generic internal response that cannot leak technical details', async () => {
    const response = apiErrorResponse(
      APP_ERROR_CODES.INTERNAL_ERROR,
      'Die Anfrage konnte nicht verarbeitet werden.',
      500,
    );
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(serialized).not.toContain('stack');
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('SELECT');
  });

  it('maps authentication failures to stable safe codes', () => {
    expect(mapAuthError('Invalid login credentials')).toMatchObject({
      code: 'AUTHENTICATION_FAILED',
    });
    expect(mapAuthError('User already registered')).toMatchObject({ code: 'CONFLICT' });
    expect(mapAuthError('Invalid API key')).toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(mapAuthError('provider leaked SELECT password')).toMatchObject({
      code: 'AUTHENTICATION_FAILED',
      message: expect.not.stringContaining('SELECT'),
    });
  });

  it('reads both the new contract and legacy string responses', () => {
    expect(getApiErrorCode({ error: { code: 'PROMO_INVALID', message: 'Ungültig' } })).toBe(
      'PROMO_INVALID',
    );
    expect(getApiErrorMessage({ error: { code: 'PROMO_INVALID', message: 'Ungültig' } })).toBe(
      'Ungültig',
    );
    expect(getApiErrorMessage({ error: 'Legacy failure' })).toBe('Legacy failure');
    expect(getApiErrorMessage({}, 'Fallback')).toBe('Fallback');
  });
});
