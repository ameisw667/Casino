// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  buildPersonaBlock,
  DEFAULT_PERSONA,
  GUIDE_PERSONAS,
  guidePersonaSchema,
  PERSONA_META,
  type GuidePersona,
} from '../personas';
import { buildCasinoGuideInstructions } from '../instructions';
import type { GuideKnowledgeContext } from '../types';

describe('Guide Personas Module (Stufe P)', () => {
  it('defines the 3 core personas with valid schema', () => {
    expect(GUIDE_PERSONAS).toEqual(['math_strategist', 'high_roller', 'casual_buddy']);
    expect(DEFAULT_PERSONA).toBe('math_strategist');

    for (const persona of GUIDE_PERSONAS) {
      const parsed = guidePersonaSchema.safeParse(persona);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toBe(persona);
      }
    }

    const invalid = guidePersonaSchema.safeParse('invalid_persona_name');
    expect(invalid.success).toBe(false);
  });

  it('contains UI metadata (label, emoji, description) for every persona', () => {
    for (const persona of GUIDE_PERSONAS) {
      const meta = PERSONA_META[persona];
      expect(meta).toBeDefined();
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.emoji.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });

  it('builds distinct persona instruction blocks for all personas', () => {
    const mathBlock = buildPersonaBlock('math_strategist');
    const highRollerBlock = buildPersonaBlock('high_roller');
    const casualBuddyBlock = buildPersonaBlock('casual_buddy');

    expect(mathBlock).toContain('THE MATH STRATEGIST');
    expect(mathBlock).toContain('EV');

    expect(highRollerBlock).toContain('THE HIGH-ROLLER CONCIERGE');
    expect(highRollerBlock).toContain('VIP');

    expect(casualBuddyBlock).toContain('THE CASUAL BUDDY');
    expect(casualBuddyBlock).toContain('companion');

    // Fallback on invalid persona
    const fallback = buildPersonaBlock('unknown_persona' as GuidePersona);
    expect(fallback).toBe(mathBlock);
  });

  it('injects persona block into buildCasinoGuideInstructions', () => {
    const mockContext: GuideKnowledgeContext = {
      sourceIds: ['test'],
      sourceVersion: '1.0',
      content: 'Sample casino knowledge',
    };

    const instructionsMath = buildCasinoGuideInstructions(mockContext, null, 'math_strategist');
    expect(instructionsMath).toContain('PERSONA — THE MATH STRATEGIST');

    const instructionsHighRoller = buildCasinoGuideInstructions(mockContext, null, 'high_roller');
    expect(instructionsHighRoller).toContain('PERSONA — THE HIGH-ROLLER CONCIERGE');

    const instructionsCasual = buildCasinoGuideInstructions(mockContext, null, 'casual_buddy');
    expect(instructionsCasual).toContain('PERSONA — THE CASUAL BUDDY');
  });
});
