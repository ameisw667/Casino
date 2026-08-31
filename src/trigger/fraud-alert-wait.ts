import { logger, metadata, schemaTask, wait } from '@trigger.dev/sdk';
import { z } from 'zod';
import { sendTelegramMessage } from '../lib/casino/telegram-api';

export const fraudAlertWaitPayloadSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().min(1),
  signalType: z.string().min(1),
  score: z.number().nonnegative(),
  details: z.unknown().optional(),
});

export type FraudAlertWaitPayload = z.infer<typeof fraudAlertWaitPayloadSchema>;

export function buildFraudAlertMessage(
  payload: FraudAlertWaitPayload,
  appUrl = 'https://casino-nine-omega.vercel.app',
): string {
  return [
    '⚠️ High-Severity Fraud-Signal erkannt!',
    '',
    `Signal: ${payload.signalType}`,
    `Score: ${payload.score}`,
    `User-ID: ${payload.userId}`,
    `Event-ID: ${payload.eventId}`,
    '',
    `🔍 Zur Prüfung im Admin-Dashboard:`,
    `${appUrl}/admin/fraud?id=${payload.eventId}`,
  ].join('\n');
}

export async function executeFraudAlertWait(payload: FraudAlertWaitPayload) {
  logger.log('High-severity fraud alert triggered', {
    eventId: payload.eventId,
    userId: payload.userId,
    signalType: payload.signalType,
    score: payload.score,
  });

  metadata.set('eventId', payload.eventId);
  metadata.set('userId', payload.userId);
  metadata.set('signalType', payload.signalType);
  metadata.set('score', payload.score);
  metadata.set('status', 'waiting_for_admin_review');

  // 1. Send telegram alert message to admin
  const chatIdRaw = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (chatIdRaw) {
    const chatId = Number(chatIdRaw);
    if (Number.isFinite(chatId)) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://casino-nine-omega.vercel.app';
      const text = buildFraudAlertMessage(payload, appUrl);
      const delivery = await sendTelegramMessage(chatId, text);
      if (!delivery.ok) {
        logger.error('Failed to dispatch telegram fraud alert', { status: delivery.status });
      }
    }
  }

  // 2. Create wait token with 48h timeout
  const token = await wait.createToken({
    timeout: '48h',
    idempotencyKey: `fraud-wait-${payload.eventId}`,
  });

  metadata.set('tokenId', token.id);
  logger.log('Created waitpoint token for fraud signal', {
    tokenId: token.id,
    eventId: payload.eventId,
  });

  // 3. Pause run and wait for human decision in /admin/fraud
  const result = await wait.forToken<{
    status: 'reviewed' | 'closed';
    reason?: string;
    reviewerId?: string;
  }>(token.id);

  if (result.ok) {
    logger.log('Fraud signal decision received from admin', {
      eventId: payload.eventId,
      decision: result.output,
    });

    metadata.set('status', 'resolved');
    metadata.set('decision', result.output);
    metadata.set('resolved', true);

    return {
      eventId: payload.eventId,
      resolved: true,
      timedOut: false,
      decision: result.output,
    };
  }

  // Timeout path: 48h expired without human review. Signal remains open in /admin/fraud (no silent auto-reject).
  logger.log('Fraud signal waitpoint timed out (signal remains open in /admin/fraud)', {
    eventId: payload.eventId,
    error: result.error,
  });

  metadata.set('status', 'timed_out');
  metadata.set('timedOut', true);
  metadata.set('resolved', false);

  return {
    eventId: payload.eventId,
    resolved: false,
    timedOut: true,
  };
}

export const fraudAlertWait = schemaTask({
  id: 'fraud-alert-wait',
  schema: fraudAlertWaitPayloadSchema,
  maxDuration: 172800, // 48h in seconds
  run: async (payload) => executeFraudAlertWait(payload),
});
