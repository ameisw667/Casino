import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import {
  guidePersonaSchema,
  DEFAULT_PERSONA,
  type GuidePersona,
} from '@/lib/casino/chat-guide/personas';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' };

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/casino/guide-persona
// Returns the authenticated user's active guide persona.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { persona: DEFAULT_PERSONA },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('guide_persona')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ persona: DEFAULT_PERSONA }, { headers: PRIVATE_NO_STORE });
    }

    const parsed = guidePersonaSchema.safeParse(data.guide_persona);
    const persona: GuidePersona = parsed.success ? parsed.data : DEFAULT_PERSONA;

    return NextResponse.json({ persona }, { headers: PRIVATE_NO_STORE });
  } catch {
    return NextResponse.json({ persona: DEFAULT_PERSONA }, { headers: PRIVATE_NO_STORE });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/casino/guide-persona
// Updates the authenticated user's active guide persona.
// Body: { persona: GuidePersona }
// ─────────────────────────────────────────────────────────────────────────────
const patchSchema = z.object({
  persona: guidePersonaSchema,
});

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }

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
      .eq('id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save persona preference' },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json({ persona: parsed.data.persona }, { headers: PRIVATE_NO_STORE });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save persona preference' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
