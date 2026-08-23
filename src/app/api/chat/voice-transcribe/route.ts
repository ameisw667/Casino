import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const clientIp = getClientIdentifier(request, userId);
    const rate = await enforceRateLimit('guide-voice-stt', clientIp, 10, 60);
    const responseHeaders = {
      ...PRIVATE_NO_STORE_HEADERS,
      ...rateLimitHeaders(rate),
    };

    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: responseHeaders },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503, headers: responseHeaders },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data payload' },
        { status: 400, headers: responseHeaders },
      );
    }

    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Missing or invalid audio file' },
        { status: 400, headers: responseHeaders },
      );
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: 'Audio file exceeds 5 MB limit' },
        { status: 400, headers: responseHeaders },
      );
    }

    const fileType = file.type.toLowerCase();
    const isAllowed = ALLOWED_AUDIO_TYPES.some((allowed) => fileType.includes(allowed.split('/')[1]));
    if (file.type && !isAllowed) {
      return NextResponse.json(
        { error: 'Unsupported audio format. Allowed: WebM, WAV, MP4, MP3, OGG' },
        { status: 400, headers: responseHeaders },
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
      CasinoLogger.error('VoiceTranscribe', `OpenAI Whisper failure: ${openAiRes.status} ${errorBody}`);
      return NextResponse.json(
        { error: 'Audio transcription failed upstream' },
        { status: 502, headers: responseHeaders },
      );
    }

    const result = (await openAiRes.json()) as { text?: string };
    const text = result.text?.trim() ?? '';

    return NextResponse.json(
      { text, success: true },
      { headers: responseHeaders },
    );
  } catch (error) {
    CasinoLogger.error('VoiceTranscribe', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Voice transcription service unavailable' },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
