'use client';

export function GameSkeleton() {
  return (
    <div className="h-screen w-full animate-pulse bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header skeleton */}
      <div className="h-16 border-b border-slate-700/50 bg-slate-800/50" />

      {/* Main content skeleton */}
      <div className="flex gap-4 p-8">
        {/* Sidebar skeleton */}
        <div className="w-80 space-y-4">
          <div className="h-12 rounded-lg bg-slate-700/50" />
          <div className="h-32 rounded-lg bg-slate-700/50" />
          <div className="h-24 rounded-lg bg-slate-700/50" />
        </div>

        {/* Game area skeleton */}
        <div className="flex-1 space-y-6">
          <div className="h-96 rounded-xl bg-slate-700/50" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 rounded-lg bg-slate-700/50" />
            <div className="h-20 rounded-lg bg-slate-700/50" />
            <div className="h-20 rounded-lg bg-slate-700/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <div className="aspect-square animate-pulse rounded-xl bg-slate-700/50" />;
}

export function StatSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-3/4 rounded bg-slate-700/50" />
      <div className="h-6 w-1/2 rounded bg-slate-700/50" />
    </div>
  );
}
