import { z } from 'zod';

export const guideKnowledgeSourceIds = [
  'guide-blackjack',
  'guide-crash',
  'guide-dice',
  'guide-roulette',
  'guide-slots',
  'guide-navigation',
  'guide-commands',
  'guide-vip',
  'guide-fairness',
  'guide-limits',
] as const;

export type GuideKnowledgeSourceId = (typeof guideKnowledgeSourceIds)[number];

export const guideKnowledgeTopics = ['games', 'navigation', 'commands', 'economy'] as const;
export type GuideKnowledgeTopic = (typeof guideKnowledgeTopics)[number];

export const guideKnowledgeSourceSchema = z.object({
  id: z.enum(guideKnowledgeSourceIds),
  version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topic: z.enum(guideKnowledgeTopics),
  title: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).min(1),
  owner: z.literal('product'),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.literal('active'),
  content: z.string().trim().min(1),
});

export const guideKnowledgeRegistrySchema = z
  .array(guideKnowledgeSourceSchema)
  .min(1)
  .superRefine((sources, context) => {
    const seenIds = new Set<string>();
    for (const [index, source] of sources.entries()) {
      if (seenIds.has(source.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate source id ${source.id} at index ${index}`,
          path: [index, 'id'],
        });
      }
      seenIds.add(source.id);
    }

    const versions = new Set(sources.map((source) => source.version));
    if (versions.size > 1) {
      context.addIssue({
        code: 'custom',
        message: 'All guide knowledge sources must use the same version',
      });
    }
  });

export type GuideKnowledgeSource = z.infer<typeof guideKnowledgeSourceSchema>;
