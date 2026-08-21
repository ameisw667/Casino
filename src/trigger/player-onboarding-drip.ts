import { logger, metadata, schemaTask, wait } from '@trigger.dev/sdk';
import { z } from 'zod';
import { createAdminClient } from '../utils/supabase/admin';
import { sendTelegramMessage } from '../lib/casino/telegram-api';
import { setTelegramNotificationsEnabled } from '../lib/casino/telegram-link';

const TELEGRAM_FORBIDDEN_STATUS = 403;

export const playerOnboardingDripPayloadSchema = z.object({
  userId: z.string().min(1),
  chatId: z.number().int(),
  username: z.string().optional(),
});

export type PlayerOnboardingDripPayload = z.infer<typeof playerOnboardingDripPayloadSchema>;

export function buildDay0WelcomeMessage(username?: string): string {
  const greeting = username ? `Hallo @${username}` : 'Hallo';
  return [
    `🎰 Willkommen im Royale Casino, ${greeting}!`,
    '',
    '• Dein Startguthaben von 10.000 Coins ist freigeschaltet.',
    '• Teste deine Strategie in Blackjack, Crash, Roulette, Slots & Dice.',
    '• Bei Fragen steht dir unser interaktiver Royale AI-Guide zur Seite.',
    '',
    'Viel Erfolg an den Tischen!',
  ].join('\n');
}

export function buildDay2Message(betCount: number): string {
  if (betCount === 0) {
    return [
      '💎 Dein Startguthaben wartet!',
      '',
      'Du hast deine 10.000 Gratis-Coins noch nicht eingesetzt.',
      'Starte noch heute mit einer Runde Dice oder Slots und sichere dir deine ersten Gewinne!',
    ].join('\n');
  }

  return [
    '🔥 Starker Einstieg!',
    '',
    `Du hast bereits ${betCount} Wette${betCount === 1 ? '' : 'n'} platziert.`,
    'Wirf einen Blick in deinen VIP-Vault, um deinen Level-Aufstieg und Rang-Vorteile zu verfolgen!',
  ].join('\n');
}

export function buildDay7Message(): string {
  return [
    '🏆 Willkommen im regulären Spielbetrieb!',
    '',
    'Deine erste Casino-Woche ist abgeschlossen.',
    'Ab jetzt erhältst du jeden Montag um 09:00 Uhr deinen persönlichen Wochenrückblick mit deinen wichtigsten Statistiken & Gewinnen.',
  ].join('\n');
}

async function sendStageNotification(
  userId: string,
  chatId: number,
  message: string,
): Promise<{ ok: boolean; blocked?: boolean }> {
  const admin = createAdminClient();
  const { data: link, error } = await admin
    .from('telegram_links')
    .select('notifications_enabled')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !link || !link.notifications_enabled) {
    return { ok: false };
  }

  const result = await sendTelegramMessage(chatId, message);
  if (!result.ok) {
    if (result.status === TELEGRAM_FORBIDDEN_STATUS) {
      await setTelegramNotificationsEnabled(userId, false);
      return { ok: false, blocked: true };
    }
    throw new Error(`Onboarding drip: Telegram send failed (status ${result.status})`);
  }

  return { ok: true };
}

export async function executePlayerOnboardingDrip(payload: PlayerOnboardingDripPayload) {
  logger.log('Starting player onboarding drip', { userId: payload.userId });
  metadata.set('userId', payload.userId);
  metadata.set('stage', 'day_0_start');

  // --- STAGE 1: Tag 0 (Sofort) ---
  const day0Message = buildDay0WelcomeMessage(payload.username);
  const day0Result = await sendStageNotification(payload.userId, payload.chatId, day0Message);
  if (!day0Result.ok) {
    logger.log('Onboarding drip aborted at Stage 1 (opted out or blocked)', { userId: payload.userId });
    return { completed: false, reason: 'unlinked_or_muted', stage: 'day_0' };
  }
  metadata.set('stage', 'day_0_sent');

  // --- Durable Sleep: 2 Tage pausieren ---
  await wait.for({ days: 2 });

  // --- STAGE 2: Tag 2 (State-Aware Branching) ---
  const admin = createAdminClient();
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [walletRes, roundsRes] = await Promise.all([
    admin
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('type', 'bet_settled')
      .gte('created_at', fortyEightHoursAgo),
    admin
      .from('game_rounds')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('status', 'SETTLED')
      .gte('updated_at', fortyEightHoursAgo),
  ]);

  const recentBetsCount = (walletRes.data?.length ?? 0) + (roundsRes.data?.length ?? 0);
  const day2Message = buildDay2Message(recentBetsCount);

  const day2Result = await sendStageNotification(payload.userId, payload.chatId, day2Message);
  if (!day2Result.ok) {
    logger.log('Onboarding drip aborted at Stage 2 (opted out or blocked)', { userId: payload.userId });
    return { completed: false, reason: 'unlinked_or_muted', stage: 'day_2' };
  }
  metadata.set('stage', 'day_2_sent');
  metadata.set('recentBetsCount', recentBetsCount);

  // --- Durable Sleep: 5 Tage pausieren (Tag 7) ---
  await wait.for({ days: 5 });

  // --- STAGE 3: Tag 7 (Handoff to Weekly Recap) ---
  const day7Message = buildDay7Message();
  const day7Result = await sendStageNotification(payload.userId, payload.chatId, day7Message);
  if (!day7Result.ok) {
    logger.log('Onboarding drip aborted at Stage 3 (opted out or blocked)', { userId: payload.userId });
    return { completed: false, reason: 'unlinked_or_muted', stage: 'day_7' };
  }

  metadata.set('stage', 'completed');
  logger.log('Player onboarding drip completed successfully', { userId: payload.userId });

  return {
    completed: true,
    userId: payload.userId,
    stagesCompleted: 3,
  };
}

export const playerOnboardingDrip = schemaTask({
  id: 'player-onboarding-drip',
  schema: playerOnboardingDripPayloadSchema,
  queue: {
    name: 'onboarding-drip-queue',
    concurrencyLimit: 5,
  },
  run: async (payload) => executePlayerOnboardingDrip(payload),
});
