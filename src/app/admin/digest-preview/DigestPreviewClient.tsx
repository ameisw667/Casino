'use client';

import { useState } from 'react';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import { Play, CheckCircle2, AlertTriangle, Loader2, Sparkles, Send } from 'lucide-react';
import type { digestPreview } from '@/trigger/digest-preview';

interface StartPreviewResponse {
  success?: boolean;
  runId?: string;
  publicAccessToken?: string;
  error?: string;
}

export default function DigestPreviewClient() {
  const [runId, setRunId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const { run, error: realtimeError } = useRealtimeRun<typeof digestPreview>(runId ?? '', {
    accessToken: token ?? undefined,
    enabled: Boolean(runId && token),
  });

  const handleStartPreview = async () => {
    setInitiating(true);
    setStartError(null);
    try {
      const res = await fetch('/api/admin/digest-preview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const raw = await res.json();
      const data: StartPreviewResponse = (raw?.data ?? raw) as StartPreviewResponse;
      if (!res.ok || !data.runId || !data.publicAccessToken) {
        throw new Error(data.error ?? 'Preview-Start fehlgeschlagen');
      }
      setRunId(data.runId);
      setToken(data.publicAccessToken);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Unerwarteter Fehler');
    } finally {
      setInitiating(false);
    }
  };

  const status = run?.status ?? 'IDLE';
  const progress = typeof run?.metadata?.progress === 'number' ? run.metadata.progress : 0;
  const currentStep = typeof run?.metadata?.step === 'string' ? run.metadata.step : 'idle';
  const output = run?.output;

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 md:flex-row md:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Daily Digest Live-Vorschau
              </h1>
            </div>
            <p className="text-sm text-zinc-400">
              Echtzeit-Ausführung via Trigger.dev Realtime (Electric SQL). Garantierter Dry-Run ohne
              Telegram-Versand.
            </p>
          </div>
          <button
            onClick={handleStartPreview}
            disabled={initiating || status === 'EXECUTING'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] px-5 py-2.5 text-sm font-medium text-black shadow-lg shadow-[#D4AF37]/10 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {initiating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Starte Run...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Live-Vorschau starten</span>
              </>
            )}
          </button>
        </div>

        {/* Error Banners */}
        {startError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-800/50 bg-red-950/40 p-4 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Fehler beim Starten:</p>
              <p>{startError}</p>
            </div>
          </div>
        )}

        {realtimeError && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-800/50 bg-yellow-950/40 p-4 text-sm text-yellow-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-300">Realtime-Verbindungsfehler:</p>
              <p>{realtimeError.message}</p>
            </div>
          </div>
        )}

        {/* Status & Progress Card */}
        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-xs tracking-wider text-zinc-500 uppercase">
                Run ID
              </span>
              <p className="font-mono text-sm text-zinc-300">{runId ?? 'Kein aktiver Lauf'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wider text-zinc-500 uppercase">
                Status
              </span>
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs font-medium ${
                  status === 'COMPLETED'
                    ? 'border border-emerald-800/60 bg-emerald-950/80 text-emerald-300'
                    : ['EXECUTING', 'QUEUED', 'WAITING', 'DEQUEUED'].includes(status as string)
                      ? 'border border-amber-800/60 bg-amber-950/80 text-amber-300'
                      : ['FAILED', 'CRASHED', 'SYSTEM_FAILURE'].includes(status as string)
                        ? 'border border-red-800/60 bg-red-950/80 text-red-300'
                        : 'border border-zinc-700/60 bg-zinc-800/60 text-zinc-400'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {runId && (
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs text-zinc-400">
                <span>Schritt: {currentStep}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Step Timeline */}
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            {[
              { id: 'querying_db', label: '1. Supabase Query' },
              { id: 'aggregating', label: '2. Aggregation' },
              { id: 'formatting_message', label: '3. Message Build' },
              { id: 'completed', label: '4. Fertig' },
            ].map((step) => {
              const isDone =
                status === 'COMPLETED' ||
                (step.id === 'querying_db' &&
                  ['aggregating', 'formatting_message', 'completed'].includes(currentStep)) ||
                (step.id === 'aggregating' &&
                  ['formatting_message', 'completed'].includes(currentStep)) ||
                (step.id === 'formatting_message' && ['completed'].includes(currentStep));
              const isCurrent = currentStep === step.id && status !== 'COMPLETED';

              return (
                <div
                  key={step.id}
                  className={`rounded-xl border p-3 transition-colors ${
                    isDone
                      ? 'border-emerald-800/40 bg-emerald-950/20 text-emerald-300'
                      : isCurrent
                        ? 'border-amber-800/40 bg-amber-950/20 text-amber-300'
                        : 'border-zinc-800/40 bg-zinc-900/40 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-400" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-zinc-700" />
                    )}
                    <span className="font-medium">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telegram Message Preview Card */}
        {output?.message && (
          <div className="space-y-4 rounded-2xl border border-[#D4AF37]/30 bg-zinc-950/80 p-6 shadow-2xl shadow-[#D4AF37]/5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Send className="h-4 w-4" />
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  Generierte Telegram-Nachricht (Dry-Run)
                </h2>
              </div>
              <span className="rounded-md border border-emerald-800 bg-emerald-950 px-2.5 py-0.5 font-mono text-xs text-emerald-300">
                Nicht gesendet (Dry-Run)
              </span>
            </div>
            <pre className="rounded-xl border border-zinc-800/80 bg-black/70 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-200">
              {output.message}
            </pre>
            <div className="flex items-center justify-between pt-2 font-mono text-xs text-zinc-500">
              <span>Wetten analysiert: {output.betCount}</span>
              <span>Kalendertag: {output.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
