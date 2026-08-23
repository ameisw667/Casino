import {
  CircleDot,
  Compass,
  Crown,
  Dices,
  Layers,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  TrendingUp,
} from 'lucide-react';

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
    icon: Layers,
  },
  {
    label: 'Crash',
    query: 'Wie berechnet sich der Crash Multiplikator und Cashout?',
    icon: TrendingUp,
  },
  { label: 'VIP Ränge', query: 'Welche VIP-Stufen und Rakeback-Vorteile gibt es?', icon: Crown },
  {
    label: 'Provably Fair',
    query: 'Wie funktioniert das Provably Fair Seed-System?',
    icon: ShieldCheck,
  },
  { label: 'Navigation', query: 'Wo finde ich meine Wetthistorie und den Tresor?', icon: Compass },
] as const;

export const SIDEBAR_TOPICS = [
  {
    category: 'Spiele & Regeln',
    items: [
      {
        label: 'Blackjack Regeln',
        query: 'Wie funktioniert Split und Double Down bei Blackjack?',
        icon: Layers,
      },
      {
        label: 'Crash Multiplikator',
        query: 'Wie berechnet sich der Crash Multiplikator und Cashout?',
        icon: TrendingUp,
      },
      {
        label: 'Roulette Quoten',
        query: 'Welche Auszahlungsquoten haben Straight und Farben bei Roulette?',
        icon: CircleDot,
      },
      {
        label: 'Dice Wahrscheinlichkeit',
        query: 'Wie funktioniert Roll Under und der Multiplikator bei Dice?',
        icon: Dices,
      },
      {
        label: 'Slots Walzen & 7s',
        query: 'Welche Symbol-Hierarchie und Auszahlungslinien gibt es bei Slots?',
        icon: Sparkles,
      },
    ],
  },
  {
    category: 'VIP & Fairness',
    items: [
      {
        label: 'VIP Ränge & Level',
        query: 'Welche VIP-Stufen und Rakeback-Vorteile gibt es?',
        icon: Crown,
      },
      {
        label: 'Provably Fair Seed',
        query: 'Wie funktioniert das Provably Fair Seed-System?',
        icon: ShieldCheck,
      },
      {
        label: 'Einsatz-Limits',
        query: 'Wie hoch sind die Mindest- und Maximaleinsätze?',
        icon: Sliders,
      },
    ],
  },
  {
    category: 'Plattform',
    items: [
      {
        label: 'Navigation & Menü',
        query: 'Wo finde ich meine Wetthistorie und den Tresor?',
        icon: Compass,
      },
      {
        label: 'Chat-Befehle',
        query: 'Welche Chat-Befehle wie /help oder /stats gibt es?',
        icon: Terminal,
      },
    ],
  },
] as const;

export function nextTurnId(role: GuideTurn['role']): string {
  return `${role}-${crypto.randomUUID()}`;
}
