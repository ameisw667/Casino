import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';

const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
];

const MAX_AUDIO_BYTES = 5_000_000; // 5 MB max
const OPENAI_AUDIO_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';

const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let userId = authUser?.id;
    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    if (
      !userId &&
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_FALLBACK === 'true' &&
      !isExplicitSignedOut
    ) {
      userId = 'dev_user_fallback';
    }

    if (!userId) {
      return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401, undefined, {
        headers: PRIVATE_NO_STORE_HEADERS,
      });
    }

    const clientIp = getClientIdentifier(request, userId);
    const rate = await enforceRateLimit(clientIp, 'guide-voice-stt', 10, 60);
    const responseHeaders = {
      ...PRIVATE_NO_STORE_HEADERS,
      ...rateLimitHeaders(rate),
    };

    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: responseHeaders },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return apiErrorResponse('CONFIG_ERROR', 'OpenAI API key not configured', 503, undefined, {
        headers: responseHeaders,
      });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return apiErrorResponse('INVALID_PAYLOAD', 'Invalid form data payload', 400, undefined, {
        headers: responseHeaders,
      });
    }

    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return apiErrorResponse('INVALID_AUDIO', 'Missing or invalid audio file', 400, undefined, {
        headers: responseHeaders,
      });
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return apiErrorResponse('AUDIO_TOO_LARGE', 'Audio file exceeds 5 MB limit', 400, undefined, {
        headers: responseHeaders,
      });
    }

    const fileType = file.type.toLowerCase();
    const isAllowed = ALLOWED_AUDIO_TYPES.some((allowed) =>
      fileType.includes(allowed.split('/')[1]),
    );
    if (file.type && !isAllowed) {
      return apiErrorResponse(
        'UNSUPPORTED_AUDIO_FORMAT',
        'Unsupported audio format. Allowed: WebM, WAV, MP4, MP3, OGG',
        400,
        undefined,
        { headers: responseHeaders },
      );
    }

    const openAiFormData = new FormData();
    const fileName = file instanceof File ? file.name : 'audio.webm';
    openAiFormData.append('file', file, fileName);
    openAiFormData.append('model', 'whisper-1');
    openAiFormData.append('language', 'de');
    openAiFormData.append('response_format', 'json');

    const openAiRes = await fetch(OPENAI_AUDIO_TRANSCRIPTIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(15_000),
      body: openAiFormData,
    });

    if (!openAiRes.ok) {
      const errorBody = await openAiRes.text().catch(() => '');
      CasinoLogger.error(
        'VoiceTranscribe',
        `OpenAI Whisper failure: ${openAiRes.status} ${errorBody}`,
      );
      return apiErrorResponse(
        'TRANSCRIPTION_UPSTREAM_ERROR',
        'Audio transcription failed upstream',
        502,
        undefined,
        {
          headers: responseHeaders,
        },
      );
    }

    const result = (await openAiRes.json()) as { text?: string };
    const rawText = result.text?.trim() ?? '';

    // Filter known OpenAI Whisper hallucinations on silent/low-amplitude audio
    const isHallucination =
      /amara\.org|untertitel\s+der|untertitel\s+im|subtitles\s+by|vielen\s+dank\s+fürs\s+zuschauen|thank\s+you\s+for\s+watching|transcription\s+by|copyright/i.test(
        rawText,
      );

    const text = isHallucination ? '' : rawText;

    return apiSuccessResponse({ text, success: true }, { headers: responseHeaders });
  } catch (error) {
    CasinoLogger.error('VoiceTranscribe', error instanceof Error ? error.message : 'Unknown error');
    return apiErrorResponse(
      'SERVICE_UNAVAILABLE',
      'Voice transcription service unavailable',
      500,
      undefined,
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
