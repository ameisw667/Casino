import { useMemo, useState, useCallback, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export const STORAGE_KEY_HUD_EXPANDED = 'casino_copilot_hud_expanded';
export const STORAGE_KEY_HUD_VISIBLE = 'casino_copilot_hud_visible';
import {
  getBlackjackRecommendation,
  getCrashCurrentZone,
  getRouletteOdds,
  getDiceOdds,
  type CoPilotRecommendation,
  type RouletteBetKind,
} from '@/lib/casino/copilot-math';
import type { Card } from '@/lib/games/blackjack';

export type CoPilotGameType = 'BLACKJACK' | 'CRASH' | 'ROULETTE' | 'DICE' | 'SLOTS';

export interface GameCoPilotContext {
  gameType: CoPilotGameType;
  blackjackState?: {
    playerScore: number;
    dealerUpcard?: Card | null;
    isSoft?: boolean;
    canSplit?: boolean;
    canDouble?: boolean;
    cards?: Card[];
    phase?: string;
    betAmount?: number;
  };
  crashState?: {
    multiplier: number;
    status: string;
    hasPlacedBet?: boolean;
  };
  rouletteState?: {
    lastSelectedBet?: RouletteBetKind;
  };
  diceState?: {
    target: number;
    isOver: boolean;
  };
  slotsState?: {
    betAmount?: number;
    isSpinning?: boolean;
  };
}

export interface UseGameCoPilotOptions {
  defaultExpanded?: boolean;
}

export function useGameCoPilot(context: GameCoPilotContext, options?: UseGameCoPilotOptions) {
  const initialExpanded = options?.defaultExpanded ?? false;
  const storageKey = `${STORAGE_KEY_HUD_EXPANDED}_${context.gameType.toLowerCase()}`;

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return initialExpanded;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? stored === 'true' : initialExpanded;
    } catch {
      return initialExpanded;
    }
  });

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HUD_VISIBLE);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const mounted = useHydrated();

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, [storageKey]);

  const toggleVisible = useCallback(() => {
    setIsVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_HUD_VISIBLE, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Compute recommendation deterministically based on active game context
  const recommendation = useMemo<CoPilotRecommendation>(() => {
    const { gameType, blackjackState, crashState, rouletteState, diceState } = context;

    // 1. Blackjack
    if (gameType === 'BLACKJACK' && blackjackState) {
      const { playerScore, isSoft, cards, dealerUpcard, canDouble, canSplit, phase } =
        blackjackState;

      if (!cards || cards.length === 0 || phase === 'IDLE' || phase === 'SETTLEMENT') {
        return {
          action: 'RUNDE BEREIT',
          winProbability: 49.5,
          expectedValue: -0.005,
          reasoning:
            'Setze deinen Wetteinsatz. Basic Strategy empfiehlt max. 1-2% Bankroll pro Runde.',
          riskLevel: 'low',
          badgeText: 'Pre-Round Guide',
          suggestedPrompt: 'Was ist das optimale Bankroll-Management beim Blackjack?',
          metrics: [
            { label: 'Basis-Hausvorteil', value: '0.50%' },
            { label: 'Regel', value: 'Dealer steht auf Soft 17' },
          ],
        };
      }

      return getBlackjackRecommendation({
        playerScore,
        isSoft: isSoft ?? false,
        cards,
        dealerUpcard,
        canDouble: canDouble ?? true,
        canSplit: canSplit ?? false,
      });
    }

    // 2. Crash
    if (gameType === 'CRASH' && crashState) {
      const { multiplier, status } = crashState;
      if (status === 'RUNNING' && multiplier >= 1.0) {
        return getCrashCurrentZone(multiplier);
      }

      if (status === 'CRASHED') {
        return {
          action: 'RUNDE BEENDET',
          winProbability: 0,
          expectedValue: -0.01,
          reasoning: `Der Multiplikator ist gecrasht. Starte die nächste Runde mit kontrolliertem Einsatz.`,
          riskLevel: 'medium',
          badgeText: 'Crash Settled',
          suggestedPrompt: 'Wie funktioniert der Provably Fair Algorithmus bei Crash?',
        };
      }

      return {
        action: 'EINSATZ WÄHLEN',
        winProbability: 49.5,
        expectedValue: -0.01,
        reasoning: 'Auto-Cashout bei 1.50x bis 2.00x liefert statistisch die stabilste Rendite.',
        riskLevel: 'low',
        badgeText: 'Pre-Flight Radar',
        suggestedPrompt: 'Welcher Auto-Cashout Multiplikator ist mathematisch am besten?',
        metrics: [
          { label: 'Hausvorteil', value: '1.0%' },
          { label: 'Auto-Cashout Tipp', value: '1.80x - 2.20x' },
        ],
      };
    }

    // 3. Roulette
    if (gameType === 'ROULETTE') {
      const betKind = rouletteState?.lastSelectedBet || 'red';
      return getRouletteOdds(betKind);
    }

    // 4. Dice
    if (gameType === 'DICE') {
      const target = diceState?.target ?? 50;
      const isOver = diceState?.isOver ?? true;
      return getDiceOdds(target, isOver);
    }

    // 5. Slots
    return {
      action: 'VOLATILITÄTS-RADAR',
      winProbability: 35.0,
      expectedValue: -0.035,
      reasoning:
        'Slots haben eine mittlere bis hohe Volatilität. Größere Gewinne entstehen in Freispiel- und Multiplikator-Phasen.',
      riskLevel: 'medium',
      badgeText: 'RTP ~96.5%',
      suggestedPrompt: 'Wie hoch ist die Trefferquote bei den Slots?',
      metrics: [
        { label: 'Theoretischer RTP', value: '96.5%' },
        { label: 'Volatilität', value: 'Mittel - Hoch' },
      ],
    };
  }, [context]);

  // Quick Action to open Royale Guide Chat with prefilled prompt
  const openInRoyaleGuide = useCallback(
    (customPrompt?: string) => {
      const promptToUse = customPrompt || recommendation.suggestedPrompt;
      const event = new CustomEvent('royale-guide-open-with-prompt', {
        detail: { prompt: promptToUse },
      });
      window.dispatchEvent(event);
    },
    [recommendation.suggestedPrompt],
  );

  return {
    recommendation,
    isExpanded,
    isVisible,
    mounted,
    toggleExpanded,
    toggleVisible,
    openInRoyaleGuide,
  };
}
