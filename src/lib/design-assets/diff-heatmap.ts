import sharp from 'sharp';

export interface DiffHeatmapResult {
  heatmapBuffer: Buffer;
  totalPixels: number;
  mutatedPixels: number;
  mutationRatePercent: number;
  identical: boolean;
}

/**
 * Erzeugt ein optisches Differenz-Heatmap-Bild:
 * - Identische Pixel: gedimmt auf 20 % Helligkeit (Obsidian-Kontext)
 * - Verändertes Bild / Mutierte Pixel: leuchtendes Neon-Rot (#EF4444) oder Gold (#D4AF37)
 * Ermöglicht Jan und Reviewern in 1 Sekunde zu sehen, wo Edits stattfanden.
 */
export async function createDiffHeatmap(
  imageABuffer: Buffer,
  imageBBuffer: Buffer,
  tolerance = 10,
): Promise<DiffHeatmapResult> {
  const [rawA, rawB] = await Promise.all([
    sharp(imageABuffer).raw().toBuffer({ resolveWithObject: true }),
    sharp(imageBBuffer).raw().toBuffer({ resolveWithObject: true }),
  ]);

  const { width, height, channels } = rawA.info;
  const totalPixels = width * height;

  const outData = Buffer.alloc(totalPixels * 4); // RGBA
  let mutatedPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    const idxA = i * channels;
    const idxB = i * rawB.info.channels;
    const outIdx = i * 4;

    const rA = rawA.data[idxA];
    const gA = rawA.data[idxA + 1];
    const bA = rawA.data[idxA + 2];

    const rB = rawB.data[idxB];
    const gB = rawB.data[idxB + 1];
    const bB = rawB.data[idxB + 2];

    const diff = Math.abs(rA - rB) + Math.abs(gA - gB) + Math.abs(bA - bB);

    if (diff > tolerance * 3) {
      mutatedPixels++;
      // Mutierter Bereich: Knalliges Rot (#EF4444)
      outData[outIdx] = 239;
      outData[outIdx + 1] = 68;
      outData[outIdx + 2] = 68;
      outData[outIdx + 3] = 255;
    } else {
      // Unveränderter Bereich: Gedimmtes Original (30 % Helligkeit)
      outData[outIdx] = Math.round(rA * 0.3);
      outData[outIdx + 1] = Math.round(gA * 0.3);
      outData[outIdx + 2] = Math.round(bA * 0.3);
      outData[outIdx + 3] = 255;
    }
  }

  const heatmapBuffer = await sharp(outData, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  const mutationRatePercent = (mutatedPixels / totalPixels) * 100;

  return {
    heatmapBuffer,
    totalPixels,
    mutatedPixels,
    mutationRatePercent,
    identical: mutatedPixels === 0,
  };
}
