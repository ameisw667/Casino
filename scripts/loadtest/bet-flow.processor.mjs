// worldmap/05_Observability_und_Lasttest.md (P28/1.16, L5) — assigns each Artillery
// virtual user a distinct synthetic player id (kept stable across the whole VU flow via
// context.vars), so the load test measures genuine multi-user concurrency on the bet
// path instead of every VU serializing on the single dev_user_fallback advisory lock.
import { randomUUID } from 'node:crypto';

export function assignLoadtestUser(context, events, done) {
  context.vars.loadtestUserId = `vu-${randomUUID()}`;
  return done();
}
