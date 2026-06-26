export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer ${className}`} aria-hidden="true" />;
}

export function HeroSkeleton() {
  return (
    <div className="card overflow-hidden rounded-2xl p-8" style={{ minHeight: 400, background: "var(--bg-card-dark)", border: "none" }}>
      <div className="flex items-center gap-2.5">
        <div className="shimmer h-3.5 w-3.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        <div className="shimmer h-3.5 w-44 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }} />
      </div>
      <div className="shimmer mt-8 h-28 w-64 rounded-2xl" style={{ background: "rgba(255,255,255,0.10)" }} />
      <div className="shimmer mt-4 h-6 w-40 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="mt-6 flex gap-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="shimmer h-14 w-24 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-32 rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card flex h-[58px] items-center gap-4 px-5">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-4 flex-1 max-w-40 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-2 w-28 rounded-full" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
