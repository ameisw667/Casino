import { commandsGuideKnowledge } from './commands';
import { gamesGuideKnowledge } from './games';
import { navigationGuideKnowledge } from './navigation';
import type { GuideKnowledgeSource } from './schema';

export const GUIDE_KNOWLEDGE_SOURCES: readonly GuideKnowledgeSource[] = [
  gamesGuideKnowledge,
  navigationGuideKnowledge,
  commandsGuideKnowledge,
];
