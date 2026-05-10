# 🎯 Crash Game - Feature Flowchart

**Source**: `src/app/games/crash/page.tsx` (969 LOC)  
**Last Updated**: 2026-05-10

---

## 🔄 Primary Happy Path: Bet → Run → Cashout → Payout

```mermaid
flowchart TD
    A["User Click 'Bet' Button<br/>crash/page.tsx:43"] --> B["Validate Bet Amount<br/>crash/page.tsx:200?"]
    B --> C["Debit Balance from Store<br/>useCasinoStore.removeBalance"]
    C --> D["Call CasinoCore.placeBet<br/>casino-core.ts:29"]
    D --> E["ProvablyFairEngine.generateServerSeed<br/>provably-fair.ts:15"]
    E --> F["Get Dice Roll from Server Seed<br/>casino-core.ts:50"]
    F --> G["Calculate Game Result<br/>BetResult object<br/>casino-core.ts:38"]
    G --> H["Crash Multiplier Curve Begins<br/>crash/page.tsx:88-89<br/>GROWTH_FACTOR=0.0007"]
    H --> I["Canvas Animation Loop Starts<br/>crash/page.tsx:72"]
    I --> J{"User Cashout<br/>or Auto-Cashout<br/>Trigger?<br/>crash/page.tsx:47-49"}
    J -->|User Clicks 'Cashout'| K["Record Cashout Multiplier<br/>crash/page.tsx:????"]
    J -->|Auto-Cashout Enabled| L["Calculate Auto Multiplier<br/>crash/page.tsx:48"]
    L --> K
    J -->|Game Crashes| M["Crash Point Hit<br/>crash/page.tsx:76"]
    M --> N["Loss: Bet Lost"]
    K --> O["Calculate Payout<br/>BetAmount × Multiplier"]
    O --> P["Credit Balance to Store<br/>useCasinoStore.addBalance"]
    P --> Q["Process Game Result<br/>useCasinoStore.processGameResult"]
    Q --> R["Update Stats & XP<br/>useCasinoStore"]
    R --> S["Play Win/Loss Audio<br/>soundManager.play<br/>crash/page.tsx:96"]
    S --> T["Display Toast Notification<br/>addToast<br/>crash/page.tsx:39"]
    T --> U["Show Big Win Overlay?<br/>bigWin state<br/>crash/page.tsx:51"]
    U --> V["Return to IDLE<br/>crash/page.tsx:45"]
    
    style D fill:#ff6b9d
    style E fill:#ff6b9d
    style F fill:#ff6b9d
    style H fill:#ffd700
    style J fill:#ffd700
    style S fill:#4ecdc4
    style V fill:#95e1d3
```

---

## 🔧 Sub-Flow: Auto-Bet Mode (Advanced)

```mermaid
flowchart TD
    A["User Enables Auto-Bet<br/>crash/page.tsx:57"] --> B["Set Auto Parameters<br/>Runs, Reset Loss, etc<br/>crash/page.tsx:60-63"]
    B --> C["Start Auto Loop<br/>setAutoRunning=true<br/>crash/page.tsx:59"]
    C --> D["Loop: Place Bet<br/>baseBetAmount<br/>crash/page.tsx:60"]
    D --> E["Wait for Game Result<br/>Happy Path above"]
    E --> F{"Runs Completed?<br/>or Loss Limit?<br/>crash/page.tsx:????"}
    F -->|Yes| G["Stop Auto Mode<br/>setAutoRunning=false"]
    F -->|No| D
    G --> H["Return to Manual"]
    
    style C fill:#ffd700
    style D fill:#ffd700
    style F fill:#ff6b9d
    style H fill:#95e1d3
```

---

## 🎤 Side Effect: Live Bet Broadcasting

```mermaid
flowchart TD
    A["Bet Placed<br/>crash/page.tsx:50"] --> B["Add to Live Bets Array<br/>setLiveBets<br/>crash/page.tsx:50"]
    B --> C["Display in Live Feed<br/>UI renders liveBets"]
    C --> D["Watching Count Increments<br/>setWatchingCount<br/>crash/page.tsx:53"]
    
    style A fill:#4ecdc4
    style B fill:#4ecdc4
    style D fill:#4ecdc4
```

---

## 🎨 Side Effect: Canvas Animation & Particle System

