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
      const data: StartPreviewResponse = await res.json();
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
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Daily Digest Live-Vorschau
              </h1>
            </div>
            <p className="text-sm text-zinc-400">
              Echtzeit-Ausführung via Trigger.dev Realtime (Electric SQL). Garantierter Dry-Run ohne Telegram-Versand.
            </p>
          </div>
          <button
            onClick={handleStartPreview}
            disabled={initiating || status === 'EXECUTING'}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#D4AF37]/10"
          >
            {initiating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Starte Run...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Live-Vorschau starten</span>
              </>
            )}
          </button>
        </div>

        {/* Error Banners */}
        {startError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-200 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Fehler beim Starten:</p>
              <p>{startError}</p>
            </div>
          </div>
        )}

        {realtimeError && (
          <div className="p-4 rounded-xl bg-yellow-950/40 border border-yellow-800/50 flex items-start gap-3 text-yellow-200 text-sm">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-300">Realtime-Verbindungsfehler:</p>
              <p>{realtimeError.message}</p>
            </div>
          </div>
        )}

        {/* Status & Progress Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">Run ID</span>
              <p className="font-mono text-sm text-zinc-300">{runId ?? 'Kein aktiver Lauf'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${
                  status === 'COMPLETED'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : ['EXECUTING', 'QUEUED', 'WAITING', 'DEQUEUED'].includes(status as string)
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : ['FAILED', 'CRASHED', 'SYSTEM_FAILURE'].includes(status as string)
                        ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                        : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/60'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {runId && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Schritt: {currentStep}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Step Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'querying_db', label: '1. Supabase Query' },
              { id: 'aggregating', label: '2. Aggregation' },
              { id: 'formatting_message', label: '3. Message Build' },
              { id: 'completed', label: '4. Fertig' },
            ].map((step) => {
              const isDone =
                status === 'COMPLETED' ||
                (step.id === 'querying_db' && ['aggregating', 'formatting_message', 'completed'].includes(currentStep)) ||
                (step.id === 'aggregating' && ['formatting_message', 'completed'].includes(currentStep)) ||
                (step.id === 'formatting_message' && ['completed'].includes(currentStep));
              const isCurrent = currentStep === step.id && status !== 'COMPLETED';

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : isCurrent
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                        : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
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
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-zinc-950/80 backdrop-blur-xl p-6 space-y-4 shadow-2xl shadow-[#D4AF37]/5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Send className="w-4 h-4" />
                <h2 className="text-sm font-semibold tracking-wide uppercase">Generierte Telegram-Nachricht (Dry-Run)</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Nicht gesendet (Dry-Run)
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-black/70 border border-zinc-800/80 font-mono text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {output.message}
            </pre>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2">
              <span>Wetten analysiert: {output.betCount}</span>
              <span>Kalendertag: {output.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
