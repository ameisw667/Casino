'use client';

import { useEffect, type Dispatch, type SetStateAction, type RefObject } from 'react';
import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';
import {
  CRASH_REALTIME_CHANNEL,
  CRASH_ROUND_EVENT,
  CRASH_PLAYER_EVENT,
  type CrashRoundBroadcastPayload,
  type CrashPlayerBroadcastPayload,
} from '@/lib/casino/realtime-types';
import { soundManager } from '@/lib/casino/sound-manager';
import { type Particle, type LiveBet } from '../crash/crash-helpers';

// Multiplayer adds a shared 'WAITING' betting window between IDLE and RUNNING
// that solo crash (../crash/crash-helpers CrashStatus) does not have, so this
// local union is the authoritative multiplayer status type — matches the
// inline union in crash-multiplayer/page.tsx and CrashMultiplayerStage.
type CrashStatus = 'IDLE' | 'WAITING' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT';

interface RoomClockParams {
  status: CrashStatus;
  roomRound: CrashRoundBroadcastPayload | null;
  setRoomRound: Dispatch<SetStateAction<CrashRoundBroadcastPayload | null>>;
  setLiveBets: Dispatch<SetStateAction<LiveBet[]>>;
  setRoomWaitDisplay: Dispatch<SetStateAction<string>>;
  setBettingWindowSecondsLeft: Dispatch<SetStateAction<number | null>>;
  setStatus: Dispatch<SetStateAction<CrashStatus>>;
  setBigWin: Dispatch<SetStateAction<{ amount: number; multiplier: number } | null>>;
  setMilestoneFlash: Dispatch<SetStateAction<{ value: number; key: number } | null>>;
  crashRoundIdRef: RefObject<string | null>;
  crashPointRef: RefObject<number>;
  multiplierRef: RefObject<number>;
  lastUpdateRef: RefObject<number>;
  roundResolvedRef: RefObject<boolean>;
  pointsRef: RefObject<{ x: number; y: number }[]>;
  particlesRef: RefObject<Particle[]>;
  bigWinQueueRef: RefObject<Array<{ amount: number; multiplier: number }>>;
  prngSeedRef: RefObject<number>;
  lastMilestoneIndexRef: RefObject<number>;
  bettingEndsAtMsRef: RefObject<number | null>;
  resetRiskVisuals: () => void;
}

/**
 * Multiplayer shared-room clock: the Realtime broadcast + REST poll fallback that drives the
 * room's live round state, the per-user betting-window countdown that triggers the synchronized
 * flight-start reset, and the spectator room-status line shown before this browser has bet.
 * Verbatim extraction from crash-multiplayer/page.tsx — dep arrays ([], [status, resetRiskVisuals],
 * [roomRound, status]) preserved exactly. Parent owns all state/refs; this hook only reads refs +
 * drives setters, identical to the inlined original.
 */
