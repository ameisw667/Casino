import 'server-only';

import { z } from 'zod';
import { GUIDE_OPENAI_TOOLS } from '../guide-tools';
import { loadGuideLeaderboardSnippet } from '../guide-live-leaderboard';
import { buildCasinoGuideContextAsync } from './context';
import { buildCasinoGuideInstructions } from './instructions';
import { CASINO_GUIDE_MODEL, type GuideConversationHistoryItem } from './types';

export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const GUIDE_REQUEST_TIMEOUT_MS = 8_000;

export const GUIDE_REPLY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    type: { type: 'string', enum: ['guide_answer', 'out_of_scope'] },
    topic: {
      type: 'string',
      enum: [
        'blackjack',
        'crash',
        'dice',
        'roulette',
        'slots',
        'navigation',
        'commands',
        'economy',
        'vip_stats',
        'other',
      ],
    },
    answer: { type: 'string' },
  },
  required: ['type', 'topic', 'answer'],
} as const;

export const guideReplySchema = z.object({
  type: z.enum(['guide_answer', 'out_of_scope']),
  topic: z.enum([
    'blackjack',
    'crash',
    'dice',
    'roulette',
    'slots',
    'navigation',
    'commands',
    'economy',
    'vip_stats',
    'other',
  ]),
  answer: z.string(),
});

export function createGuideHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    'Content-Type': 'application/json',
  };
}

export function buildGuideInputPayload(
  message: string,
  history?: readonly GuideConversationHistoryItem[],
  image?: string,
): unknown[] {
  const inputs: unknown[] = [];

  if (history && history.length > 0) {
    const windowed = history.slice(-6);
    for (const item of windowed) {
      if (item.role === 'user') {
        inputs.push({ role: 'user', content: [{ type: 'input_text', text: item.content }] });
      } else {
        inputs.push({ role: 'assistant', content: [{ type: 'output_text', text: item.content }] });
      }
    }
  }

  if (image) {
    inputs.push({
      role: 'user',
      content: [
        { type: 'input_text', text: message },
        { type: 'input_image', image_url: image },
      ],
    });
  } else {
    inputs.push({ role: 'user', content: [{ type: 'input_text', text: message }] });
  }

  return inputs;
}

export async function buildCasinoGuideRequest(
  message: string,
  history?: readonly GuideConversationHistoryItem[],
  image?: string,
): Promise<{ url: string; init: RequestInit }> {
  const lastUserQuery = history?.filter((h) => h.role === 'user').slice(-1)[0]?.content;
  const retrievalQuery = lastUserQuery ? `${lastUserQuery} ${message}`.trim() : message;

  const context = await buildCasinoGuideContextAsync(retrievalQuery);
  const leaderboard = await loadGuideLeaderboardSnippet();
  const isReasoningModel =
    CASINO_GUIDE_MODEL.includes('gpt-5') ||
    CASINO_GUIDE_MODEL.includes('o1') ||
    CASINO_GUIDE_MODEL.includes('o3');

  const inputPayload = buildGuideInputPayload(message, history, image);

  return {
    url: OPENAI_RESPONSES_URL,
    init: {
      method: 'POST',
      headers: createGuideHeaders(),
      signal: AbortSignal.timeout(GUIDE_REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: CASINO_GUIDE_MODEL,
        store: false,
        instructions: buildCasinoGuideInstructions(context, leaderboard),
        input: inputPayload,
        tools: GUIDE_OPENAI_TOOLS,
        text: {
          format: {
            type: 'json_schema',
            name: 'casino_guide_reply',
            strict: true,
            schema: GUIDE_REPLY_SCHEMA,
          },
        },
        ...(isReasoningModel ? { reasoning: { effort: 'minimal' } } : {}),
        max_output_tokens: 600,
      }),
    },
  };
}
