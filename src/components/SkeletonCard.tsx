export function SkeletonCard() {
  return (
    <div className="group overflow-hidden glass-card h-80 sm:h-96 md:h-[26rem] flex flex-col rounded-lg animate-pulse">
      {/* Poster skeleton */}
      <div className="flex-1 min-h-0 bg-neutral-800" />
      {/* Title skeleton */}
      <div className="p-2 sm:p-3 h-16 sm:h-20 flex items-center">
        <div className="w-3/4 h-4 sm:h-5 bg-neutral-700 rounded" />
      </div>
    </div>
  );
}