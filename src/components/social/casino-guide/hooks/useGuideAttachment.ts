'use client';

import { useState, useRef, useCallback } from 'react';
import { CasinoLogger } from '@/lib/casino/logger';
import { processGuideAttachment } from '@/lib/casino/image-compression';

const ATTACHMENT_ERROR_MESSAGES = {
  'invalid-type': 'Ungültiger Dateityp. Erlaubt sind nur PNG, JPEG und WebP.',
  'compression-failed': 'Bild konnte nicht verarbeitet werden. Bitte versuche es erneut.',
} as const;

export function useGuideAttachment() {
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setAttachmentError(null);
    setIsCompressing(true);
    const result = await processGuideAttachment(file);
    setIsCompressing(false);

    if (result.status === 'accepted') {
      setAttachedImage(result.dataUrl);
      return;
    }

    // Previously a bare `catch { /* ignore */ }` — a failed compression left the player
    // with no attached image and no explanation, indistinguishable from never having
    // picked a file, and left zero trace anywhere (client or server) for debugging.
    if (result.reason === 'compression-failed') {
      CasinoLogger.error(
        'useGuideAttachment',
        'Image compression failed',
        result.error instanceof Error ? result.error : undefined,
      );
    }
    setAttachmentError(ATTACHMENT_ERROR_MESSAGES[result.reason]);
  }, []);

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            await handleFileSelect(file);
            break;
          }
        }
      }
    },
    [handleFileSelect],
  );

  const clearAttachedImage = useCallback(() => {
    setAttachedImage(null);
    setAttachmentError(null);
  }, []);

  return {
    attachedImage,
    isCompressing,
    attachmentError,
    fileInputRef,
    handleFileSelect,
    handlePaste,
    clearAttachedImage,
    setAttachedImage,
  };
}
