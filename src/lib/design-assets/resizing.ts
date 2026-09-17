import sharp from 'sharp';

export interface MipmapResult {
  size: number;
  buffer: Buffer;
  bytes: number;
}

export interface MarginCheckResult {
  hasClipping: boolean;
  marginPx: number;
  clippingPixelsCount: number;
  passed: boolean;
}

/**
 * Generiert Mipmap-Auflösungen mit hochwertigem Lanczos3-Resampling für maximale Schärfe.
 */
export async function generateMipmaps(
  imageBuffer: Buffer,
  sizes: number[] = [16, 32, 64, 128, 256, 512],
): Promise<MipmapResult[]> {
  const results: MipmapResult[] = [];

  for (const size of sizes) {
    const resized = await sharp(imageBuffer)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    results.push({
      size,
      buffer: resized,
      bytes: resized.byteLength,
    });
  }

  return results;
}

/**
 * Erzeugt eine Schwarz-Weiß-Silhouette zur Sichtprüfung der Kleinformat-Erkennbarkeit (16px / 32px).
 */
export async function createSilhouette(imageBuffer: Buffer, targetSize = 32): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(targetSize, targetSize, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .greyscale()
    .threshold(200)
    .png()
    .toBuffer();
}

/**
 * Zero-Clipping-Audit: Prüft, ob Pixeldaten den äußersten Rand des Bildes berühren.
 * Erfordert einen Sicherheitsabstand von mindestens `marginPx` Pixeln (Standard: 10px).
 */
export async function checkZeroClipping(
  imageBuffer: Buffer,
  marginPx = 10,
  alphaThreshold = 20,
): Promise<MarginCheckResult> {
  const raw = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = raw.info;
  const data = raw.data;

  let clippingPixelsCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Prüfe, ob (x, y) im Randbereich liegt
      const isMargin =
        x < marginPx || x >= width - marginPx || y < marginPx || y >= height - marginPx;

      if (isMargin) {
        const idx = (y * width + x) * channels;
        const alpha = data[idx + 3];
        if (alpha > alphaThreshold) {
          clippingPixelsCount++;
        }
      }
    }
  }

  return {
    hasClipping: clippingPixelsCount > 0,
    marginPx,
    clippingPixelsCount,
    passed: clippingPixelsCount === 0,
  };
}
