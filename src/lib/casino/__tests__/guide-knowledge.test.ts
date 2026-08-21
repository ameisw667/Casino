import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '../guide-knowledge/parser';
import {
  GUIDE_KNOWLEDGE_SOURCES,
  getKnowledgeDocById,
  getKnowledgeDocsByTag,
  getKnowledgeDocsByTopic,
} from '../guide-knowledge/registry';
import {
  guideKnowledgeRegistrySchema,
  guideKnowledgeSourceSchema,
} from '../guide-knowledge/schema';

describe('Guide Knowledge Parser', () => {
  it('parses valid YAML frontmatter with inline array', () => {
    const raw = `---
id: guide-blackjack
version: 2026-08-21
topic: games
title: Blackjack Rules
tags: [blackjack, cards, 21]
owner: product
reviewedAt: 2026-08-21
status: active
---
# Content here
Line 2`;

    const { frontmatter, content } = parseFrontmatter(raw);
    expect(frontmatter.id).toBe('guide-blackjack');
    expect(frontmatter.version).toBe('2026-08-21');
    expect(frontmatter.topic).toBe('games');
    expect(frontmatter.title).toBe('Blackjack Rules');
    expect(frontmatter.tags).toEqual(['blackjack', 'cards', '21']);
    expect(frontmatter.owner).toBe('product');
    expect(content).toBe('# Content here\nLine 2');
  });

  it('parses YAML list items with hyphen syntax', () => {
    const raw = `---
id: guide-crash
version: 2026-08-21
topic: games
title: Crash Multiplier
tags:
  - crash
  - multiplier
  - rocket
owner: product
reviewedAt: 2026-08-21
status: active
---
Body text`;

    const { frontmatter, content } = parseFrontmatter(raw);
    expect(frontmatter.tags).toEqual(['crash', 'multiplier', 'rocket']);
    expect(content).toBe('Body text');
  });

  it('returns raw text as content when no frontmatter delimiters exist', () => {
    const raw = 'Just plain markdown without frontmatter.';
    const { frontmatter, content } = parseFrontmatter(raw);
    expect(frontmatter).toEqual({});
    expect(content).toBe(raw);
  });

  it('handles unclosed frontmatter gracefully', () => {
    const raw = `---
id: broken
version: 2026-08-21
topic: games`;
    const { frontmatter, content } = parseFrontmatter(raw);
    expect(frontmatter).toEqual({});
    expect(content).toBe(raw);
  });
});

describe('Guide Knowledge Schema and Registry', () => {
  it('loads all 10 registered knowledge documents with valid schema and matching version', () => {
    expect(GUIDE_KNOWLEDGE_SOURCES).toHaveLength(10);

    const version = GUIDE_KNOWLEDGE_SOURCES[0]?.version;
    expect(version).toBe('2026-08-21');

    for (const doc of GUIDE_KNOWLEDGE_SOURCES) {
      expect(doc.version).toBe(version);
      expect(doc.owner).toBe('product');
      expect(doc.status).toBe('active');
      expect(doc.tags.length).toBeGreaterThan(0);
      expect(doc.content.trim().length).toBeGreaterThan(10);
      expect(guideKnowledgeSourceSchema.safeParse(doc).success).toBe(true);
    }
  });

  it('validates the entire registry via guideKnowledgeRegistrySchema', () => {
    const result = guideKnowledgeRegistrySchema.safeParse(GUIDE_KNOWLEDGE_SOURCES);
    expect(result.success).toBe(true);
  });

  it('rejects registry with duplicate IDs', () => {
    const duplicates = [...GUIDE_KNOWLEDGE_SOURCES, GUIDE_KNOWLEDGE_SOURCES[0]!];
    const result = guideKnowledgeRegistrySchema.safeParse(duplicates);
    expect(result.success).toBe(false);
  });

  it('rejects registry with mismatched versions', () => {
    const mismatched = GUIDE_KNOWLEDGE_SOURCES.map((doc, idx) =>
      idx === 0 ? { ...doc, version: '2026-01-01' } : doc,
    );
    const result = guideKnowledgeRegistrySchema.safeParse(mismatched);
    expect(result.success).toBe(false);
  });

  it('finds document by id using getKnowledgeDocById', () => {
    const doc = getKnowledgeDocById('guide-blackjack');
    expect(doc).toBeDefined();
    expect(doc?.id).toBe('guide-blackjack');
    expect(doc?.title).toBe('Blackjack Rules and Actions');
  });

  it('returns undefined for non-existent document ID', () => {
    const doc = getKnowledgeDocById('guide-unknown');
    expect(doc).toBeUndefined();
  });

  it('filters documents by topic using getKnowledgeDocsByTopic', () => {
    const gamesDocs = getKnowledgeDocsByTopic('games');
    expect(gamesDocs).toHaveLength(5);
    const topics = new Set(gamesDocs.map((d) => d.topic));
    expect(topics).toEqual(new Set(['games']));

    const economyDocs = getKnowledgeDocsByTopic('economy');
    expect(economyDocs).toHaveLength(3);
  });

  it('filters documents by tag using getKnowledgeDocsByTag', () => {
    const cardDocs = getKnowledgeDocsByTag('cards');
    expect(cardDocs.some((d) => d.id === 'guide-blackjack')).toBe(true);

    const provablyFairDocs = getKnowledgeDocsByTag('provably-fair');
    expect(provablyFairDocs.length).toBeGreaterThanOrEqual(2);
  });
});
