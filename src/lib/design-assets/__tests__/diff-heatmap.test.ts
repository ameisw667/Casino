import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { createDiffHeatmap } from '../diff-heatmap';

describe('diff-heatmap verification', () => {
  it('reports 0 % mutation and returns identical for identical images', async () => {
    const img = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 4,
        background: { r: 100, g: 150, b: 200, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const diff = await createDiffHeatmap(img, img);
    expect(diff.identical).toBe(true);
    expect(diff.mutatedPixels).toBe(0);
    expect(diff.mutationRatePercent).toBe(0);
    expect(diff.heatmapBuffer).toBeInstanceOf(Buffer);
  });

  it('accurately highlights changed pixels in red', async () => {
    const width = 100;
    const height = 100;

    const imgA = await sharp({
      create: { width, height, channels: 4, background: { r: 10, g: 14, b: 20, alpha: 1 } },
    })
      .png()
      .toBuffer();

    // In imgB, change a 20x20 area in the center to white
    const svgB = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="rgb(10,14,20)" />
        <rect x="40" y="40" width="20" height="20" fill="white" />
      </svg>
    `;
    const imgB = await sharp(Buffer.from(svgB)).png().toBuffer();

    const diff = await createDiffHeatmap(imgA, imgB, 5);
    expect(diff.identical).toBe(false);
    expect(diff.mutatedPixels).toBe(400); // 20 * 20
    expect(diff.mutationRatePercent).toBe(4); // 400 / 10000 = 4%

    // Check that mutated pixels in the heatmap are highlighted red [239, 68, 68]
    const rawHeatmap = await sharp(diff.heatmapBuffer).raw().toBuffer({ resolveWithObject: true });
    const centerIdx = (50 * width + 50) * 4;
    expect(rawHeatmap.data[centerIdx]).toBe(239);
    expect(rawHeatmap.data[centerIdx + 1]).toBe(68);
    expect(rawHeatmap.data[centerIdx + 2]).toBe(68);
  });
});
