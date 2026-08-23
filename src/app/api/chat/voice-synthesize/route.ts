import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

const synthesizeSchema = z.object({
  text: z.string().trim().min(1, 'Text required').max(3000, 'Text too long for synthesis'),
  voice: z.enum(['onyx', 'echo', 'alloy', 'fable', 'nova', 'shimmer']).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
});

const OPENAI_AUDIO_SPEECH_URL = 'https://api.openai.com/v1/audio/speech';
const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

/**
 * Sanitizes markdown text into clean speakable prose
 * Strips delimiter markers, markdown tables, URLs, backticks, asterisks, headers.
 */
export function cleanMarkdownForSpeech(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Remove <<<SUGGESTIONS: [...]>>> block
  cleaned = cleaned.replace(/<<<SUGGESTIONS:\s*\[.*?\]\s*>>>/gs, '');

  // 2. Remove code blocks ```...``` and inline code `...`
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // 3. Remove markdown tables and separator rows
  cleaned = cleaned.replace(/[-:|]{3,}/g, ' ');
  cleaned = cleaned.replace(/\|/g, ' ');

  // 4. Remove links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 5. Remove bold/italic markers (*, **, _, __)
  cleaned = cleaned.replace(/[*_]{1,3}/g, '');

  // 6. Remove header hashes (# Header -> Header)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 7. Remove bullet dashes/asterisks at line starts
  cleaned = cleaned.replace(/^[-*•]\s+/gm, '');

  // 8. Collapse extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

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
    const rate = await enforceRateLimit('guide-voice-tts', clientIp, 15, 60);
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

    const body = await request.json().catch(() => null);
    const parsed = synthesizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid synthesis request' },
        { status: 400, headers: responseHeaders },
      );
    }

    const speakableText = cleanMarkdownForSpeech(parsed.data.text);
    if (!speakableText) {
      return NextResponse.json(
        { error: 'No speakable text content remaining after sanitizing' },
        { status: 400, headers: responseHeaders },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503, headers: responseHeaders },
      );
    }

    const openAiRes = await fetch(OPENAI_AUDIO_SPEECH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        model: 'tts-1',
        input: speakableText,
        voice: parsed.data.voice ?? 'onyx',
        response_format: 'mp3',
        speed: parsed.data.speed ?? 1.05,
      }),
    });

    if (!openAiRes.ok || !openAiRes.body) {
      const errorBody = await openAiRes.text().catch(() => '');
      CasinoLogger.error('VoiceSynthesize', `OpenAI TTS failure: ${openAiRes.status} ${errorBody}`);
      return NextResponse.json(
        { error: 'Audio synthesis failed upstream' },
        { status: 502, headers: responseHeaders },
      );
    }

    return new Response(openAiRes.body, {
      headers: {
        ...responseHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    CasinoLogger.error('VoiceSynthesize', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Voice synthesis service unavailable' },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
