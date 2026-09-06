import type { ZodError } from 'zod';

export const APP_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFLICT: 'CONFLICT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  BET_LIMIT_EXCEEDED: 'BET_LIMIT_EXCEEDED',
  SELF_EXCLUDED: 'SELF_EXCLUDED',
  LOSS_LIMIT_REACHED: 'LOSS_LIMIT_REACHED',
  STALE_GAME_ACTION: 'STALE_GAME_ACTION',
  PROMO_NOT_FOUND: 'PROMO_NOT_FOUND',
  PROMO_INACTIVE: 'PROMO_INACTIVE',
  PROMO_EXPIRED: 'PROMO_EXPIRED',
  PROMO_EXHAUSTED: 'PROMO_EXHAUSTED',
  PROMO_ALREADY_REDEEMED: 'PROMO_ALREADY_REDEEMED',
  PROMO_REQUEST_CONFLICT: 'PROMO_REQUEST_CONFLICT',
  PROMO_INVALID: 'PROMO_INVALID',
} as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];
export type FieldErrors = Record<string, string>;

export type ApiError = {
  code: AppErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
  requestId?: string;
};

export type ApiErrorPayload = { error: ApiError };

type ApiErrorOptions = {
  fieldErrors?: FieldErrors;
  requestId?: string;
  headers?: HeadersInit;
  extra?: Record<string, unknown>;
};

const SAFE_AUTH_MESSAGES = {
  apiKey:
    'Konfigurationsfehler: Der API-Schlüssel ist ungültig oder abgelaufen. Bitte versuche es später erneut.',
  alreadyRegistered: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich an.',
  invalidCredentials:
    'Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail-Adresse und dein Passwort.',
  password: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
  emailNotConfirmed: 'Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfe dein Postfach.',
  rateLimit: 'Zu viele Versuche. Bitte warte einen kurzen Moment und versuche es erneut.',
  network: 'Netzwerkfehler: Verbindung zum Server konnte nicht hergestellt werden.',
  passkeyNotAllowed:
    'Die Passkey-Anmeldung wurde abgebrochen oder ist abgelaufen. Bitte versuche es erneut oder nutze dein Passwort.',
  passkeyNotFound:
    'Kein passender Passkey auf diesem Gerät gefunden. Bitte melde dich mit deinem Passwort an.',
  passkeyNotSupported:
    'Passkeys werden von diesem Browser oder Gerät nicht unterstützt. Bitte nutze dein Passwort.',
  passkeySecurity:
    'Sicherheitsfehler bei der Passkey-Verifikation. Bitte überprüfe die Domain oder nutze dein Passwort.',
  passkeyInvalidState: 'Dieser Passkey ist auf diesem Gerät bereits registriert oder ungültig.',
  passwordLeaked:
    'Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wähle ein sichereres Passwort.',
  mfaInvalidCode:
    'Ungültiger Bestätigungscode. Bitte prüfe die Eingabe in deiner Authenticator-App.',
  mfaFactorNotFound: '2FA-Faktor nicht gefunden oder bereits entfernt.',
  mfaAlreadyVerified: 'Dieser 2FA-Faktor ist bereits aktiviert.',
  identityAlreadyLinked: 'Dieses Konto ist bereits mit einem anderen Spielerprofil verknüpft.',
  cannotUnlinkLastIdentity: 'Die letzte verbleibende Anmeldemethode kann nicht getrennt werden.',
  identityNotFound: 'Das angegebene verknüpfte Konto wurde nicht gefunden.',
  samePassword: 'Das neue Passwort darf nicht mit deinem bisherigen Passwort identisch sein.',
  recoveryOtpExpired:
    'Der Wiederherstellungs-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.',
  otpInvalid: 'Ungültiger Einmal-Code. Bitte prüfe die 6 Ziffern aus deiner E-Mail.',
  fallback: 'Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.',
} as const;

