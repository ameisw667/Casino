import type { MockInstance } from 'vitest';
import { vi } from 'vitest';
import { useCasinoStore } from '../../useCasinoStore';
import type { WalletSnapshot } from '@/lib/casino/wallet-contract';

export const INITIAL_STATE = useCasinoStore.getState();
export const SAMPLE_TRANSACTION_ID = '11111111-1111-4111-8111-111111111111';

let errorSpy: MockInstance | undefined;
let resultIdSequenceBase = 0;

export function resultId(sequence: number): string {
  return `00000000-0000-4000-8000-${(resultIdSequenceBase + sequence).toString().padStart(12, '0')}`;
}

export function makeSnapshot(overrides: Partial<WalletSnapshot> = {}): WalletSnapshot {
  return {
    balance: 100,
    xp: 5,
    level: 2,
    rank: 'Bronze',
    transactionId: SAMPLE_TRANSACTION_ID,
    ...overrides,
  };
}

export function setupTestEnv(): void {
  resultIdSequenceBase += 1000;
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn());
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
}

export function teardownTestEnv(): void {
  useCasinoStore.setState(INITIAL_STATE, true);
  localStorage.clear();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  errorSpy?.mockRestore();
  vi.clearAllMocks();
}

export function getErrorSpy(): MockInstance {
  if (!errorSpy) throw new Error('setupTestEnv must run before getErrorSpy');
  return errorSpy;
}
