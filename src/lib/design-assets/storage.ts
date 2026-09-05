import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface StorageWriteResult {
  bytes: number;
  sha256: string;
}

export interface IntegrityVerificationResult {
  valid: boolean;
  actualSha256: string;
  bytes: number;
}

/**
 * Berechnet die hexadezimale SHA-256-Prüfsumme eines Datenpuffers.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Schreibt eine Bilddatei atomar auf die Festplatte (Atomic Write):
 * 1. Schreibt in eine temporäre Datei im selben Verzeichnis (.tmp.<rnd>)
 * 2. Berechnet die SHA-256-Prüfsumme
 * 3. Benennt die Datei atomar in den finalen Zielpfad um
 * 4. Verhindert unvollständige Dateien bei plötzlichem Prozessabbruch
 */
export function writeAssetAtomically(finalPath: string, buffer: Buffer): StorageWriteResult {
  if (buffer.length === 0) {
    throw new Error(`Ungültige Bilddaten: Puffer für "${finalPath}" ist leer (0 Bytes).`);
  }

  const dir = path.dirname(finalPath);
  fs.mkdirSync(dir, { recursive: true });

  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const tempPath = `${finalPath}.tmp.${Date.now()}.${randomSuffix}`;

  try {
    fs.writeFileSync(tempPath, buffer);
    const sha256 = computeSha256(buffer);

    // Atomares Umbenennen (POSIX- und Windows-konform auf demselben Dateisystem)
    fs.renameSync(tempPath, finalPath);

    return {
      bytes: buffer.length,
      sha256,
    };
  } catch (error) {
    // Defensives Aufräumen der temporären Datei im Fehlerfall
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // Ignorieren, falls Löschen fehlschlägt
      }
    }
    throw error;
  }
}

/**
 * Schreibt ein JSON-Objekt atomar auf die Festplatte.
 */
export function atomicWriteJsonSync(filePath: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  writeAssetAtomically(filePath, Buffer.from(json, 'utf8'));
}

/**
 * Verifiziert die Dateiintegrität anhand der Dateigröße und optionalen SHA-256-Prüfsumme.
 */
export function verifyAssetIntegrity(
  filePath: string,
  expectedSha256?: string,
): IntegrityVerificationResult {
  if (!fs.existsSync(filePath)) {
    return { valid: false, actualSha256: '', bytes: 0 };
  }

  const content = fs.readFileSync(filePath);
  const actualSha256 = computeSha256(content);
  const valid = expectedSha256 ? actualSha256 === expectedSha256 : content.length > 0;

  return {
    valid,
    actualSha256,
    bytes: content.length,
  };
}
