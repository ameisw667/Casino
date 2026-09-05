import type { AssetCategory, ImageBackground } from './types';

/**
 * Kern-Farb- und Vibe-Tokens aus dem Casino Design System (xx_sop/04_design_system_ui.md).
 */
export const OBSIDIAN_BASE_COLOR = '#0B0E14';
export const GOLD_ACCENT_COLOR = '#D4AF37';

export const GLOBAL_EXCLUSIONS: readonly string[] = [
  'text',
  'typography',
  'watermark',
  'signature',
  'logo',
  'blurry',
  'distorted',
  'jpeg artifacts',
  'flat 2d cartoon',
  'neon rainbow',
];

export const CATEGORY_EXCLUSIONS: Record<AssetCategory, readonly string[]> = {
  hero: ['cropped edges', 'isolated sticker', 'low detail background'],
  icon: ['busy background', 'cluttered scenery', 'characters', 'multiple objects'],
  badge: ['photorealistic face', 'plain rectangle', 'cartoonish shading'],
  background: ['centered focal object', 'high-contrast distracting shapes', 'figures'],
  avatar: ['full body shot', 'cut off crown', 'low contrast'],
  ui: ['complex realism', 'cluttered 3d scene'],
};

export const CATEGORY_STYLE_PRESETS: Record<AssetCategory, string> = {
  hero: 'cinematic widescreen framing, atmospheric volumetric gold dust, obsidian smoke depth, dramatic chiaroscuro lighting with safe zones for UI overlays',
  icon: '3D game asset render, isolated floating object, clean silhouette, obsidian glass core with metallic gold beveled edges (#D4AF37), dramatic studio rim light',
  badge:
    'luxury VIP crest emblem, faceted gemstone inlays, polished gold filigree (#D4AF37), obsidian plate backdrop, high jewelry craftsmanship',
  background:
    'seamless ambient texture, soft golden bokeh lights (#D4AF37), deep dark obsidian slate gradient (#0B0E14), subtle luxury depth',
  avatar:
    'character bust portrait, dark obsidian backdrop, dramatic gold chiaroscuro side lighting, premium VIP aesthetic',
  ui: 'sleek frosted glass card surface with 12px optical blur, subtle 1px gold border illumination (#D4AF37), clean geometric lines',
};

const OBSIDIAN_GOLD_MATERIAL_SUFFIX =
  `luxurious warm metallic gold accents (${GOLD_ACCENT_COLOR}, radiant champagne gold with polished brass reflections and warm amber rim lighting), ` +
  'translucent frosted smoked glass surfaces with 12px optical blur and subtle internal refraction, ' +
  'cinematic premium casino atmosphere, high detail';

const OPAQUE_BACKGROUND_CLAUSE = `deep pitch-black obsidian slate background (${OBSIDIAN_BASE_COLOR}, ultra-dark charcoal tones with ambient depth)`;

const TRANSPARENT_BACKGROUND_CLAUSE =
  'isolated on a transparent background, no background scenery, no backdrop';

/**
 * Abwärtskompatibel: bisher immer der opake Hintergrund-Satz + Material-Suffix zusammen.
 */
export const OBSIDIAN_GOLD_STYLE_SUFFIX = `${OPAQUE_BACKGROUND_CLAUSE}, ${OBSIDIAN_GOLD_MATERIAL_SUFFIX}`;

/**
 * Baut den Material-Suffix passend zum gewünschten Hintergrund — verhindert den Widerspruch
 * "background: transparent" (API-Parameter) vs. "pitch-black background" (Prompt-Text), der bei
 * transparenten Icon-Assets zu unsauberen Alpha-Kanten führen kann.
 */
export function buildStyleSuffix(background?: ImageBackground): string {
  const backgroundClause =
    background === 'transparent' ? TRANSPARENT_BACKGROUND_CLAUSE : OPAQUE_BACKGROUND_CLAUSE;
  return `${backgroundClause}, ${OBSIDIAN_GOLD_MATERIAL_SUFFIX}`;
}

export interface ComposePromptParams {
  basePrompt: string;
  category?: AssetCategory;
  background?: ImageBackground;
  styleSuffixOverride?: string;
  exclusions?: string[];
}

/**
 * Kombiniert globale, kategoriespezifische und benutzerspezifische Ausschlüsse.
 */
export function buildExclusionString(
  category?: AssetCategory,
  customExclusions?: readonly string[],
): string {
  const combined = new Set<string>(GLOBAL_EXCLUSIONS);

  if (category && CATEGORY_EXCLUSIONS[category]) {
    for (const item of CATEGORY_EXCLUSIONS[category]) {
      combined.add(item);
    }
  }

  if (customExclusions) {
    for (const item of customExclusions) {
      if (item.trim().length > 0) combined.add(item.trim());
    }
  }

  return `no ${Array.from(combined).join(', no ')}`;
}

/**
 * Komponiert den finalen API-Prompt.
 * Unterstützt sowohl das neue Optionen-Objekt als auch die bewährte 2-String-Signatur (100 % abwärtskompatibel).
 */
export function composePrompt(
  input: string | ComposePromptParams,
  legacyStyleSuffix?: string,
): string {
  const params: ComposePromptParams =
    typeof input === 'string'
      ? { basePrompt: input, styleSuffixOverride: legacyStyleSuffix }
      : input;

  const trimmedBase = params.basePrompt.trim();
  if (trimmedBase.length === 0) {
    throw new Error('Prompt darf nicht leer sein.');
  }

  if (params.styleSuffixOverride) {
    return `${trimmedBase}, ${params.styleSuffixOverride}`;
  }

  const categoryPreset = params.category ? CATEGORY_STYLE_PRESETS[params.category] : undefined;
  const exclusionStr = buildExclusionString(params.category, params.exclusions);

  const parts: string[] = [trimmedBase];
  if (categoryPreset) parts.push(categoryPreset);
  parts.push(buildStyleSuffix(params.background));
  if (exclusionStr) parts.push(exclusionStr);

  return parts.join(', ');
}
