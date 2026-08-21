---
id: guide-blackjack
version: 2026-08-21
topic: games
title: Blackjack Rules and Actions
tags: [blackjack, cards, deal, hit, stand, double, split, 21, payout]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Blackjack is played against the dealer. The goal is to get a card total closer to 21 than the dealer without exceeding 21.
- Available player actions:
  - DEAL: Start a new round with the chosen bet.
  - HIT: Draw an additional card to increase the hand total.
  - STAND: End turn with the current hand total.
  - DOUBLE: Double the initial bet and receive exactly one final card.
  - SPLIT: When dealt two cards of equal rank, split them into two separate playable hands with an equal additional bet.
- Dealer stands on all 17s (including soft 17).
- Payouts: Natural Blackjack pays 3:2. Regular winning hand pays 1:1. Tie or push returns the original bet.
- Game state, card generation, and round settlements are fully verified on the server.
