import { describe, expect, it } from 'vitest';
import { validateAuthCredentials } from '../../../components/auth/auth-validation';

describe('validateAuthCredentials', () => {
  it('rejects malformed email and short password', () => {
    expect(validateAuthCredentials('not-an-email', 'short')).toEqual({
      email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      password: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    });
  });

  it('accepts a trimmed valid email and six-character password', () => {
    expect(validateAuthCredentials(' qa@example.com ', 'secret')).toEqual({});
  });

  it('rejects empty credentials', () => {
    expect(validateAuthCredentials('', '')).toEqual({
      email: 'Bitte gib deine E-Mail-Adresse ein.',
      password: 'Bitte gib dein Passwort ein.',
    });
  });
});
