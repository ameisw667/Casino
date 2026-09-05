/**
 * Naming-Konvention (Best Practice: chronologisch sortierbar, kollisionsfrei, kein Overwrite):
 *   <yyyy-mm-dd>_<name>_v<3-stellige Versionsnummer>.png
 * Beispiel: 2026-08-31_hero-bg-crash_v001.png
 */
export function buildAssetFileName(
  name: string,
  date: Date,
  version: number,
  extension = 'png',
): string {
  const datePrefix = formatDate(date);
  const versionSuffix = String(version).padStart(3, '0');
  return `${datePrefix}_${name}_v${versionSuffix}.${extension}`;
}

export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ermittelt die nächste freie Versionsnummer für `name`, basierend auf bereits vorhandenen
 * Dateinamen im Zielordner. Verhindert, dass ein erneuter Lauf ein bestehendes Asset überschreibt.
 */
export function nextVersionFor(name: string, existingFileNames: readonly string[]): number {
  const pattern = new RegExp(`^\\d{4}-\\d{2}-\\d{2}_${escapeRegExp(name)}_v(\\d{3})\\.[a-z0-9]+$`);
  const usedVersions = existingFileNames
    .map((fileName) => fileName.match(pattern)?.[1])
    .filter((match): match is string => match !== undefined)
    .map((match) => Number.parseInt(match, 10));
  if (usedVersions.length === 0) return 1;
  return Math.max(...usedVersions) + 1;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
