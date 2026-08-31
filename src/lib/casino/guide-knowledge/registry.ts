import { RAW_KNOWLEDGE_MARKDOWN } from './content-raw';
import { parseFrontmatter } from './parser';
import {
  guideKnowledgeRegistrySchema,
  guideKnowledgeSourceSchema,
  type GuideKnowledgeSource,
  type GuideKnowledgeSourceId,
  type GuideKnowledgeTopic,
} from './schema';

function buildRegistryFromRawMarkdown(rawList: readonly string[]): GuideKnowledgeSource[] {
  const parsedSources = rawList.map((rawMd, index) => {
    const { frontmatter, content } = parseFrontmatter(rawMd);
    const candidate = {
      ...frontmatter,
      content,
    };
    const parsed = guideKnowledgeSourceSchema.safeParse(candidate);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message ?? 'Unknown validation error';
      throw new Error(`Invalid guide knowledge document at index ${index}: ${issue}`);
    }
    return parsed.data;
  });

  const registryResult = guideKnowledgeRegistrySchema.safeParse(parsedSources);
  if (!registryResult.success) {
    const issue = registryResult.error.issues[0]?.message ?? 'Registry validation error';
    throw new Error(`Invalid guide knowledge registry: ${issue}`);
  }

  return registryResult.data;
}

export const GUIDE_KNOWLEDGE_SOURCES: readonly GuideKnowledgeSource[] =
  buildRegistryFromRawMarkdown(RAW_KNOWLEDGE_MARKDOWN);

export function getKnowledgeDocById(
  id: GuideKnowledgeSourceId | string,
): GuideKnowledgeSource | undefined {
  return GUIDE_KNOWLEDGE_SOURCES.find((doc) => doc.id === id);
}

export function getKnowledgeDocsByTopic(
  topic: GuideKnowledgeTopic | string,
): GuideKnowledgeSource[] {
  return GUIDE_KNOWLEDGE_SOURCES.filter((doc) => doc.topic === topic);
}

export function getKnowledgeDocsByTag(tag: string): GuideKnowledgeSource[] {
  const normalized = tag.toLowerCase().trim();
  return GUIDE_KNOWLEDGE_SOURCES.filter((doc) =>
    doc.tags.some((t) => t.toLowerCase() === normalized),
  );
}

export { selectKnowledgeDocs, scoreDocument, tokenizeQuery } from './matcher';
export type { ScoredKnowledgeDoc, SelectKnowledgeOptions } from './matcher';
export { retrieveKnowledgeDocs } from './hybrid-retriever';
export type {
  HybridRetrievalResult,
  HybridRetrieverOptions,
  RetrievalStrategy,
} from './hybrid-retriever';
export { chunkKnowledgeDoc, chunkAllKnowledgeDocs } from './chunker';
export type { GuideKnowledgeChunk } from './chunker';
export { cosineSimilarity, dotProduct, normalizeVector, vectorNorm } from './vector-math';
export {
  fetchQueryEmbedding,
  generateLocalEmbedding,
  getOrCreateVectorStore,
  resetVectorStoreCache,
  searchVectorChunks,
} from './vector-store';
export type { EmbeddedChunk, ScoredChunk } from './vector-store';
