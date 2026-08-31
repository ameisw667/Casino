import { getKnowledgeDocById } from './registry';
import type { GuideKnowledgeSource } from './schema';

export const gamesGuideKnowledge: GuideKnowledgeSource = getKnowledgeDocById('guide-blackjack') ?? {
  id: 'guide-blackjack',
  version: '2026-08-21',
  topic: 'games',
  title: 'Blackjack Rules and Actions',
  tags: ['blackjack'],
  owner: 'product',
  reviewedAt: '2026-08-21',
  status: 'active',
  content: 'Blackjack rules',
};
