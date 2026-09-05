import { z } from 'zod';
import type { GenerationRequest, GenerationResponsePayload, RetryConfig } from './types';
import { scrubSensitiveText } from './security';

export const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
export const DEFAULT_IMAGE_MODEL = 'gpt-image-2';
export const IMAGE_REQUEST_TIMEOUT_MS = 60_000;

const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_MAX_BACKOFF_MS = 8_000;

const imageGenerationResponseSchema = z.object({
  data: z
    .array(
      z.object({
        b64_json: z.string().min(1),
        revised_prompt: z.string().optional(),
      }),
    )
    .min(1),
});

const openAiErrorPayloadSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    code: z.string().nullable().optional(),
    param: z.string().nullable().optional(),
  }),
});

export class OpenAiImageError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
    public readonly errorCode?: string | null,
    public readonly errorType?: string,
  ) {
    super(scrubSensitiveText(message));
    this.name = 'OpenAiImageError';
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  isQuotaExceeded(): boolean {
    return (
      this.status === 429 &&
      (this.errorCode === 'insufficient_quota' || this.errorType === 'insufficient_quota')
    );
  }

  isRateLimit(): boolean {
    return this.status === 429 && !this.isQuotaExceeded();
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Fatale Fehler, bei denen ein weiterer Aufruf im Batch sinnlos ist.
   */
  isFatal(): boolean {
    return this.isAuthError() || this.isQuotaExceeded();
  }
}

export interface OpenAiImageClientDeps {
  apiKey: string;
  fetchImpl?: typeof fetch;
  sleepImpl?: (ms: number) => Promise<void>;
  retryConfig?: RetryConfig;
}

interface SingleRequestOutcome {
  buffer: Buffer;
  requestId?: string;
  revisedPrompt?: string;
  rateLimitRemainingRequests?: string;
  rateLimitRemainingTokens?: string;
}

/**
 * Führt die Bildgenerierung mit voller Telemetrie (Dauer, Attempts, Header, revised_prompt) aus.
 */
export async function generateImageWithMeta(
  request: GenerationRequest,
  deps: OpenAiImageClientDeps,
): Promise<GenerationResponsePayload> {
  if (process.env.NEXT_RUNTIME) {
    throw new Error(
      'Sicherheitsbarriere: Design-Asset-Generierung darf nicht im Next.js Web-Runtime-Kontext ausgeführt werden.',
    );
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const sleepImpl = deps.sleepImpl ?? sleep;
  const maxRetries = deps.retryConfig?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseBackoff = deps.retryConfig?.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
  const maxBackoff = deps.retryConfig?.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
  const timeoutMs = deps.retryConfig?.timeoutMs ?? IMAGE_REQUEST_TIMEOUT_MS;

  const startTime = Date.now();
  let attempt = 0;

  while (true) {
    attempt += 1;
    try {
      const outcome = await requestOnce(request, deps.apiKey, fetchImpl, timeoutMs);
      return {
        imageBuffer: outcome.buffer,
        meta: {
          durationMs: Date.now() - startTime,
          requestId: outcome.requestId,
          model: request.model,
          size: request.size,
          quality: request.quality,
          attemptsMade: attempt,
          revisedPrompt: outcome.revisedPrompt,
          rateLimitRemainingRequests: outcome.rateLimitRemainingRequests,
          rateLimitRemainingTokens: outcome.rateLimitRemainingTokens,
        },
      };
    } catch (error) {
      if (
        !(error instanceof OpenAiImageError) ||
        !error.retryable ||
        error.isFatal() ||
        attempt > maxRetries
      ) {
        throw error;
      }
      const backoffMs = Math.min(baseBackoff * 2 ** (attempt - 1), maxBackoff);
      const jitterMs = Math.random() * backoffMs * 0.5;
      await sleepImpl(backoffMs + jitterMs);
    }
  }
}

/**
 * Convenience-Wrapper: Liefert direkt den Bild-Buffer (100 % abwärtskompatibel).
 */
export async function generateImage(
  request: GenerationRequest,
  deps: OpenAiImageClientDeps,
): Promise<Buffer> {
  const payload = await generateImageWithMeta(request, deps);
  return payload.imageBuffer;
}

async function requestOnce(
  request: GenerationRequest,
  apiKey: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<SingleRequestOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;
    try {
      response = await fetchImpl(OPENAI_IMAGES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          size: request.size,
          quality: request.quality,
          background: request.background ?? 'auto',
          n: 1,
        }),
        signal: controller.signal,
      });
    } catch (networkError: unknown) {
      const isAbort =
        networkError instanceof Error &&
        (networkError.name === 'AbortError' || networkError.message.includes('aborted'));
      throw new OpenAiImageError(
        isAbort
          ? `Request-Timeout nach ${timeoutMs}ms überschritten`
          : `Netzwerkfehler beim API-Aufruf: ${networkError instanceof Error ? networkError.message : String(networkError)}`,
        isAbort ? 408 : 0,
        true, // Netzwerkfehler und Timeouts sind grundsätzlich retryable
        isAbort ? 'timeout' : 'network_error',
      );
    }

    const requestId = response.headers.get('x-request-id') ?? undefined;
    const rateLimitRemainingRequests =
      response.headers.get('x-ratelimit-remaining-requests') ?? undefined;
    const rateLimitRemainingTokens =
      response.headers.get('x-ratelimit-remaining-tokens') ?? undefined;

    if (!response.ok) {
      const bodyText = await safeReadText(response);
      const { message, code, type } = parseErrorPayload(bodyText, response.status);
      const isQuota =
        response.status === 429 && (code === 'insufficient_quota' || type === 'insufficient_quota');
      const retryable = (response.status === 429 && !isQuota) || response.status >= 500;

      throw new OpenAiImageError(
        `OpenAI Images API antwortete mit ${response.status}: ${message}`,
        response.status,
        retryable,
        code,
        type,
      );
    }

    const json = await response.json();
    const parsed = imageGenerationResponseSchema.parse(json);
    return {
      buffer: Buffer.from(parsed.data[0].b64_json, 'base64'),
      requestId,
      revisedPrompt: parsed.data[0].revised_prompt,
      rateLimitRemainingRequests,
      rateLimitRemainingTokens,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseErrorPayload(
  bodyText: string,
  status: number,
): { message: string; code?: string | null; type?: string } {
  try {
    const json = JSON.parse(bodyText);
    const parsed = openAiErrorPayloadSchema.safeParse(json);
    if (parsed.success) {
      return {
        message: parsed.data.error.message,
        code: parsed.data.error.code,
        type: parsed.data.error.type,
      };
    }
  } catch {
    // Nicht als JSON parsbar
  }
  return { message: bodyText || `HTTP Status ${status}` };
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '(kein Response-Body lesbar)';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
