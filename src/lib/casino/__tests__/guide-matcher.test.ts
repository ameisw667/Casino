import { describe, expect, it } from 'vitest';
import { scoreDocument, selectKnowledgeDocs, tokenizeQuery } from '../guide-knowledge/matcher';
import { getKnowledgeDocById } from '../guide-knowledge/registry';

describe('Guide Knowledge Tokenizer', () => {
  it('normalizes, lowercases and filters punctuation and stop words', () => {
    const tokens = tokenizeQuery('How does the Blackjack Double Down action work?');
    expect(tokens).toContain('blackjack');
    expect(tokens).toContain('double');
    expect(tokens).toContain('down');
    expect(tokens).toContain('work');
    expect(tokens).not.toContain('how');
    expect(tokens).not.toContain('does');
    expect(tokens).not.toContain('the');
  });

  it('handles German queries and stop words correctly', () => {
    const tokens = tokenizeQuery('Wie funktioniert der Crash Multiplikator und Cashout?');
    expect(tokens).toContain('funktioniert');
    expect(tokens).toContain('crash');
    expect(tokens).toContain('multiplikator');
    expect(tokens).toContain('cashout');
    expect(tokens).not.toContain('wie');
    expect(tokens).not.toContain('der');
    expect(tokens).not.toContain('und');
  });
});

describe('Guide Document Scoring', () => {
  it('assigns high score to exact title and ID matches', () => {
    const blackjackDoc = getKnowledgeDocById('guide-blackjack')!;
    const { score, matchedTags } = scoreDocument(blackjackDoc, ['blackjack', 'split']);

    expect(score).toBeGreaterThan(10);
    expect(matchedTags).toContain('blackjack');
    expect(matchedTags).toContain('split');
  });

  it('assigns score 0 when tokens do not match the document', () => {
    const slotsDoc = getKnowledgeDocById('guide-slots')!;
    const { score } = scoreDocument(slotsDoc, ['blackjack', 'dealer', 'cards']);

    expect(score).toBe(0);
  });
});

describe('Guide Document Selection (Deterministic Routing)', () => {
  it('selects Blackjack document for card and split queries', () => {
    const selected = selectKnowledgeDocs('Can I split cards in Blackjack?');
    expect(selected.length).toBeGreaterThan(0);
    expect(selected[0]?.id).toBe('guide-blackjack');
  });

  it('selects Crash document for rocket and multiplier queries', () => {
    const selected = selectKnowledgeDocs('When should I cashout on the multiplier curve in Crash?');
    expect(selected[0]?.id).toBe('guide-crash');
  });

  it('selects Dice document for target roll queries', () => {
    const selected = selectKnowledgeDocs('How do I set the target roll under 50 in Dice?');
    expect(selected[0]?.id).toBe('guide-dice');
  });

  it('selects Roulette document for color and wheel queries', () => {
    const selected = selectKnowledgeDocs('What is the payout for red or black in Roulette?');
    expect(selected[0]?.id).toBe('guide-roulette');
  });

  it('selects Slots document for reel and payline queries', () => {
    const selected = selectKnowledgeDocs('How do paylines and 7s symbols work in slots?');
    expect(selected[0]?.id).toBe('guide-slots');
  });

  it('selects Navigation document for route queries', () => {
    const selected = selectKnowledgeDocs('Where can I see my bets history and vault?');
    expect(selected[0]?.id).toBe('guide-navigation');
  });

  it('selects Commands document for chat command queries', () => {
    const selected = selectKnowledgeDocs('What chat commands like /help or /stats exist?');
    expect(selected[0]?.id).toBe('guide-commands');
  });

  it('selects VIP document for rakeback and rank tier queries', () => {
    const selected = selectKnowledgeDocs('How does the VIP tier system and XP level progression work?');
    expect(selected[0]?.id).toBe('guide-vip');
  });

  it('selects Fairness document for provably fair and seed queries', () => {
    const selected = selectKnowledgeDocs('How is HMAC-SHA256 used with server seed and client seed for fairness?');
    expect(selected[0]?.id).toBe('guide-fairness');
  });

  it('selects Limits document for min/max bet queries', () => {
    const selected = selectKnowledgeDocs('What is the minimum bet and maximum bet per round?');
    expect(selected[0]?.id).toBe('guide-limits');
  });

  it('returns fallback platform documents for empty or stop-word-only queries', () => {
    const emptySelected = selectKnowledgeDocs('');
    expect(emptySelected.map((d) => d.id)).toEqual(['guide-navigation', 'guide-commands']);

    const genericSelected = selectKnowledgeDocs('Hello there, how are you?');
    expect(genericSelected.map((d) => d.id)).toEqual(['guide-navigation', 'guide-commands']);
  });

  it('limits result count to maxDocs (e.g. 2)', () => {
    const selected = selectKnowledgeDocs('games and bets rules for blackjack and roulette', {
      maxDocs: 2,
    });
    expect(selected.length).toBeLessThanOrEqual(2);
  });
});
