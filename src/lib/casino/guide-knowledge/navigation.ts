import { getKnowledgeDocById } from './registry';
import type { GuideKnowledgeSource } from './schema';

export const navigationGuideKnowledge: GuideKnowledgeSource =
  getKnowledgeDocById('guide-navigation') ?? {
    id: 'guide-navigation',
    version: '2026-08-21',
    topic: 'navigation',
    title: 'Platform Navigation and Routes',
    tags: ['navigation'],
    owner: 'product',
    reviewedAt: '2026-08-21',
    status: 'active',
    content: 'Navigation routes',
  };
