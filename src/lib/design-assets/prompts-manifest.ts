import { z } from 'zod';
import type { AssetCategory, ImageSize, PromptEntry } from './types';
import { nextVersionFor } from './naming';

export const ASSET_CATEGORIES: readonly AssetCategory[] = [
  'hero',
  'icon',
  'badge',
  'background',
  'avatar',
  'ui',
];

const promptEntrySchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'name muss kebab-case sein, z.B. "hero-bg-crash"'),
  prompt: z.string().min(3, 'prompt ist zu kurz'),
  size: z.enum(['1024x1024', '1536x1024', '1024x1536', '1792x1024', '1024x1792']).optional(),
  quality: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['hero', 'icon', 'badge', 'background', 'avatar', 'ui']).optional(),
  background: z.enum(['transparent', 'opaque', 'auto']).optional(),
  tags: z.array(z.string().min(1)).optional(),
  variables: z.record(z.string(), z.string()).optional(),
  negativePrompt: z.string().min(3).optional(),
});

const promptManifestSchema = z.array(promptEntrySchema).min(1, 'Manifest darf nicht leer sein');

export interface ManifestParseResult {
  entries: PromptEntry[];
  duplicateNames: string[];
}

export interface ManifestDiffItem {
  name: string;
  category?: AssetCategory;
  size: ImageSize;
  targetVersion: string;
  isNew: boolean;
}

export interface ManifestDiffResult {
  totalCount: number;
  newCount: number;
  updateCount: number;
  items: ManifestDiffItem[];
}

/**
 * Validiert eine rohe Manifest-Struktur. Trennt Daten (Prompts) strikt
 * von Code und validiert Kategorien, Tags und Template-Strukturen.
 */
export function parsePromptManifest(raw: unknown): ManifestParseResult {
  const entries = promptManifestSchema.parse(raw);
  const seen = new Set<string>();
  const duplicateNames: string[] = [];
  for (const entry of entries) {
    if (seen.has(entry.name)) duplicateNames.push(entry.name);
    seen.add(entry.name);
  }
  if (duplicateNames.length > 0) {
    throw new Error(`Doppelte Asset-Namen im Manifest gefunden: ${duplicateNames.join(', ')}`);
  }
  return { entries, duplicateNames };
}

/**
 * Ersetzt `{{variable}}`-Platzhalter im Prompt durch bereitgestellte Werte.
 */
export function interpolatePrompt(
  template: string,
  variables: Record<string, string> = {},
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? variables[varName] : match;
  });
}

/**
 * Prüft, ob nach der Interpolation noch unersetzte `{{placeholder}}` im Text verblieben sind.
 */
export function findMissingTemplateVariables(
  template: string,
  variables: Record<string, string> = {},
): string[] {
  const matches = template.matchAll(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g);
  const missing: string[] = [];
  for (const match of matches) {
    const varName = match[1];
    if (variables[varName] === undefined && !missing.includes(varName)) {
      missing.push(varName);
    }
  }
  return missing;
}

/**
 * Analysiert den Bestand gegenüber dem Manifest: Zeigt, welche Assets neu angelegt
 * werden vs. welche eine Folgeversion (`v002`, `v003`) erhalten.
 */
export function analyzeManifestDiff(
  entries: readonly PromptEntry[],
  existingFileNames: readonly string[],
): ManifestDiffResult {
  const items: ManifestDiffItem[] = entries.map((entry) => {
    const nextVer = nextVersionFor(entry.name, existingFileNames);
    const isNew = nextVer === 1;
    return {
      name: entry.name,
      category: entry.category,
      size: entry.size ?? '1024x1024',
      targetVersion: `v${String(nextVer).padStart(3, '0')}`,
      isNew,
    };
  });

  const newCount = items.filter((i) => i.isNew).length;
  const updateCount = items.filter((i) => !i.isNew).length;

  return {
    totalCount: items.length,
    newCount,
    updateCount,
    items,
  };
}
