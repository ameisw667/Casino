import type { GuideFunctionCall } from './types';

const MAX_VISIBLE_ANSWER_LENGTH = 2_000;

export function normalizeGuideAnswer(answer: string): string {
  return answer
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_VISIBLE_ANSWER_LENGTH);
}

export function getGuideOutputText(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;

  if ('output_text' in payload && typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  if (!('output' in payload) || !Array.isArray(payload.output)) return undefined;

  for (const outputItem of payload.output) {
    if (
      typeof outputItem !== 'object' ||
      outputItem === null ||
      !('type' in outputItem) ||
      outputItem.type !== 'message' ||
      !('content' in outputItem) ||
      !Array.isArray(outputItem.content)
    ) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (
        typeof contentItem === 'object' &&
        contentItem !== null &&
        'type' in contentItem &&
        contentItem.type === 'output_text' &&
        'text' in contentItem &&
        typeof contentItem.text === 'string'
      ) {
        return contentItem.text;
      }
    }
  }

  return undefined;
}

export function getGuideFunctionCalls(payload: unknown): GuideFunctionCall[] {
  if (typeof payload !== 'object' || payload === null) return [];

  const calls: GuideFunctionCall[] = [];

  if ('output' in payload && Array.isArray(payload.output)) {
    for (const item of payload.output) {
      if (typeof item !== 'object' || item === null) continue;

      if (
        'type' in item &&
        (item.type === 'function_call' || item.type === 'tool_call') &&
        'name' in item &&
        typeof item.name === 'string'
      ) {
        const callId =
          'call_id' in item && typeof item.call_id === 'string'
            ? item.call_id
            : 'id' in item && typeof item.id === 'string'
              ? item.id
              : `call_${crypto.randomUUID()}`;
        const rawArgs =
          'arguments' in item && typeof item.arguments === 'string' ? item.arguments : '{}';
        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(rawArgs);
        } catch {
          // ignore
        }
        calls.push({ callId, name: item.name, arguments: parsedArgs, rawArguments: rawArgs });
      }
    }
  }

  return calls;
}

export function getOpenAiErrorCode(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null || !('error' in payload)) return undefined;

  const error = payload.error;
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;

  return typeof error.code === 'string' ? error.code : undefined;
}
