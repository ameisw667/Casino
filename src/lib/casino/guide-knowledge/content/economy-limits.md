---
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
  - Game bets require valid session authentication and CSRF origin verification.
