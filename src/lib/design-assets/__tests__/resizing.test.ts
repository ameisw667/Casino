import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { generateMipmaps, createSilhouette, checkZeroClipping } from '../resizing';

describe('resizing & legibility tooling', () => {
  it('generates Lanczos3 mipmaps for all standard sizes', async () => {
    const input = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 212, g: 175, b: 55, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const mipmaps = await generateMipmaps(input, [16, 32, 64]);
    expect(mipmaps).toHaveLength(3);

    expect(mipmaps[0].size).toBe(16);
    const meta16 = await sharp(mipmaps[0].buffer).metadata();
    expect(meta16.width).toBe(16);
    expect(meta16.height).toBe(16);

    expect(mipmaps[1].size).toBe(32);
    const meta32 = await sharp(mipmaps[1].buffer).metadata();
    expect(meta32.width).toBe(32);

    expect(mipmaps[2].size).toBe(64);
    const meta64 = await sharp(mipmaps[2].buffer).metadata();
    expect(meta64.width).toBe(64);
  });

  it('creates binary silhouette for 32px legibility check', async () => {
    const svg = `
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="30" fill="rgb(212,175,55)" />
      </svg>
    `;
    const input = await sharp(Buffer.from(svg)).png().toBuffer();

    const silhouette = await createSilhouette(input, 32);
    const meta = await sharp(silhouette).metadata();

    expect(meta.width).toBe(32);
    expect(meta.height).toBe(32);
  });

  it('detects edge clipping when subject extends to the image border', async () => {
    const width = 100;
    const height = 100;

    // 1. Safe image with 15px margin
    const safeSvg = `
      <svg width="${width}" height="${height}">
        <rect x="20" y="20" width="60" height="60" fill="gold" />
      </svg>
    `;
    const safeImg = await sharp(Buffer.from(safeSvg)).png().toBuffer();
    const safeCheck = await checkZeroClipping(safeImg, 10);
    expect(safeCheck.passed).toBe(true);
    expect(safeCheck.hasClipping).toBe(false);

    // 2. Clipped image touching border (x=0)
    const clippedSvg = `
      <svg width="${width}" height="${height}">
        <rect x="0" y="20" width="80" height="60" fill="gold" />
      </svg>
    `;
    const clippedImg = await sharp(Buffer.from(clippedSvg)).png().toBuffer();
    const clippedCheck = await checkZeroClipping(clippedImg, 10);
    expect(clippedCheck.passed).toBe(false);
    expect(clippedCheck.hasClipping).toBe(true);
    expect(clippedCheck.clippingPixelsCount).toBeGreaterThan(0);
  });
});
