import { z } from 'zod';

const designAssetsEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY fehlt oder ist leer'),
  DESIGN_ASSETS_MAX_SPEND_USD: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? 5 : Number(value)))
    .pipe(z.number().positive('DESIGN_ASSETS_MAX_SPEND_USD muss > 0 sein')),
  DESIGN_ASSETS_MONTHLY_BUDGET_USD: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? 20 : Number(value)))
    .pipe(z.number().positive('DESIGN_ASSETS_MONTHLY_BUDGET_USD muss > 0 sein')),
  DESIGN_ASSETS_EST_COST_PER_IMAGE_USD: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? 0.25 : Number(value)))
    .pipe(z.number().positive('DESIGN_ASSETS_EST_COST_PER_IMAGE_USD muss > 0 sein')),
});

export type DesignAssetsEnv = z.infer<typeof designAssetsEnvSchema>;

/**
 * Lädt und validiert die für die Bildgenerierung nötigen Env-Variablen.
 * Wirft bei fehlendem/ungültigem Key sofort (fail-fast) statt erst beim API-Call.
 */
export function loadDesignAssetsEnv(
  source: Record<string, string | undefined> = process.env,
): DesignAssetsEnv {
  const parsed = designAssetsEnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Ungültige Design-Assets-Konfiguration:\n${issues}`);
  }
  return parsed.data;
}

/** Verhindert, dass der Key jemals versehentlich in Logs/Fehlermeldungen landet. */
export function redactApiKey(value: string): string {
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
}
