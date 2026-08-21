---
id: guide-dice
version: 2026-08-21
topic: games
title: Dice Roll and Target Mechanics
tags: [dice, roll, target, multiplier, win-chance, provably-fair]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Dice generates a provably-fair decimal roll result between 0.00 and 100.00.
- The player sets a target value and selects whether the roll will be Under or Over that target.
- Win chance and payout multiplier adjust dynamically based on the chosen target.
- Payout formula: Payout Multiplier = (99 / Win Chance) with 1% house edge.
- Example: Rolling Under 50 gives a 49.50% win chance and a 2.00x multiplier.
- Every roll is cryptographically determined on the server using HMAC-SHA256.
