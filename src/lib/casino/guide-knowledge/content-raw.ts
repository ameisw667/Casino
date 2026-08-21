export const RAW_KNOWLEDGE_MARKDOWN: readonly string[] = [
  // 1. Blackjack
  `---
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
- Game state, card generation, and round settlements are fully verified on the server.`,

  // 2. Crash
  `---
id: guide-crash
version: 2026-08-21
topic: games
title: Crash Multiplier and Cashout Mechanics
tags: [crash, multiplier, cashout, house-edge, curve, rocket]
owner: product
reviewedAt: 2026-08-21
status: active
---
- In Crash, a multiplier begins at 1.00x and increases exponentially over time.
- The player starts a round with a bet and must click CASHOUT before the game randomly crashes.
- If the player cashes out before the crash, payout equals bet multiplied by the cashout multiplier.
- If the game crashes before cashout, the bet is lost.
- Crash uses a 1% house edge in the provably fair formula.
- Round lifecycle (start, multiplier progression, cashout validation, resolution) is securely tracked and settled by the server.`,

  // 3. Dice
  `---
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
- Every roll is cryptographically determined on the server using HMAC-SHA256.`,

  // 4. Roulette
  `---
id: guide-roulette
version: 2026-08-21
topic: games
title: European Roulette Rules and Bets
tags: [roulette, numbers, red, black, even, odd, dozens, zero, wheel]
owner: product
reviewedAt: 2026-08-21
status: active
---
- European Roulette features a wheel with 37 pocket numbers: 0 (green) and numbers 1 through 36 (red or black).
- Available betting options:
  - Straight Up (single number 0-36): Pays 35:1.
  - Red / Black: Pays 1:1.
  - Even / Odd: Pays 1:1.
  - Low (1-18) / High (19-36): Pays 1:1.
  - Dozens (1-12, 13-24, 25-36): Pays 2:1.
  - Columns: Pays 2:1.
- If 0 (green) hits, outside bets (Red/Black, Even/Odd, Low/High, Dozens, Columns) lose.
- The winning number is generated server-side using the provably fair RNG engine.`,

  // 5. Slots
  `---
id: guide-slots
version: 2026-08-21
topic: games
title: 3-Reel Slots Mechanics and Symbols
tags: [slots, reels, symbols, paylines, scatter, wild, jackpot, spin]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Slots is a classic 3-reel game with multiple horizontal and diagonal paylines.
- Symbol hierarchy and payouts:
  - 7s / Diamond: Top tier jackpot multipliers (up to 100x).
  - Bell / Bar: High tier multipliers (10x - 25x).
  - Cherry / Lemon / Plum: Mid and low tier fruit multipliers (2x - 5x).
- Each reel result index is independently and provably-fairly determined via HMAC-SHA256 on the server.
- Winnings are automatically calculated based on matching symbols across active paylines.`,

  // 6. Navigation
  `---
id: guide-navigation
version: 2026-08-21
topic: navigation
title: Platform Navigation and Routes
tags: [navigation, routes, pages, games, history, leaderboard, vault, stats, admin, menü, tresor, historie, wetthistorie, rangliste]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Key Casino Navigation (Direkte 1-Klick Menüpunkte in der linken Seitenleiste und oberen Navigationsleiste):
  - \`/games\`: Games Hub — Direkter Zugriff auf Blackjack, Crash, Dice, Roulette und Slots.
  - \`/history\`: Wetthistorie — Vollständiger Verlauf aller platzierten Wetten mit Provably-Fair-Seed-Nachprüfung, Zeitstempeln und Auszahlungen. Direkt über die Seitenleiste oder den Header erreichbar (kein Untermenü).
  - \`/vault\`: Tresor (Vault) — Sichere Guthabenverwaltung, Einzahlungen, Auszahlungen und Rakeback-Übersicht. Direkt mit 1 Klick in der Navigation verlinkt.
  - \`/leaderboard\`: Rangliste (Leaderboard) — Öffentliche Rangliste sortiert nach Wagered Volume, Level und VIP-Rang.
  - \`/stats\`: Statistiken — Persönliche Spielstatistiken, Gewinnraten, PnL-Heatmap und Strähnen.
  - \`/admin\`: Administrations-Dashboard — Zugriff exklusiv für autorisierte Casino-Administratoren.`,

  // 7. Commands
  `---
id: guide-commands
version: 2026-08-21
topic: commands
title: Chat Commands and Shortcuts
tags: [commands, chat, help, stats, tip, leaderboard, guide]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Chat commands:
  - \`/help\`: Displays available chat commands and usage instructions.
  - \`/stats\`: Shows your local session statistics (total bets, wins, win rate) in chat.
  - \`/leaderboard\`: Displays a quick snapshot of the current top players.
  - \`/tip\`: Currently disabled for security and regulatory compliance.
- The Royale Guide panel is accessible via the floating button on the bottom-right corner.`,

  // 8. VIP System
  `---
id: guide-vip
version: 2026-08-21
topic: economy
title: VIP Rank Tiers and XP Progression
tags: [vip, rank, tiers, xp, levels, bronze, silver, gold, platinum, diamond, rakeback, stufen, ränge, rang, vorteile, cashback, belohnungen, progression]
owner: product
reviewedAt: 2026-08-21
status: active
---
- VIP Rank Tiers & Ränge:
  - Bronze: Entry rank for new players (Level 1-9), Basis-Vorteile.
  - Silver: Level 10-24, unlocked higher reward benefits and weekly bonuses.
  - Gold: Level 25-49, increased rakeback percentage and prestige gold badge.
  - Platinum: Level 50-99, premium rakeback tiers and priority VIP support.
  - Diamond: Level 100+, maximum rakeback tiers (bis zu 15%), elite recognition, personal VIP host.
- Rakeback & Cashback:
  - Rakeback is calculated dynamically on all settled wagers and credited directly to the player rank pool.
- XP Progression: Players earn XP with every settled bet based on wagered amount (calculateXpGain(betAmount)).
- Level calculation: Player level is derived logarithmically from total accumulated XP (calculateLevel(xp)).`,

  // 9. Fairness
  `---
id: guide-fairness
version: 2026-08-21
topic: economy
title: Provably Fair Verification System
tags: [fairness, provably-fair, server-seed, client-seed, nonce, hmac-sha256, verify]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Every game outcome is 100% provably fair and verifiable by the player.
- Technical architecture:
  - Server Seed: Cryptographically secure secret generated on the server (provided as SHA-256 hash before betting).
  - Client Seed: Player-controlled seed value that can be customized at any time.
  - Nonce: Incrementing counter representing the number of bets played with the current seed pair.
- Result generation: HMAC_SHA256(serverSeed, clientSeed:nonce) computes deterministic raw bytes converted to the game outcome.
- Verification: Once a server seed cycle is closed, the unhashed server seed is revealed in bet history for third-party verification.`,

  // 10. Limits
  `---
id: guide-limits
version: 2026-08-21
topic: economy
title: Betting Limits and Security Guardrails
tags: [limits, betting, minimum-bet, maximum-bet, rate-limit, balance, wallet, security, mindesteinsatz, maximaleinsatz, einsatz, einsatzlimits, mindest, maximal, einsatzgrenzen]
owner: product
reviewedAt: 2026-08-21
status: active
---
- Betting Limits (Einsatz-Limits):
  - Mindesteinsatz (Minimum Bet): $0.10 across all games (Blackjack, Crash, Dice, Roulette, Slots).
  - Maximaleinsatz (Maximum Bet): $10,000.00 per individual round.
- Wallet and Balance:
  - Balance operations are processed atomically via Supabase database RPCs with strict advisory locks.
  - Browser values never hold wallet authority; every balance update is server-settled.
- Security & Rate Limiting:
  - Chat guide endpoint is limited to 10 requests per 60 seconds per user/IP.
  - Game bets require valid session authentication and CSRF origin verification.`,
];
