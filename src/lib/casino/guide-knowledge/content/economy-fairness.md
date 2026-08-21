---
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
- Result generation: `HMAC_SHA256(serverSeed, clientSeed:nonce)` computes deterministic raw bytes converted to the game outcome.
- Verification: Once a server seed cycle is closed, the unhashed server seed is revealed in bet history for third-party verification.
