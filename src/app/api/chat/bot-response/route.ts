import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import {
  CASINO_GUIDE_CONTEXT_VERSION,
  CasinoGuideError,
  requestCasinoGuideAnswer,
  requestCasinoGuideAnswerStream,
} from '@/lib/casino/chat-guide';
import { recordGuideTelemetry, type GuideTelemetryOutcome } from '@/lib/casino/guide-telemetry';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

const guideHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().max(1000),
});

const guideRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message required').max(1000, 'Message too long'),
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/,
      'Ungültiges Bildformat. Erlaubt: PNG, JPEG, WebP (Base64)',
    )
    .max(2_500_000, 'Bild darf maximal 2.5 MB groß sein')
    .optional(),
  history: z.array(guideHistoryItemSchema).max(6).optional(),
  stream: z.boolean().optional(),
});

const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  let currentUserId: string | null = null;
  let guideStartedAt: number | null = null;

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

    currentUserId = userId;

    const clientIp = getClientIdentifier(request, userId);
    const rate = await enforceRateLimit('guide-chat', clientIp, 10, 60);
    const responseHeaders = {
      ...PRIVATE_NO_STORE_HEADERS,
      ...rateLimitHeaders(rate),
    };

    if (!rate.success) {
      if (!rate.unavailable) {
        await recordGuideTelemetry({
          actorId: userId,
          outcome: 'rate_limited',
          latencyMs: 0,
          model: null,
          usage: null,
          rateLimitWindowStartedAt: new Date(rate.reset - 60_000),
        });
      }

      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: responseHeaders },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = guideRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid guide request' },
        { status: 400, headers: responseHeaders },
      );
    }

    guideStartedAt = performance.now();
    const shouldStream =
      parsed.data.stream === true ||
      request.headers.get('accept')?.includes('text/event-stream');

    if (shouldStream) {
      const streamResult = await requestCasinoGuideAnswerStream(
        parsed.data.message,
        userId,
        parsed.data.history,
        parsed.data.image,
      );

      await recordGuideTelemetry({
        actorId: userId,
        outcome: 'success',
        latencyMs: Math.round(performance.now() - guideStartedAt),
        model: streamResult.model,
        usage: null,
      });

      return new Response(streamResult.stream, {
        headers: {
          ...responseHeaders,
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    const answerResult = await requestCasinoGuideAnswer(
      parsed.data.message,
      userId,
      parsed.data.history,
      parsed.data.image,
    );

    await recordGuideTelemetry({
      actorId: userId,
      outcome: 'success',
      latencyMs: Math.round(performance.now() - guideStartedAt),
      model: answerResult.model,
      usage: answerResult.usage,
    });

    return NextResponse.json(
      { answer: answerResult.answer, contextVersion: CASINO_GUIDE_CONTEXT_VERSION },
      { headers: responseHeaders },
    );
  } catch (error) {
    if (currentUserId && guideStartedAt !== null) {
      let outcome: GuideTelemetryOutcome = 'upstream';
      if (error instanceof CasinoGuideError) {
        if (error.kind === 'configuration') outcome = 'configuration';
        else if (error.kind === 'quota') outcome = 'quota';
        else if (error.kind === 'invalid-response') outcome = 'invalid_response';
      }

      await recordGuideTelemetry({
        actorId: currentUserId,
        outcome,
        latencyMs: Math.round(performance.now() - guideStartedAt),
        model: null,
        usage: null,
      });
    }

    if (error instanceof CasinoGuideError) {
      CasinoLogger.error('CasinoGuide', 'Guide service request failed');
    }

    if (
      error instanceof CasinoGuideError &&
      (error.kind === 'configuration' || error.kind === 'quota')
    ) {
      return NextResponse.json(
        { error: 'Casino guide is temporarily unavailable' },
        { status: 503, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { error: 'Casino guide is temporarily unavailable' },
      { status: 502, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
