import { type GameConfig, DEFAULT_GAME_CONFIG, validateBetWithConfig } from './game-config';

/**
 * Legacy validator using embedded defaults.
 * Prefer passing a GameConfig for server-side / up-to-date validation.
 */
export function validateBet(
  betAmount: number,
  balance: number,
  config: GameConfig = DEFAULT_GAME_CONFIG,
): string | null {
  return validateBetWithConfig(betAmount, balance, config);
}
