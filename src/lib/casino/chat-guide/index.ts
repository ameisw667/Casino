import 'server-only';

export {
  CASINO_GUIDE_MODEL,
  CASINO_GUIDE_CONTEXT_VERSION,
  CasinoGuideError,
  type CasinoGuideErrorKind,
  type GuideKnowledgeContext,
  type BuildGuideContextInput,
  type GuideConversationHistoryItem,
  type GuideAnswerResult,
  type GuideFunctionCall,
  type GuideStreamResult,
} from './types';

export { buildCasinoGuideContext, buildCasinoGuideContextAsync } from './context';
export { buildCasinoGuideInstructions } from './instructions';
export { buildGuideInputPayload, buildCasinoGuideRequest } from './request';
export { extractSuggestionsFromText, SuggestionStreamFilter } from './suggestions';
export { requestCasinoGuideAnswer } from './answer';
export { requestCasinoGuideAnswerStream } from './stream';
