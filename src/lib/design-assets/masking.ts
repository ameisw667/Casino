import sharp from 'sharp';

export interface MaskBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MaskCircle {
  cx: number;
  cy: number;
  r: number;
}

export interface MaskRegion {
  type: 'box' | 'circle';
  box?: MaskBox;
  circle?: MaskCircle;
}

/**
 * Erzeugt eine Alpha-Maske im SVG-Format, die in Sharp als RGBA-PNG gerendert wird.
 * OpenAI-Regel:
 * - Transparent (alpha = 0): Bereich, der von der KI neu gezeichnet wird (Edit-Zone).
 * - Opaque (alpha = 255): Bereich, der zu 100 % geschützt bleibt (Safe-Zone).
 */
export async function createBoxMask(
  width: number,
  height: number,
  box: MaskBox,
  featherPx = 2,
): Promise<Buffer> {
  const clampedX = Math.max(0, Math.min(box.x, width));
  const clampedY = Math.max(0, Math.min(box.y, height));
  const clampedW = Math.max(1, Math.min(box.w, width - clampedX));
  const clampedH = Math.max(1, Math.min(box.h, height - clampedY));

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="edit-hole">
          <rect width="${width}" height="${height}" fill="white" />
          <rect x="${clampedX}" y="${clampedY}" width="${clampedW}" height="${clampedH}" rx="${featherPx}" fill="black" />
        </mask>
      </defs>
      <rect width="${width}" height="${height}" fill="black" mask="url(#edit-hole)" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Erzeugt eine kreisförmige Maske für punktuelle Änderungen (z. B. Chip-Center, Edelstein, Icon-Kern).
 */
export async function createCircleMask(
  width: number,
  height: number,
  circle: MaskCircle,
  featherPx = 2,
): Promise<Buffer> {
  const clampedR = Math.max(1, circle.r);

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="edit-circle-hole">
          <rect width="${width}" height="${height}" fill="white" />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${clampedR}" fill="black" />
        </mask>
      </defs>
      <rect width="${width}" height="${height}" fill="black" mask="url(#edit-circle-hole)" />
    </svg>
  `;

  const pipeline = sharp(Buffer.from(svg));
  if (featherPx > 0) {
    pipeline.blur(Math.max(0.3, featherPx * 0.5));
  }
  return pipeline.png().toBuffer();
}

/**
 * Validiert Bild und Maske für die OpenAI Inpainting API:
 * - Beide müssen quadratisch sein (z. B. 1024x1024, 512x512, 256x256)
 * - Beide müssen exakt dieselben Dimensionen besitzen
 * - Beide müssen unter 4 MB Dateigröße liegen
 */
export async function validateInpaintingInputs(
  imageBuffer: Buffer,
  maskBuffer?: Buffer,
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

  if (imageBuffer.byteLength > MAX_BYTES) {
    return {
      valid: false,
      error: `Bildgröße (${(imageBuffer.byteLength / 1024 / 1024).toFixed(2)} MB) überschreitet das OpenAI-Limit von 4 MB.`,
    };
  }

  const imgMeta = await sharp(imageBuffer).metadata();
  if (!imgMeta.width || !imgMeta.height) {
    return { valid: false, error: 'Bild-Metadaten konnten nicht gelesen werden.' };
  }

  if (imgMeta.width !== imgMeta.height) {
    return {
      valid: false,
      error: `Bild muss strikt quadratisch sein (aktuell: ${imgMeta.width}x${imgMeta.height}).`,
    };
  }

  if (maskBuffer) {
    if (maskBuffer.byteLength > MAX_BYTES) {
      return {
        valid: false,
        error: `Maskengröße (${(maskBuffer.byteLength / 1024 / 1024).toFixed(2)} MB) überschreitet das OpenAI-Limit von 4 MB.`,
      };
    }

    const maskMeta = await sharp(maskBuffer).metadata();
    if (maskMeta.width !== imgMeta.width || maskMeta.height !== imgMeta.height) {
      return {
        valid: false,
        error: `Dimensionen stimmen nicht überein: Bild hat ${imgMeta.width}x${imgMeta.height}, Maske hat ${maskMeta.width}x${maskMeta.height}.`,
      };
    }
  }

  return { valid: true, width: imgMeta.width, height: imgMeta.height };
}

/**
 * Berechnet die Pixel-Invarianz zwischen Original und Edit:
 * Zählt, ob Pixel in der opaken Safe-Zone (alpha > 200 in der Maske) versehentlich mutiert wurden.
 */
export async function auditMaskInvariance(
  originalBuffer: Buffer,
  editedBuffer: Buffer,
  maskBuffer: Buffer,
  tolerance = 5,
): Promise<{
  safeZoneTotalPixels: number;
  mutatedPixels: number;
  mutationRatePercent: number;
  passed: boolean;
}> {
  const [origRaw, editRaw, maskRaw] = await Promise.all([
    sharp(originalBuffer).raw().toBuffer({ resolveWithObject: true }),
    sharp(editedBuffer).raw().toBuffer({ resolveWithObject: true }),
    sharp(maskBuffer).raw().toBuffer({ resolveWithObject: true }),
  ]);

  const { width, height, channels: origChannels } = origRaw.info;
  const totalPixels = width * height;

  let safeZoneTotalPixels = 0;
  let mutatedPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    const maskIdx = i * maskRaw.info.channels;
    const maskAlpha =
      maskRaw.info.channels === 4 ? maskRaw.data[maskIdx + 3] : maskRaw.data[maskIdx];

    if (maskAlpha > 200) {
      safeZoneTotalPixels++;

      const origIdx = i * origChannels;
      const editIdx = i * editRaw.info.channels;

      const rDiff = Math.abs(origRaw.data[origIdx] - editRaw.data[editIdx]);
      const gDiff = Math.abs(origRaw.data[origIdx + 1] - editRaw.data[editIdx + 1]);
      const bDiff = Math.abs(origRaw.data[origIdx + 2] - editRaw.data[editIdx + 2]);

      if (rDiff > tolerance || gDiff > tolerance || bDiff > tolerance) {
        mutatedPixels++;
      }
    }
  }

  const mutationRatePercent =
    safeZoneTotalPixels > 0 ? (mutatedPixels / safeZoneTotalPixels) * 100 : 0;

  return {
    safeZoneTotalPixels,
    mutatedPixels,
    mutationRatePercent,
    passed: mutationRatePercent === 0,
  };
}
