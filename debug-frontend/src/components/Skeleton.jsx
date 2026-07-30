export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse motion-reduce:animate-none rounded-md bg-neutral-100 ${className}`.trim()} />;
}

export function SkeletonCard({ imageHeight = 'h-44' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className={`w-full ${imageHeight} animate-pulse motion-reduce:animate-none bg-neutral-100`} />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
  );
}
