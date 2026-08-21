import { getKnowledgeDocById } from './registry';
import type { GuideKnowledgeSource } from './schema';

export const commandsGuideKnowledge: GuideKnowledgeSource =
  getKnowledgeDocById('guide-commands') ?? {
    id: 'guide-commands',
    version: '2026-08-21',
    topic: 'commands',
    title: 'Chat Commands and Shortcuts',
    tags: ['commands'],
    owner: 'product',
    reviewedAt: '2026-08-21',
    status: 'active',
    content: 'Chat commands',
  };
