// Fassade (03a-R04): öffentliche API des guide-knowledge-Moduls.
// Reine Re-Exports — keine neuen Exporte, keine Umbenennung. `registry.ts`
// bündelt bereits matcher/hybrid-retriever/chunker/vector-math/vector-store;
// diese Datei ergänzt Schema-Verträge und die pgvector-Admin-API.
// Tiefen-Importe bestehender Konsumierender bleiben erlaubt (additive Fassade).
export * from './registry';
export {
  guideKnowledgeSourceIds,
  guideKnowledgeSourceSchema,
  guideKnowledgeRegistrySchema,
  guideKnowledgeTopics,
} from './schema';
export type { GuideKnowledgeSource, GuideKnowledgeSourceId, GuideKnowledgeTopic } from './schema';
export {
  listAdminGuideDocuments,
  upsertAdminGuideDocument,
  deleteAdminGuideDocument,
  searchDatabaseDocuments,
  generateOpenAiEmbedding1536,
} from './pgvector-store';
export type { DbGuideDocument, MatchedDbDocument } from './pgvector-store';