export function createApiError(
  code: AppErrorCode,
  message: string,
  options: Pick<ApiErrorOptions, 'fieldErrors' | 'requestId'> = {},
): ApiError {
  return {
    code,
    message,
    ...(options.fieldErrors && Object.keys(options.fieldErrors).length > 0
      ? { fieldErrors: options.fieldErrors }
      : {}),
    ...(options.requestId ? { requestId: options.requestId } : {}),
  };
}

export function apiErrorResponse(
  code: AppErrorCode,
  message: string,
  status: number,
  options: ApiErrorOptions = {},
): Response {
  const headers = new Headers(options.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');

  return new Response(
    JSON.stringify({
      ...(options.extra ?? {}),
      error: createApiError(code, message, options),
    } satisfies ApiErrorPayload & Record<string, unknown>),
    { status, headers },
  );
}

export function zodErrorToFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join('.') : '_form';
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

export function zodErrorResponse(
  error: ZodError,
  status = 400,
  options: Omit<ApiErrorOptions, 'fieldErrors'> = {},
): Response {
  return apiErrorResponse(
    APP_ERROR_CODES.VALIDATION_FAILED,
    'Die Eingaben konnten nicht verarbeitet werden.',
    status,
    { ...options, fieldErrors: zodErrorToFieldErrors(error) },
  );
}

export function mapAuthError(message: string): ApiError {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('invalidstateerror') ||
    (normalized.includes('already registered') && normalized.includes('authenticator')) ||
    (normalized.includes('already registered') && normalized.includes('passkey'))
  ) {
    return createApiError(APP_ERROR_CODES.CONFLICT, SAFE_AUTH_MESSAGES.passkeyInvalidState);
  }
  if (
    normalized.includes('notallowederror') ||
    normalized.includes('user cancelled') ||
    normalized.includes('cancelled') ||
    normalized.includes('operation was not allowed') ||
    normalized.includes('timed out')
  ) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.passkeyNotAllowed,
    );
  }
  if (
    normalized.includes('notsupportederror') ||
    normalized.includes('webauthn not supported') ||
    normalized.includes('passkey not supported')
  ) {
    return createApiError(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      SAFE_AUTH_MESSAGES.passkeyNotSupported,
    );
  }
  if (
    normalized.includes('securityerror') ||
    normalized.includes('relying party') ||
    normalized.includes('origin mismatch') ||
    normalized.includes('rp id') ||
    normalized.includes('origin is not allowed')
  ) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.passkeySecurity,
    );
  }
  if (
    normalized.includes('passkey not found') ||
    normalized.includes('no passkey') ||
    normalized.includes('no credentials') ||
    normalized.includes('authenticator not found')
  ) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.passkeyNotFound,
    );
  }
  if (
    normalized.includes('mfa_factor_not_found') ||
    (normalized.includes('factor') && normalized.includes('not found'))
  ) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.mfaFactorNotFound,
    );
  }
  if (normalized.includes('factor already verified') || normalized.includes('already enrolled')) {
    return createApiError(APP_ERROR_CODES.CONFLICT, SAFE_AUTH_MESSAGES.mfaAlreadyVerified);
  }
  if (
    normalized.includes('invalid_grant') ||
    normalized.includes('invalid totp') ||
    normalized.includes('invalid mfa') ||
    normalized.includes('mfa_challenge_failed') ||
    normalized.includes('invalid challenge')
  ) {
    return createApiError(APP_ERROR_CODES.AUTHENTICATION_FAILED, SAFE_AUTH_MESSAGES.mfaInvalidCode);
  }
  if (
    normalized.includes('identity_already_exists') ||
    normalized.includes('already linked to another') ||
    normalized.includes('already linked')
  ) {
    return createApiError(APP_ERROR_CODES.CONFLICT, SAFE_AUTH_MESSAGES.identityAlreadyLinked);
  }
  if (
    normalized.includes('cannot_unlink_last_identity') ||
    normalized.includes('cannot unlink last') ||
    normalized.includes('last identity')
  ) {
    return createApiError(
      APP_ERROR_CODES.VALIDATION_FAILED,
      SAFE_AUTH_MESSAGES.cannotUnlinkLastIdentity,
    );
  }
  if (normalized.includes('identity_not_found') || normalized.includes('identity not found')) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.identityNotFound,
    );
  }
  if (
    normalized.includes('same_password') ||
    normalized.includes('new password should be different') ||
    normalized.includes('same as old password')
  ) {
    return createApiError(APP_ERROR_CODES.VALIDATION_FAILED, SAFE_AUTH_MESSAGES.samePassword);
  }
  if (
    normalized.includes('otp_expired') ||
    normalized.includes('token has expired') ||
    normalized.includes('token expired') ||
    normalized.includes('recovery link expired')
  ) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.recoveryOtpExpired,
    );
  }
  if (
    normalized.includes('invalid otp') ||
    normalized.includes('token is invalid') ||
    normalized.includes('invalid token') ||
    normalized.includes('token_not_found')
  ) {
    return createApiError(APP_ERROR_CODES.AUTHENTICATION_FAILED, SAFE_AUTH_MESSAGES.otpInvalid);
  }
  if (normalized.includes('invalid api key') || normalized.includes('api key')) {
    return createApiError(APP_ERROR_CODES.SERVICE_UNAVAILABLE, SAFE_AUTH_MESSAGES.apiKey);
  }
  if (normalized.includes('user already registered') || normalized.includes('already registered')) {
    return createApiError(APP_ERROR_CODES.CONFLICT, SAFE_AUTH_MESSAGES.alreadyRegistered);
  }
  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials')
  ) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.invalidCredentials,
    );
  }
  if (
    normalized.includes('compromised password') ||
    normalized.includes('list of compromised') ||
    normalized.includes('data breach') ||
    normalized.includes('pwned') ||
    (normalized.includes('weak_password') && normalized.includes('leaked')) ||
    normalized.includes('password is leaked') ||
    normalized.includes('password has been leaked')
  ) {
    return createApiError(APP_ERROR_CODES.VALIDATION_FAILED, SAFE_AUTH_MESSAGES.passwordLeaked);
  }
  if (
    normalized.includes('password should be at least') ||
    (normalized.includes('password') && normalized.includes('characters'))
  ) {
    return createApiError(APP_ERROR_CODES.VALIDATION_FAILED, SAFE_AUTH_MESSAGES.password);
  }
  if (normalized.includes('email not confirmed')) {
    return createApiError(
      APP_ERROR_CODES.AUTHENTICATION_FAILED,
      SAFE_AUTH_MESSAGES.emailNotConfirmed,
    );
  }
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return createApiError(APP_ERROR_CODES.RATE_LIMITED, SAFE_AUTH_MESSAGES.rateLimit);
  }
  if (normalized.includes('network') || normalized.includes('failed to fetch')) {
    return createApiError(APP_ERROR_CODES.SERVICE_UNAVAILABLE, SAFE_AUTH_MESSAGES.network);
  }
  return createApiError(APP_ERROR_CODES.AUTHENTICATION_FAILED, SAFE_AUTH_MESSAGES.fallback);
}

export function getApiErrorCode(payload: unknown): AppErrorCode | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const value = payload as { error?: unknown; code?: unknown };
  if (value.error && typeof value.error === 'object') {
    const code = (value.error as { code?: unknown }).code;
    return typeof code === 'string' ? (code as AppErrorCode) : undefined;
  }
  return typeof value.code === 'string' ? (value.code as AppErrorCode) : undefined;
}

export function getApiErrorMessage(
  payload: unknown,
  fallback = 'Die Anfrage konnte nicht verarbeitet werden.',
): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const value = payload as { error?: unknown; message?: unknown };
  if (value.error && typeof value.error === 'object') {
    const message = (value.error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  if (typeof value.error === 'string' && value.error.length > 0) return value.error;
  if (typeof value.message === 'string' && value.message.length > 0) return value.message;
  return fallback;
}

export function formatAuthError(message: string): string {
  return mapAuthError(message).message;
}
