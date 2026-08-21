import type { GuideKnowledgeSource, GuideKnowledgeSourceId, GuideKnowledgeTopic } from './schema';

export type GuideKnowledgeChunk = {
  id: string;
  docId: GuideKnowledgeSourceId;
  topic: GuideKnowledgeTopic;
  title: string;
  tags: readonly string[];
  text: string;
  searchableText: string;
};

/**
 * Splits a single GuideKnowledgeSource document into semantic chunks based on sections and bullet points.
 */
export function chunkKnowledgeDoc(doc: GuideKnowledgeSource): GuideKnowledgeChunk[] {
  const lines = doc.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections: string[] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    // If we hit a new major top-level bullet point or heading, start a new block
    if ((line.startsWith('- ') && !line.startsWith('  -')) || line.startsWith('#')) {
      if (currentBlock.length > 0) {
        sections.push(currentBlock.join(' '));
        currentBlock = [];
      }
    }
    currentBlock.push(line.replace(/^-\s+/, '').replace(/^#+\s+/, ''));
  }

  if (currentBlock.length > 0) {
    sections.push(currentBlock.join(' '));
  }

  // If document was short or didn't split well, use full content
  if (sections.length === 0) {
    sections.push(doc.content);
  }

  return sections.map((sectionText, index) => {
    const chunkId = `${doc.id}#chunk-${index}`;
    const searchableText = `${doc.title} (${doc.topic}, ${doc.tags.join(', ')}): ${sectionText}`;
    return {
      id: chunkId,
      docId: doc.id,
      topic: doc.topic,
      title: doc.title,
      tags: doc.tags,
      text: sectionText,
      searchableText,
    };
  });
}

/**
 * Splits all registered guide knowledge sources into structured chunks.
 */
export function chunkAllKnowledgeDocs(
  docs: readonly GuideKnowledgeSource[],
): GuideKnowledgeChunk[] {
  return docs.flatMap((doc) => chunkKnowledgeDoc(doc));
}
