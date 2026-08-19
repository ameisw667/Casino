import type { GuideKnowledgeSource } from './schema';

export const gamesGuideKnowledge: GuideKnowledgeSource = {
  id: 'guide-games',
  version: '2026-08-17',
  topic: 'games',
  owner: 'product',
  reviewedAt: '2026-08-17',
  status: 'active',
  content: `
- Available games: Blackjack, Crash, Dice, Roulette, and Slots.
- Blackjack actions are DEAL, HIT, STAND, DOUBLE, and SPLIT. The game state and settlement are handled on the server.
- A Dice result is a provably-fair value from 0 through 100; the player sets a target before rolling.
- Crash starts a round and allows cashing out before the round crashes. The server settles the round.
- Roulette uses numbers 0 through 36.
- Slots uses provably-fair per-reel result indices.
`.trim(),
};
