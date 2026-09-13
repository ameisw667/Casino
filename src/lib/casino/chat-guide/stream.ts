import 'server-only';

import { executeGuideTool } from '../guide-tools';
import { recordGuideTelemetry, type GuideTelemetryOutcome } from '../guide-telemetry';
import { loadGuideLeaderboardSnippet } from '../guide-live-leaderboard';
import { CasinoLogger } from '../logger';
import { requestCasinoGuideAnswer } from './answer';
import { buildCasinoGuideContextAsync } from './context';
import { buildCasinoGuideInstructions } from './instructions';
import { DEFAULT_PERSONA, type GuidePersona } from './personas';
import { buildCasinoGuideRequest, createGuideHeaders, GUIDE_REQUEST_TIMEOUT_MS } from './request';
import { getGuideFunctionCalls } from './response-parser';
import { SuggestionStreamFilter } from './suggestions';
import {
  CASINO_GUIDE_MODEL,
  CasinoGuideError,
  type GuideConversationHistoryItem,
  type GuideStreamResult,
} from './types';

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

export async function requestCasinoGuideAnswerStream(
  message: string,
  userId?: string,
  history?: readonly GuideConversationHistoryItem[],
  image?: string,
  persona: GuidePersona = DEFAULT_PERSONA,
): Promise<GuideStreamResult> {
  const streamStartedAt = performance.now();

  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new CasinoGuideError('configuration');
  }

  const lastUserQuery = history?.filter((h) => h.role === 'user').slice(-1)[0]?.content;
  const retrievalQuery = lastUserQuery ? `${lastUserQuery} ${message}`.trim() : message;

  const context = await buildCasinoGuideContextAsync(retrievalQuery);
  const leaderboard = await loadGuideLeaderboardSnippet();
  const instructions = buildCasinoGuideInstructions(context, leaderboard, persona);

  // Turn 1: Check if structured live player tools are needed
  let toolContextExtra = '';
  let uiAction: { type: string; target?: string; label: string } | null = null;
  const executedToolNames: string[] = [];
  try {
    const toolCheckRequest = await buildCasinoGuideRequest(message, history, image, persona);
    const turn1Res = await fetch(toolCheckRequest.url, toolCheckRequest.init);
    if (turn1Res.ok) {
      const turn1Payload = await turn1Res.json();
      const toolCalls = getGuideFunctionCalls(turn1Payload);
      if (toolCalls.length > 0) {
        for (const call of toolCalls) {
          executedToolNames.push(call.name);
          if (call.name === 'trigger_ui_action') {
            uiAction = {
              type:
                typeof call.arguments.action === 'string' ? call.arguments.action : 'open_vault',
              target: typeof call.arguments.target === 'string' ? call.arguments.target : undefined,
              label: typeof call.arguments.label === 'string' ? call.arguments.label : 'Öffnen',
            };
          }
          const toolResult = await executeGuideTool(call.name, call.arguments, userId);
          toolContextExtra += `\n\nLIVE TOOL RESULT (${call.name}):\n${JSON.stringify(toolResult, null, 2)}`;
        }
      }
    }
  } catch {
    // Non-blocking fallback to direct streaming
  }

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: unknown }> = [
    { role: 'system', content: `${instructions}${toolContextExtra}` },
  ];

  if (history && history.length > 0) {
    for (const item of history.slice(-6)) {
      messages.push({
        role: item.role === 'user' ? 'user' : 'assistant',
        content: item.content,
      });
    }
  }

  if (image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message },
        {
          type: 'image_url',
          image_url: {
            url: image,
            detail: 'low',
          },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: message });
  }

  let openAiStreamRes: Response;
  try {
    openAiStreamRes = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: createGuideHeaders(),
      signal: AbortSignal.timeout(GUIDE_REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: CASINO_GUIDE_MODEL,
        messages,
        stream: true,
        max_tokens: 800,
        temperature: 0.3,
      }),
    });
  } catch {
    // If chat completions stream fails, fallback to standard answer stream
    const fallbackAnswer = await requestCasinoGuideAnswer(message, userId, history, image, persona);
    const encoder = new TextEncoder();
    const fallbackStream = new ReadableStream<Uint8Array>({
      start(controller) {
        if (executedToolNames.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ toolCall: executedToolNames[0], tools: executedToolNames })}\n\n`,
            ),
          );
        }
        if (uiAction) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: uiAction })}\n\n`));
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: fallbackAnswer.answer })}\n\n`),
        );
        if (fallbackAnswer.suggestions && fallbackAnswer.suggestions.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ suggestions: fallbackAnswer.suggestions })}\n\n`,
            ),
          );
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, model: fallbackAnswer.model })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return { stream: fallbackStream, model: fallbackAnswer.model, telemetryHandledInStream: false };
  }

  if (!openAiStreamRes.ok || !openAiStreamRes.body) {
    const fallbackAnswer = await requestCasinoGuideAnswer(
      message,
      userId,
      history,
      undefined,
      persona,
    );
    const encoder = new TextEncoder();
    const fallbackStream = new ReadableStream<Uint8Array>({
      start(controller) {
        if (executedToolNames.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ toolCall: executedToolNames[0], tools: executedToolNames })}\n\n`,
            ),
          );
        }
        if (uiAction) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: uiAction })}\n\n`));
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: fallbackAnswer.answer })}\n\n`),
        );
        if (fallbackAnswer.suggestions && fallbackAnswer.suggestions.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ suggestions: fallbackAnswer.suggestions })}\n\n`,
            ),
          );
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, model: fallbackAnswer.model })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return { stream: fallbackStream, model: fallbackAnswer.model, telemetryHandledInStream: false };
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = openAiStreamRes.body.getReader();
  const suggestionFilter = new SuggestionStreamFilter();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      if (executedToolNames.length > 0) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ toolCall: executedToolNames[0], tools: executedToolNames })}\n\n`,
          ),
        );
      }
      if (uiAction) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: uiAction })}\n\n`));
      }
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed === 'data: [DONE]') {
              continue;
            }
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6);
              try {
                const parsed = JSON.parse(jsonStr);
                const deltaText =
                  parsed.choices?.[0]?.delta?.content ??
                  parsed.delta ??
                  (parsed.type === 'response.output_text.delta' ? parsed.delta : undefined);
                if (deltaText) {
                  const { textToEmit, suggestionsFound } = suggestionFilter.processChunk(deltaText);
                  if (textToEmit) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: textToEmit })}\n\n`),
                    );
                  }
                  if (suggestionsFound && suggestionsFound.length > 0) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ suggestions: suggestionsFound })}\n\n`,
                      ),
                    );
                  }
                }
              } catch {
                // Ignore partial json parse errors
              }
            }
          }
        }

        const { textToEmit, suggestionsFound } = suggestionFilter.flush();
        if (textToEmit) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: textToEmit })}\n\n`));
        }
        if (suggestionsFound && suggestionsFound.length > 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ suggestions: suggestionsFound })}\n\n`),
          );
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, model: CASINO_GUIDE_MODEL })}\n\n`),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));

        // Recorded here (actual stream completion), not by the caller right after this
        // function returns the (still-unread) stream — a mid-stream failure below must be
        // able to report its true outcome instead of a 'success' already written upstream.
        if (userId) {
          await recordGuideTelemetry({
            actorId: userId,
            outcome: 'success',
            latencyMs: Math.round(performance.now() - streamStartedAt),
            model: CASINO_GUIDE_MODEL,
            usage: null,
          });
        }
      } catch (err) {
        // Never forward the raw internal error message into the SSE payload — it can
        // contain upstream/network detail the client has no business seeing (the same
        // "no message leak" rule already enforced on every non-streaming guide error path).
        CasinoLogger.error(
          'ChatGuideStream',
          'SSE stream failed mid-response',
          err instanceof Error ? err : undefined,
        );
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Casino guide is temporarily unavailable' })}\n\n`,
          ),
        );
        if (userId) {
          const outcome: GuideTelemetryOutcome = 'upstream';
          await recordGuideTelemetry({
            actorId: userId,
            outcome,
            latencyMs: Math.round(performance.now() - streamStartedAt),
            model: CASINO_GUIDE_MODEL,
            usage: null,
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return { stream, model: CASINO_GUIDE_MODEL, telemetryHandledInStream: true };
}
