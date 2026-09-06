export interface SampleAction {
  type: 'navigate_game';
  label: string;
}

export interface SampleConversationTurn {
  id: string;
  role: 'guide' | 'player';
  text: string;
  time: string;
  action?: SampleAction;
  suggestions?: string[];
}

export const SAMPLE_CONVERSATION: SampleConversationTurn[] = [
  {
    id: 'msg-1',
    role: 'guide',
    text: 'Willkommen bei Royale Guide. Wähle ein Schnellthema oder stelle eine konkrete Frage zu Spielregeln, Quoten oder VIP-Limits.',
    time: '21:40',
  },
  {
    id: 'msg-2',
    role: 'player',
    text: 'Wie funktioniert Double Down bei Blackjack und wann lohnt sich das mathematisch am meisten?',
    time: '21:41',
  },
  {
    id: 'msg-3',
    role: 'guide',
    text: `### 🃏 Double Down — Regeln & Mathematische EV-Tabelle

Beim **Double Down (Verdoppeln)** verdoppelst du deinen ursprünglichen Einsatz nach den ersten 2 Karten und erhältst **exakt eine einzige weitere Karte**.

#### Mathematische Best-Practice Matrix:
| Deine Starthand | Dealer Upcard | Erwartungswert (EV) | Empfohlene Aktion |
| :--- | :--- | :--- | :--- |
| **Hard 11** | 2 bis 10 | **+0.66 per Unit** | **Immer Double Down** |
| **Hard 10** | 2 bis 9 | **+0.54 per Unit** | **Double Down** |
| **Hard 9** | 3 bis 6 | **+0.28 per Unit** | **Double Down** |
| **Soft 18 (A,7)**| 3 bis 6 | **+0.39 per Unit** | **Double Down** (sonst Stand) |

> **Formel für Expected Value:**
\\[ EV = P(\\text{Win}) \\times (2 \\times \\text{Bet}) - P(\\text{Loss}) \\times (2 \\times \\text{Bet}) \\]

*Tipp:* Gegen eine Dealer-10 oder ein Dealer-Ass ist das Risiko bei Hard 9 und 10 höher – hier wird nach Basic Strategy nur gezogen (*Hit*).`,
    time: '21:42',
    action: {
      type: 'navigate_game',
      label: 'Direkt zu Blackjack wechseln',
    },
    suggestions: [
      'Wann sollte man Paare splitten?',
      'Wie hoch ist der Hausvorteil bei Blackjack?',
      'Was passiert bei Dealer Blackjack?',
    ],
  },
];
