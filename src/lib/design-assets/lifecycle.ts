import fs from 'fs';
import path from 'path';
import type { AssetIndex, AssetIndexEntry } from './asset-index';
import { computeSha256 } from './storage';
import { SIZE_DIMENSIONS } from './client';

export interface VersionInfo {
  version: number;
  fileName: string;
  date: string;
  fullPath?: string;
  isActive?: boolean;
}

/**
 * Parst einen Asset-Dateinamen in seine Komponenten:
 * `2026-09-02_hero-bg-crash_v001.png`
 */
export function parseAssetFileName(fileName: string): {
  date: string;
  name: string;
  version: number;
  extension: string;
} | null {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})_([a-z0-9-]+)_v(\d{3})\.([a-z0-9]+)$/);
  if (!match) return null;

  return {
    date: match[1],
    name: match[2],
    version: Number.parseInt(match[3], 10),
    extension: match[4],
  };
}

/**
 * Listet alle vorhandenen Versionen für ein bestimmtes Asset chronologisch auf (neueste zuerst).
 */
export function listAssetVersions(
  name: string,
  existingFileNames: readonly string[],
  activeIndex?: Readonly<AssetIndex>,
): VersionInfo[] {
  const versions: VersionInfo[] = [];
  const activePath = activeIndex?.[name]?.path;

  for (const file of existingFileNames) {
    const parsed = parseAssetFileName(file);
    if (parsed && parsed.name === name) {
      const isActive = activePath?.endsWith(file) ?? false;
      versions.push({
        version: parsed.version,
        fileName: file,
        date: parsed.date,
        isActive,
      });
    }
  }

  return versions.sort((a, b) => b.version - a.version);
}

/**
 * Identifiziert veraltete Versionen, die über die `keepCount`-neuesten Versionen hinausgehen.
 * Schützt die aktive Version im Index zwingend vor Archivierung.
 */
export function findObsoleteVersions(
  name: string,
  existingFileNames: readonly string[],
  keepCount = 3,
  activeIndex?: Readonly<AssetIndex>,
): string[] {
  const allVersions = listAssetVersions(name, existingFileNames, activeIndex);
  if (allVersions.length <= keepCount) {
    return [];
  }

  const activePath = activeIndex?.[name]?.path;

  return allVersions
    .slice(keepCount)
    .filter((v) => !activePath?.endsWith(v.fileName)) // Aktive Version darf niemals archiviert werden
    .map((v) => v.fileName);
}

/**
 * Führt einen Zero-Cost-Rollback im Asset-Index auf eine vorherige Version durch.
 * Berechnet Integritäts-Metadaten (SHA-256, Bytes) neu und stellt vollständige Daten bereit.
 */
export function rollbackAssetIndexEntry(
  index: Readonly<AssetIndex>,
  name: string,
  targetVersion: number,
  existingFileNames: readonly string[],
  outputDir?: string,
  now = new Date(),
): AssetIndex {
  const versions = listAssetVersions(name, existingFileNames);
  const target = versions.find((v) => v.version === targetVersion);

  if (!target) {
    throw new Error(
      `Rollback fehlgeschlagen: Version v${String(targetVersion).padStart(3, '0')} für "${name}" existiert nicht.`,
    );
  }

  const existingEntry: AssetIndexEntry | undefined = index[name];
  let sha256 = existingEntry?.sha256;
  let bytes = existingEntry?.bytes;

  // Wenn Verzeichnis vorhanden, re-hashen für exakte Integrität
  if (outputDir) {
    const fullPath = path.join(outputDir, target.fileName);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      sha256 = computeSha256(buf);
      bytes = buf.length;
    }
  }

  const size = existingEntry?.size ?? '1024x1024';
  const dims = SIZE_DIMENSIONS[size] ?? { width: 1024, height: 1024, aspectRatio: '1/1' };

  const updatedEntry: AssetIndexEntry = {
    name,
    path: `/generated/design-assets/${target.fileName}`,
    version: `v${String(targetVersion).padStart(3, '0')}`,
    updatedAt: now.toISOString(),
    size,
    width: dims.width,
    height: dims.height,
    aspectRatio: dims.aspectRatio,
    category: existingEntry?.category,
    alt: existingEntry?.alt ?? `${name} asset`,
    sha256,
    bytes,
  };

  return {
    ...index,
    [name]: updatedEntry,
  };
}

/**
 * Archiviert eine veraltete Version sicher in einen Archiv-Ordner (kein destruktives Löschen).
 */
export function archiveAssetFile(
  sourcePath: string,
  archiveDir: string,
): { archivedPath: string; fileName: string } {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Archivierung fehlgeschlagen: Datei existiert nicht ("${sourcePath}").`);
  }

  fs.mkdirSync(archiveDir, { recursive: true });
  const fileName = path.basename(sourcePath);
  const archivedPath = path.join(archiveDir, fileName);

  fs.renameSync(sourcePath, archivedPath);

  return {
    archivedPath,
    fileName,
  };
}
