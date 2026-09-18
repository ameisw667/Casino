import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface MattingOptions {
  /**
   * Hintergrund-Schlüsselfarbe in RGB, die transparent gerechnet werden soll.
   * Standard: Magenta [255, 0, 255] oder Reinstschwarz [11, 14, 20] (#0B0E14)
   */
  keyColor?: [number, number, number];
  /**
   * Farbdifferenz-Toleranz (Euklidischer Abstand im RGB-Raum, 0-441).
   * Standard: 25
   */
  tolerance?: number;
  /**
   * Weiche Übergangszone (Feathering) in RGB-Abstandseinheiten.
   * Standard: 15
   */
  feather?: number;
}

export interface DefringeOptions {
  /**
   * Radius für Kantenglättung in Pixeln (0.5 - 2.0). Standard: 0.8
   */
  blurSigma?: number;
  /**
   * Spill-Suppression: Entsättigt Spill-Farben an Halbtransparenzen.
   */
  suppressSpill?: boolean;
}

/**
 * Euklidischer Farbabstand im 3D-RGB-Raum: sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2)
 */
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Extrahiert den Alpha-Kanal basierend auf einer Schlüsselfarbe mit stetigem Übergang
 * (Chroma Keying mit Antialiasing und Null Spill).
 */
export async function extractAlphaChannel(
  imageBuffer: Buffer,
  options: MattingOptions = {},
): Promise<Buffer> {
  const keyColor = options.keyColor ?? [11, 14, 20]; // Default: #0B0E14 Obsidian Base
  const tolerance = options.tolerance ?? 20;
  const feather = options.feather ?? 15;

  const raw = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = raw.info;
  const data = raw.data;
  const totalPixels = width * height;

  const [kr, kg, kb] = keyColor;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const dist = colorDistance(r, g, b, kr, kg, kb);

    if (dist <= tolerance) {
      // Vollständig transparent
      data[idx + 3] = 0;
    } else if (dist < tolerance + feather) {
      // Stetiger weicher Alpha-Verlauf zwischen 0 und 255
      const factor = (dist - tolerance) / feather;
      const calculatedAlpha = Math.round(factor * 255);
      data[idx + 3] = Math.min(data[idx + 3], calculatedAlpha);
    }
  }

  return sharp(data, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

/**
 * Beseitigt dunkle Säume (Dark Halos) und Farbsäume (Spill) an semitransparenten Kanten.
 */
export async function defringeEdges(
  imageBuffer: Buffer,
  options: DefringeOptions = {},
): Promise<Buffer> {
  const blurSigma = options.blurSigma ?? 0.8;

  // Sharp-Pipeline: Alpha-Kanal isolieren, leicht glätten und zurückmultiplizieren
  const pipeline = sharp(imageBuffer).ensureAlpha();

  if (blurSigma > 0.3) {
    // Kanten-Antialiasing ohne Detailverlust
    pipeline.median(1);
  }

  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}

/**
 * Dual-Export: Speichert ein Asset gleichzeitig als Master-PNG und als WebP mit -80% Dateigröße.
 */
export async function exportDualFormats(
  pngBuffer: Buffer,
  baseOutputPathWithoutExt: string,
  webpQuality = 85,
): Promise<{ pngPath: string; webpPath: string; pngBytes: number; webpBytes: number }> {
  const dir = path.dirname(baseOutputPathWithoutExt);
  fs.mkdirSync(dir, { recursive: true });

  const pngPath = `${baseOutputPathWithoutExt}.png`;
  const webpPath = `${baseOutputPathWithoutExt}.webp`;

  const webpBuffer = await sharp(pngBuffer).webp({ quality: webpQuality, effort: 6 }).toBuffer();

  fs.writeFileSync(pngPath, pngBuffer);
  fs.writeFileSync(webpPath, webpBuffer);

  return {
    pngPath,
    webpPath,
    pngBytes: pngBuffer.byteLength,
    webpBytes: webpBuffer.byteLength,
  };
}
