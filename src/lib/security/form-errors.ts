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
