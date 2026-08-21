import { GUIDE_KNOWLEDGE_SOURCES, getKnowledgeDocById } from './registry';
import type { GuideKnowledgeSource } from './schema';

const STOP_WORDS = new Set([
  // Generic English stop words
  'a',
  'about',
  'all',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'casino',
  'data',
  'do',
  'does',
  'every',
  'for',
  'from',
  'game',
  'games',
  'get',
  'give',
  'have',
  'help',
  'how',
  'i',
  'ignore',
  'in',
  'information',
  'instruction',
  'instructions',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'online',
  'or',
  'play',
  'player',
  'please',
  'prior',
  'prompt',
  'reveal',
  'rule',
  'rules',
  'system',
  'tell',
  'the',
  'there',
  'this',
  'to',
  'user',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you',
  'your',
  // German stop words
  'ab',
  'alle',
  'alles',
  'als',
  'am',
  'an',
  'auf',
  'aus',
  'bei',
  'bitte',
  'casino',
  'das',
  'dass',
  'dein',
  'deine',
  'dem',
  'den',
  'der',
  'des',
  'die',
  'du',
  'ein',
  'eine',
  'einem',
  'einen',
  'einer',
  'eines',
  'es',
  'für',
  'gib',
  'gibt',
  'habe',
  'hat',
  'hilfe',
  'ich',
  'im',
  'in',
  'ist',
  'kann',
  'kannst',
  'man',
  'mein',
  'meine',
  'mir',
  'mit',
  'nach',
  'oder',
  'regel',
  'regeln',
  'sag',
  'sage',
  'sie',
  'so',
  'spiel',
  'spiele',
  'über',
  'um',
  'und',
  'vom',
  'von',
  'wann',
  'warum',
  'was',
  'welche',
  'welcher',
  'welches',
  'wenn',
  'wer',
  'wie',
  'wo',
  'zeig',
  'zeige',
  'zu',
  'zum',
  'zur',
]);

/**
 * Tokenizes and normalizes an input query into meaningful lowercase keywords.
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
}

export type ScoredKnowledgeDoc = {
  doc: GuideKnowledgeSource;
  score: number;
  matchedTags: string[];
};

function splitWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

/**
 * Calculates relevance score of a knowledge document against normalized query tokens.
 */
export function scoreDocument(
  doc: GuideKnowledgeSource,
  tokens: readonly string[],
): ScoredKnowledgeDoc {
  let score = 0;
  const matchedTags: string[] = [];
  const titleWords = splitWords(doc.title);
  const lowerTopic = doc.topic.toLowerCase();
  const lowerId = doc.id.toLowerCase();
  const idShortName = lowerId.replace('guide-', '');
  const docTags = doc.tags.map((t) => t.toLowerCase());

  for (const token of tokens) {
    // 1. Direct ID match (+6 points)
    if (token === idShortName || token === lowerId) {
      score += 6;
    }

    // 2. Exact Title word match (+4 points)
    if (titleWords.includes(token)) {
      score += 4;
    }

    // 3. Tag matches (+3 points for exact/hyphen-part, +2 for plural match)
    for (const tag of docTags) {
      if (tag === token) {
        score += 3;
        if (!matchedTags.includes(tag)) matchedTags.push(tag);
      } else if (tag.includes('-') && tag.split('-').includes(token)) {
        score += 3;
        if (!matchedTags.includes(tag)) matchedTags.push(tag);
      } else if (tag + 's' === token || token + 's' === tag) {
        score += 2;
        if (!matchedTags.includes(tag)) matchedTags.push(tag);
      }
    }

    // 4. Topic match (+1 point)
    if (lowerTopic === token) {
      score += 1;
    }
  }

  return { doc, score, matchedTags };
}

export type SelectKnowledgeOptions = {
  maxDocs?: number;
  sources?: readonly GuideKnowledgeSource[];
  fallbackDocIds?: readonly string[];
};

const DEFAULT_FALLBACK_DOC_IDS = ['guide-navigation', 'guide-commands'] as const;

/**
 * Deterministically selects the most relevant knowledge documents for a given user query.
 * Falls back to platform navigation & commands when no specific match is found.
 */
export function selectKnowledgeDocs(
  query: string,
  options: SelectKnowledgeOptions = {},
): GuideKnowledgeSource[] {
  const {
    maxDocs = 2,
    sources = GUIDE_KNOWLEDGE_SOURCES,
    fallbackDocIds = DEFAULT_FALLBACK_DOC_IDS,
  } = options;

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return getFallbackDocs(fallbackDocIds, sources);
  }

  const scoredDocs = sources
    .map((doc) => scoreDocument(doc, tokens))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredDocs.length === 0) {
    return getFallbackDocs(fallbackDocIds, sources);
  }

  return scoredDocs.slice(0, Math.max(1, maxDocs)).map((entry) => entry.doc);
}

function getFallbackDocs(
  fallbackDocIds: readonly string[],
  sources: readonly GuideKnowledgeSource[],
): GuideKnowledgeSource[] {
  const fallback = fallbackDocIds
    .map((id) => sources.find((s) => s.id === id) ?? getKnowledgeDocById(id))
    .filter((doc): doc is GuideKnowledgeSource => doc !== undefined);

  if (fallback.length > 0) return fallback;
  return sources.slice(0, 2);
}
