-- Migration 049: Realtime Broadcast authorization for the Multiplayer-Crash room
-- (worldmap/05_multiplayercrash.md §4.1, §18).
--
-- Root cause found live (2026-08-23): this Supabase project uses Realtime Authorization —
-- Broadcast/Presence channels require an explicit policy on realtime.messages before any client
-- can subscribe, regardless of whether the channel is otherwise "public". Without this, the
-- server-side publish (src/lib/casino/realtime.ts, via the service_role client, which bypasses
-- RLS entirely) always succeeds silently, but every browser subscribe (crash/page.tsx, via the
-- anon/authenticated browser client) is rejected — explaining both the empty Realtime Inspector
-- and the absent websocket traffic observed during the live test. The REST poll fallback (NFR3)
-- masked this: the feature still worked, just without the low-latency broadcast path.
--
-- SELECT-only, deliberately: only the server ever publishes (service_role, RLS-exempt), so no
-- INSERT policy is needed here. Grants both anon and authenticated — the channel is intentionally
-- public/spectator-facing (see realtime.ts's own comment) and never carries a secret: crash_point/
-- server_seed are masked at the application layer (toPublicRoundState()) until the room has
-- actually crashed, independent of who can technically subscribe to the topic.

-- CREATE POLICY has no IF NOT EXISTS in Postgres (same reasoning as 039's fix, hit twice already
-- in this rollout) — DROP IF EXISTS first so a retried push is safe.
DROP POLICY IF EXISTS "crash_room_broadcast_receive" ON realtime.messages;

CREATE POLICY "crash_room_broadcast_receive"
ON realtime.messages
FOR SELECT
TO anon, authenticated
USING (
  realtime.topic() = 'crash-room'
  AND realtime.messages.extension = 'broadcast'
);
