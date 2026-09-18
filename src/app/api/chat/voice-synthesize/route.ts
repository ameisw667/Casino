import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';
import { enforceDailyCostCap } from '@/lib/security/daily-cost-cap';
import { apiErrorResponse } from '@/lib/api/response';

const synthesizeSchema = z.object({
  text: z.string().trim().min(1, 'Text required').max(3000, 'Text too long for synthesis'),
  voice: z.enum(['onyx', 'echo', 'alloy', 'fable', 'nova', 'shimmer']).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
});

const OPENAI_AUDIO_SPEECH_URL = 'https://api.openai.com/v1/audio/speech';
const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

import { cleanMarkdownForSpeech } from '@/lib/casino/voice-markdown';

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure)
    return apiErrorResponse(
      'PERMISSION_DENIED',
      'Keine Berechtigung.',
      originFailure.status || 403,
    );

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
    const rate = await enforceRateLimit(clientIp, 'guide-voice-tts', 15, 60);
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

    // 06_1 L2 daily cost cap (block recorded as cost_cap_reached signal in the module).
    const dailyCap = await enforceDailyCostCap(userId, 'voice-synthesize');
    if (!dailyCap.allowed) {
      return apiErrorResponse(
        dailyCap.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'DAILY_COST_CAP_REACHED',
        dailyCap.unavailable
          ? 'Rate limit service unavailable'
          : 'Tageslimit erreicht. Versuch es morgen wieder.',
        dailyCap.unavailable ? 503 : 429,
        undefined,
        { headers: responseHeaders },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = synthesizeSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse(
        'INVALID_REQUEST',
        parsed.error.issues[0]?.message ?? 'Invalid synthesis request',
        400,
        parsed.error.issues,
        { headers: responseHeaders },
      );
    }

    const speakableText = cleanMarkdownForSpeech(parsed.data.text);
    if (!speakableText) {
      return apiErrorResponse(
        'NO_SPEAKABLE_TEXT',
        'No speakable text content remaining after sanitizing',
        400,
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
      return apiErrorResponse(
        'SYNTHESIS_UPSTREAM_ERROR',
        'Audio synthesis failed upstream',
        502,
        undefined,
        {
          headers: responseHeaders,
        },
      );
    }

    return new Response(openAiRes.body, {
      headers: {
        ...responseHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    CasinoLogger.error(
      'VoiceSynthesize',
      'Voice synthesis request failed',
      error instanceof Error ? error : undefined,
    );
    return apiErrorResponse(
      'SERVICE_UNAVAILABLE',
      'Voice synthesis service unavailable',
      500,
      undefined,
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
