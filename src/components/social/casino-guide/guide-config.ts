export type GuideTurn = {
  id: string;
  role: 'guide' | 'player';
  text: string;
  time: string;
  image?: string;
  action?: {
    type: string;
    target?: string;
    label: string;
  };
  suggestions?: string[];
};

export type CasinoGuidePanelProps = {
  isMobile: boolean;
  onOpen: () => void;
};

export const getCurrentTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const INITIAL_TURN: GuideTurn = {
  id: 'royale-guide-intro',
  role: 'guide',
  text: 'Willkommen bei Royale Guide, deinem persönlichen KI-Casino-Assistenten. Wähle ein Schnellthema oder frage mich zu Spielregeln, VIP-Rängen, Limits oder Navigation.',
  time: getCurrentTime(),
};

export const QUICK_CHIPS = [
  {
    label: 'Blackjack',
    query: 'Wie funktioniert Split und Double Down bei Blackjack?',
  },
  {
    label: 'Crash',
    query: 'Wie berechnet sich der Crash Multiplikator und Cashout?',
  },
  {
    label: 'VIP Ränge',
    query: 'Welche VIP-Stufen und Rakeback-Vorteile gibt es?',
  },
  {
    label: 'Provably Fair',
    query: 'Wie funktioniert das Provably Fair Seed-System?',
  },
  {
    label: 'Navigation',
    query: 'Wo finde ich meine Wetthistorie und den Tresor?',
  },
] as const;

export const SIDEBAR_TOPICS = [
  {
    category: 'Spiele & Regeln',
    items: [
      {
        label: 'Blackjack Regeln',
        sub: 'Split, Double Down & Dealer-Regeln',
        query: 'Wie funktioniert Split und Double Down bei Blackjack?',
        tag: 'BJ',
      },
      {
        label: 'Crash Multiplikator',
        sub: 'Multiplikator-Kurve & Auto-Cashout',
        query: 'Wie berechnet sich der Crash Multiplikator und Cashout?',
        tag: 'CR',
      },
      {
        label: 'Roulette Quoten',
        sub: 'Auszahlungsquoten & Einsatzfelder',
        query: 'Welche Auszahlungsquoten haben Straight und Farben bei Roulette?',
        tag: 'RL',
      },
      {
        label: 'Dice Wahrscheinlichkeit',
        sub: 'Roll Under, EV & Multiplikatoren',
        query: 'Wie funktioniert Roll Under und der Multiplikator bei Dice?',
        tag: 'DC',
      },
      {
        label: 'Slots Walzen & 7s',
        sub: 'Symbol-Hierarchie & Gewinnlinien',
        query: 'Welche Symbol-Hierarchie und Auszahlungslinien gibt es bei Slots?',
        tag: 'SL',
      },
    ],
  },
  {
    category: 'VIP & Fairness',
    items: [
      {
        label: 'VIP Ränge & Level',
        sub: 'Stufen-Aufstieg & Rakeback-Vorteile',
        query: 'Welche VIP-Stufen und Rakeback-Vorteile gibt es?',
        tag: 'VIP',
      },
      {
        label: 'Provably Fair Seed',
        sub: 'Kryptografischer Seed-Nachweis',
        query: 'Wie funktioniert das Provably Fair Seed-System?',
        tag: 'PF',
      },
      {
        label: 'Einsatz-Limits',
        sub: 'Mindest- & Maximaleinsätze je Spiel',
        query: 'Wie hoch sind die Mindest- und Maximaleinsätze?',
        tag: 'LIM',
      },
    ],
  },
  {
    category: 'Plattform',
    items: [
      {
        label: 'Navigation & Menü',
        sub: 'Tresor, Wetthistorie & Einstellungen',
        query: 'Wo finde ich meine Wetthistorie und den Tresor?',
        tag: 'NAV',
      },
      {
        label: 'Chat-Befehle',
        sub: '/help, /stats & VIP-Shortcuts',
        query: 'Welche Chat-Befehle wie /help oder /stats gibt es?',
        tag: 'CMD',
      },
    ],
  },
] as const;

export function nextTurnId(role: GuideTurn['role']): string {
  return `${role}-${crypto.randomUUID()}`;
}
