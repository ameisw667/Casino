import type { GuideUsage } from '../guide-telemetry';

export const CASINO_GUIDE_MODEL = process.env.CASINO_GUIDE_MODEL || 'gpt-4o-mini';
export const CASINO_GUIDE_CONTEXT_VERSION = '2026-08-21';

export type CasinoGuideErrorKind = 'configuration' | 'quota' | 'upstream' | 'invalid-response';

export class CasinoGuideError extends Error {
  constructor(
    public readonly kind: CasinoGuideErrorKind,
    public readonly requestId?: string,
  ) {
    super('Casino guide is temporarily unavailable');
    this.name = 'CasinoGuideError';
  }
}

export type GuideKnowledgeContext = {
  sourceIds: string[];
  sourceVersion: string;
  content: string;
};

export type BuildGuideContextInput =
  string | unknown[] | { query?: string; maxDocs?: number; sources?: unknown };

export type GuideConversationHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type GuideAnswerResult = {
  answer: string;
  model: string;
  usage: GuideUsage | null;
  suggestions?: string[];
  action?: {
    type: string;
    target?: string;
    label: string;
  };
};

export type GuideFunctionCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
  rawArguments: string;
};

export type GuideStreamResult = {
  stream: ReadableStream<Uint8Array>;
  model: string;
  // true: the stream's own start()/catch() already recorded guide telemetry at actual
  // completion time (real OpenAI SSE path — success is only known once the stream ends).
  // false: the answer was already fully resolved before the stream was built (fallback
  // paths), so the caller must still record telemetry itself, same as before this field existed.
  telemetryHandledInStream: boolean;
};
