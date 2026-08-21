---
id: guide-vip
version: 2026-08-21
topic: economy
title: VIP Rank Tiers and XP Progression
tags: [vip, rank, tiers, xp, levels, bronze, silver, gold, platinum, diamond, rakeback]
owner: product
reviewedAt: 2026-08-21
status: active
---
- VIP Rank Tiers:
  - Bronze: Entry rank for new players (Level 1-9).
  - Silver: Level 10-24, unlocked higher reward benefits.
  - Gold: Level 25-49, increased rakeback percentage and prestige badge.
  - Platinum: Level 50-99, high-tier benefits and priority support.
  - Diamond: Level 100+, maximum rakeback tiers and elite recognition.
- XP Progression: Players earn XP with every settled bet based on wagered amount (`calculateXpGain(betAmount)`).
- Level calculation: Player level is derived logarithmically from total accumulated XP (`calculateLevel(xp)`).
