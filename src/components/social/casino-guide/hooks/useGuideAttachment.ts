'use client';

import { useState, useRef, useCallback } from 'react';
import { compressImageFile, isAllowedImageFile } from '@/lib/casino/image-compression';

export function useGuideAttachment() {
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!isAllowedImageFile(file)) return;
    try {
      setIsCompressing(true);
      const compressed = await compressImageFile(file);
      setAttachedImage(compressed);
    } catch {
      // Ignore invalid files silently
    } finally {
      setIsCompressing(false);
    }
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
  }, []);

  return {
    attachedImage,
    isCompressing,
    fileInputRef,
    handleFileSelect,
    handlePaste,
    clearAttachedImage,
    setAttachedImage,
  };
}