```mermaid
flowchart TD
    A["Game Loop Running<br/>crash/page.tsx:72"] --> B["Render Canvas Graph<br/>canvas points tracking<br/>crash/page.tsx:75"]
    B --> C["Update Multiplier Display<br/>setDisplayMultiplier<br/>crash/page.tsx:44"]
    C --> D["Particle System Active?<br/>crash/page.tsx:72"]
    D -->|If Crash| E["Emit Crash Particles<br/>particlesRef.current<br/>crash/page.tsx:????"]
    D -->|If Win| F["Emit Confetti/Win Particles<br/>crash/page.tsx:????"]
    E --> G["Animate Particles<br/>vx, vy, life decay"]
    F --> G
    G --> H["Request Animation Frame<br/>RequestAnimationFrame loop"]
    H --> I["Update last Display<br/>lastUpdateRef<br/>crash/page.tsx:73"]
    I --> J["Return to Loop"]
    
    style A fill:#ffd700
    style D fill:#ffd700
    style E fill:#ff6b9d
    style F fill:#95e1d3
    style H fill:#ffd700
```

---

## 🔊 Side Effect: Audio Management

```mermaid
flowchart TD
    A["Game Events Trigger<br/>Bet, Tick, Cashout, Crash"] --> B["soundManager.play<br/>crash/page.tsx:96"]
    B --> C{"Which Sound?"}
    C -->|Engine| D["engine.mp3"]
    C -->|Cashout| E["win.mp3"]
    C -->|Crash| F["loss.mp3"]
    C -->|Tick| G["tick.mp3"]
    D --> H["Play via Audio DOM<br/>audioRefs<br/>crash/page.tsx:81"]
    E --> H
    F --> H
    G --> H
    
    style A fill:#4ecdc4
    style B fill:#4ecdc4
    style H fill:#4ecdc4
```

---

## ⚠️ Error Paths

```mermaid
flowchart TD
    A["Bet Validation Fails<br/>Insufficient Balance<br/>Invalid Amount"] --> B["Show Error Toast<br/>addToast type='error'"]
    B --> C["Reject Bet<br/>Return to IDLE"]
    
    D["CasinoCore.placeBet Throws<br/>casino-core.ts:39"] --> E["Catch Error<br/>try-catch block?"]
    E --> F["Log Error<br/>CasinoLogger?"]
    F --> G["Refund Balance<br/>useCasinoStore.addBalance"]
    G --> H["Show Error Toast"]
    H --> C
    
    style A fill:#ff6b9d
    style D fill:#ff6b9d
    style C fill:#ff6b9d
```

---

## 📊 State Dependencies

| State Variable | Source | Used By | Risk |
|---|---|---|---|
| `betAmount` | Local state (line 43) | Bet placement | 🟡 Not persisted |
| `displayMultiplier` | Local state (line 44) | UI display | 🟡 Client-only |
| `status` | Local state (line 45) | Game flow | 🟡 Sync issue (ref + state) |
| `balance` | useCasinoStore | Validation | 🔴 Client-side wallet |
| `crashHistory` | useCasinoStore (line 34) | Fairness info | 🟢 Read-only |
| `liveBets` | Local state (line 50) | Live feed | 🟡 Not persisted |
| `autoBetSettings` | useCasinoStore (line 61) | Auto mode | 🟡 Decoupled from core |

---

## 🔗 External Dependencies

| Dependency | Used For | Location |
|---|---|---|
| `useCasinoStore` | State mgmt | crash/page.tsx:5 |
| `CasinoCore.placeBet()` | Game logic | casino-core.ts:29 |
| `ProvablyFairEngine` | Randomness | provably-fair.ts:11 |
| `soundManager` | Audio | crash/page.tsx:7 |
| `framer-motion` | Animations | crash/page.tsx:8 |
| `@clerk/nextjs` | Auth | crash/page.tsx:4 |
| `lucide-react` | Icons | crash/page.tsx:3 |

---

## 🚨 Identified Issues

1. **Monolithic Component**: All logic inline (969 LOC)
   - Should split: GameController → GameCanvas → GameUI

2. **Ref + State Sync**: statusRef & status both tracked (lines 79, 84)
   - Risk: Closure stale data in event listeners

3. **Client-Side Wallet**: Balance debit/credit in UI
   - Per MASTER_PLAN 1.4: "TODO — Server-Side State Transition"
   - Risk: Manipulable via console

4. **No Explicit Error Boundaries**: Missing try-catch in game loop
   - Per AGENTS.md: "Bug-Hunter must inject error boundaries"

5. **Auto-Bet Decoupled**: autoBetSettings in store but execution in component
   - Risk: Config + execution drift