export function useCrashMultiplayerRoomClock(params: RoomClockParams) {
  const {
    status,
    roomRound,
    setRoomRound,
    setLiveBets,
    setRoomWaitDisplay,
    setBettingWindowSecondsLeft,
    setStatus,
    setBigWin,
    setMilestoneFlash,
    crashRoundIdRef,
    crashPointRef,
    multiplierRef,
    lastUpdateRef,
    roundResolvedRef,
    pointsRef,
    particlesRef,
    bigWinQueueRef,
    prngSeedRef,
    lastMilestoneIndexRef,
    bettingEndsAtMsRef,
    resetRiskVisuals,
  } = params;

  // Shared room clock: Realtime broadcast + REST poll fallback (NFR3).
  // Runs for the component's whole lifetime, independent of local `status` —
  // even a user who hasn't bet yet sees the room's live state. Reads
  // crashRoundIdRef so the effect doesn't need `status`/`roundId` in its
  // deps (mirrors the RAF-loop-via-refs pattern already used in this file).
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(CRASH_REALTIME_CHANNEL);

    const applyRoundUpdate = (round: CrashRoundBroadcastPayload) => {
      setRoomRound(round);
      if (
        round.status === 'CRASHED' &&
        round.id === crashRoundIdRef.current &&
        round.crashPoint !== null &&
        !roundResolvedRef.current
      ) {
        // Reveals the server-authoritative crash point (FR5: never known
        // earlier). The existing gameLoop crash-check (next >= crashPointRef)
        // then fires on the very next animation frame — no other change
        // needed there.
        crashPointRef.current = round.crashPoint;
      }
    };

    channel.on('broadcast', { event: CRASH_ROUND_EVENT }, ({ payload }) => {
      applyRoundUpdate(payload as CrashRoundBroadcastPayload);
    });
    channel.on('broadcast', { event: CRASH_PLAYER_EVENT }, ({ payload }) => {
      const event = payload as CrashPlayerBroadcastPayload;
      setLiveBets((previous) =>
        [
          {
            user: event.seat,
            amount: event.betAmount,
            multiplier: event.multiplier,
            payout: event.payout,
            action: event.action,
          },
          ...previous.filter((bet) => bet.user !== event.seat),
        ].slice(0, 20),
      );
    });
    channel.subscribe();

    let cancelled = false;
    const pollFallback = async () => {
      try {
        const response = await fetch('/api/casino/active-round?game=CRASH_MULTIPLAYER', {
          cache: 'no-store',
        });
        if (!response.ok || cancelled) return;
        const resJson = (await response.json()) as {
          data?: { sharedRound?: CrashRoundBroadcastPayload };
          sharedRound?: CrashRoundBroadcastPayload;
        };
        const data = resJson?.data ?? resJson;
        if (data?.sharedRound) applyRoundUpdate(data.sharedRound as CrashRoundBroadcastPayload);
      } catch {
        // Best-effort fallback only — Realtime broadcast remains primary.
      }
    };
    void pollFallback();
    const pollId = setInterval(pollFallback, 4000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, []);

  // Betting-window countdown for a user who HAS joined the current round.
  // When it reaches zero, the flight begins for every room member at the
  // same synchronized instant (started_at on the server) — this is where
  // the flight-start visual resets (previously fired immediately on bet
  // placement in the solo model) now happen instead.
  useEffect(() => {
    if (status !== 'WAITING') return;
    const tick = () => {
      const endsAt = bettingEndsAtMsRef.current;
      if (endsAt === null) return;
      const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setBettingWindowSecondsLeft(secondsLeft);
      if (Date.now() < endsAt) return;

      crashPointRef.current = Number.POSITIVE_INFINITY;
      multiplierRef.current = 1.0;
      lastUpdateRef.current = performance.now();
      roundResolvedRef.current = false;
      pointsRef.current = [{ x: 0, y: 1 }];
      particlesRef.current = [];
      bigWinQueueRef.current = [];
      setBigWin(null);
      prngSeedRef.current = Date.now() % 0x7fffffff || 1;
      lastMilestoneIndexRef.current = 0;
      setMilestoneFlash(null);
      resetRiskVisuals();
      setBettingWindowSecondsLeft(null);
      setStatus('RUNNING');
      soundManager.play('crash-launch');
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [status, resetRiskVisuals]);

  // Spectator room-status line (shown before this browser has bet) — ticked
  // via state instead of reading Date.now() directly in JSX (impure during
  // render, flagged by the React Compiler purity rule).
  useEffect(() => {
    if (!roomRound || status !== 'IDLE') return;
    const tick = () => {
      if (roomRound.status === 'WAITING') {
        const secondsLeft = Math.max(
          0,
          Math.ceil((new Date(roomRound.bettingEndsAt).getTime() - Date.now()) / 1000),
        );
        setRoomWaitDisplay(`Next window in ${secondsLeft}s`);
      } else if (roomRound.status === 'RUNNING') {
        setRoomWaitDisplay('Round in flight…');
      } else {
        setRoomWaitDisplay('Round just crashed');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roomRound, status]);
}
