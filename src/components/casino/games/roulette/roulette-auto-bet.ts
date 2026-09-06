export type AutoBetStopReason =
  { type: 'limit'; maxAllowed: number } | { type: 'profit' } | { type: 'loss' } | null;

export function getAutoBetStopReason({
  autoCount,
  numberOfBets,
  profit,
  stopOnProfit,
  stopOnLoss,
}: {
  autoCount: number;
  numberOfBets: number;
  profit: number;
  stopOnProfit: number;
  stopOnLoss: number;
}): AutoBetStopReason {
  const maxAllowed = numberOfBets > 0 ? numberOfBets : 500;

  if (autoCount >= maxAllowed) return { type: 'limit', maxAllowed };
  if (stopOnProfit > 0 && profit >= stopOnProfit) return { type: 'profit' };
  if (stopOnLoss > 0 && profit < 0 && Math.abs(profit) >= stopOnLoss) return { type: 'loss' };

  return null;
}
