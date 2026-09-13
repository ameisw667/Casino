import { logger, metadata, schemaTask, wait } from '@trigger.dev/sdk';
import { z } from 'zod';
import { sendTelegramMessage } from '../lib/casino/telegram-api';

export const fraudAlertWaitPayloadSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().min(1),
  signalType: z.string().min(1),
  score: z.number().nonnegative(),
  details: z.unknown().optional(),
  // 06_9 L2: marks the single escalation round after the first 48h wait timed out.
  escalated: z.boolean().optional(),
});

export type FraudAlertWaitPayload = z.infer<typeof fraudAlertWaitPayloadSchema>;

export function buildFraudAlertMessage(
  payload: FraudAlertWaitPayload,
  appUrl = 'https://casino-nine-omega.vercel.app',
): string {
  return [
    payload.escalated
      ? '🚨 ESKALATION: High-Severity Fraud-Signal seit 48h unbeachtet!'
      : '⚠️ High-Severity Fraud-Signal erkannt!',
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

  // 2. Create wait token with 48h timeout. The escalation round gets its own
  // idempotency key — reusing the base key would collide with the (already expired)
  // token of the original run and fail the second wait immediately.
  const token = await wait.createToken({
    timeout: '48h',
    idempotencyKey: `fraud-wait-${payload.eventId}${payload.escalated ? '-escalation' : ''}`,
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

  // 06_9 L2: exactly ONE escalation round — an unreviewed 48h timeout re-triggers the
  // same task with a sharper message. If the escalation run also times out, the signal
  // stays open for human decision instead of escalating forever (alert fatigue).
  // Fire-and-forget: escalation dispatch must not fail the task run itself.
  if (!payload.escalated) {
    try {
      void fraudAlertWait
        .trigger({ ...payload, escalated: true })
        .catch((error: unknown) => logger.error('Fraud escalation re-trigger failed', { error }));
    } catch (error) {
      logger.error('Fraud escalation re-trigger could not be enqueued', { error });
    }
  } else {
    logger.log('Escalated fraud signal timed out again — no further escalation rounds', {
      eventId: payload.eventId,
    });
  }

  return {
    eventId: payload.eventId,
    resolved: false,
    timedOut: true,
  };
}

export const fraudAlertWait = schemaTask({
  id: 'fraud-alert-wait',
  schema: fraudAlertWaitPayloadSchema,
  // 48h token wait + 1h buffer: if maxDuration exactly equals the waitpoint timeout, the
  // run can be cancelled at the same instant the token resolves its timeout — the
  // escalation branch below would then never execute (security review 2026-09-06).
  maxDuration: 172800 + 3600,
  run: async (payload) => executeFraudAlertWait(payload),
});
