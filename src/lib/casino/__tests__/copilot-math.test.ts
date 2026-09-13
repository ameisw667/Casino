import { describe, it, expect } from 'vitest';
import {
  getBlackjackRecommendation,
  getCrashSurvivalProbability,
  getCrashCurrentZone,
  getRouletteOdds,
  getDiceOdds,
  getDealerUpcardValue,
} from '@/lib/casino/copilot-math';
import { DEFAULT_GAME_CONFIG } from '@/lib/casino/game-config';
import type { Card } from '@/lib/games/blackjack';

function makeCard(value: Card['value'], suit: Card['suit'] = 'spades'): Card {
  let numericValue = 10;
  if (value === 'A') numericValue = 11;
  else if (['J', 'Q', 'K', '10'].includes(value)) numericValue = 10;
  else numericValue = parseInt(value, 10);

  return {
    suit,
    value,
    numericValue,
    faceDown: false,
  };
}

describe('In-Game Live Co-Pilot Math Engine (copilot-math)', () => {
  describe('Blackjack Basic Strategy & Probabilities', () => {
    it('correctly recommends STAND for natural 21 and hard 20', () => {
      const rec21 = getBlackjackRecommendation({
        playerScore: 21,
        isSoft: false,
        cards: [makeCard('10'), makeCard('A')],
        dealerUpcard: makeCard('10'),
      });
      expect(rec21.action).toBe('STAND');
      expect(rec21.winProbability).toBeGreaterThan(90);

      const rec20 = getBlackjackRecommendation({
        playerScore: 20,
        isSoft: false,
        cards: [makeCard('10'), makeCard('K')],
        dealerUpcard: makeCard('6'),
      });
      expect(rec20.action).toBe('STAND');
    });

    it('correctly recommends SPLIT for Aces (A-A) and Eights (8-8)', () => {
      const recAces = getBlackjackRecommendation({
        playerScore: 12,
        isSoft: true,
        cards: [makeCard('A', 'hearts'), makeCard('A', 'spades')],
        dealerUpcard: makeCard('6'),
        canSplit: true,
      });
      expect(recAces.action).toBe('SPLIT');

      const recEights = getBlackjackRecommendation({
        playerScore: 16,
        isSoft: false,
        cards: [makeCard('8', 'hearts'), makeCard('8', 'spades')],
        dealerUpcard: makeCard('10'),
        canSplit: true,
      });
      expect(recEights.action).toBe('SPLIT');
    });

    it('recommends STAND (never split) for pair of 10s', () => {
      const recTens = getBlackjackRecommendation({
        playerScore: 20,
        isSoft: false,
        cards: [makeCard('10', 'hearts'), makeCard('J', 'spades')],
        dealerUpcard: makeCard('5'),
        canSplit: true,
      });
      expect(recTens.action).toBe('STAND');
    });

    it('recommends DOUBLE for 11 and 10 against dealer weak cards', () => {
      const rec11 = getBlackjackRecommendation({
        playerScore: 11,
        isSoft: false,
        cards: [makeCard('6'), makeCard('5')],
        dealerUpcard: makeCard('6'),
        canDouble: true,
      });
      expect(rec11.action).toBe('DOUBLE');

      const rec10 = getBlackjackRecommendation({
        playerScore: 10,
        isSoft: false,
        cards: [makeCard('6'), makeCard('4')],
        dealerUpcard: makeCard('5'),
        canDouble: true,
      });
      expect(rec10.action).toBe('DOUBLE');
    });

    it('recommends STAND for Hard 13-16 against Dealer 2-6 (Bust Zone)', () => {
      const rec16vs6 = getBlackjackRecommendation({
        playerScore: 16,
        isSoft: false,
        cards: [makeCard('10'), makeCard('6')],
        dealerUpcard: makeCard('6'),
      });
      expect(rec16vs6.action).toBe('STAND');
      expect(rec16vs6.reasoning).toContain('Dealer hat');
    });

    it('recommends HIT for Hard 13-16 against Dealer 7, 10 or Ace', () => {
      const rec16vs10 = getBlackjackRecommendation({
        playerScore: 16,
        isSoft: false,
        cards: [makeCard('10'), makeCard('6')],
        dealerUpcard: makeCard('10'),
      });
      expect(rec16vs10.action).toBe('HIT');
      expect(rec16vs10.riskLevel).toBe('high');
    });

    it('recommends HIT for Hard 12 against 2 and 3, but STAND against 4, 5, 6', () => {
      const rec12vs2 = getBlackjackRecommendation({
        playerScore: 12,
        isSoft: false,
        cards: [makeCard('8'), makeCard('4')],
        dealerUpcard: makeCard('2'),
      });
      expect(rec12vs2.action).toBe('HIT');

      const rec12vs5 = getBlackjackRecommendation({
        playerScore: 12,
        isSoft: false,
        cards: [makeCard('8'), makeCard('4')],
        dealerUpcard: makeCard('5'),
      });
      expect(rec12vs5.action).toBe('STAND');
    });

    it('recommends DOUBLE for Soft 18 (A-7) vs Dealer 3-6', () => {
      const recSoft18vs5 = getBlackjackRecommendation({
        playerScore: 18,
        isSoft: true,
        cards: [makeCard('A'), makeCard('7')],
        dealerUpcard: makeCard('5'),
        canDouble: true,
      });
      expect(recSoft18vs5.action).toBe('DOUBLE');
    });

    it('handles dealer upcard value parsing correctly', () => {
      expect(getDealerUpcardValue(makeCard('A'))).toBe(11);
      expect(getDealerUpcardValue(makeCard('K'))).toBe(10);
      expect(getDealerUpcardValue(makeCard('7'))).toBe(7);
      expect(getDealerUpcardValue(null)).toBe(7);
    });
  });

  describe('Crash Probability Radar & EV Zones', () => {
    it('calculates exact mathematical survival probability for multipliers', () => {
      // P(Crash >= 1.0) is capped at 99%
      expect(getCrashSurvivalProbability(1.0)).toBe(99.0);

      // P(Crash >= 2.0) = 0.99 / 2.0 = 49.5%
      expect(getCrashSurvivalProbability(2.0)).toBe(49.5);

      // P(Crash >= 10.0) = 0.99 / 10.0 = 9.9%
      expect(getCrashSurvivalProbability(10.0)).toBe(9.9);

      // P(Crash >= 100.0) = 0.99 / 100.0 = 1.0% (rounded 1%)
      expect(getCrashSurvivalProbability(100.0)).toBe(1.0);
    });

    it('classifies crash multipliers into appropriate risk zones', () => {
      const safeZone = getCrashCurrentZone(1.2);
      expect(safeZone.riskLevel).toBe('low');
      expect(safeZone.badgeText).toContain('Safe');

      const balancedZone = getCrashCurrentZone(1.85);
      expect(balancedZone.riskLevel).toBe('medium');
      expect(balancedZone.badgeText).toContain('Balanced');

      const highRiskZone = getCrashCurrentZone(3.5);
      expect(highRiskZone.riskLevel).toBe('high');
      expect(highRiskZone.badgeText).toContain('High Risk');

      const moonZone = getCrashCurrentZone(12.4);
      expect(moonZone.riskLevel).toBe('high');
      expect(moonZone.badgeText).toContain('Moon');
    });

    it('derives its default house edge from the shared game-config default instead of a separately hardcoded constant (regression: a change to DEFAULT_GAME_CONFIG.crash.houseEdge used to silently leave the Co-Pilot showing stale odds)', () => {
      expect(getCrashSurvivalProbability(2.0)).toBe(
        Math.round(((1 - DEFAULT_GAME_CONFIG.crash.houseEdge) / 2.0) * 100 * 10) / 10,
      );
    });

    it('recomputes survival probability for an explicitly passed house edge instead of always assuming 1%', () => {
      // A 2% house edge halves-ish the survivor odds relative to the 1% default at the same multiplier.
      expect(getCrashSurvivalProbability(2.0, 0.02)).toBe(49.0);
      expect(getCrashSurvivalProbability(2.0, 0.05)).toBe(47.5);
    });

    it('derives every risk zone\'s expectedValue from the shared house-edge default instead of a separate hardcoded -0.01 (regression: winProbability already followed DEFAULT_GAME_CONFIG after L1, but expectedValue in each zone branch was still a disconnected literal)', () => {
      const expected = -DEFAULT_GAME_CONFIG.crash.houseEdge;
      expect(getCrashCurrentZone(1.2).expectedValue).toBe(expected); // safe zone
      expect(getCrashCurrentZone(1.85).expectedValue).toBe(expected); // balanced zone
      expect(getCrashCurrentZone(3.5).expectedValue).toBe(expected); // high-risk zone
      expect(getCrashCurrentZone(12.4).expectedValue).toBe(expected); // moon zone
    });

    it('recomputes every risk zone\'s expectedValue for an explicitly passed house edge instead of always assuming 1%', () => {
      expect(getCrashCurrentZone(1.2, 0.03).expectedValue).toBe(-0.03);
      expect(getCrashCurrentZone(1.85, 0.03).expectedValue).toBe(-0.03);
      expect(getCrashCurrentZone(3.5, 0.03).expectedValue).toBe(-0.03);
      expect(getCrashCurrentZone(12.4, 0.03).expectedValue).toBe(-0.03);
    });
  });

  describe('Roulette & Dice Probability Computations', () => {
    it('calculates correct European roulette probabilities', () => {
      const redOdds = getRouletteOdds('red');
      expect(redOdds.winProbability).toBe(48.65);
      expect(redOdds.expectedValue).toBe(-0.027);

      const dozenOdds = getRouletteOdds('dozen');
      expect(dozenOdds.winProbability).toBe(32.43);

      const straightOdds = getRouletteOdds('straight');
      expect(straightOdds.winProbability).toBe(2.7);
    });

    it('calculates dice win chances and target multipliers with 1% house edge', () => {
      const rollOver50 = getDiceOdds(50, true);
      expect(rollOver50.winProbability).toBe(50);
      expect(rollOver50.expectedValue).toBe(-0.01);
      expect(rollOver50.riskLevel).toBe('medium');

      const rollUnder20 = getDiceOdds(20, false);
      expect(rollUnder20.winProbability).toBe(20);
      expect(rollUnder20.riskLevel).toBe('high');
    });

    it('derives its default house edge from the shared game-config default instead of a separately hardcoded 99 (regression: a change to DEFAULT_GAME_CONFIG.dice.houseEdge used to silently leave the Co-Pilot showing a stale multiplier)', () => {
      const rollOver50 = getDiceOdds(50, true);
      expect(rollOver50.expectedValue).toBe(-DEFAULT_GAME_CONFIG.dice.houseEdge);
      expect(rollOver50.metrics?.find((m) => m.label === 'Hausvorteil')?.value).toBe(
        `${(DEFAULT_GAME_CONFIG.dice.houseEdge * 100).toFixed(1)}%`,
      );
    });

    it('recomputes the multiplier and EV for an explicitly passed house edge instead of always assuming 1%', () => {
      const withDefaultEdge = getDiceOdds(50, true, 0.01);
      const withDoubleEdge = getDiceOdds(50, true, 0.02);

      expect(withDefaultEdge.badgeText).toBe('1.98x Multiplikator');
      expect(withDoubleEdge.badgeText).toBe('1.96x Multiplikator');
      expect(withDoubleEdge.expectedValue).toBe(-0.02);
    });
  });
});
