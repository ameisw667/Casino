import 'server-only';

import { normalizeGuideUsage } from '../guide-telemetry';
import { executeGuideTool, GUIDE_OPENAI_TOOLS } from '../guide-tools';
import { loadGuideLeaderboardSnippet } from '../guide-live-leaderboard';
import { buildCasinoGuideContextAsync } from './context';
import { buildCasinoGuideInstructions } from './instructions';
import { DEFAULT_PERSONA, type GuidePersona } from './personas';
import {
  buildCasinoGuideRequest,
  buildGuideInputPayload,
  createGuideHeaders,
  GUIDE_REPLY_SCHEMA,
  GUIDE_REQUEST_TIMEOUT_MS,
  guideReplySchema,
  OPENAI_RESPONSES_URL,
} from './request';
import {
  getGuideFunctionCalls,
  getGuideOutputText,
  getOpenAiErrorCode,
  normalizeGuideAnswer,
} from './response-parser';
import { extractSuggestionsFromText } from './suggestions';
import {
  CASINO_GUIDE_MODEL,
  CasinoGuideError,
  type GuideAnswerResult,
  type GuideConversationHistoryItem,
} from './types';

// Turn 2 must not get a fresh full timeout budget — that would let the documented
// "8s total for both turns" invariant silently become up to 16s worst-case. Below
// this remaining-budget floor, firing turn 2 would abort almost immediately anyway,
// so fail closed instead of racing a doomed request.
const MIN_TURN2_TIMEOUT_MS = 500;

export async function requestCasinoGuideAnswer(
  message: string,
  userId?: string,
  history?: readonly GuideConversationHistoryItem[],
  image?: string,
  persona: GuidePersona = DEFAULT_PERSONA,
): Promise<GuideAnswerResult> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new CasinoGuideError('configuration');
  }

  const request = await buildCasinoGuideRequest(message, history, image, persona);
  const guideRequestStartedAt = Date.now();
  let response: Response;
  // Populated only when the model calls trigger_ui_action; surfaced on every return
  // below so the non-streaming JSON response can carry it the same way the SSE
  // streaming path already does (stream.ts's own, separate uiAction handling).
  let uiAction: GuideAnswerResult['action'];

  try {
    response = await fetch(request.url, request.init);
  } catch {
    throw new CasinoGuideError('upstream');
  }

  if (!response.ok) {
    const requestId = response.headers.get('x-request-id') ?? undefined;
    let errorCode: string | undefined;
    try {
      errorCode = getOpenAiErrorCode(await response.json());
    } catch {
      // A malformed upstream error body remains an opaque upstream failure.
    }

    const kind =
      response.status === 429 && errorCode === 'credit_balance_exhausted' ? 'quota' : 'upstream';
    throw new CasinoGuideError(kind, requestId);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CasinoGuideError('invalid-response');
  }

  // Check for Function / Tool Calls (Turn 1 -> Execute -> Turn 2)
  const functionCalls = getGuideFunctionCalls(payload);
  if (functionCalls.length > 0) {
    const toolInputs: unknown[] = buildGuideInputPayload(message, history, image);

    for (const call of functionCalls) {
      toolInputs.push({
        type: 'function_call',
        call_id: call.callId,
        name: call.name,
        arguments: call.rawArguments,
      });

      const toolResult = await executeGuideTool(call.name, call.arguments, userId);
      if (call.name === 'trigger_ui_action') {
        // toolResult is executeGuideTool's already-sanitized output (allowlisted action/target,
        // trimmed+capped label) — never the model's raw call arguments.
        const action = typeof toolResult.action === 'string' ? toolResult.action : undefined;
        const label = typeof toolResult.label === 'string' ? toolResult.label : undefined;
        if (action && label) {
          uiAction = {
            type: action,
            target: typeof toolResult.target === 'string' ? toolResult.target : undefined,
            label,
          };
        }
      }
      toolInputs.push({
        type: 'function_call_output',
        call_id: call.callId,
        output: JSON.stringify(toolResult),
      });
    }

    const lastUserQuery = history?.filter((h) => h.role === 'user').slice(-1)[0]?.content;
    const retrievalQuery = lastUserQuery ? `${lastUserQuery} ${message}`.trim() : message;

    const context = await buildCasinoGuideContextAsync(retrievalQuery);
    const leaderboard = await loadGuideLeaderboardSnippet();
    const isReasoningModel =
      CASINO_GUIDE_MODEL.includes('gpt-5') ||
      CASINO_GUIDE_MODEL.includes('o1') ||
      CASINO_GUIDE_MODEL.includes('o3');

    const remainingBudgetMs = GUIDE_REQUEST_TIMEOUT_MS - (Date.now() - guideRequestStartedAt);
    if (remainingBudgetMs < MIN_TURN2_TIMEOUT_MS) {
      throw new CasinoGuideError('upstream');
    }

    const turn2Request = {
      url: OPENAI_RESPONSES_URL,
      init: {
        method: 'POST',
        headers: createGuideHeaders(),
        signal: AbortSignal.timeout(remainingBudgetMs),
        body: JSON.stringify({
          model: CASINO_GUIDE_MODEL,
          store: false,
          instructions: buildCasinoGuideInstructions(context, leaderboard, persona),
          input: toolInputs,
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

    let turn2Response: Response;
    try {
      turn2Response = await fetch(turn2Request.url, turn2Request.init);
    } catch {
      throw new CasinoGuideError('upstream');
    }

    if (!turn2Response.ok) {
      throw new CasinoGuideError('upstream');
    }

    let turn2Payload: unknown;
    try {
      turn2Payload = await turn2Response.json();
    } catch {
      throw new CasinoGuideError('invalid-response');
    }

    const turn2OutputText = getGuideOutputText(turn2Payload);
    if (typeof turn2OutputText === 'string') {
      try {
        const parsedReply = guideReplySchema.safeParse(JSON.parse(turn2OutputText));
        if (parsedReply.success) {
          const { cleanText, suggestions } = extractSuggestionsFromText(
            normalizeGuideAnswer(parsedReply.data.answer),
          );
          return {
            answer: cleanText,
            suggestions: suggestions.length > 0 ? suggestions : undefined,
            action: uiAction,
            model: CASINO_GUIDE_MODEL,
            usage: normalizeGuideUsage(
              typeof turn2Payload === 'object' && turn2Payload !== null && 'usage' in turn2Payload
                ? turn2Payload.usage
                : typeof payload === 'object' && payload !== null && 'usage' in payload
                  ? payload.usage
                  : null,
            ),
          };
        }
      } catch {
        // Fallback
      }
    }
  }

  const outputText = getGuideOutputText(payload);
  let answer = '';
  if (typeof outputText === 'string') {
    try {
      const parsedReply = guideReplySchema.safeParse(JSON.parse(outputText));
      if (parsedReply.success) answer = normalizeGuideAnswer(parsedReply.data.answer);
    } catch {
      // The upstream output does not satisfy the required structured contract.
    }
  }

  if (!answer) {
    throw new CasinoGuideError('invalid-response');
  }

  const { cleanText, suggestions } = extractSuggestionsFromText(answer);

  return {
    answer: cleanText,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    action: uiAction,
    model: CASINO_GUIDE_MODEL,
    usage: normalizeGuideUsage(
      typeof payload === 'object' && payload !== null && 'usage' in payload ? payload.usage : null,
    ),
  };
}
