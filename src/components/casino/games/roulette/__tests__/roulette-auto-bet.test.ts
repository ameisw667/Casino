import { describe, expect, it } from 'vitest';

import { getAutoBetStopReason } from '../roulette-auto-bet';

describe('getAutoBetStopReason', () => {
  it('stops at the configured spin limit before scheduling another spin', () => {
    expect(
      getAutoBetStopReason({
        autoCount: 3,
        numberOfBets: 3,
        profit: 0,
        stopOnProfit: 0,
        stopOnLoss: 0,
      }),
    ).toEqual({ type: 'limit', maxAllowed: 3 });
  });
});
