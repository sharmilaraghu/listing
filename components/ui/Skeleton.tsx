export function SkeletonCard() {
  return (
    <div className="bg-paper border border-rule animate-pulse">
      <div className="bg-dust/30 h-48" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-dust/40 rounded w-3/4" />
        <div className="h-3 bg-dust/30 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 bg-dust/30 rounded w-1/3" />
          <div className="h-5 bg-dust/40 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 bg-paper border border-rule p-4 animate-pulse">
      <div className="bg-dust/30 h-24 w-32 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-dust/40 rounded w-3/4" />
        <div className="h-3 bg-dust/30 rounded w-1/2" />
        <div className="h-3 bg-dust/30 rounded w-1/3" />
      </div>
      <div className="shrink-0 flex flex-col items-end justify-between py-1">
        <div className="h-6 bg-dust/40 rounded w-20" />
        <div className="h-3 bg-dust/30 rounded w-16" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
