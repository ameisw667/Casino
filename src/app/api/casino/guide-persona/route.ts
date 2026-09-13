import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import {
  guidePersonaSchema,
  DEFAULT_PERSONA,
  type GuidePersona,
} from '@/lib/casino/chat-guide/personas';
import {
  withRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import {
  GUIDE_PERSONA_LIMIT,
  GUIDE_PERSONA_WINDOW_SECONDS,
} from '@/lib/security/rate-limit-config';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' };

// 06_6 L0/L4 (E2+E6): this authenticated GET+PATCH route had 0 rate-limit calls — the
// exact "forgotten route" case the distributed-consistency audit predicted. It is now one
// of the two reference implementations for withRateLimit(): the resolve hook runs the auth
// gate BEFORE the limit decision (user-based buckets) and passes supabase/user through so
// the handler does not re-authenticate.
const personaGate = withRateLimit<
  { supabase: Awaited<ReturnType<typeof createClient>>; userId: string; email?: string }
>(
  async (request, context) => {
    const { supabase, userId } = context.data;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('guide_persona')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return NextResponse.json({ persona: DEFAULT_PERSONA }, { headers: PRIVATE_NO_STORE });
      }

      const parsed = guidePersonaSchema.safeParse(data.guide_persona);
      const persona: GuidePersona = parsed.success ? parsed.data : DEFAULT_PERSONA;

      return NextResponse.json(
        { persona },
        { headers: { ...PRIVATE_NO_STORE, ...rateLimitHeaders(context.decision) } },
      );
    } catch {
      return NextResponse.json({ persona: DEFAULT_PERSONA }, { headers: PRIVATE_NO_STORE });
    }
  },
  {
    scope: 'guide-persona',
    limit: GUIDE_PERSONA_LIMIT,
    windowSeconds: GUIDE_PERSONA_WINDOW_SECONDS,
    resolve: async (request) => {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return {
            earlyResponse: NextResponse.json(
              { persona: DEFAULT_PERSONA },
              { status: 401, headers: PRIVATE_NO_STORE },
            ),
          };
        }
        return {
          identifier: getClientIdentifier(request, user.id),
          data: { supabase, userId: user.id },
        };
      } catch {
        return {
          earlyResponse: NextResponse.json(
            { persona: DEFAULT_PERSONA },
            { status: 401, headers: PRIVATE_NO_STORE },
          ),
        };
      }
    },
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/casino/guide-persona
// Returns the authenticated user's active guide persona.
// ─────────────────────────────────────────────────────────────────────────────
export const GET = personaGate;

const patchSchema = z.object({
  persona: guidePersonaSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/casino/guide-persona
// Updates the authenticated user's active guide persona.
// Body: { persona: GuidePersona }
// ─────────────────────────────────────────────────────────────────────────────
export const PATCH = withRateLimit<
  { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
>(
  async (request, context) => {
    const { supabase, userId } = context.data;
    try {
      const body = await request.json().catch(() => null);
      const parsed = patchSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid persona. Must be one of: math_strategist, high_roller, casual_buddy' },
          { status: 400, headers: PRIVATE_NO_STORE },
        );
      }

      const { error } = await supabase
        .from('users')
        .update({ guide_persona: parsed.data.persona })
        .eq('id', userId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to save persona preference' },
          { status: 500, headers: PRIVATE_NO_STORE },
        );
      }

      return NextResponse.json(
        { persona: parsed.data.persona },
        { headers: { ...PRIVATE_NO_STORE, ...rateLimitHeaders(context.decision) } },
      );
    } catch {
      return NextResponse.json(
        { error: 'Failed to save persona preference' },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }
  },
  {
    scope: 'guide-persona',
    limit: GUIDE_PERSONA_LIMIT,
    windowSeconds: GUIDE_PERSONA_WINDOW_SECONDS,
    resolve: async (request) => {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return {
            earlyResponse: NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401, headers: PRIVATE_NO_STORE },
            ),
          };
        }
        return {
          identifier: getClientIdentifier(request, user.id),
          data: { supabase, userId: user.id },
        };
      } catch {
        return {
          earlyResponse: NextResponse.json(
            { error: 'Failed to save persona preference' },
            { status: 500, headers: PRIVATE_NO_STORE },
          ),
        };
      }
    },
  },
);