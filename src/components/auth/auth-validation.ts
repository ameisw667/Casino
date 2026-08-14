export const AUTH_PASSWORD_MIN_LENGTH = 6;

export type AuthValidationErrors = {
  email?: string;
  password?: string;
};

export function validateAuthCredentials(email: string, password: string): AuthValidationErrors {
  const errors: AuthValidationErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = 'Bitte gib deine E-Mail-Adresse ein.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }

  if (!password) {
    errors.password = 'Bitte gib dein Passwort ein.';
  } else if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = `Das Passwort muss mindestens ${AUTH_PASSWORD_MIN_LENGTH} Zeichen lang sein.`;
  }

  return errors;
}
