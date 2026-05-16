'use client';

import { useEffect } from 'react';

/**
 * Custom hook to handle common modal keyboard interactions.
 * Currently supports closing the modal on ESC key press.
 * 
 * @param onClose - Function to call when ESC is pressed
 * @param isOpen - Only attach listener if modal is active
 */
export function useModalKeyboard(onClose: () => void, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup to prevent memory leaks and unexpected behavior
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isOpen]);
}
