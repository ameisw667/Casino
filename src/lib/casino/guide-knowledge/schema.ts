import { z } from 'zod';

const guideKnowledgeSourceIds = ['guide-games', 'guide-navigation', 'guide-commands'] as const;

export const guideKnowledgeSourceSchema = z.object({
  id: z.enum(guideKnowledgeSourceIds),
  version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topic: z.enum(['games', 'navigation', 'commands']),
  owner: z.literal('product'),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.literal('active'),
  content: z.string().trim().min(1),
});

export const guideKnowledgeRegistrySchema = z
  .array(guideKnowledgeSourceSchema)
  .length(guideKnowledgeSourceIds.length)
  .superRefine((sources, context) => {
    for (const [index, expectedId] of guideKnowledgeSourceIds.entries()) {
      const source = sources[index];
      if (source?.id !== expectedId) {
        context.addIssue({
          code: 'custom',
          message: `Expected ${expectedId} at registry position ${index}`,
          path: [index, 'id'],
        });
      }
    }

    const versions = new Set(sources.map((source) => source.version));
    if (versions.size !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'All guide knowledge sources must use the same version',
      });
    }
  });

export type GuideKnowledgeSource = z.infer<typeof guideKnowledgeSourceSchema>;
