/**
 * Client-side Image Compression & Resizing Engine
 * Scales large casino game screenshots down to max 1024x1024px with 80% JPEG/WebP quality.
 * Reduces 5 MB raw screenshots to < 150 KB for instant zero-storage Vision API streaming.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  mimeType: 'image/jpeg',
};

export const MAX_COMPRESSED_IMAGE_BYTES = 2_500_000; // 2.5 MB

/**
 * Validates whether a file is an allowed image type (PNG, JPEG, WebP).
 */
export function isAllowedImageFile(file: File | Blob): boolean {
  if (!file || !file.type) return false;
  return /^(image\/png|image\/jpeg|image\/jpg|image\/webp)$/i.test(file.type);
}

/**
 * Calculates new width and height while preserving original aspect ratio.
 */
export function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (originalWidth <= 0 || originalHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

/**
 * Compresses an image File or Blob in the browser using HTML5 Canvas.
 * Returns a Base64 Data URL (e.g. `data:image/jpeg;base64,...`).
 */
export async function compressImageFile(
  file: File | Blob,
  options?: ImageCompressionOptions,
): Promise<string> {
  if (!isAllowedImageFile(file)) {
    throw new Error('Ungültiger Dateityp. Erlaubt sind nur PNG, JPEG und WebP.');
  }

  const merged = { ...DEFAULT_OPTIONS, ...options };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Canvas compression is only available in the browser.');
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        const { width, height } = calculateScaledDimensions(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          merged.maxWidth,
          merged.maxHeight,
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Konnte Canvas 2D-Kontext nicht initialisieren.'));
          return;
        }

        // Draw white background for transparent PNGs converting to JPEG
        if (merged.mimeType === 'image/jpeg') {
          ctx.fillStyle = '#121212';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(merged.mimeType, merged.quality);
        if (dataUrl.length > MAX_COMPRESSED_IMAGE_BYTES) {
          reject(new Error('Das komprimierte Bild überschreitet das Limit von 2.5 MB.'));
          return;
        }

        resolve(dataUrl);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Fehler bei der Bildkompression.'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Das Bild konnte nicht geladen werden.'));
    };

    img.src = objectUrl;
  });
}
