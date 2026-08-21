---
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
- XP Progression: Players earn XP with every settled bet based on wagered amount (`calculateXpGain(betAmount)`).
- Level calculation: Player level is derived logarithmically from total accumulated XP (`calculateLevel(xp)`).
