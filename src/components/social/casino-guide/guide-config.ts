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
  // True for a client-generated fallback/error notice (offline, non-2xx response, empty
  // stream) rendered with role 'guide' so it visually matches a real answer. Never actually
  // said by the model — must be excluded when building the history payload sent back to it.
  isSystemNotice?: boolean;
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

// Only these 5 slugs have a real /games/<slug> route. The server's trigger_ui_action
// allowlist (UI_ACTION_TARGETS in guide-tools.ts) is shared across every action type and
// also permits non-game targets like "vault" or "settings" — nothing there stops the model
// from pairing action: "navigate_game" with one of those, which would otherwise send the
// player to a dead-end /games/vault route.
const GUIDE_ACTION_GAME_TARGETS = ['blackjack', 'crash', 'dice', 'roulette', 'slots'] as const;

export function resolveGuideActionRoute(action: { type: string; target?: string }): string | null {
  switch (action.type) {
    case 'open_vault':
    case 'open_settings':
    case 'open_rank_benefits':
      return '/vault';
    case 'open_history':
      return '/history';
    case 'open_leaderboard':
      return '/leaderboard';
    case 'navigate_game': {
      if (!action.target) return null;
      const cleanTarget = action.target.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (GUIDE_ACTION_GAME_TARGETS as readonly string[]).includes(cleanTarget)
        ? `/games/${cleanTarget}`
        : null;
    }
    default:
      return null;
  }
}
