'use client';

export function GameSkeleton() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-950 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-slate-800/50 border-b border-slate-700/50" />

      {/* Main content skeleton */}
      <div className="flex gap-4 p-8">
        {/* Sidebar skeleton */}
        <div className="w-80 space-y-4">
          <div className="h-12 bg-slate-700/50 rounded-lg" />
          <div className="h-32 bg-slate-700/50 rounded-lg" />
          <div className="h-24 bg-slate-700/50 rounded-lg" />
        </div>

        {/* Game area skeleton */}
        <div className="flex-1 space-y-6">
          <div className="h-96 bg-slate-700/50 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-700/50 rounded-lg" />
            <div className="h-20 bg-slate-700/50 rounded-lg" />
            <div className="h-20 bg-slate-700/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-square rounded-xl bg-slate-700/50 animate-pulse" />
  );
}

export function StatSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-slate-700/50 rounded w-3/4" />
      <div className="h-6 bg-slate-700/50 rounded w-1/2" />
    </div>
  );
}
