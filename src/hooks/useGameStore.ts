import { useCasinoStore } from '@/store/useCasinoStore';

export function useGameStore() {
  const balance = useCasinoStore(state => state.balance);
  const provablyFairSettings = useCasinoStore(state => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore(state => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore(state => state.processGameResult);
  const addToast = useCasinoStore(state => state.addToast);
  const isProcessing = useCasinoStore(state => state.isProcessing);
  const setIsProcessing = useCasinoStore(state => state.setIsProcessing);

  return {
    balance,
    provablyFairSettings,
    setProvablyFairSettings,
    processGameResult,
    addToast,
    isProcessing,
    setIsProcessing,
  };
}
