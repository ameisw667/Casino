import type { StateCreator } from 'zustand';
import type { CasinoState, UISlice } from './types';

export const createUISlice: StateCreator<CasinoState, [], [], UISlice> = (set, get) => ({
  toasts: [],
  isMobile: false,
  isProcessing: false,
  isChatOpen: false,
  isLoading: false,
  _hasHydrated: false,
  setHasHydrated: (val) => set({ _hasHydrated: val }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  addToast: (message, type = 'info', duration = 4000) =>
    set((state) => {
      const id = Math.random().toString(36).slice(2, 11);
      const newToast = { id, message, type, duration };

      setTimeout(() => {
        get().removeToast(id);
      }, duration);

      return { toasts: [...state.toasts, newToast] };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
});
