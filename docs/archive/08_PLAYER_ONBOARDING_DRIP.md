# 08 — Player Onboarding Drip: Zustandsabhängige Mehrtages-Sequenz (Option B)

> Stand: **2026-08-21**  
> Status: **🟢 Executed (archiviert)**  
> Ziel: Realisierung einer zustandsbehafteten Mehrtages-Onboarding-Sequenz via Trigger.dev `wait.for()` (Durable Sleep) mit dynamischer Verzweigung anhand echter Nutzeraktivität.

---

## 1 — Übersicht & Meilenstein-Matrix

| Nr | Meilenstein | Status | Geld-Pfad | Security-Review | Baut auf | Ziel / Kurzbeschreibung |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **D1** | Task-Logik & Stage-Verzweigung (`player-onboarding-drip.ts`) | 🟢 Executed | Nein | Empfohlen | — | Tag 0 (Welcome), Tag 2 (`wait.for({ days: 2 })` + State-Branching aktiv/inaktiv), Tag 7 (`wait.for({ days: 5 })` + Recap-Handoff) |
| **D2** | Webhook-/Link-Triggering (`telegram-link.ts`) | 🟢 Executed | Nein | **Ja** | D1 | Asynchroner Non-blocking `tasks.trigger('player-onboarding-drip')` nach erfolgreichem Telegram-Link |
| **D3** | Unit-Tests & Branching-Verifikation | 🟢 Executed | Nein | Nein | D1, D2 | Tests für Message-Builder, State-Branching (0 Bets vs. aktive Bets), Opt-in/403-Schutz, Zod-Validierung (7/7 Tests grün) |
| **D4** | Security Review & Deployment | 🟢 Executed | Nein | **Ja** | D1–D3 | Dediziertes Security Reviewer Gate (0 CRITICAL / 0 HIGH) + Cloud Deployment (`20260821.3`, 8 Tasks aktiv) |

---

## 2 — Architektur & Workflow (Option B)

```
[Spieler verknüpft Telegram]
       │
       ▼
[tasks.trigger('player-onboarding-drip')]
       │
       ├─► STAGE 1 (Sofort, Tag 0):
       │     └─► Willkommens-Info + 10.000 Coins Startguthaben & Guide-Hinweis
       │     └─► metadata.set('stage', 'day_0_sent')
       │
       ▼
[await wait.for({ days: 2 })]  ◄─── (Durable Sleep: Task pausiert serverless ohne Kosten)
       │
       ├─► STAGE 2 (Tag 2 nach Aufwachen):
       │     ├─► DB-Abfrage: Wetten in letzten 48h?
       │     ├─► [0 Wetten]: Erinnerungs-Tipp für Startguthaben
       │     ├─► [≥1 Wette]: VIP-Rangfortschritts-Tipp & Gratulation
       │     └─► metadata.set('stage', 'day_2_sent')
       │
       ▼
[await wait.for({ days: 5 })]  ◄─── (Durable Sleep bis Tag 7)
       │
       └─► STAGE 3 (Tag 7 nach Aufwachen):
             ├─► DB-Abfrage: 7-Tage-Aktivität
             ├─► Übergabe an den regulären Montags-Recap (`weekly-player-recap`)
             └─► metadata.set('stage', 'completed')
```

---

## 3 — Sicherheits- & Fehlertoleranz-Garantien

1. **Geld-Pfad unberührt**: Keine Wallet-Mutationen, reine lesende Leseabfragen (`wallet_transactions`, `telegram_links`).
2. **Opt-out & Bot-Block-Schutz**: Vor jedem Versandprüfschritt wird `telegram_links.notifications_enabled` geprüft. Bei `403 Forbidden` (Nutzer blockiert Bot) wird das Flag deaktiviert und der Task bricht sauber ab.
3. **Idempotenz**: `idempotencyKeys.create(`onboarding-drip-${payload.userId}`)` verhindert mehrfache Drip-Sequenzen für denselben Nutzer.
4. **Queue Concurrency**: `queue({ name: 'onboarding-drip-queue', concurrencyLimit: 5 })`.
